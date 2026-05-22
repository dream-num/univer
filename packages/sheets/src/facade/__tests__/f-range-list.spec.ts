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

import type { ICellData, Injector, IStyleData, Nullable } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { ICommandService, IUniverInstanceService, TextDirection, WrapStrategy } from '@univerjs/core';
import { ClearSelectionContentCommand, ClearSelectionFormatCommand, InsertSheetCommand, InsertSheetMutation, SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetSelectionsOperation, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FRangeList', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
    let getStyleByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<IStyleData>;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        const commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(ClearSelectionContentCommand);
        commandService.registerCommand(ClearSelectionFormatCommand);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetWorksheetActiveOperation);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();

        getStyleByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<IStyleData> => {
            const value = getValueByPosition(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };
    });

    it('Worksheet getRangeList returns ranges in A1 order', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const rangeList = activeSheet.getRangeList(['A1:B2', 'D1:E2']);

        expect(rangeList.getRanges().map((range) => range.getA1Notation())).toEqual(['A1:B2', 'D1:E2']);
    });

    it('RangeList applies chainable style operations to non-contiguous ranges', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();

        activeSheet.getRangeList(['A1:B2', 'D1:E2'])
            .setBackgroundColor('#fce4d6')
            .setFontWeight('bold');

        expect(getStyleByPosition(0, 0, 0, 0)?.bg?.rgb).toBe('#fce4d6');
        expect(getStyleByPosition(1, 1, 1, 1)?.bg?.rgb).toBe('#fce4d6');
        expect(getStyleByPosition(0, 3, 0, 3)?.bg?.rgb).toBe('#fce4d6');
        expect(getStyleByPosition(1, 4, 1, 4)?.bg?.rgb).toBe('#fce4d6');
        expect(getStyleByPosition(0, 0, 0, 0)?.bl).toBe(1);
        expect(getStyleByPosition(1, 4, 1, 4)?.bl).toBe(1);

        activeSheet.getRangeList(['A3:B3', 'D3:E3'])
            .setTextDirection(TextDirection.RIGHT_TO_LEFT);

        expect(getStyleByPosition(2, 0, 2, 0)?.td).toBe(TextDirection.RIGHT_TO_LEFT);
        expect(getStyleByPosition(2, 4, 2, 4)?.td).toBe(TextDirection.RIGHT_TO_LEFT);
    });

    it('RangeList applies value, formula, wrapping, and clear operations', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();

        activeSheet.getRangeList(['A1', 'C1'])
            .setValue('Ready')
            .setWrap(true);

        expect(activeSheet.getRange('A1').getValue()).toBe('Ready');
        expect(activeSheet.getRange('C1').getValue()).toBe('Ready');
        expect(getStyleByPosition(0, 0, 0, 0)?.tb).toBe(WrapStrategy.WRAP);
        expect(getStyleByPosition(0, 2, 0, 2)?.tb).toBe(WrapStrategy.WRAP);

        activeSheet.getRangeList(['A2', 'C2'])
            .setFormula('=SUM(A1:C1)')
            .setWrap(true);
        expect(activeSheet.getRange('A2').getFormula()).toBe('=SUM(A1:C1)');
        expect(activeSheet.getRange('C2').getFormula()).toBe('=SUM(A1:C1)');
        expect(getStyleByPosition(1, 0, 1, 0)?.tb).toBe(WrapStrategy.WRAP);
        expect(getStyleByPosition(1, 2, 1, 2)?.tb).toBe(WrapStrategy.WRAP);

        const contentRangeList = activeSheet.getRangeList(['A1', 'C1']);
        const formatRangeList = activeSheet.getRangeList(['A2', 'C2']);
        expect(contentRangeList.clearContent()).toBe(contentRangeList);
        expect(formatRangeList.clearFormat()).toBe(formatRangeList);
    });

    it('RangeList supports RGB background convenience and activation', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();

        activeSheet.getRangeList(['D4', 'B2:C4'])
            .setBackgroundRGB(255, 0, 0)
            .activate();

        expect(getStyleByPosition(3, 3, 3, 3)?.bg?.rgb).toBe('#ff0000');
        expect(getStyleByPosition(1, 1, 1, 1)?.bg?.rgb).toBe('#ff0000');
        expect(activeSheet.getSelection()?.getActiveRange()?.getA1Notation()).toBe('B2:C4');
        expect(activeSheet.getSelection()?.getActiveRangeList().map((range) => range.getA1Notation())).toEqual(['D4', 'B2:C4']);
    });

    it('Worksheet getRangeList rejects empty lists', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();

        expect(() => activeSheet.getRangeList([])).toThrow('Range list cannot be empty');
    });

    it('Worksheet getRangeList supports sheet-qualified ranges on other sheets', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const activeSheet = workbook.getActiveSheet();
        const sheet2 = workbook.insertSheet('sheet2');

        activeSheet.getRangeList(['A1', 'sheet2!C1']).setValue('range value');

        expect(activeSheet.getRange('A1').getValue()).toBe('range value');
        expect(sheet2.getRange('C1').getValue()).toBe('range value');
    });

    it('RangeList activate requires all ranges to belong to one sheet', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const activeSheet = workbook.getActiveSheet();
        workbook.insertSheet('sheet2');

        expect(() => activeSheet.getRangeList(['A1', 'sheet2!A1']).activate()).toThrow('Cannot activate a range list across multiple worksheets');
    });
});
