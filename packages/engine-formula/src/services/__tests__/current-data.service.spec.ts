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

import { ObjectMatrix } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { FormulaCurrentConfigService } from '../current-data.service';

function createService() {
    const workbookForCurrentType = {
        getUnitId: vi.fn(() => 'unit-current'),
        getActiveSheet: vi.fn(() => ({
            getSheetId: () => 'sheet-current',
        })),
        getSnapshot: vi.fn(() => ({
            id: 'unit-current',
            sheetOrder: ['sheet-current'],
        })),
    };

    const workbookById = new Map<string, unknown>();
    const univerInstanceService = {
        getCurrentUnitForType: vi.fn(() => workbookForCurrentType),
        getUnit: vi.fn((unitId: string) => workbookById.get(unitId)),
    };
    const localeService = {
        getCurrentLocale: vi.fn(() => 'zhCN'),
    };
    const formulaDataModel = {
        getCalculateData: vi.fn(() => ({
            allUnitData: {},
            unitSheetNameMap: {},
            unitStylesData: {},
        })),
        getFormulaData: vi.fn(() => ({ unitLite: { sheetLite: {} } })),
        getArrayFormulaCellData: vi.fn(() => ({})),
        getArrayFormulaRange: vi.fn(() => ({ unitLite: { sheetLite: {} } })),
    };
    const sheetRowFilteredService = {
        getRowFiltered: vi.fn((_unitId: string, _sheetId: string, row: number) => row === 2 || row === 4),
    };

    const service = new FormulaCurrentConfigService(
        univerInstanceService as never,
        localeService as never,
        formulaDataModel as never,
        sheetRowFilteredService as never
    );

    return {
        service,
        workbookById,
        univerInstanceService,
        localeService,
        formulaDataModel,
    };
}

