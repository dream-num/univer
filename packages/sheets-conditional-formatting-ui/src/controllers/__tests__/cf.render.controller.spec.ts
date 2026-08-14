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

import type { IRange } from '@univerjs/core';
import { INTERCEPTOR_POINT } from '@univerjs/sheets';
import { CFRuleType, ConditionalFormattingIcon, DataBar, dataBarUKey, DEFAULT_PADDING, DEFAULT_WIDTH, IconUKey } from '@univerjs/sheets-conditional-formatting';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetsCfRenderController } from '../cf.render.controller';

afterEach(() => {
    vi.useRealTimers();
});

interface ITestConditionFormattingRule {
    ranges: IRange[];
    rule?: { type: CFRuleType };
}

interface ITestInterceptor {
    handler: (cell: unknown, context: unknown, next: (cell: unknown) => unknown) => unknown;
}

interface ITestDirtyEvent {
    cfId?: string;
    rule?: ITestConditionFormattingRule;
    subUnitId: string;
    unitId: string;
}

function createController() {
    let interceptor: ITestInterceptor;
    const ruleChange$ = new Subject<ITestDirtyEvent>();
    const markDirty$ = new Subject<ITestDirtyEvent>();
    const reCalculate = vi.fn();
    const makeDirty = vi.fn();
    const resetRangeCache = vi.fn();
    const dataBar = new DataBar();
    const icon = new ConditionalFormattingIcon();
    const setDataBarRenderRangeResolver = vi.spyOn(dataBar, 'setRenderRangeResolver');
    const setIconRenderRangeResolver = vi.spyOn(icon, 'setRenderRangeResolver');
    const getRulesByRanges = vi.fn(() => [] as Array<{ ranges: IRange[]; rule: { type: CFRuleType } }>);
    const renderCreated$ = new Subject<unknown>();
    const renderDisposed$ = new Subject<string>();
    const rowColumnSegment = { startRow: 0, endRow: 10, startColumn: 0, endColumn: 10 };
    const getRule = vi.fn<() => ITestConditionFormattingRule>(() => ({
        ranges: [{ startRow: 2, endRow: 4, startColumn: 1, endColumn: 3 }],
    }));
    const getSubunitRules = vi.fn<() => ITestConditionFormattingRule[]>(() => []);
    const getExtensionByKey = vi.fn((key: string) => key === dataBarUKey ? dataBar : key === IconUKey ? icon : undefined);
    const render = {
        unitId: 'unit-1',
        type: 'UNIVER_SHEET',
        with: vi.fn(() => ({ getCurrentSkeleton: vi.fn(() => ({ resetRangeCache, rowColumnSegment })), reCalculate })),
        mainComponent: {
            makeDirty,
            getExtensionByKey,
        },
    };
    const controller = new SheetsCfRenderController(
        {
            intercept: vi.fn((point, config: ITestInterceptor) => {
                expect(point).toBe(INTERCEPTOR_POINT.CELL_CONTENT);
                interceptor = config;
                return { dispose: vi.fn() };
            }),
        } as never,
        {
            composeStyle: vi.fn(() => ({
                style: { bg: { rgb: '#00ff00' } },
                isShowValue: false,
                dataBar: { color: '#00f' },
                iconSet: { icon: 'arrow-up' },
            })),
        } as never,
        {
            getCurrentUnitOfType: vi.fn(() => ({
                getUnitId: () => 'unit-1',
                getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
            })),
        } as never,
        {
            created$: renderCreated$,
            disposed$: renderDisposed$,
            getAllRenderersOfType: vi.fn(() => [render]),
            getRenderUnitById: vi.fn(() => render),
        } as never,
        { markDirty$ } as never,
        { $ruleChange: ruleChange$, getRule, getSubunitRules } as never,
        { getRulesByRanges } as never
    );

    return { controller, getExtensionByKey, getRule, getRulesByRanges, getSubunitRules, interceptor: () => interceptor, markDirty$, makeDirty, reCalculate, resetRangeCache, rowColumnSegment, ruleChange$, setDataBarRenderRangeResolver, setIconRenderRangeResolver };
}

