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

import type { IUniverInstanceService } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { runWithEmbedChildProductCurrentUnit } from '../embed-child-product-plugin-lease';

describe('embed child product plugin lease', () => {
    it('keeps the child as current and focused while async product plugin registration settles, then restores the host', async () => {
        const instanceService = createInstanceService({
            focusedUnitId: 'host-doc',
            currentByType: {
                [UniverInstanceType.UNIVER_DOC]: 'host-doc',
                [UniverInstanceType.UNIVER_SHEET]: 'previous-sheet',
            },
        });
        const observations: Array<{ current?: string; focused?: string }> = [];

        await runWithEmbedChildProductCurrentUnit({
            instanceService: instanceService as unknown as IUniverInstanceService,
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            settleDelayMs: 0,
        }, async () => {
            observations.push({
                current: instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId(),
                focused: instanceService.getFocusedUnit()?.getUnitId(),
            });

            await Promise.resolve();

            observations.push({
                current: instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId(),
                focused: instanceService.getFocusedUnit()?.getUnitId(),
            });
        });

        expect(observations).toEqual([
            { current: 'child-sheet', focused: 'child-sheet' },
            { current: 'child-sheet', focused: 'child-sheet' },
        ]);
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('previous-sheet');
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('host-doc');
        expect(instanceService.calls).toEqual([
            'setCurrent:child-sheet',
            'focus:child-sheet',
            'setCurrent:previous-sheet',
            'focus:host-doc',
        ]);
    });

    it('waits for the settle delay before restoring current and focus', async () => {
        vi.useFakeTimers();
        const instanceService = createInstanceService({
            focusedUnitId: 'host-doc',
            currentByType: {
                [UniverInstanceType.UNIVER_DOC]: 'host-doc',
                [UniverInstanceType.UNIVER_SHEET]: 'previous-sheet',
            },
        });

        const registration = runWithEmbedChildProductCurrentUnit({
            instanceService: instanceService as unknown as IUniverInstanceService,
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            settleDelayMs: 16,
        }, () => 'registered');

        await Promise.resolve();
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('child-sheet');
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('child-sheet');

        await vi.advanceTimersByTimeAsync(15);
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('child-sheet');
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('child-sheet');

        await vi.advanceTimersByTimeAsync(1);
        await expect(registration).resolves.toBe('registered');
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('previous-sheet');
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('host-doc');
        vi.useRealTimers();
    });

    it('restores the previous current unit and focus when registration throws', async () => {
        const instanceService = createInstanceService({
            focusedUnitId: 'host-doc',
            currentByType: {
                [UniverInstanceType.UNIVER_DOC]: 'host-doc',
                [UniverInstanceType.UNIVER_SHEET]: 'previous-sheet',
            },
        });

        await expect(runWithEmbedChildProductCurrentUnit({
            instanceService: instanceService as unknown as IUniverInstanceService,
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            settleDelayMs: 0,
        }, () => {
            throw new Error('plugin failed');
        })).rejects.toThrow('plugin failed');

        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('previous-sheet');
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('host-doc');
    });

    it('restores the host unit as the active product after deferred child plugin work', async () => {
        vi.useFakeTimers();
        const instanceService = createInstanceService({
            focusedUnitId: null,
            currentByType: {
                [UniverInstanceType.UNIVER_SLIDE]: 'host-slide',
            },
        });

        await runWithEmbedChildProductCurrentUnit({
            instanceService: instanceService as unknown as IUniverInstanceService,
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            restoreUnitId: 'host-slide',
            settleDelayMs: 0,
            deferredRestoreDelaysMs: [0, 100],
        }, () => {
            expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe('child-sheet');
            expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('child-sheet');
        });

        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SLIDE)?.getUnitId()).toBe('host-slide');
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('host-slide');

        instanceService.focusUnit('child-sheet');
        await vi.advanceTimersByTimeAsync(100);
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('host-slide');
        vi.useRealTimers();
    });

    it('does not run deferred host restore after the child enters an active runtime session', async () => {
        vi.useFakeTimers();
        let childSessionActive = false;
        const instanceService = createInstanceService({
            focusedUnitId: null,
            currentByType: {
                [UniverInstanceType.UNIVER_SLIDE]: 'host-slide',
            },
        });

        await runWithEmbedChildProductCurrentUnit({
            instanceService: instanceService as unknown as IUniverInstanceService,
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            restoreUnitId: 'host-slide',
            shouldRestore: () => !childSessionActive,
            settleDelayMs: 0,
            deferredRestoreDelaysMs: [0, 100],
        }, () => {});

        childSessionActive = true;
        instanceService.focusUnit('child-sheet');
        await vi.advanceTimersByTimeAsync(100);
        expect(instanceService.getFocusedUnit()?.getUnitId()).toBe('child-sheet');
        vi.useRealTimers();
    });
});

function createInstanceService(options: {
    focusedUnitId: string | null;
    currentByType: Partial<Record<UniverInstanceType, string>>;
}) {
    const units = new Map<string, ReturnType<typeof createUnit>>();
    const currentByType = new Map<UniverInstanceType, ReturnType<typeof createUnit>>();
    let focusedUnitId = options.focusedUnitId;
    const calls: string[] = [];

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
    ensureUnit('host-slide', UniverInstanceType.UNIVER_SLIDE);

    return {
        calls,
        getUnit: vi.fn((unitId: string, type: UniverInstanceType) => units.get(unitId) ?? ensureUnit(unitId, type)),
        getCurrentUnitOfType: vi.fn((type: UniverInstanceType) => currentByType.get(type)),
        setCurrentUnitForType: vi.fn((unitId: string) => {
            const unit = units.get(unitId);
            if (!unit) {
                return;
            }
            calls.push(`setCurrent:${unitId}`);
            currentByType.set(unit.type, unit);
        }),
        getFocusedUnit: vi.fn(() => focusedUnitId == null ? null : units.get(focusedUnitId)),
        focusUnit: vi.fn((unitId: string | null) => {
            calls.push(`focus:${unitId}`);
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
