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

import type { ICellData, Injector, IWorkbookData } from '@univerjs/core';
import { ICommandService, LifecycleService, LifecycleStages, LocaleService, LocaleType, Tools, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ErrorType, IDefinedNamesService } from '@univerjs/engine-formula';
import { SetRangeValuesCommand, SetRangeValuesMutation } from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import formulaEnUS from '../../locale/en-US';
import { UniverSheetsFormulaPlugin } from '../../plugin';
import { createFacadeTestBed } from './create-test-bed';
import '@univerjs/engine-formula/facade';

function getTestWorkbookDataWithFormulas(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 1,
                        },
                        1: {
                            v: 2,
                        },
                        2: {
                            f: '=SUM(A1:B1)',
                            v: 3,
                        },
                        3: {
                            f: '=A1/0',
                            v: ErrorType.DIV_BY_ZERO,
                            t: 4,
                        },
                    },
                    1: {
                        0: {
                            f: '=UNKNOWN_FUNCTION()',

                            v: ErrorType.NAME,
                            t: 4,

                        },
                        1: {
                            f: '=SUM(A1,A2)',
                            v: 2,
                        },
                        2: {
                            f: '=SQRT(-1)',

                            v: ErrorType.NUM,
                            t: 4,

                        },
                    },
                    2: {
                        0: {
                            v: 'text',
                        },
                        1: {
                            f: '=A3+B2',

                            v: ErrorType.VALUE,
                            t: 4,

                        },
                    },
                },
                rowCount: 100,
                columnCount: 100,
            },
            sheet2: {
                id: 'sheet2',
                name: 'sheet2',
                cellData: {
                    0: {
                        0: {
                            f: '=1/0',
                            v: ErrorType.DIV_BY_ZERO,
                            t: 4,
                        },
                    },
                },
                rowCount: 100,
                columnCount: 100,
            },
        },
        locale: LocaleType.ZH_CN,
        name: 'Test Workbook',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
    };
}

describe('Test FWorkbookEngineFormulaMixin', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed(getTestWorkbookDataWithFormulas());
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    it('should get all formula errors in the workbook', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const errors = workbook.getAllFormulaError();

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBeGreaterThan(0);

        // Check for specific error types
        const divByZeroErrors = errors.filter((e) => e.errorType === ErrorType.DIV_BY_ZERO);
        const nameErrors = errors.filter((e) => e.errorType === ErrorType.NAME);
        const numErrors = errors.filter((e) => e.errorType === ErrorType.NUM);
        const valueErrors = errors.filter((e) => e.errorType === ErrorType.VALUE);

        expect(divByZeroErrors.length).toBeGreaterThan(0);
        expect(nameErrors.length).toBeGreaterThan(0);
        expect(numErrors.length).toBeGreaterThan(0);
        expect(valueErrors.length).toBeGreaterThan(0);

        // Check error details
        const firstError = errors[0];
        expect(firstError).toHaveProperty('sheetName');
        expect(firstError).toHaveProperty('row');
        expect(firstError).toHaveProperty('column');
        expect(firstError).toHaveProperty('formula');
        expect(firstError).toHaveProperty('errorType');
        expect(typeof firstError.sheetName).toBe('string');
        expect(typeof firstError.row).toBe('number');
        expect(typeof firstError.column).toBe('number');
        expect(typeof firstError.formula).toBe('string');
    });

    it('should identify different error types correctly', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const errors = workbook.getAllFormulaError();

        const errorTypes = new Set(errors.map((e) => e.errorType));

        // Should contain multiple error types from our test data
        expect(errorTypes.has(ErrorType.DIV_BY_ZERO)).toBe(true);
        expect(errorTypes.has(ErrorType.NAME)).toBe(true);
        expect(errorTypes.has(ErrorType.NUM)).toBe(true);
        expect(errorTypes.has(ErrorType.VALUE)).toBe(true);
    });

    it('should include correct formula strings in error results', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const errors = workbook.getAllFormulaError();

        // Find specific errors and check their formula strings
        const divByZeroError = errors.find((e) => e.errorType === ErrorType.DIV_BY_ZERO);
        const nameError = errors.find((e) => e.errorType === ErrorType.NAME);

        expect(divByZeroError).toBeDefined();
        expect(divByZeroError!.formula).toContain('=');

        expect(nameError).toBeDefined();
        expect(nameError!.formula).toContain('=');
    });

    it('should find errors across multiple sheets', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const errors = workbook.getAllFormulaError();

        const sheetNames = new Set(errors.map((e) => e.sheetName));

        // Should find errors in both sheets
        expect(sheetNames.has('sheet1')).toBe(true);
        expect(sheetNames.has('sheet2')).toBe(true);
        expect(sheetNames.size).toBe(2);
    });
});

