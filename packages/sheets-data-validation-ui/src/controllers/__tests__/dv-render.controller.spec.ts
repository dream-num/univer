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

import { DataValidationStatus, DataValidationType } from '@univerjs/core';
import { INTERCEPTOR_POINT } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetsDataValidationRenderController } from '../dv-render.controller';

describe('SheetsDataValidationRenderController', () => {
    it('adds invalid markers, dropdown canvas renderer and list-cell layout behavior through the cell interceptor', () => {
        let interceptor: any;
        const canvasRender = {
            calcCellAutoHeight: vi.fn(() => 36),
            calcCellAutoWidth: vi.fn(() => 120),
        };
        const skeleton = {
            worksheet: { getMergedCell: vi.fn(() => null) },
            getStyles: vi.fn(() => ({ getStyleByCell: vi.fn(() => ({ fs: 11 })) })),
            getCellWithCoordByIndex: vi.fn(() => ({ startX: 10, startY: 20 })),
        };
        const controller = new SheetsDataValidationRenderController(
            { executeCommand: vi.fn() } as never,
            { mergeMenu: vi.fn() } as never,
            {
                getRenderById: vi.fn(() => ({
                    with: vi.fn(() => ({
                        getSkeletonParam: vi.fn(() => ({ skeleton })),
                    })),
                })),
            } as never,
            { getUniverSheetInstance: vi.fn() } as never,
            { getUndoRedoParamsOfAutoHeight: vi.fn(() => ({ redos: [] })) } as never,
            { activeDropdown: null, hideDropdown: vi.fn(), showDropdown: vi.fn() } as never,
            {
                getRuleIdByLocation: vi.fn(() => 'rule-1'),
                getRuleById: vi.fn(() => ({ uid: 'rule-1', type: DataValidationType.LIST })),
                ruleChange$: new Subject(),
            } as never,
            {
                getValidatorItem: vi.fn(() => ({
                    canvasRender,
                    dropdownType: 'list',
                    skipDefaultFontRender: vi.fn(() => true),
                    getExtraStyle: vi.fn(() => ({ bg: { rgb: '#fff3cd' } })),
                })),
            } as never,
            {
                intercept: vi.fn((point, config) => {
                    expect(point).toBe(INTERCEPTOR_POINT.CELL_CONTENT);
                    interceptor = config;
                    return { dispose: vi.fn() };
                }),
            } as never,
            { getValue: vi.fn(() => DataValidationStatus.INVALID) } as never
        );
        const rawCell = { v: 'bad', markers: { bl: { size: 1 } }, coverable: true };
        const workbook = { getStyles: vi.fn(() => ({ get: vi.fn(() => ({ fs: 10 })) })) };
        const worksheet = { getMergedCell: vi.fn(() => null) };

        const result = interceptor.handler(rawCell, {
            row: 1,
            col: 2,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rawData: rawCell,
            workbook,
            worksheet,
        }, (cell: unknown) => cell);

        expect(result).not.toBe(rawCell);
        expect(result.markers).toEqual(expect.objectContaining({
            bl: { size: 1 },
            tr: { size: 6, color: '#fe4b4b' },
        }));
        expect(result.customRender).toContain(canvasRender);
        expect(result.fontRenderExtension.isSkip).toBe(true);
        expect(result.interceptorStyle).toEqual({ bg: { rgb: '#fff3cd' } });
        expect(result.coverable).toBe(false);
        expect(result.interceptorAutoHeight()).toBe(36);
        expect(result.interceptorAutoWidth()).toBe(120);

        controller.dispose();
    });
});
