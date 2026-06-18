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

import { INTERCEPTOR_POINT } from '@univerjs/sheets';
import { DEFAULT_PADDING, DEFAULT_WIDTH } from '@univerjs/sheets-conditional-formatting';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetsCfRenderController } from '../cf.render.controller';

afterEach(() => {
    vi.useRealTimers();
});

function createController() {
    let interceptor: any;
    const ruleChange$ = new Subject<any>();
    const markDirty$ = new Subject<any>();
    const reCalculate = vi.fn();
    const makeDirty = vi.fn();
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
                with: vi.fn(() => ({ reCalculate })),
                mainComponent: { makeDirty },
            })),
        } as never,
        { markDirty$ } as never,
        { $ruleChange: ruleChange$ } as never
    );

    return { controller, interceptor: () => interceptor, ruleChange$, markDirty$, reCalculate, makeDirty };
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
        const { controller, ruleChange$, markDirty$, reCalculate, makeDirty } = createController();

        ruleChange$.next({ unitId: 'unit-1', subUnitId: 'sheet-1' });
        markDirty$.next({ unitId: 'other-unit', subUnitId: 'sheet-1' });
        await vi.advanceTimersByTimeAsync(20);

        expect(reCalculate).toHaveBeenCalled();
        expect(makeDirty).toHaveBeenCalled();

        controller.dispose();
    });
});
