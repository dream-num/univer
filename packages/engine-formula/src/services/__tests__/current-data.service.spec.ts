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

import {
    DateSystem,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    ObjectMatrix,
    UniverInstanceType,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import type { IFormulaDatasetConfig } from '../../basics/common';
import { createFunctionTestBed } from '../../functions/__tests__/create-function-test-bed';
import { FormulaDataModel } from '../../models/formula-data.model';
import { FormulaCurrentConfigService, hasDeferredFormulaDataSnapshot, IFormulaCurrentConfigService } from '../current-data.service';
import { ISheetRowFilteredService } from '../sheet-row-filtered.service';

function createService(withCurrentWorkbook = true) {
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
        getCurrentUnitOfType: vi.fn(() => withCurrentWorkbook ? workbookForCurrentType : undefined),
        getUnit: vi.fn((unitId: string) => workbookById.get(unitId)),
        getUnitType: vi.fn((unitId: string) =>
            workbookById.has(unitId)
                ? UniverInstanceType.UNIVER_SHEET
                : UniverInstanceType.UNRECOGNIZED
        ),
    };
    const localeService = {
        getCurrentLocale: vi.fn(() => 'zhCN'),
    };
    const formulaDataModel = {
        getCalculateData: vi.fn(() => ({
            allUnitData: {},
            unitNameMap: {},
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

    class TestUniverInstanceService {
        getCurrentUnitOfType = univerInstanceService.getCurrentUnitOfType;
        getUnit = univerInstanceService.getUnit;
        getUnitType = univerInstanceService.getUnitType;
    }

    class TestLocaleService {
        getCurrentLocale = localeService.getCurrentLocale;
    }

    class TestFormulaDataModel {
        getCalculateData = formulaDataModel.getCalculateData;
        getFormulaData = formulaDataModel.getFormulaData;
        getArrayFormulaCellData = formulaDataModel.getArrayFormulaCellData;
        getArrayFormulaRange = formulaDataModel.getArrayFormulaRange;
    }

    class TestSheetRowFilteredService {
        getRowFiltered = sheetRowFilteredService.getRowFiltered;
    }

    const injector = new Injector();
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([FormulaDataModel, { useClass: TestFormulaDataModel as never }]);
    injector.add([ISheetRowFilteredService, { useClass: TestSheetRowFilteredService as never }]);
    injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
    const service = injector.get(IFormulaCurrentConfigService) as FormulaCurrentConfigService;

    return {
        service,
        workbookById,
        univerInstanceService,
        localeService,
        formulaDataModel,
    };
}

function createSnapshotDataset(): Omit<IFormulaDatasetConfig, 'formulaData'> {
    return {
        allUnitData: {},
        unitStylesData: {},
        unitSheetNameMap: {},
        arrayFormulaCellData: {},
        arrayFormulaRange: {},
        forceCalculate: false,
        dirtyRanges: [],
        dirtyNameMap: {},
        dirtyDefinedNameMap: {},
        dirtyUnitFeatureMap: {},
        dirtyUnitOtherFormulaMap: {},
    };
}

describe('FormulaCurrentConfigService', () => {
    it('materializes captured formulas only for a formula read and caches their mutable owned root', () => {
        const { service, formulaDataModel } = createService();
        const data = { unit: { sheet: { 0: { 1: { f: '=A1+2' } } } } };
        const materialize = vi.fn(() => data);
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(false);
        service.loadWithFormulaDataSnapshot(createSnapshotDataset(), { materialize });
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(true);
        service.getUnitData();
        service.getDirtyData();
        service.getArrayFormulaRange();
        expect(materialize).not.toHaveBeenCalled();
        expect(formulaDataModel.getFormulaData).not.toHaveBeenCalled();
        expect(service.getCalculationGeneration()).toBe(1);
        expect(service.getFormulaData()).toBe(data);
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(false);
        data.unit.sheet[0][1].f = '=LOCAL()';
        expect(service.getFormulaData().unit?.sheet?.[0]?.[1]?.f).toBe('=LOCAL()');
        expect(materialize).toHaveBeenCalledTimes(1);
    });

    it('retires pending snapshots on replacement, explicit registration, lite load and disposal', () => {
        const { service, formulaDataModel } = createService();
        const first = { materialize: vi.fn(() => ({ old: {} })) };
        const secondData = { current: {} };
        const second = { materialize: vi.fn(() => secondData) };
        const config = createSnapshotDataset();
        service.loadWithFormulaDataSnapshot(config, first);
        service.loadWithFormulaDataSnapshot(config, second);
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(true);
        expect(service.getFormulaData()).toBe(secondData);
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(false);
        expect(first.materialize).not.toHaveBeenCalled();
        expect(service.getCalculationGeneration()).toBe(2);

        const unused = { materialize: vi.fn(() => ({ unused: {} })) };
        const registered = { registered: {} };
        service.loadWithFormulaDataSnapshot(config, unused);
        service.registerFormulaData(registered);
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(false);
        expect(service.getFormulaData()).toBe(registered);
        service.loadWithFormulaDataSnapshot(config, unused);
        const explicit = { explicit: {} };
        service.load({ ...config, formulaData: explicit });
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(false);
        expect(service.getFormulaData()).toBe(explicit);
        service.loadWithFormulaDataSnapshot(config, unused);
        service.loadDataLite();
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(false);
        expect(service.getFormulaData()).toEqual({ unitLite: { sheetLite: {} } });
        expect(formulaDataModel.getFormulaData).toHaveBeenCalledTimes(1);
        service.loadWithFormulaDataSnapshot(config, unused);
        service.dispose();
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(false);
        expect(service.getFormulaData()).toEqual({});
        expect(unused.materialize).not.toHaveBeenCalled();
    });

    it('keeps the captured source available if materialization fails before producing a root', () => {
        const { service } = createService();
        const data = { unit: { sheet: {} } };
        const materialize = vi.fn()
            .mockImplementationOnce(() => { throw new Error('materialization failed'); })
            .mockReturnValue(data);
        service.loadWithFormulaDataSnapshot(createSnapshotDataset(), { materialize });
        expect(() => service.getFormulaData()).toThrow('materialization failed');
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(true);
        expect(service.getFormulaData()).toBe(data);
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(false);
        expect(service.getFormulaData()).toBe(data);
        expect(materialize).toHaveBeenCalledTimes(2);
    });

    it('queries deferred ownership without observing a service Proxy or non-object values', () => {
        const { service } = createService();
        let calls = 0;
        const proxy = new Proxy(service, {
            get: () => {
                calls++;
                throw new Error('unexpected get');
            },
            getPrototypeOf: () => {
                calls++;
                throw new Error('unexpected prototype');
            },
        });
        expect(hasDeferredFormulaDataSnapshot(proxy)).toBe(false);
        expect(hasDeferredFormulaDataSnapshot(undefined)).toBe(false);
        expect(hasDeferredFormulaDataSnapshot(null)).toBe(false);
        expect(hasDeferredFormulaDataSnapshot(1)).toBe(false);
        expect(calls).toBe(0);
    });

    it('keeps conservative feature invalidation separate from ordinary formula calculation', () => {
        const bed = createFunctionTestBed();
        try {
            const service = bed.get(IFormulaCurrentConfigService);
            service.load({ formulaData: {}, arrayFormulaCellData: {}, arrayFormulaRange: {}, forceCalculate: false, dirtyReferenceUnits: ['unit'], dirtyRanges: [], dirtyNameMap: {}, dirtyDefinedNameMap: {}, dirtyUnitFeatureMap: {}, dirtyUnitOtherFormulaMap: {}, allUnitData: {} });
            expect(service.getDirtyData().forceCalculation).toBe(false);
            expect(service.getDirtyData(true).forceCalculation).toBe(true);
            service.loadDirtyRangesAndExcludedCell([]);
            expect(service.getDirtyData(true).forceCalculation).toBe(false);
        } finally { bed.univer.dispose(); }
    });

    it('keeps reference invalidation independent of deferred formula materialization', () => {
        const { service, formulaDataModel } = createService();
        const materialize = vi.fn(() => ({ unit: { sheet: {} } }));
        service.loadWithFormulaDataSnapshot({
            ...createSnapshotDataset(),
            dirtyReferenceUnits: ['unit'],
        }, { materialize });

        expect(service.getDirtyData().dirtyReferenceUnits).toEqual(['unit']);
        expect(service.getDirtyData().forceCalculation).toBe(false);
        expect(service.getDirtyData(true).forceCalculation).toBe(true);
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(true);
        expect(materialize).not.toHaveBeenCalled();
        expect(formulaDataModel.getFormulaData).not.toHaveBeenCalled();

        service.loadDirtyRangesAndExcludedCell([]);
        expect(service.getDirtyData().dirtyReferenceUnits).toEqual([]);
        expect(service.getDirtyData().forceCalculation).toBe(false);
        expect(service.getDirtyData(true).forceCalculation).toBe(false);
        expect(hasDeferredFormulaDataSnapshot(service)).toBe(true);
        expect(materialize).not.toHaveBeenCalled();
        service.dispose();
    });

    it('distinguishes transported filter exclusions from manual hiding and clears stale exclusions', () => {
        const testBed = createFunctionTestBed();
        try {
            const service = testBed.get(IFormulaCurrentConfigService);
            const localFilter = testBed.get(ISheetRowFilteredService).register((_unitId, _sheetId, row) => row === 3);
            service.loadDataLite({ test: { sheet1: { 1: { hd: 1, filtered: true }, 2: { hd: 1 } } } });
            expect(service.getFilteredOutRows('test', 'sheet1', 0, 4)).toEqual([1, 3]);
            expect(service.getUnitData().test.sheet1.rowData[2]).toEqual({ hd: 1 });
            localFilter.dispose();
            service.loadDataLite({ test: { sheet1: {} } });
            expect(service.getFilteredOutRows('test', 'sheet1', 0, 4)).toEqual([]);
        } finally {
            testBed.univer.dispose();
        }
    });

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
            unitNameMap: {
                unitA: {
                    name: 'Sales.xlsx',
                    unitType: UniverInstanceType.UNIVER_SHEET,
                },
            },
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
        expect(service.getUnitNameMap()).toEqual({
            unitA: {
                name: 'Sales.xlsx',
                unitType: UniverInstanceType.UNIVER_SHEET,
            },
        });
        expect(service.getClearDependencyTreeCache()).toEqual({ unitA: { sheetA: 'SheetA' } });
        expect(service.getDirtyData()).toEqual(expect.objectContaining({
            forceCalculation: true,
            dirtyRanges: expect.any(Array),
            dirtyNameMap: { unitA: { sheetB: 'SheetB' } },
        }));
    });

    it('should load sheet data from model when allUnitData is omitted and expose workbook info', () => {
        const { service, workbookById, formulaDataModel, localeService } = createService();

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
            unitNameMap: {
                'unit-current': {
                    name: 'Current.xlsx',
                    unitType: UniverInstanceType.UNIVER_SHEET,
                },
            },
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
        expect(service.getUnitNameMap()['unit-current']?.name).toBe('Current.xlsx');
        expect(service.getSheetsInfo()).toEqual({
            sheetOrder: ['sheet-current'],
            sheetNameMap: { 'sheet-current': 'Main' },
        });
        workbookById.set('unit-current', {
            getSnapshot: () => ({ locale: LocaleType.FR_FR }),
        });
        expect(service.getLocale()).toBe('zhCN');
        expect(localeService.getCurrentLocale).toHaveBeenCalled();
        workbookById.set('date-1904', { getDateSystem: () => DateSystem.Date1904 });
        expect(service.getDateSystem('date-1904')).toBe(DateSystem.Date1904);
        expect(service.getDateSystem('missing')).toBe(DateSystem.Date1900);
    });

    it('resolves explicit workbook order independently of the focused workbook', () => {
        const { service, workbookById } = createService();
        workbookById.set('other', { getSnapshot: () => ({ id: 'other', sheetOrder: ['end', 'start'] }) });
        expect(service.getSheetsInfo('other').sheetOrder).toEqual(['end', 'start']);
        expect(service.getSheetsInfo().sheetOrder).toEqual(['sheet-current']);
        expect(service.getSheetsInfo('missing')).toEqual({ sheetOrder: [], sheetNameMap: {} });
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
        expect(service.getSheetRowColumnCount('doc-unit', 'doc-unit')).toEqual({ rowCount: 0, columnCount: 0 });
        expect(service.getFilteredOutRows('unit-size', 'sheet-size', 1, 5)).toEqual([2, 4]);

        formulaDataModel.getCalculateData.mockReturnValue({
            allUnitData: {},
            unitStylesData: {},
            unitNameMap: {},
            unitSheetNameMap: {},
        });
        formulaDataModel.getFormulaData.mockReturnValue({ unitLite: { sheetLite: { 1: { 1: { f: '=A1' } } } } });
        formulaDataModel.getArrayFormulaRange.mockReturnValue({ unitLite: { sheetLite: { key: 'range' } } });

        service.loadDataLite({ unitLite: { sheetLite: { 1: { h: 30 } } } } as never);
        expect(service.getFormulaData()).toEqual({ unitLite: { sheetLite: { 1: { 1: { f: '=A1' } } } } });
        expect(service.getArrayFormulaRange()).toEqual({ unitLite: { sheetLite: { key: 'range' } } });
        expect(service.getUnitData().unitLite.sheetLite.rowData).toEqual({ 1: { h: 30 } });
    });

    it('returns empty sheet metadata when formula calculation runs without Sheets', () => {
        const { service } = createService(false);

        expect(service.getSheetsInfo()).toEqual({
            sheetOrder: [],
            sheetNameMap: {},
        });
    });

    it('should update dirty ranges/register data and cleanup all caches on dispose', () => {
        const { service } = createService();

        service.registerUnitData({ unit: { sheet: { cellData: new ObjectMatrix({}), rowCount: 1, columnCount: 1, rowData: {}, columnData: {} } } } as never);
        service.registerFormulaData({ unit: { sheet: { 1: { 1: { f: '=1' } } } } } as never);
        service.registerSheetNameMap({ unit: { Sheet: 'sheet' } } as never);
        service.registerUnitNameMap({
            unit: {
                name: 'Book.xlsx',
                unitType: UniverInstanceType.UNIVER_SHEET,
            },
        });
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
        expect(service.getUnitNameMap()).toEqual({});
        expect(service.getExcludedRange()).toEqual({});
    });
});
