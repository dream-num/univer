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

import type { IDisposable, Injector, UniverInstanceType } from '@univerjs/core';
import type { EmbedProductMenuSurface, IEmbedProductMenuContribution, IEmbedProductMenuMountContext } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';
import { MenuManagerPosition, RibbonPosition } from '@univerjs/ui';
import { mountEmbedProductRibbonMenu } from './embed-product-menu-mounting';

export function registerEmbedProductMenuContribution(
    injector: Pick<Injector, 'get' | 'has'>,
    contribution: IEmbedProductMenuContribution
): IDisposable | undefined {
    if (!injector.has(EmbedProductMenuRegistryService)) {
        return undefined;
    }

    const registry = injector.get(EmbedProductMenuRegistryService);
    if (
        contribution.id &&
        registry.getAll(contribution.childType, contribution.surface).some((registeredContribution) => registeredContribution.id === contribution.id)
    ) {
        return undefined;
    }

    return registry.register(contribution);
}

export class EmbedProductMenuRegistryService {
    private readonly _contributions = new Map<UniverInstanceType, Array<{ contribution: IEmbedProductMenuContribution; index: number }>>();
    private _nextIndex = 0;

    constructor() {
        // noop
    }

    register(contribution: IEmbedProductMenuContribution): IDisposable {
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

    get(childType: UniverInstanceType): IEmbedProductMenuContribution | undefined {
        return this.getAll(childType)[0];
    }

    getAll(childType: UniverInstanceType, surface?: EmbedProductMenuSurface): readonly IEmbedProductMenuContribution[] {
        return (this._contributions.get(childType) ?? [])
            .map((entry) => entry.contribution)
            .filter((contribution) => !surface || getContributionSurface(contribution) === surface);
    }

    getMergedMenuSchema(childType: UniverInstanceType, surface: EmbedProductMenuSurface = 'ribbon'): unknown | undefined {
        const schemas = this.getAll(childType, surface)
            .map((contribution) => contribution.menuSchema)
            .filter((schema) => schema && typeof schema === 'object');

        if (!schemas.length) {
            return undefined;
        }

        return mergeMenuSchemas(schemas);
    }

    mountMenu(context: Omit<IEmbedProductMenuMountContext, 'menuSchema'>): IDisposable | undefined {
        const surface = context.surface ?? 'ribbon';
        const contributions = this.getAll(context.childType, surface);
        if (!contributions.length) {
            return undefined;
        }

        const customMounts = contributions.filter((contribution) => contribution.mountMenu);
        if (customMounts.length) {
            const disposables = customMounts
                .map((contribution) => contribution.mountMenu?.({
                    ...context,
                    surface,
                    menuSchema: contribution.menuSchema,
                    scopedActionServiceTokens: contribution.scopedActionServiceTokens,
                }))
                .filter((disposable): disposable is IDisposable => Boolean(disposable));

            return toDisposable(() => {
                disposables.forEach((disposable) => disposable.dispose());
            });
        }

        const menuSchema = this.getMergedMenuSchema(context.childType, surface);
        if (!menuSchema) {
            return undefined;
        }

        if (surface !== 'ribbon') {
            return undefined;
        }

        return mountEmbedProductRibbonMenu({
            ...context,
            surface,
            menuSchema,
            scopedActionServiceTokens: mergeScopedActionServiceTokens(contributions),
        }) ?? undefined;
    }
}

function mergeScopedActionServiceTokens(contributions: readonly IEmbedProductMenuContribution[]): IEmbedProductMenuContribution['scopedActionServiceTokens'] {
    const tokens = contributions.flatMap((contribution) => contribution.scopedActionServiceTokens ?? []);

    return tokens.length ? Array.from(new Set(tokens)) : undefined;
}

function getContributionSurface(contribution: IEmbedProductMenuContribution): EmbedProductMenuSurface {
    return contribution.surface ?? 'ribbon';
}

function compareContributionItems(
    left: { contribution: IEmbedProductMenuContribution; index: number },
    right: { contribution: IEmbedProductMenuContribution; index: number }
): number {
    const leftOrder = left.contribution.order ?? left.index;
    const rightOrder = right.contribution.order ?? right.index;

    return leftOrder - rightOrder || left.index - right.index;
}

function mergeMenuSchemas(schemas: readonly unknown[]): unknown {
    return schemas.reduce<unknown>((merged, schema) => mergeMenuSchema(merged, normalizeRibbonMenuSchema(schema)), {});
}

function normalizeRibbonMenuSchema(schema: unknown): unknown {
    if (!isPlainObject(schema)) {
        return schema;
    }

    const ribbonPositionKeys = new Set<string>(Object.values(RibbonPosition));
    const ribbonEntries = Object.entries(schema).filter(([key]) => ribbonPositionKeys.has(key));
    if (!ribbonEntries.length) {
        return schema;
    }

    const result: Record<string, unknown> = {};
    Object.entries(schema).forEach(([key, value]) => {
        if (!ribbonPositionKeys.has(key)) {
            result[key] = cloneMenuSchema(value);
        }
    });

    const ribbonRoot = isPlainObject(result[MenuManagerPosition.RIBBON])
        ? result[MenuManagerPosition.RIBBON] as Record<string, unknown>
        : {};
    ribbonEntries.forEach(([key, value]) => {
        ribbonRoot[key] = key in ribbonRoot
            ? mergeMenuSchema(ribbonRoot[key], value)
            : cloneMenuSchema(value);
    });
    result[MenuManagerPosition.RIBBON] = ribbonRoot;

    return result;
}

function mergeMenuSchema(target: unknown, source: unknown): unknown {
    if (!isPlainObject(target) || !isPlainObject(source)) {
        return cloneMenuSchema(source);
    }

    const result: Record<string, unknown> = { ...target };
    Object.entries(source).forEach(([key, value]) => {
        result[key] = key in result ? mergeMenuSchema(result[key], value) : cloneMenuSchema(value);
    });

    return result;
}

function cloneMenuSchema(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => cloneMenuSchema(item));
    }

    if (!isPlainObject(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, cloneMenuSchema(child)])
    );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