describe('worksheet scoped names through real formula calculation', () => {
    let scopedUniver: Univer | undefined;

    afterEach(() => scopedUniver?.dispose());

    async function createScopedWorkbook(localOrderName: boolean, isolatedScopes = false) {
        const formulaCells: Record<number, ICellData> = {
            9: { f: '=ScopedRate' },
            10: { f: '=SUM(ScopedRate,1)' },
        };
        if (isolatedScopes) {
            formulaCells[11] = { f: '=sCoPeDrAtE' };
        }
        scopedUniver = new Univer();
        const injector = scopedUniver.__getInjector();
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...formulaEnUS } });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        scopedUniver.registerPlugin(UniverSheetsFormulaPlugin);
        const api = FUniver.newAPI(scopedUniver);
        const workbook = api.createWorkbook({
            id: 'scoped-calculation',
            name: 'Scoped calculation',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: isolatedScopes ? ['orders', 'summary', 'scratch', 'copy'] : ['orders', 'summary'],
            sheets: {
                orders: {
                    id: 'orders',
                    name: 'Orders',
                    rowCount: 20,
                    columnCount: 20,
                    cellData: {
                        0: formulaCells,
                        6: { 4: { v: 5 }, 5: { v: 8 } },
                    },
                },
                summary: {
                    id: 'summary',
                    name: 'Summary',
                    rowCount: 20,
                    columnCount: 20,
                    cellData: { 0: { 0: { f: '=ScopedRate' } } },
                },
                ...(isolatedScopes
                    ? {
                        scratch: {
                            id: 'scratch',
                            name: 'Scratch',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: { 0: { 0: { f: '=ScopedRate' } }, 6: { 4: { v: 7 } } },
                        },
                        copy: {
                            id: 'copy',
                            name: 'Rates Copy',
                            rowCount: 20,
                            columnCount: 20,
                            cellData: { 0: { 0: { f: '=ScopedRate' } }, 6: { 4: { v: 9 } } },
                        },
                    }
                    : {}),
            },
        });
        const orders = workbook.getSheetByName('Orders')!;
        workbook.insertDefinedName('ScopedRate', 'Orders!$F$7');
        if (localOrderName) {
            orders.insertDefinedName('ScopedRate', 'Orders!$E$7');
        }
        if (isolatedScopes) {
            workbook.getSheetByName('Scratch')!.insertDefinedName('ScopedRate', 'Scratch!$E$7');
            workbook.getSheetByName('Rates Copy')!.insertDefinedName('ScopedRate', "'Rates Copy'!$E$7");
        }
        const initial = api.getFormula().onCalculationResultApplied(5_000);
        injector.get(LifecycleService).stage = LifecycleStages.Rendered;
        await initial;
        expect(orders.getRange('J1').getValue()).toBe(localOrderName ? 5 : 8);
        expect(orders.getRange('K1').getValue()).toBe(localOrderName ? 6 : 9);
        expect(workbook.getSheetByName('Summary')!.getRange('A1').getValue()).toBe(8);
        return { api, workbook, orders, injector };
    }

    it.each(['remove', 'rename'] as const)('isolates %s of a local alias by its resolved identity', async (action) => {
        const { api, workbook, orders, injector } = await createScopedWorkbook(true, true);
        const definedNames = injector.get(IDefinedNamesService);
        const names = () => Tools.deepClone(Object.values(definedNames.getDefinedNameMap(workbook.getId())!))
            .sort((first, second) => first.id.localeCompare(second.id));
        const originalNames = names();
        const localName = orders.getDefinedNames()[0];
        const localId = definedNames.getValueByName(workbook.getId(), 'ScopedRate', orders.getSheetId())!.id;
        const independentApplied = api.getFormula().onCalculationResultApplied(5_000);
        const independent = api.createWorkbook({ ...workbook.save(), id: 'independent-scoped-calculation' });
        await independentApplied;
        expect(orders.getRange('J1:L1').getValues()).toEqual([[5, 6, 5]]);
        const assertOthers = () => {
            for (const [sheetName, value] of [['Scratch', 7], ['Rates Copy', 9], ['Summary', 8]] as const) {
                const sheet = workbook.getSheetByName(sheetName)!;
                expect(sheet.getRange('A1').getFormula()).toBe('=ScopedRate');
                expect(sheet.getRange('A1').getValue()).toBe(value);
            }
            expect(independent.getSheetByName('Orders')!.getRange('J1:L1').getFormulas())
                .toEqual([['=ScopedRate', '=SUM(ScopedRate,1)', '=sCoPeDrAtE']]);
            expect(independent.getSheetByName('Orders')!.getRange('J1:L1').getValues()).toEqual([[5, 6, 5]]);
            expect(names().filter((name) => name.id !== localId))
                .toEqual(originalNames.filter((name) => name.id !== localId));
        };
        const assertAffected = () => {
            assertOthers();
            const formula = action === 'remove' ? '#REF!' : 'OrdersRate';
            expect(orders.getRange('J1:L1').getFormulas())
                .toEqual([[`=${formula}`, `=SUM(${formula},1)`, `=${formula}`]]);
            expect(orders.getRange('J1:L1').getValues()).toEqual(action === 'remove'
                ? [[ErrorType.REF, ErrorType.REF, ErrorType.REF]]
                : [[5, 6, 5]]);
            if (action === 'remove') {
                expect(names().find((name) => name.id === localId)).toBeUndefined();
            } else {
                expect(names().find((name) => name.id === localId)).toEqual({
                    ...originalNames.find((name) => name.id === localId)!,
                    name: 'OrdersRate',
                });
            }
        };
        const changed = api.getFormula().onCalculationResultApplied(5_000);
        if (action === 'remove') {
            localName.delete();
        } else {
            localName.setName('OrdersRate');
        }
        await changed;
        assertAffected();
        const undone = api.getFormula().onCalculationResultApplied(5_000);
        workbook.undo();
        await undone;
        expect(orders.getRange('J1:L1').getFormulas())
            .toEqual([['=ScopedRate', '=SUM(ScopedRate,1)', '=sCoPeDrAtE']]);
        expect(orders.getRange('J1:L1').getValues()).toEqual([[5, 6, 5]]);
        expect(names()).toEqual(originalNames);
        assertOthers();
        const redone = api.getFormula().onCalculationResultApplied(5_000);
        workbook.redo();
        await redone;
        assertAffected();
        const expectedFormulas = orders.getRange('J1:L1').getFormulas();
        const expectedNames = names();
        const saved = workbook.save();
        expect(api.disposeUnit(workbook.getId())).toBe(true);
        const reopened = api.getFormula().onCalculationResultApplied(5_000);
        const restored = api.createWorkbook(saved);
        await reopened;
        const restoredOrders = restored.getSheetByName('Orders')!;
        expect(restoredOrders.getRange('J1:L1').getFormulas()).toEqual(expectedFormulas);
        expect(names()).toEqual(expectedNames);
        const edited = api.getFormula().onCalculationResultApplied(5_000);
        restoredOrders.getRange('E7').setValue(6);
        await edited;
        expect(restoredOrders.getRange('J1:L1').getValues()).toEqual(action === 'remove'
            ? [[ErrorType.REF, ErrorType.REF, ErrorType.REF]]
            : [[6, 7, 6]]);
        for (const [sheetName, value] of [['Scratch', 7], ['Rates Copy', 9], ['Summary', 8]] as const) {
            expect(restored.getSheetByName(sheetName)!.getRange('A1').getFormula()).toBe('=ScopedRate');
            expect(restored.getSheetByName(sheetName)!.getRange('A1').getValue()).toBe(value);
        }
        expect(independent.getSheetByName('Orders')!.getRange('J1:L1').getValues()).toEqual([[5, 6, 5]]);
    });

    it('rebinds an already calculated global alias when a local alias shadows it', async () => {
        const { api, workbook, orders } = await createScopedWorkbook(false);
        const localApplied = api.getFormula().onCalculationResultApplied(5_000);
        orders.insertDefinedName('ScopedRate', 'Orders!$E$7');
        await localApplied;
        expect(orders.getRange('J1').getValue()).toBe(5);
        expect(orders.getRange('K1').getValue()).toBe(6);
        expect(workbook.getSheetByName('Summary')!.getRange('A1').getValue()).toBe(8);
        const edited = api.getFormula().onCalculationResultApplied(5_000);
        orders.getRange('E7').setValue(6);
        await edited;
        expect(orders.getRange('J1:K1').getValues()).toEqual([[6, 7]]);
        const undone = api.getFormula().onCalculationResultApplied(5_000);
        workbook.undo();
        await undone;
        expect(orders.getRange('J1:K1').getValues()).toEqual([[5, 6]]);
        const redone = api.getFormula().onCalculationResultApplied(5_000);
        workbook.redo();
        await redone;
        expect(orders.getRange('J1:K1').getValues()).toEqual([[6, 7]]);
        const saved = workbook.save();
        expect(api.disposeUnit(workbook.getId())).toBe(true);
        const restored = api.createWorkbook(saved);
        const restoredOrders = restored.getSheetByName('Orders')!;
        const restoredEdit = api.getFormula().onCalculationResultApplied(5_000);
        restoredOrders.getRange('E7').setValue(7);
        await restoredEdit;
        expect(restoredOrders.getRange('J1:K1').getValues()).toEqual([[7, 8]]);
        expect(restored.getSheetByName('Summary')!.getRange('A1').getValue()).toBe(8);
    });

    it('rebinds a copied formula after rename and creation of its own local alias', async () => {
        const { api, workbook, orders } = await createScopedWorkbook(true);
        const duplicated = api.getFormula().onCalculationResultApplied(5_000);
        const copied = workbook.duplicateSheet(orders);
        copied.setName('Rates Copy');
        await duplicated;
        expect(copied.getRange('J1:K1').getValues()).toEqual([[8, 9]]);
        copied.insertDefinedName('ScopedRate', "'Rates Copy'!$E$7");
        const copyApplied = api.getFormula().onCalculationResultApplied(5_000);
        copied.getRange('E7').setValue(9);
        await copyApplied;
        expect(copied.getRange('J1').getFormula()).toBe('=ScopedRate');
        expect(copied.getRange('J1').getValue()).toBe(9);
        expect(copied.getRange('K1').getValue()).toBe(10);
        expect(orders.getRange('J1').getValue()).toBe(5);
        expect(workbook.getSheetByName('Summary')!.getRange('A1').getValue()).toBe(8);
        const subsequentEdit = api.getFormula().onCalculationResultApplied(5_000);
        copied.getRange('E7').setValue(10);
        await subsequentEdit;
        expect(copied.getRange('J1:K1').getValues()).toEqual([[10, 11]]);
        expect(orders.getRange('J1:K1').getValues()).toEqual([[5, 6]]);
    });
});
