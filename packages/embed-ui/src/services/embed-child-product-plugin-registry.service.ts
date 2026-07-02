/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IDisposable, PluginCtor, UniverInstanceType } from '@univerjs/core';
import { Inject, Injector, IUniverInstanceService, Optional, PluginService, toDisposable } from '@univerjs/core';
import { runWithEmbedChildProductCurrentUnit } from './embed-child-product-plugin-lease';
import { EmbedRuntimeFocusCoordinator } from './embed-runtime-focus-coordinator.service';

export type EmbedChildProductPluginDefinition<T extends PluginCtor = PluginCtor> =
    | T
    | readonly [T]
    | readonly [T, ConstructorParameters<T>[0]?];

export interface IEmbedChildProductPluginPrepareContext {
    injector: Injector;
    childUnitId: string;
    childType: UniverInstanceType;
    descriptor?: unknown;
}

export interface IEmbedChildProductPluginContribution {
    id?: string;
    childType: UniverInstanceType;
    order?: number;
    plugins?: readonly EmbedChildProductPluginDefinition[];
    prepare?(context: IEmbedChildProductPluginPrepareContext): void | Promise<void>;
}

export interface IEmbedChildProductPluginPrepareOptions {
    childUnitId: string;
    childType: UniverInstanceType;
    restoreUnitId?: string;
    descriptor?: unknown;
    settleDelayMs?: number;
}

export class EmbedChildProductPluginRegistryService {
    private readonly _contributions = new Map<UniverInstanceType, Array<{ contribution: IEmbedChildProductPluginContribution; index: number }>>();
    private readonly _registeredProductPluginNames = new Set<string>();
    private _nextIndex = 0;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Optional(EmbedRuntimeFocusCoordinator) private readonly _focusCoordinator?: EmbedRuntimeFocusCoordinator
    ) {
        // noop
    }

    register(contribution: IEmbedChildProductPluginContribution): IDisposable {
        if (contribution.id && this._hasContributionId(contribution.childType, contribution.id)) {
            return toDisposable(() => {});
        }

        const item = { contribution, index: this._nextIndex++ };
        const contributions = this._contributions.get(contribution.childType) ?? [];
        contributions.push(item);
        contributions.sort(compareContributionItems);
        this._contributions.set(contribution.childType, contributions);

        return toDisposable(() => {
            const current = this._contributions.get(contribution.childType);
            if (!current) {
                return;
            }

            const next = current.filter((entry) => entry !== item);
            if (next.length) {
                this._contributions.set(contribution.childType, next);
            } else {
                this._contributions.delete(contribution.childType);
            }
        });
    }

    getAll(childType: UniverInstanceType): readonly IEmbedChildProductPluginContribution[] {
        return (this._contributions.get(childType) ?? []).map((item) => item.contribution);
    }

    async prepare(options: IEmbedChildProductPluginPrepareOptions): Promise<void> {
        const contributions = this.getAll(options.childType);
        if (!contributions.length) {
            return;
        }

        await runWithEmbedChildProductCurrentUnit({
            instanceService: this._injector.get(IUniverInstanceService),
            childUnitId: options.childUnitId,
            childType: options.childType,
            restoreUnitId: options.restoreUnitId,
            settleDelayMs: options.settleDelayMs,
            shouldRestore: () => !this._focusCoordinator?.isChildUnitInActiveSession(options.childUnitId),
        }, async () => {
            for (const contribution of contributions) {
                this._registerProductPluginsOnce(contribution);
                if (contribution.prepare) {
                    await contribution.prepare({
                        injector: this._injector,
                        childUnitId: options.childUnitId,
                        childType: options.childType,
                        descriptor: options.descriptor,
                    });
                }
            }
        });
    }

    private _hasContributionId(childType: UniverInstanceType, id: string): boolean {
        return (this._contributions.get(childType) ?? []).some((entry) => entry.contribution.id === id);
    }

    private _registerProductPluginsOnce(contribution: IEmbedChildProductPluginContribution): void {
        if (!contribution.plugins?.length || !this._injector.has(PluginService)) {
            return;
        }

        const pluginService = this._injector.get(PluginService);
        contribution.plugins.forEach((definition) => {
            const [plugin, config] = normalizeProductPluginDefinition(definition);
            if (this._registeredProductPluginNames.has(plugin.pluginName)) {
                return;
            }

            try {
                pluginService.registerPlugin(plugin, config);
            } catch (error) {
                if (!isDuplicatePluginNameError(error, plugin.pluginName)) {
                    throw error;
                }
            }
            this._registeredProductPluginNames.add(plugin.pluginName);
        });
    }
}

function compareContributionItems(
    left: { contribution: IEmbedChildProductPluginContribution; index: number },
    right: { contribution: IEmbedChildProductPluginContribution; index: number }
): number {
    const leftOrder = left.contribution.order ?? left.index;
    const rightOrder = right.contribution.order ?? right.index;

    return leftOrder - rightOrder || left.index - right.index;
}

function normalizeProductPluginDefinition<T extends PluginCtor>(definition: EmbedChildProductPluginDefinition<T>): readonly [T, ConstructorParameters<T>[0] | undefined] {
    if (Array.isArray(definition)) {
        return [definition[0], definition[1]];
    }

    return [definition as T, undefined];
}

function isDuplicatePluginNameError(error: unknown, pluginName: string): boolean {
    return error instanceof Error &&
        error.message.includes('duplicated plugin name') &&
        error.message.includes(`"${pluginName}"`);
}