describe('SheetsCfRenderController', () => {
    it('falls back to source rules when the range index has not registered an icon set', () => {
        const { controller, getExtensionByKey, getRulesByRanges, getSubunitRules, setDataBarRenderRangeResolver, setIconRenderRangeResolver } = createController();
        const ranges = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }];
        const dataBarResolver = setDataBarRenderRangeResolver.mock.calls[0][0];
        const iconResolver = setIconRenderRangeResolver.mock.calls[0][0];

        expect(getExtensionByKey).toHaveBeenCalledTimes(2);
        expect(getExtensionByKey).toHaveBeenCalledWith(dataBarUKey);
        expect(getExtensionByKey).toHaveBeenCalledWith(IconUKey);
        expect(dataBarResolver).not.toBeNull();
        expect(iconResolver).not.toBeNull();
        if (!dataBarResolver || !iconResolver) {
            throw new Error('Expected conditional-formatting render range resolvers to be bound');
        }

        getRulesByRanges.mockReturnValue([{ ranges, rule: { type: CFRuleType.dataBar } }]);
        expect(dataBarResolver('unit-1', 'sheet-1', ranges)).toEqual([expect.objectContaining(ranges[0])]);

        getRulesByRanges.mockReturnValue([]);
        getSubunitRules.mockReturnValue([{ ranges, rule: { type: CFRuleType.iconSet } }]);
        expect(iconResolver('unit-1', 'sheet-1', ranges)).toEqual([expect.objectContaining(ranges[0])]);

        controller.dispose();
        expect(setDataBarRenderRangeResolver).toHaveBeenLastCalledWith(null);
        expect(setIconRenderRangeResolver).toHaveBeenLastCalledWith(null);
    });

    it('composes conditional-formatting style, data bar and icon set into rendered cell data', () => {
        const { controller, interceptor } = createController();
        const rawCell = { v: 10, s: 'style-1' };

        const result = interceptor().handler(rawCell, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 2,
            rawData: rawCell,
            workbook: {
                getStyles: vi.fn(() => ({
                    get: vi.fn(() => ({ fs: 12 })),
                })),
            },
        }, (cell: unknown) => cell) as {
            dataBar: unknown;
            fontRenderExtension: unknown;
            iconSet: unknown;
            s: unknown;
        };

        expect(result).not.toBe(rawCell);
        expect(result.s).toEqual({ fs: 12, bg: { rgb: '#00ff00' } });
        expect(result.fontRenderExtension).toEqual({
            isSkip: true,
            leftOffset: DEFAULT_PADDING + DEFAULT_WIDTH,
        });
        expect(result.dataBar).toEqual({ color: '#00f' });
        expect(result.iconSet).toEqual({ icon: 'arrow-up' });

        controller.dispose();
    });

    it('marks the active sheet skeleton dirty when conditional formatting changes affect it', async () => {
        vi.useFakeTimers();
        const { controller, ruleChange$, markDirty$, reCalculate, makeDirty, resetRangeCache } = createController();

        const ranges = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }];
        ruleChange$.next({ unitId: 'unit-1', subUnitId: 'sheet-1', rule: { ranges } });
        markDirty$.next({ unitId: 'other-unit', subUnitId: 'sheet-1' });
        await vi.advanceTimersByTimeAsync(20);

        expect(resetRangeCache).toHaveBeenCalledWith(ranges);
        expect(reCalculate).toHaveBeenCalled();
        expect(makeDirty).toHaveBeenCalled();

        controller.dispose();
    });

    it('resets changed ranges found from conditional-formatting dirty cfIds', async () => {
        vi.useFakeTimers();
        const { controller, getRule, markDirty$, resetRangeCache } = createController();

        markDirty$.next({ unitId: 'unit-1', subUnitId: 'sheet-1', cfId: 'cf-1' });
        await vi.advanceTimersByTimeAsync(20);

        expect(getRule).toHaveBeenCalledWith('unit-1', 'sheet-1', 'cf-1');
        expect(resetRangeCache).toHaveBeenCalledWith([{ startRow: 2, endRow: 4, startColumn: 1, endColumn: 3 }]);

        controller.dispose();
    });

    it('resets existing active-sheet rule ranges when the controller starts after snapshot rules are loaded', async () => {
        const { controller, getSubunitRules, resetRangeCache } = createController();
        const ranges = [{ startRow: 5, endRow: 6, startColumn: 2, endColumn: 4 }];
        getSubunitRules.mockReturnValue([{ ranges }]);

        await Promise.resolve();

        expect(getSubunitRules).toHaveBeenCalledWith('unit-1', 'sheet-1');
        expect(resetRangeCache).toHaveBeenCalledWith(ranges);

        controller.dispose();
    });

    it('clips large conditional-formatting dirty ranges to the current rendered range', async () => {
        vi.useFakeTimers();
        const { controller, getRule, markDirty$, resetRangeCache, rowColumnSegment } = createController();
        getRule.mockReturnValue({
            ranges: [{ startRow: 0, endRow: 20000, startColumn: 0, endColumn: 48 }],
        });

        markDirty$.next({ unitId: 'unit-1', subUnitId: 'sheet-1', cfId: 'cf-1' });
        await vi.advanceTimersByTimeAsync(20);

        expect(resetRangeCache).toHaveBeenCalledWith([rowColumnSegment]);

        controller.dispose();
    });
});
