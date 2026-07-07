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
import { DEFAULT_PADDING, DEFAULT_WIDTH } from '@univerjs/sheets-conditional-formatting';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetsCfRenderController } from '../cf.render.controller';

afterEach(() => {
    vi.useRealTimers();
});

interface ITestConditionFormattingRule {
    ranges: IRange[];
}

function createController() {
    let interceptor: any;
    const ruleChange$ = new Subject<any>();
    const markDirty$ = new Subject<any>();
    const reCalculate = vi.fn();
    const makeDirty = vi.fn();
    const resetRangeCache = vi.fn();
    const rowColumnSegment = { startRow: 0, endRow: 10, startColumn: 0, endColumn: 10 };
    const getRule = vi.fn<() => ITestConditionFormattingRule>(() => ({
        ranges: [{ startRow: 2, endRow: 4, startColumn: 1, endColumn: 3 }],
    }));
    const getSubunitRules = vi.fn<() => ITestConditionFormattingRule[]>(() => []);
    const controller = new SheetsCfRenderController(
        {
            intercept: vi.fn((point, config) => {
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
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => ({ getCurrentSkeleton: vi.fn(() => ({ resetRangeCache, rowColumnSegment })), reCalculate })),
                mainComponent: { makeDirty },
            })),
        } as never,
        { markDirty$ } as never,
        { $ruleChange: ruleChange$, getRule, getSubunitRules } as never
    );

    return { controller, getRule, getSubunitRules, interceptor: () => interceptor, markDirty$, makeDirty, reCalculate, resetRangeCache, rowColumnSegment, ruleChange$ };
}

describe('SheetsCfRenderController', () => {
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
        }, (cell: unknown) => cell);

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
        const { controller, getRule, markDirty$, resetRangeCache, rowColumnSegment } = createController();

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
