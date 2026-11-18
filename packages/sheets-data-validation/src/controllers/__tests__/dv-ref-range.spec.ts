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

import type { IAccessor, Injector, IRange, IWorkbookData } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { DataValidationType, Direction, ICommandService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { serializeRange } from '@univerjs/engine-formula';
import { InsertColByRangeCommand, InsertColMutation, InsertRowByRangeCommand, InsertRowMutation, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { FormulaRefRangeService } from '@univerjs/sheets-formula';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AddSheetDataValidationCommand, ClearRangeDataValidationCommand, UpdateSheetDataValidationRangeCommand } from '../../commands/commands/data-validation.command';
import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { createDefaultNewRule } from '../../utils/create';
import { DataValidationFormulaRefRangeController } from '../dv-formula-ref-range.controller';
import { DataValidationRefRangeController } from '../dv-ref-range.controller';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: ['sheet1'],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                rowCount: 100,
                columnCount: 26,
                cellData: {},
            },
        },
    };
}

describe('data validation ref range on row and column insertion', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let univer: ReturnType<typeof createFacadeTestBed>['univer'];

    beforeEach(() => {
        // a number rule is handled by the formula based ref-range controller, which transforms
        // the rule ranges together with its formulas
        const testBed = createFacadeTestBed(createWorkbookData(), [
            [DataValidationFormulaRefRangeController],
            [DataValidationRefRangeController],
            [FormulaRefRangeService],
            [DataValidatorRegistryService],
        ]);
        univer = testBed.univer;
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        const commandService = get(ICommandService);
        [
            AddSheetDataValidationCommand,
            ClearRangeDataValidationCommand,
            UpdateSheetDataValidationRangeCommand,
            InsertRowByRangeCommand,
            InsertRowMutation,
            InsertColByRangeCommand,
            InsertColMutation,
            SetSelectionsOperation,
        ].forEach((command) => commandService.registerCommand(command));

        // instantiate the controllers before rules are added, so that they subscribe to rule changes
        get(DataValidationFormulaRefRangeController);
        get(DataValidationRefRangeController);
    });

    afterEach(() => {
        univer.dispose();
    });

    function insertRows(startRow: number, direction: Direction.UP | Direction.DOWN) {
        expect(get(ICommandService).syncExecuteCommand(InsertRowByRangeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            direction,
            range: { startRow, endRow: startRow, startColumn: 0, endColumn: 25 },
        })).toBeTruthy();
    }

    function insertColumns(startColumn: number, direction: Direction.LEFT | Direction.RIGHT) {
        expect(get(ICommandService).syncExecuteCommand(InsertColByRangeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            direction,
            range: { startRow: 0, endRow: 99, startColumn, endColumn: startColumn },
        })).toBeTruthy();
    }

    function setUpRule(rangeA1: string) {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        worksheet.getRange(rangeA1).setDataValidation(
            univerAPI.newDataValidation().requireNumberBetween(0, 100).build()
        );

        const ruleRanges = () => worksheet.getDataValidations().flatMap((rule) => rule.rule.ranges);
        const ruleA1Notations = () => worksheet.getDataValidations()
            .flatMap((rule) => rule.getRanges().map((range) => range.getA1Notation()));

        return { worksheet, ruleRanges, ruleA1Notations };
    }

    it('shifts the rule when a row is inserted right above the rule range', () => {
        const { ruleA1Notations } = setUpRule('A2:A10');

        // the UP entry creates the new row 2
        insertRows(1, Direction.UP);
        expect(ruleA1Notations()).toEqual(['A3:A11']);
    });

    it('shifts the rule identically when the same row is inserted through the DOWN entry', () => {
        const { ruleA1Notations } = setUpRule('A2:A10');

        // the DOWN entry creates the same new row 2
        insertRows(1, Direction.DOWN);
        expect(ruleA1Notations()).toEqual(['A3:A11']);
    });

    it('keeps the rule untouched when the row is inserted right below the rule range', () => {
        const { ruleA1Notations } = setUpRule('A2:A10');

        insertRows(10, Direction.UP);
        expect(ruleA1Notations()).toEqual(['A2:A10']);
    });

    it('keeps the rule untouched when the row below is inserted through the DOWN entry', () => {
        const { ruleA1Notations } = setUpRule('A2:A10');

        insertRows(10, Direction.DOWN);
        expect(ruleA1Notations()).toEqual(['A2:A10']);
    });

    it('keeps the inserted row covered when it is inserted inside the rule range', () => {
        const { ruleA1Notations } = setUpRule('A2:A10');

        insertRows(5, Direction.UP);
        expect(ruleA1Notations()).toEqual(['A2:A11']);
    });

    it('keeps a whole column rule whole when rows are inserted', () => {
        const { ruleRanges, ruleA1Notations } = setUpRule('A:A');
        expect(ruleA1Notations()).toEqual(['A:A']);

        // rows are inserted above and inside the rule range
        insertRows(0, Direction.UP);
        insertRows(5, Direction.UP);

        expect(ruleRanges()).toMatchObject([{ startRow: 0, rangeType: RANGE_TYPE.COLUMN }]);
        expect(ruleRanges()[0].endRow).toBe(101);
        expect(ruleA1Notations()).toEqual(['A:A']);
    });

    it('keeps a whole row rule whole when columns are inserted', () => {
        const { ruleRanges, ruleA1Notations } = setUpRule('1:1');
        expect(ruleA1Notations()).toEqual(['1:1']);

        insertColumns(0, Direction.LEFT);
        insertColumns(3, Direction.LEFT);

        expect(ruleRanges()).toMatchObject([{ startColumn: 0, rangeType: RANGE_TYPE.ROW }]);
        expect(ruleRanges()[0].endColumn).toBe(27);
        expect(ruleA1Notations()).toEqual(['1:1']);
    });

    it('drops the whole column type when only part of the rule is cleared', () => {
        const { worksheet } = setUpRule('A:A');

        get(ICommandService).syncExecuteCommand(ClearRangeDataValidationCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 0, endRow: 49, startColumn: 0, endColumn: 0 }],
        });

        const rules = worksheet.getDataValidations();
        expect(rules.map((rule) => rule.rule.ranges)).toMatchObject([[{ startRow: 50, endRow: 99 }]]);
        expect(rules[0].rule.ranges[0].rangeType).toBeUndefined();
    });

    it('keeps a whole column rule created from a column selection', () => {
        // this is what the UI produces when the user picks a whole column through the column header
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        get(ICommandService).syncExecuteCommand(AddSheetDataValidationCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule: {
                uid: 'column-rule',
                type: DataValidationType.DECIMAL,
                operator: 0,
                formula1: '0',
                formula2: '100',
                ranges: [{
                    startRow: 0,
                    endRow: 99,
                    startColumn: 0,
                    endColumn: 0,
                    rangeType: RANGE_TYPE.COLUMN,
                }],
            },
        });

        insertRows(0, Direction.UP);

        const rules = worksheet.getDataValidations();
        expect(rules.map((rule) => rule.rule.ranges)).toMatchObject([[{ startRow: 0, endRow: 100, rangeType: RANGE_TYPE.COLUMN }]]);
        expect(rules.flatMap((rule) => rule.getRanges().map((range) => range.getA1Notation()))).toEqual(['A:A']);
    });

    it('keeps the range type when the panel rewrites the rule range', () => {
        const { worksheet } = setUpRule('A:A');

        // the range selector of the panel emits a whole column range with empty row bounds
        get(ICommandService).syncExecuteCommand(UpdateSheetDataValidationRangeCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ruleId: worksheet.getDataValidations()[0].rule.uid,
            ranges: [{
                startRow: null,
                endRow: null,
                startColumn: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.COLUMN,
            } as unknown as IRange],
        });

        const rules = worksheet.getDataValidations();
        expect(rules.map((rule) => rule.rule.ranges)).toMatchObject([[{ startRow: 0, endRow: 99, rangeType: RANGE_TYPE.COLUMN }]]);
        expect(rules.flatMap((rule) => rule.getRanges().map((range) => range.getA1Notation()))).toEqual(['A:A']);
    });

    it('keeps a whole column list rule whole when rows are inserted', () => {
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        worksheet.getRange('A:A').setDataValidation(
            univerAPI.newDataValidation().requireValueInList(['Yes', 'No']).build()
        );

        insertRows(0, Direction.UP);

        const rules = worksheet.getDataValidations();
        expect(rules.map((rule) => rule.rule.ranges)).toMatchObject([[{ startRow: 0, endRow: 100, rangeType: RANGE_TYPE.COLUMN }]]);
        expect(rules.flatMap((rule) => rule.getRanges().map((range) => range.getA1Notation()))).toEqual(['A:A']);
    });

    it('creates a whole column rule from a column selection, like the panel new rule button does', () => {
        // the panel takes the current selection as the rule range
        get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 99, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.COLUMN },
            primary: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                actualRow: 0,
                actualColumn: 0,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);

        const rule = createDefaultNewRule({ get } as unknown as IAccessor);
        expect(rule.ranges[0]).toMatchObject({ startRow: 0, endRow: 99, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.COLUMN });
        // the panel renders the rule range with serializeRange
        expect(serializeRange(rule.ranges[0])).toBe('A:A');

        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        get(ICommandService).syncExecuteCommand(AddSheetDataValidationCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rule,
        });

        expect(worksheet.getDataValidations().flatMap((item) => item.getRanges().map((range) => range.getA1Notation()))).toEqual(['A:A']);
        expect(serializeRange(worksheet.getDataValidations()[0].rule.ranges[0])).toBe('A:A');

        insertRows(0, Direction.UP);

        expect(worksheet.getDataValidations().flatMap((item) => item.getRanges().map((range) => range.getA1Notation()))).toEqual(['A:A']);
        expect(serializeRange(worksheet.getDataValidations()[0].rule.ranges[0])).toBe('A:A');
    });
});
