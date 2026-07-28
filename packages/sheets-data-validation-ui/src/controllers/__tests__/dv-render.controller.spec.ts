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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { DataValidationStatus, DataValidationType, InterceptorEffectEnum, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { DataValidationCacheService, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { AutoHeightController } from '@univerjs/sheets-ui';
import { IMenuManagerService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationDropdownManagerService } from '../../services/dropdown-manager.service';
import { SheetsDataValidationRenderController } from '../dv-render.controller';

describe('SheetsDataValidationRenderController', () => {
    it('adds invalid markers, dropdown canvas renderer and list-cell layout behavior through the cell interceptor', () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        const canvasRender = {
            calcCellAutoHeight: vi.fn(() => 36),
            calcCellAutoWidth: vi.fn(() => 120),
        };
        const skeleton = {
            worksheet: { getMergedCell: vi.fn(() => null) },
            getCellWithCoordByIndex: vi.fn(() => ({ startX: 10, startY: 20 })),
        };

        injector.add([IMenuManagerService, { useValue: { mergeMenu: vi.fn() } as never }]);
        injector.add([IRenderManagerService, {
            useValue: {
                getRenderUnitById: vi.fn(() => ({
                    with: vi.fn(() => ({
                        getSkeletonParam: vi.fn(() => ({ skeleton })),
                    })),
                })),
            } as never,
        }]);
        injector.add([AutoHeightController, { useValue: { getUndoRedoParamsOfAutoHeight: vi.fn(() => ({ redos: [], undos: [] })) } as never }]);
        injector.add([DataValidationDropdownManagerService, { useValue: { activeDropdown: null, hideDropdown: vi.fn(), showDropdown: vi.fn() } as never }]);
        injector.add([SheetDataValidationModel, {
            useValue: {
                getRuleIdByLocation: vi.fn(() => 'rule-1'),
                getRuleById: vi.fn(() => ({ uid: 'rule-1', type: DataValidationType.LIST })),
                ruleChange$: new Subject(),
            } as never,
        }]);
        injector.add([DataValidatorRegistryService, {
            useValue: {
                getValidatorItem: vi.fn(() => ({
                    canvasRender,
                    dropdownType: 'list',
                    skipDefaultFontRender: vi.fn(() => true),
                    getExtraStyle: vi.fn(() => ({ bg: { rgb: '#fff3cd' } })),
                })),
            } as never,
        }]);
        injector.add([SheetInterceptorService]);
        injector.add([DataValidationCacheService, { useValue: { getValue: vi.fn(() => DataValidationStatus.INVALID) } as never }]);
        injector.add([SheetsDataValidationRenderController]);

        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'unit-1',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            name: 'Test workbook',
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: {
                'sheet-1': {
                    id: 'sheet-1',
                    name: 'Sheet 1',
                    cellData: { 1: { 2: { v: 'bad' } } },
                },
            },
        });
        const worksheet = workbook.getSheetBySheetId('sheet-1')!;
        const controller = injector.get(SheetsDataValidationRenderController);
        const rawCell = { v: 'bad', markers: { bl: { size: 1 } }, coverable: true } as never;
        const result = injector.get(SheetInterceptorService).fetchThroughInterceptors(
            INTERCEPTOR_POINT.CELL_CONTENT,
            InterceptorEffectEnum.Style
        )(rawCell, {
            row: 1,
            col: 2,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rawData: rawCell,
            workbook,
            worksheet,
        });
        const intercepted = result!;

        expect(intercepted).not.toBe(rawCell);
        expect(intercepted.markers).toEqual(expect.objectContaining({
            bl: { size: 1 },
            tr: { size: 6, color: '#fe4b4b' },
        }));
        expect(intercepted.customRender).toContain(canvasRender);
        expect(intercepted.fontRenderExtension?.isSkip).toBe(true);
        expect(intercepted.interceptorStyle).toEqual({ bg: { rgb: '#fff3cd' } });
        expect(intercepted.coverable).toBe(false);
        expect(intercepted.interceptorAutoHeight?.()).toBe(36);
        expect(intercepted.interceptorAutoWidth?.()).toBe(120);

        controller.dispose();
        univer.dispose();
    });
});
