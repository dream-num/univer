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
import type { ISheetAutoFillHook } from '@univerjs/sheets';
import {
    DataValidationOperator,
    DataValidationType,
    Direction,
    ICommandService,
    ILogService,
    IResourceLoaderService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Range,
    RedoCommand,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { AddDataValidationMutation, UniverDataValidationPlugin } from '@univerjs/data-validation';
import { AUTO_FILL_APPLY_TYPE, IAutoFillService, UniverSheetsPlugin } from '@univerjs/sheets';
import {
    AddSheetDataValidationCommand,
    DATA_VALIDATION_PLUGIN_NAME,
    SheetDataValidationModel,
    UniverSheetsDataValidationPlugin,
} from '@univerjs/sheets-data-validation';
import enUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDvUiTestBed } from '../../__tests__/create-dv-ui-test-bed';
import { DataValidationAutoFillController } from '../dv-auto-fill.controller';

describe('DataValidationAutoFillController', () => {
    let testBed: ReturnType<typeof createDvUiTestBed>;
    let hook: ISheetAutoFillHook;

    beforeEach(() => {
        testBed = createDvUiTestBed();
        testBed.injector.add([DataValidationAutoFillController]);
        testBed.injector.get(DataValidationAutoFillController);
        const registeredHook = testBed.autoFillService.getAllHooks().find((item) => item.id === DATA_VALIDATION_PLUGIN_NAME);
        if (!registeredHook) {
            throw new Error('Data validation autofill hook was not registered');
        }
        hook = registeredHook;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        testBed.univer.dispose();
    });

    it('disables series fill for checkbox rules without querying each source cell', async () => {
        await testBed.commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: {
                uid: 'checkbox-rule',
                type: DataValidationType.CHECKBOX,
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            },
        });
        vi.spyOn(testBed.dataValidationModel, 'getRuleByLocation').mockImplementation(() => {
            throw new Error('must not query validation by cell');
        });

        hook.onBeforeFillData?.({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            source: {
                rows: Array.from({ length: 100_000 }, (_, index) => index),
                cols: Array.from({ length: 1_000 }, (_, index) => index),
            },
            target: { rows: [100_000], cols: [0] },
        }, Direction.DOWN);

        expect(testBed.autoFillService.menu.find((item) => item.value === AUTO_FILL_APPLY_TYPE.SERIES)?.disable).toBe(true);
    });

    it('ignores checkbox rules that only cover filtered-out source rows', async () => {
        await testBed.commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: {
                uid: 'filtered-checkbox-rule',
                type: DataValidationType.CHECKBOX,
                ranges: [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 }],
            },
        });
        vi.spyOn(testBed.dataValidationModel, 'getRuleByLocation').mockImplementation(() => {
            throw new Error('must not query validation by cell');
        });

        hook.onBeforeFillData?.({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            source: { rows: [0, 2], cols: [0] },
            target: { rows: [3], cols: [0] },
        }, Direction.DOWN);

        expect(testBed.autoFillService.menu.find((item) => item.value === AUTO_FILL_APPLY_TYPE.SERIES)?.disable).toBe(false);
    });

    it('executes and undoes real validation mutations without enumerating autofill cells', async () => {
        await testBed.commandService.executeCommand(AddDataValidationMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            rule: {
                uid: 'decimal-rule',
                type: DataValidationType.DECIMAL,
                formula1: '1',
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            },
        });
        const foreach = vi.spyOn(Range, 'foreach').mockImplementation(() => {
            throw new Error('must not enumerate cells');
        });
        const location = {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            source: { rows: [0], cols: [0] },
            target: { rows: [1], cols: [0] },
        };

        const result = hook.onFillData?.(location, Direction.DOWN, AUTO_FILL_APPLY_TYPE.COPY);
        if (!result) {
            throw new Error('Data validation autofill did not return mutations');
        }
        foreach.mockRestore();
        for (const mutation of result.redos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }
        expect(testBed.dataValidationModel.getRuleByLocation(testBed.unitId, testBed.subUnitId, 0, 0)?.uid).toBe('decimal-rule');
        expect(testBed.dataValidationModel.getRuleByLocation(testBed.unitId, testBed.subUnitId, 1, 0)?.uid).toBe('decimal-rule');

        for (const mutation of result.undos) {
            await testBed.commandService.executeCommand(mutation.id, mutation.params);
        }
        expect(testBed.dataValidationModel.getRuleByLocation(testBed.unitId, testBed.subUnitId, 0, 0)?.uid).toBe('decimal-rule');
        expect(testBed.dataValidationModel.getRuleByLocation(testBed.unitId, testBed.subUnitId, 1, 0)).toBeUndefined();
    });
});

