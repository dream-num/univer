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

import type { IUniverInstanceService as IUniverInstanceServiceType } from '@univerjs/core';
import { IUniverInstanceService, Plugin, PluginService, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { EmbedChildProductPluginRegistryService } from '../embed-child-product-plugin-registry.service';

describe('EmbedChildProductPluginRegistryService', () => {
    it('prepares matching product plugin contributions with the child unit current and focused', async () => {
        const instanceService = createInstanceService({
            focusedUnitId: 'host-doc',
            currentByType: {
                [UniverInstanceType.UNIVER_DOC]: 'host-doc',
                [UniverInstanceType.UNIVER_SHEET]: 'previous-sheet',
            },
        });
        const injector = createInjector(instanceService as unknown as IUniverInstanceServiceType);
        const service = new EmbedChildProductPluginRegistryService(injector as never);
        const observations: Array<{ id: string; current?: string; focused?: string }> = [];

        service.register({
            id: 'later',
            childType: UniverInstanceType.UNIVER_SHEET,
            order: 20,
            prepare: ({ injector }) => {
                const scopedInstanceService = injector.get(IUniverInstanceService);
                observations.push({
                    id: 'later',
                    current: scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId(),
                    focused: scopedInstanceService.getFocusedUnit()?.getUnitId(),
                });
            },
        });
        service.register({
            id: 'doc',
            childType: UniverInstanceType.UNIVER_DOC,
            prepare: () => {
                observations.push({ id: 'doc' });
            },
        });
        service.register({
            id: 'first',
            childType: UniverInstanceType.UNIVER_SHEET,
            order: 10,
            prepare: async ({ injector }) => {
                await Promise.resolve();
                const scopedInstanceService = injector.get(IUniverInstanceService);
                observations.push({
                    id: 'first',
                    current: scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId(),
                    focused: scopedInstanceService.getFocusedUnit()?.getUnitId(),
                });
            },
        });

        await service.prepare({
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            descriptor: { embedId: 'embed-1' },
            settleDelayMs: 0,
        });

        expect(observations).toEqual([
            { id: 'first', current: 'child-sheet', focused: 'child-sheet' },
            { id: 'later', current: 'child-sheet', focused: 'child-sheet' },
        ]);
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('previous-sheet');
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('host-doc');
    });

    it('ignores duplicate contribution ids for the same child type', async () => {
        const instanceService = createInstanceService({
            focusedUnitId: 'host-doc',
            currentByType: {
                [UniverInstanceType.UNIVER_DOC]: 'host-doc',
                [UniverInstanceType.UNIVER_SHEET]: 'previous-sheet',
            },
        });
        const service = new EmbedChildProductPluginRegistryService(createInjector(instanceService as unknown as IUniverInstanceServiceType) as never);
        const prepare = vi.fn();

        service.register({ id: 'sheets-full', childType: UniverInstanceType.UNIVER_SHEET, prepare });
        service.register({ id: 'sheets-full', childType: UniverInstanceType.UNIVER_SHEET, prepare });

        await service.prepare({
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            settleDelayMs: 0,
        });

        expect(prepare).toHaveBeenCalledTimes(1);
    });

    it('registers product plugins once while still preparing every child unit', async () => {
        const instanceService = createInstanceService({
            focusedUnitId: 'host-doc',
            currentByType: {
                [UniverInstanceType.UNIVER_DOC]: 'host-doc',
                [UniverInstanceType.UNIVER_SHEET]: 'previous-sheet',
            },
        });
        const pluginService = {
            registerPlugin: vi.fn(),
        };
        const service = new EmbedChildProductPluginRegistryService(
            createInjector(instanceService as unknown as IUniverInstanceServiceType, pluginService as unknown as PluginService) as never
        );
        const prepare = vi.fn();

        service.register({
            id: 'sheets-full',
            childType: UniverInstanceType.UNIVER_SHEET,
            plugins: [
                [FullSheetPluginA, { enabled: true }],
                [FullSheetPluginB],
            ],
            prepare,
        });

        await service.prepare({
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            settleDelayMs: 0,
        });
        await service.prepare({
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            settleDelayMs: 0,
        });

        expect(pluginService.registerPlugin).toHaveBeenCalledTimes(2);
        expect(pluginService.registerPlugin).toHaveBeenNthCalledWith(1, FullSheetPluginA, { enabled: true });
        expect(pluginService.registerPlugin).toHaveBeenNthCalledWith(2, FullSheetPluginB, undefined);
        expect(prepare).toHaveBeenCalledTimes(2);
    });

    it('treats a plugin registered by existing dependencies as already available', async () => {
        const instanceService = createInstanceService({
            focusedUnitId: 'host-doc',
            currentByType: {
                [UniverInstanceType.UNIVER_DOC]: 'host-doc',
                [UniverInstanceType.UNIVER_SHEET]: 'previous-sheet',
            },
        });
        const pluginService = {
            registerPlugin: vi.fn(() => {
                throw new Error(`[PluginService]: duplicated plugin name for "${FullSheetPluginA.pluginName}".`);
            }),
        };
        const service = new EmbedChildProductPluginRegistryService(
            createInjector(instanceService as unknown as IUniverInstanceServiceType, pluginService as unknown as PluginService) as never
        );
        const prepare = vi.fn();

        service.register({
            id: 'sheets-full',
            childType: UniverInstanceType.UNIVER_SHEET,
            plugins: [FullSheetPluginA],
            prepare,
        });

        await expect(service.prepare({
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            settleDelayMs: 0,
        })).resolves.toBeUndefined();

        expect(pluginService.registerPlugin).toHaveBeenCalledTimes(1);
        expect(prepare).toHaveBeenCalledTimes(1);
    });
});

function createInjector(instanceService: IUniverInstanceServiceType, pluginService?: PluginService) {
    return {
        has: (token: unknown) => token === IUniverInstanceService || (token === PluginService && !!pluginService),
        get: (token: unknown) => {
            if (token === IUniverInstanceService) {
                return instanceService;
            }
            if (token === PluginService && pluginService) {
                return pluginService;
            }

            throw new Error('unexpected token');
        },
    };
}

function createInstanceService(options: {
    focusedUnitId: string | null;
    currentByType: Partial<Record<UniverInstanceType, string>>;
}) {
    const units = new Map<string, ReturnType<typeof createUnit>>();
    const currentByType = new Map<UniverInstanceType, ReturnType<typeof createUnit>>();
    let focusedUnitId = options.focusedUnitId;

    const ensureUnit = (unitId: string, type: UniverInstanceType) => {
        let unit = units.get(unitId);
        if (!unit) {
            unit = createUnit(unitId, type);
            units.set(unitId, unit);
        }

        return unit;
    };

    Object.entries(options.currentByType).forEach(([rawType, unitId]) => {
        if (!unitId) {
            return;
        }
        currentByType.set(Number(rawType) as UniverInstanceType, ensureUnit(unitId, Number(rawType) as UniverInstanceType));
    });
    ensureUnit('child-sheet', UniverInstanceType.UNIVER_SHEET);
    ensureUnit('host-doc', UniverInstanceType.UNIVER_DOC);

    return {
        getUnit: vi.fn((unitId: string, type: UniverInstanceType) => units.get(unitId) ?? ensureUnit(unitId, type)),
        getCurrentUnitOfType: vi.fn((type: UniverInstanceType) => currentByType.get(type)),
        setCurrentUnitForType: vi.fn((unitId: string) => {
            const unit = units.get(unitId);
            if (unit) {
                currentByType.set(unit.type, unit);
            }
        }),
        getFocusedUnit: vi.fn(() => focusedUnitId == null ? null : units.get(focusedUnitId)),
        focusUnit: vi.fn((unitId: string | null) => {
            focusedUnitId = unitId;
        }),
    };
}

function createUnit(unitId: string, type: UniverInstanceType) {
    return {
        type,
        getUnitId: () => unitId,
    };
}

class FullSheetPluginA extends Plugin {
    static override pluginName = 'FULL_SHEET_PLUGIN_A';
    static override type = UniverInstanceType.UNIVER_SHEET;

    protected override _injector = null as never;
}

class FullSheetPluginB extends Plugin {
    static override pluginName = 'FULL_SHEET_PLUGIN_B';
    static override type = UniverInstanceType.UNIVER_SHEET;

    protected override _injector = null as never;
}