describe('FormulaCurrentConfigService', () => {
    it('should load explicit dataset config and merge dirty names to sheet-id map', () => {
        const { service } = createService();
        const unitData = {
            unitA: {
                sheetA: {
                    cellData: new ObjectMatrix({}),
                    rowCount: 10,
                    columnCount: 5,
                    rowData: {},
                    columnData: {},
                },
            },
        };

        service.load({
            allUnitData: unitData as never,
            unitStylesData: { unitA: {} } as never,
            unitSheetNameMap: {
                unitA: {
                    SheetA: 'sheetA',
                },
            } as never,
            formulaData: { unitA: { sheetA: {} } } as never,
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: true,
            clearDependencyTreeCache: { unitA: { sheetA: 'SheetA' } } as never,
            dirtyRanges: [{ unitId: 'unitA', sheetId: 'sheetA', range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } }],
            dirtyNameMap: { unitA: { sheetB: 'SheetB' } } as never,
            dirtyDefinedNameMap: { unitA: {} } as never,
            dirtyUnitFeatureMap: {} as never,
            dirtyUnitOtherFormulaMap: {} as never,
            excludedCell: { unitA: { sheetA: { 0: { 0: true } } } } as never,
            rowData: { unitA: { sheetB: { 0: { h: 20 } } } } as never,
        });

        expect(service.isForceCalculate()).toBe(true);
        expect(service.getUnitData().unitA.sheetB.rowData).toEqual({ 0: { h: 20 } });
        expect(service.getSheetName('unitA', 'sheetA')).toBe('SheetA');
        expect(service.getSheetName('unitA', 'sheetB')).toBe('SheetB');
        expect(service.getClearDependencyTreeCache()).toEqual({ unitA: { sheetA: 'SheetA' } });
        expect(service.getDirtyData()).toEqual(expect.objectContaining({
            forceCalculation: true,
            dirtyRanges: expect.any(Array),
            dirtyNameMap: { unitA: { sheetB: 'SheetB' } },
        }));
    });

    it('should load sheet data from model when allUnitData is omitted and expose workbook info', () => {
        const { service, formulaDataModel, localeService } = createService();

        formulaDataModel.getCalculateData.mockReturnValue({
            allUnitData: {
                'unit-current': {
                    'sheet-current': {
                        cellData: new ObjectMatrix({}),
                        rowCount: 9,
                        columnCount: 4,
                        rowData: {},
                        columnData: {},
                    },
                },
            },
            unitStylesData: { 'unit-current': {} },
            unitSheetNameMap: { 'unit-current': { Main: 'sheet-current' } },
        });

        service.load({
            formulaData: {},
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: false,
            clearDependencyTreeCache: {},
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            excludedCell: {},
        } as never);

        expect(service.getExecuteUnitId()).toBe('unit-current');
        expect(service.getExecuteSubUnitId()).toBe('sheet-current');
        expect(service.getSheetsInfo()).toEqual({
            sheetOrder: ['sheet-current'],
            sheetNameMap: { 'sheet-current': 'Main' },
        });
        expect(service.getLocale()).toBe('zhCN');
        expect(localeService.getCurrentLocale).toHaveBeenCalled();
    });

    it('should resolve sheet size, filtered rows and lightweight data loading', () => {
        const { service, workbookById, formulaDataModel } = createService();

        workbookById.set('unit-size', {
            getSheetBySheetId: (sheetId: string) => {
                if (sheetId === 'sheet-size') {
                    return {
                        getSnapshot: () => ({ rowCount: 22, columnCount: 8 }),
                    };
                }
                return undefined;
            },
        });

        expect(service.getSheetRowColumnCount('unit-size', 'sheet-size')).toEqual({ rowCount: 22, columnCount: 8 });
        expect(service.getSheetRowColumnCount('unit-size', 'missing')).toEqual({ rowCount: 0, columnCount: 0 });
        expect(service.getFilteredOutRows('unit-size', 'sheet-size', 1, 5)).toEqual([2, 4]);

        formulaDataModel.getCalculateData.mockReturnValue({
            allUnitData: {},
            unitStylesData: {},
            unitSheetNameMap: {},
        });
        formulaDataModel.getFormulaData.mockReturnValue({ unitLite: { sheetLite: { 1: { 1: { f: '=A1' } } } } });
        formulaDataModel.getArrayFormulaRange.mockReturnValue({ unitLite: { sheetLite: { key: 'range' } } });

        service.loadDataLite({ unitLite: { sheetLite: { 1: { h: 30 } } } } as never);
        expect(service.getFormulaData()).toEqual({ unitLite: { sheetLite: { 1: { 1: { f: '=A1' } } } } });
        expect(service.getArrayFormulaRange()).toEqual({ unitLite: { sheetLite: { key: 'range' } } });
        expect(service.getUnitData().unitLite.sheetLite.rowData).toEqual({ 1: { h: 30 } });
    });

    it('should update dirty ranges/register data and cleanup all caches on dispose', () => {
        const { service } = createService();

        service.registerUnitData({ unit: { sheet: { cellData: new ObjectMatrix({}), rowCount: 1, columnCount: 1, rowData: {}, columnData: {} } } } as never);
        service.registerFormulaData({ unit: { sheet: { 1: { 1: { f: '=1' } } } } } as never);
        service.registerSheetNameMap({ unit: { Sheet: 'sheet' } } as never);
        service.loadDirtyRangesAndExcludedCell(
            [{ unitId: 'unit', sheetId: 'sheet', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }],
            { unit: { sheet: { 0: { 0: true } } } } as never
        );

        expect(service.getDirtyRanges()).toHaveLength(1);
        expect(service.getExcludedRange()).toEqual({ unit: { sheet: { 0: { 0: true } } } });
        expect(service.getDirtyNameMap()).toEqual({});

        service.dispose();

        expect(service.getUnitData()).toEqual({});
        expect(service.getFormulaData()).toEqual({});
        expect(service.getSheetNameMap()).toEqual({});
        expect(service.getExcludedRange()).toEqual({});
    });
});