describe('DataValidationAutoFillController real autofill', () => {
    let univer: Univer;

    afterEach(() => {
        univer?.dispose();
    });

    it.each([
        { direction: 'down', startRow: 3, endRow: 8, startColumn: 3, endColumn: 5, row: 8, col: 5 },
        { direction: 'up remainder', startRow: 2, endRow: 5, startColumn: 3, endColumn: 5, row: 2, col: 5 },
        { direction: 'left remainder', startRow: 3, endRow: 5, startColumn: 2, endColumn: 5, row: 5, col: 2 },
    ].flatMap((fill) => [AUTO_FILL_APPLY_TYPE.COPY, AUTO_FILL_APPLY_TYPE.ONLY_FORMAT].map((applyType) => (
        { ...fill, applyType }
    ))))('fills offset rules $direction $applyType without clearing source or neighbors', async (fill) => {
        univer = new Univer();
        const injector = univer.__getInjector();
        univer.registerPlugin(UniverDataValidationPlugin);
        univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
        univer.registerPlugin(UniverSheetsDataValidationPlugin);
        injector.add([DataValidationAutoFillController]);
        const locale = injector.get(LocaleService);
        locale.load({ enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        injector.get(ILogService).setLogLevel(LogLevel.SILENT);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'autofill',
            name: 'Autofill',
            locale: LocaleType.EN_US,
            appVersion: '1.0.0',
            styles: {},
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    name: 'Sheet',
                    rowCount: 30,
                    columnCount: 10,
                    cellData: {
                        0: { 0: { v: 777 } },
                        3: { 3: { v: 1 }, 4: { v: 2 }, 5: { v: 3 } },
                        4: { 3: { v: 4 }, 4: { v: 5 }, 5: { v: 6 } },
                        5: { 3: { v: 7 }, 4: { v: 8 }, 5: { v: 9 } },
                    },
                },
            },
        });
        injector.get(IUniverInstanceService).focusUnit('autofill');
        injector.get(DataValidationAutoFillController);
        const commands = injector.get(ICommandService);
        const model = injector.get(SheetDataValidationModel);
        const history = injector.get(IUndoRedoService);
        for (const cell of [
            { uid: 'sentinel', row: 0, col: 0 },
            { uid: 'first-cell', row: 3, col: 3 },
            { uid: 'middle-cell', row: 4, col: 4 },
            { uid: 'last-cell', row: 5, col: 5 },
        ]) {
            expect(await commands.executeCommand(AddSheetDataValidationCommand.id, {
                unitId: 'autofill',
                subUnitId: 'sheet',
                rule: {
                    uid: cell.uid,
                    type: DataValidationType.DECIMAL,
                    operator: DataValidationOperator.GREATER_THAN,
                    formula1: '0',
                    ranges: [{ startRow: cell.row, endRow: cell.row, startColumn: cell.col, endColumn: cell.col }],
                },
            })).toBe(true);
        }
        history.clearUndoRedo('autofill');
        const originalRules = Tools.deepClone(model.getRules('autofill', 'sheet'));
        expect(await injector.get(IAutoFillService).triggerAutoFill(
            'autofill',
            'sheet',
            { startRow: 3, endRow: 5, startColumn: 3, endColumn: 5 },
            {
                startRow: fill.startRow,
                endRow: fill.endRow,
                startColumn: fill.startColumn,
                endColumn: fill.endColumn,
            },
            fill.applyType
        )).toBe(true);
        expect(workbook.getActiveSheet()?.getCellRaw(fill.row, fill.col)?.v)
            .toBe(fill.applyType === AUTO_FILL_APPLY_TYPE.COPY ? 9 : undefined);
        expect(model.getRuleByLocation('autofill', 'sheet', fill.row, fill.col)?.uid).toBe('last-cell');
        expect(model.getRuleByLocation('autofill', 'sheet', 3, 3)?.uid).toBe('first-cell');
        expect(model.getRuleByLocation('autofill', 'sheet', 4, 4)?.uid).toBe('middle-cell');
        expect(model.getRuleByLocation('autofill', 'sheet', 5, 5)?.uid).toBe('last-cell');
        expect(model.getRuleByLocation('autofill', 'sheet', 0, 0)?.uid).toBe('sentinel');
        expect(workbook.getActiveSheet()?.getCellRaw(0, 0)?.v).toBe(777);
        const filledRules = Tools.deepClone(model.getRules('autofill', 'sheet'));
        const expectedTargets = fill.direction === 'down'
            ? [
                { startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 },
                { startRow: 7, endRow: 7, startColumn: 4, endColumn: 4 },
                { startRow: 8, endRow: 8, startColumn: 5, endColumn: 5 },
            ]
            : [{ startRow: fill.row, endRow: fill.row, startColumn: fill.col, endColumn: fill.col }];
        const expectedRanges = [...originalRules.flatMap((rule) => rule.ranges), ...expectedTargets];
        expect(filledRules.flatMap((rule) => rule.ranges)).toHaveLength(expectedRanges.length);
        expect(filledRules.flatMap((rule) => rule.ranges)).toEqual(expect.arrayContaining(expectedRanges));
        expect(history.getUndoRedoStatus('autofill')).toEqual({ undos: 1, redos: 0 });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(model.getRules('autofill', 'sheet')).toEqual(originalRules);
        expect(workbook.getActiveSheet()?.getCellRaw(fill.row, fill.col)?.v).toBeUndefined();
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(model.getRules('autofill', 'sheet')).toEqual(filledRules);
        const saved = injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('autofill');
        if (!saved) {
            throw new Error('Resource loader did not save the autofill workbook');
        }
        injector.get(IUniverInstanceService).disposeUnit('autofill');
        univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, saved);
        expect(model.getRules('autofill', 'sheet')).toEqual(filledRules);
    });
});
