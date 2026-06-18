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
import type { EmbedProductMenuContribution, EmbedProductMenuMountContext, EmbedProductMenuSurface } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';
import { mountEmbedProductRibbonMenu } from './embed-product-menu-mounting';

export function registerEmbedProductMenuContribution(
    injector: Pick<Injector, 'get' | 'has'>,
    contribution: EmbedProductMenuContribution
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
    private readonly _contributions = new Map<UniverInstanceType, Array<{ contribution: EmbedProductMenuContribution; index: number }>>();
    private _nextIndex = 0;

    constructor() {
        // noop
    }

    register(contribution: EmbedProductMenuContribution): IDisposable {
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

    get(childType: UniverInstanceType): EmbedProductMenuContribution | undefined {
        return this.getAll(childType)[0];
    }

    getAll(childType: UniverInstanceType, surface?: EmbedProductMenuSurface): readonly EmbedProductMenuContribution[] {
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

    mountMenu(context: Omit<EmbedProductMenuMountContext, 'menuSchema'>): IDisposable | undefined {
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
        }) ?? undefined;
    }
}

function getContributionSurface(contribution: EmbedProductMenuContribution): EmbedProductMenuSurface {
    return contribution.surface ?? 'ribbon';
}

function compareContributionItems(
    left: { contribution: EmbedProductMenuContribution; index: number },
    right: { contribution: EmbedProductMenuContribution; index: number }
): number {
    const leftOrder = left.contribution.order ?? left.index;
    const rightOrder = right.contribution.order ?? right.index;

    return leftOrder - rightOrder || left.index - right.index;
}

function mergeMenuSchemas(schemas: readonly unknown[]): unknown {
    return schemas.reduce<unknown>((merged, schema) => mergeMenuSchema(merged, schema), {});
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
