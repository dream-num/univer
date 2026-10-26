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

import type {
    ICellData,
    IDocumentData,
    Injector,
    IStyleData,
    Nullable,
    RichTextValue,
    Workbook,
} from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import {
    AbsoluteRefType,
    BooleanNumber,
    BorderStyleTypes,
    BorderType,
    CellValueType,
    DEFAULT_NUMBER_FORMAT,
    Dimension,
    HorizontalAlign,
    ICommandService,
    IConfirmService,
    ILogService,
    IUniverInstanceService,
    LifecycleStages,
    TestConfirmService,
    Tools,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import {
    AddWorksheetMergeCommand,
    AddWorksheetMergeMutation,
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    DeleteWorksheetRangeThemeStyleCommand,
    DeleteWorksheetRangeThemeStyleMutation,
    InsertColMutation,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowMutation,
    MoveRangeMutation,
    RegisterWorksheetRangeThemeStyleCommand,
    RegisterWorksheetRangeThemeStyleMutation,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SetHorizontalTextAlignCommand,
    SetRangeCustomMetadataCommand,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetShrinkToFitCommand,
    SetStyleCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SetWorksheetRangeThemeStyleCommand,
    SetWorksheetRangeThemeStyleMutation,
    SheetRangeThemeModel,
    SheetRangeThemeService,
    SheetSkeletonService,
    UnregisterWorksheetRangeThemeStyleMutation,
} from '@univerjs/sheets';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FRange } from '../f-range';
import type { FWorksheet } from '../f-worksheet';
import { SetBorderBasicCommand, SetBorderCommand } from '../../commands/commands/set-border.command';
import { BorderStyleManagerService } from '../../services/border-style-manager.service';
import { SHEETS_CUSTOM_FIELD_WARNING_MESSAGE } from '../const';
import { createFacadeTestBed } from './create-test-bed';

describe('FRange style-only text preservation', () => {
    it.each<{ name: string; apply: (range: FRange) => FRange }>([
        { name: 'setFontWeight', apply: (range) => range.setFontWeight('bold') },
        { name: 'setFontStyle', apply: (range) => range.setFontStyle('italic') },
        { name: 'setFontColor', apply: (range) => range.setFontColor('#ffff00') },
        { name: 'setFontFamily', apply: (range) => range.setFontFamily('Arial') },
        { name: 'setFontSize', apply: (range) => range.setFontSize(20) },
        { name: 'setBackground', apply: (range) => range.setBackground('#ffff00') },
        { name: 'setBackgroundColor', apply: (range) => range.setBackgroundColor('#ffff00') },
        { name: 'setHorizontalAlignment', apply: (range) => range.setHorizontalAlignment('center') },
        { name: 'setVerticalAlignment', apply: (range) => range.setVerticalAlignment('middle') },
        { name: 'setWrap', apply: (range) => range.setWrap(true) },
        { name: 'setBorder', apply: (range) => range.setBorder(BorderType.ALL, BorderStyleTypes.THIN, '#ffff00') },
        {
            name: 'setValues with style-only cells',
            apply: (range) => range.setValues(Array.from({ length: range.getHeight() }, () =>
                Array.from({ length: range.getWidth() }, () => ({ s: { bl: BooleanNumber.TRUE } })))),
        },
    ])('preserves values and types through $name, including neighboring border cells', ({ name, apply }) => {
        const bed = createFacadeTestBed(undefined, [[BorderStyleManagerService]]);
        try {
            const commandService = bed.get(ICommandService);
            [
                SetRangeValuesCommand,
                SetRangeValuesMutation,
                SetStyleCommand,
                SetTextWrapCommand,
                SetHorizontalTextAlignCommand,
                SetVerticalTextAlignCommand,
                SetBorderBasicCommand,
                SetBorderCommand,
            ].forEach((command) => commandService.registerCommand(command));
            bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
            const worksheet = bed.univerAPI.getActiveWorkbook()!.getActiveSheet();
            const surroundingRange = worksheet.getRange('A1:J5');
            const border = { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } };
            surroundingRange.setValue({
                v: '001',
                t: CellValueType.STRING,
                s: { bd: { t: border, b: border, l: border, r: border } },
            });
            const cells: ICellData[] = [
                ...['014', '1.50', '1e3', 'abc', '2-2', '12%'].map((v) => ({ v, t: CellValueType.STRING })),
                { v: 14, t: CellValueType.NUMBER },
                { v: 3, t: CellValueType.NUMBER, f: '=1+2' },
            ];
            const range = worksheet.getRange('B2:I4');
            range.setValues([undefined, '000', DEFAULT_NUMBER_FORMAT].map((pattern) =>
                cells.map((cell) => ({ ...cell, s: pattern ? { n: { pattern } } : undefined }))));
            const before = Tools.deepClone(surroundingRange.getCellDataGrid());
            const readValues = () => surroundingRange.getCellDataGrid().map((row) =>
                row.map((cell) => ({ v: cell?.v, t: cell?.t, f: cell?.f })));
            const expected = readValues();
            expect(range.getCellDataGrid().map((row) => row.map((cell) => cell?.v))).toEqual([
                cells.map((cell) => cell.v),
                cells.map((cell) => cell.v),
                cells.map((cell) => cell.v),
            ]);

            apply(range);

            expect(readValues()).toEqual(expected);
            expect(surroundingRange.getCellDataGrid()).not.toEqual(before);
            if (name === 'setBorder') {
                expect(worksheet.getRange('B1').getCellStyleData()?.bd?.b).toBeUndefined();
                expect(worksheet.getRange('B5').getCellStyleData()?.bd?.t).toBeUndefined();
                expect(worksheet.getRange('A2').getCellStyleData()?.bd?.r).toBeUndefined();
                expect(worksheet.getRange('J2').getCellStyleData()?.bd?.l).toBeUndefined();
            }
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('Test FRange', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
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
        const testBed = createFacadeTestBed(undefined, [
            [IConfirmService, { useClass: TestConfirmService }],
            [SheetRangeThemeModel],
            [SheetRangeThemeService],
        ]);
        get = testBed.get;

        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetShrinkToFitCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(RemoveWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(InsertRangeMoveDownCommand);
        commandService.registerCommand(InsertRangeMoveRightCommand);
        commandService.registerCommand(DeleteRangeMoveUpCommand);
        commandService.registerCommand(DeleteRangeMoveLeftCommand);
        commandService.registerCommand(InsertRowMutation);
        commandService.registerCommand(InsertColMutation);
        commandService.registerCommand(RemoveRowMutation);
        commandService.registerCommand(RemoveColMutation);
        commandService.registerCommand(MoveRangeMutation);
        commandService.registerCommand(SetRangeCustomMetadataCommand);
        commandService.registerCommand(SetTextRotationCommand);
        commandService.registerCommand(ClearSelectionAllCommand);
        commandService.registerCommand(ClearSelectionContentCommand);
        commandService.registerCommand(ClearSelectionFormatCommand);
        commandService.registerCommand(RegisterWorksheetRangeThemeStyleCommand);
        commandService.registerCommand(RegisterWorksheetRangeThemeStyleMutation);
        commandService.registerCommand(UnregisterWorksheetRangeThemeStyleMutation);
        commandService.registerCommand(SetWorksheetRangeThemeStyleCommand);
        commandService.registerCommand(SetWorksheetRangeThemeStyleMutation);
        commandService.registerCommand(DeleteWorksheetRangeThemeStyleCommand);
        commandService.registerCommand(DeleteWorksheetRangeThemeStyleMutation);

        get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
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
            const styles = get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };
    });

    it('Range getRow', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        const range = activeSheet?.getRange(0, 0, 1, 1);

        expect(range?.getRow()).toBe(0);
    });

    it('Range getColumn', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        const range = activeSheet?.getRange(0, 0, 1, 1);

        expect(range?.getColumn()).toBe(0);
    });

    it('Range getWidth', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        const range = activeSheet?.getRange(0, 0, 1, 1);

        expect(range?.getWidth()).toBe(1);
    });

    it('Range getHeight', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        const range = activeSheet?.getRange(0, 0, 1, 1);

        expect(range?.getHeight()).toBe(1);
    });

    it('Range setValue', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // // A1 sets the number
        const range1 = activeSheet?.getRange(0, 0, 1, 1);
        range1?.setValue(1);

        expect(activeSheet?.getRange(0, 0, 1, 1)?.getValue()).toBe(1);

        // B1:C2 sets the string
        const range2 = activeSheet?.getRange(0, 1, 2, 2);
        range2?.setValue({ v: 'test' });

        expect(activeSheet?.getRange(0, 1, 1, 1)?.getValue()).toBe('test');
        expect(activeSheet?.getRange(0, 2, 1, 1)?.getValue()).toBe('test');
        expect(activeSheet?.getRange(1, 1, 1, 1)?.getValue()).toBe('test');
        expect(activeSheet?.getRange(1, 2, 1, 1)?.getValue()).toBe('test');

        // D1:E2 sets numbers and background color
        const range3 = activeSheet?.getRange(0, 3, 2, 2);
        range3?.setValue({
            v: 2,
            s: {
                bg: { rgb: 'red' },
            },
        });

        expect(activeSheet?.getRange(0, 3, 1, 1)?.getValue()).toBe(2);
        expect(activeSheet?.getRange(0, 4, 1, 1)?.getValue()).toBe(2);
        expect(activeSheet?.getRange(1, 3, 1, 1)?.getValue()).toBe(2);
        expect(activeSheet?.getRange(1, 4, 1, 1)?.getValue()).toBe(2);

        expect(getStyleByPosition(0, 3, 0, 3)?.bg?.rgb).toBe('red');
        expect(getStyleByPosition(0, 4, 0, 4)?.bg?.rgb).toBe('red');
        expect(getStyleByPosition(1, 3, 1, 3)?.bg?.rgb).toBe('red');
        expect(getStyleByPosition(1, 4, 1, 4)?.bg?.rgb).toBe('red');
    });

    it('Range setValues', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // B3:C4 sets value
        const range1 = activeSheet?.getRange(2, 1, 2, 2);
        range1?.setValues([
            [1, 1],
            [1, 1],
        ]);

        expect(activeSheet?.getRange(2, 1, 1, 1)?.getValue()).toBe(1);
        expect(activeSheet?.getRange(2, 2, 1, 1)?.getValue()).toBe(1);
        expect(activeSheet?.getRange(3, 1, 1, 1)?.getValue()).toBe(1);
        expect(activeSheet?.getRange(3, 2, 1, 1)?.getValue()).toBe(1);

        // D3:E4 sets value and background color
        const range2 = activeSheet?.getRange(2, 3, 2, 2);
        range2?.setValues({
            2: {
                3: {
                    v: 3,
                    s: {
                        bg: { rgb: 'yellow' },
                    },
                },
                4: {
                    v: 4,
                    s: {
                        bg: { rgb: 'green' },
                    },
                },
            },
            3: {
                3: {
                    v: 5,
                    s: {
                        bg: { rgb: 'orange' },
                    },
                },
                4: {
                    v: 6,
                    s: {
                        bg: { rgb: 'red' },
                    },
                },
            },
        });

        expect(activeSheet?.getRange(2, 3, 1, 1)?.getValue()).toBe(3);
        expect(activeSheet?.getRange(2, 4, 1, 1)?.getValue()).toBe(4);
        expect(activeSheet?.getRange(3, 3, 1, 1)?.getValue()).toBe(5);
        expect(activeSheet?.getRange(3, 4, 1, 1)?.getValue()).toBe(6);

        expect(getStyleByPosition(2, 3, 2, 3)?.bg?.rgb).toBe('yellow');
        expect(getStyleByPosition(2, 4, 2, 4)?.bg?.rgb).toBe('green');
        expect(getStyleByPosition(3, 3, 3, 3)?.bg?.rgb).toBe('orange');
        expect(getStyleByPosition(3, 4, 3, 4)?.bg?.rgb).toBe('red');
    });

    it('Range getValues', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // Set different types of values
        activeSheet?.getRange(0, 0, 4, 4)?.setValues([
            [1, 'text', true, ''],
            [2.5, '', false, ''],
            ['', '=SUM(A1:A2)', '', 0],
            ['', '', '', ''],
        ]);

        // Test getting values for the entire range
        const range1 = activeSheet?.getRange(0, 0, 4, 4);
        const values1 = range1?.getValues();
        expect(values1).toEqual([
            [1, 'text', 1, ''],
            [2.5, '', 0, ''],
            ['', null, '', 0],
            ['', '', '', ''],
        ]);

        // Test getting values for a partial range
        const range2 = activeSheet?.getRange(1, 1, 2, 2);
        const values2 = range2?.getValues();
        expect(values2).toEqual([
            ['', 0],
            [null, ''],
        ]);

        // Test getting value for a single cell
        const range3 = activeSheet?.getRange(0, 0, 1, 1);
        const values3 = range3?.getValues();
        expect(values3).toEqual([[1]]);

        // Test getting values for an empty area
        const range4 = activeSheet?.getRange(5, 5, 2, 2);
        const values4 = range4?.getValues();
        expect(values4).toEqual([
            [null, null],
            [null, null],
        ]);

        // Test getting values for a range containing merged cells
        activeSheet?.getRange(6, 0, 2, 2)?.merge();
        activeSheet?.getRange(6, 0)?.setValue('Merged');
        const range5 = activeSheet?.getRange(6, 0, 3, 3);
        const values5 = range5?.getValues();
        expect(values5).toEqual([
            ['Merged', null, null],
            [null, null, null],
            [null, null, null],
        ]);
    });

    it('Range custom metadata APIs should warn about custom field usage', () => {
        const logService = get(ILogService);
        Object.defineProperty(logService, 'warn', { configurable: true, value: vi.fn() });
        const warnSpy = vi.spyOn(logService, 'warn');
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        const range = activeSheet?.getRange(0, 0, 2, 2);

        range?.setCustomMetaData({ key: 'value' });
        range?.getCustomMetaData();
        range?.setCustomMetaDatas([
            [{ key: 'a' }, { key: 'b' }],
            [{ key: 'c' }, { key: 'd' }],
        ]);
        range?.getCustomMetaDatas();

        expect(warnSpy).toHaveBeenCalledTimes(4);
        expect(warnSpy).toHaveBeenNthCalledWith(1, SHEETS_CUSTOM_FIELD_WARNING_MESSAGE);
        expect(warnSpy).toHaveBeenNthCalledWith(2, SHEETS_CUSTOM_FIELD_WARNING_MESSAGE);
        expect(warnSpy).toHaveBeenNthCalledWith(3, SHEETS_CUSTOM_FIELD_WARNING_MESSAGE);
        expect(warnSpy).toHaveBeenNthCalledWith(4, SHEETS_CUSTOM_FIELD_WARNING_MESSAGE);

        warnSpy.mockRestore();
    });

    it('Range getCellData', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        activeSheet?.getRange(0, 0)?.setValue(1);
        const range = activeSheet?.getRange(0, 0);
        expect(range?.getCellData()?.v).toBe(1);
    });

    it('Range isMerged', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!;
        const range = activeSheet.getRange(2, 3);
        const isMerged = range.isMerged();
        expect(isMerged).toBe(false);

        const range2 = activeSheet.getRange(2, 3, 3, 3);
        const isMerged2 = range2.isMerged();
        expect(isMerged2).toBe(false);
    });

    it('Range getCellStyleData', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        activeSheet?.getRange(0, 0)?.setValue(1);
        activeSheet?.getRange(0, 0)?.setBackgroundColor('red');
        const range = activeSheet?.getRange(0, 0);
        expect(range?.getCellStyleData()?.bg?.rgb).toBe('red');
        activeSheet?.getRange(0, 0, 2, 2)?.setFontWeight('bold');
        expect(range?.getCellStyleData()?.bl).toBe(1);
    });

    it('Range getFormulas', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        const formulas = activeSheet?.getRange(0, 3, 5, 1)?.getFormulas();
        expect(formulas).toStrictEqual([
            ['=SUM(A1)'],
            ['=SUM(A2)'],
            ['=SUM(A3)'],
            ['=SUM(A4)'],
            [''],
        ]);
    });

    it('Range getWrap', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        const range = activeSheet?.getRange(0, 0);
        await range?.setWrap(true);
        expect(range?.getWrap()).toBe(true);
    });

    it('Range setFontWeight', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // change A1 font weight
        const range = activeSheet?.getRange(0, 0, 1, 1);
        range?.setFontWeight(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.bl).toBe(undefined);
        range?.setFontWeight('bold');
        expect(getStyleByPosition(0, 0, 0, 0)?.bl).toBe(1);
        range?.setFontWeight('normal');
        expect(getStyleByPosition(0, 0, 0, 0)?.bl).toBe(0);
        range?.setFontWeight(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.bl).toBe(undefined);

        // change B1:C2 font weight
        const range2 = activeSheet?.getRange(0, 1, 2, 2);
        range2?.setFontWeight('bold');
        expect(getStyleByPosition(0, 1, 0, 1)?.bl).toBe(1);
        expect(getStyleByPosition(0, 2, 0, 2)?.bl).toBe(1);
        expect(getStyleByPosition(1, 1, 1, 1)?.bl).toBe(1);
        expect(getStyleByPosition(1, 2, 1, 2)?.bl).toBe(1);

        range2?.setFontWeight('normal');
        expect(getStyleByPosition(0, 1, 0, 1)?.bl).toBe(0);
        expect(getStyleByPosition(0, 2, 0, 2)?.bl).toBe(0);
        expect(getStyleByPosition(1, 1, 1, 1)?.bl).toBe(0);
        expect(getStyleByPosition(1, 2, 1, 2)?.bl).toBe(0);

        range2?.setFontWeight(null);
        expect(getStyleByPosition(0, 1, 0, 1)?.bl).toBe(undefined);
        expect(getStyleByPosition(0, 2, 0, 2)?.bl).toBe(undefined);
        expect(getStyleByPosition(1, 1, 1, 1)?.bl).toBe(undefined);
        expect(getStyleByPosition(1, 2, 1, 2)?.bl).toBe(undefined);
    });

    it('Range setFontStyle', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // change A1 Font Style
        const range = activeSheet?.getRange(0, 0);
        range?.setFontStyle(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(undefined);
        range?.setFontStyle('italic');
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(1);
        range?.setFontStyle('normal');
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(0);
        range?.setFontStyle(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(undefined);

        // change A1:B2 Font Style
        const range2 = activeSheet?.getRange(0, 0, 2, 2);
        range2?.setFontStyle('italic');
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(1);
        expect(getStyleByPosition(0, 1, 0, 1)?.it).toBe(1);
        expect(getStyleByPosition(1, 0, 1, 0)?.it).toBe(1);
        expect(getStyleByPosition(1, 1, 1, 1)?.it).toBe(1);

        range2?.setFontStyle('normal');
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(0);
        expect(getStyleByPosition(0, 1, 0, 1)?.it).toBe(0);
        expect(getStyleByPosition(1, 0, 1, 0)?.it).toBe(0);
        expect(getStyleByPosition(1, 1, 1, 1)?.it).toBe(0);

        range2?.setFontStyle(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(undefined);
        expect(getStyleByPosition(0, 1, 0, 1)?.it).toBe(undefined);
        expect(getStyleByPosition(1, 0, 1, 0)?.it).toBe(undefined);
        expect(getStyleByPosition(1, 1, 1, 1)?.it).toBe(undefined);
    });

    it('Range setFontLine', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // change A1 Font Line
        const range = activeSheet?.getRange(0, 0);
        range?.setFontLine(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.ul?.s).toBe(undefined);
        range?.setFontLine('underline');
        expect(getStyleByPosition(0, 0, 0, 0)?.ul?.s).toBe(1);
        range?.setFontLine('line-through');
        expect(getStyleByPosition(0, 0, 0, 0)?.st?.s).toBe(1);
        range?.setFontLine('none');
        expect(getStyleByPosition(0, 0, 0, 0)?.ul?.s).toBe(0);
        expect(getStyleByPosition(0, 0, 0, 0)?.st?.s).toBe(0);
        range?.setFontLine(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.ul).toBe(undefined);
        expect(getStyleByPosition(0, 0, 0, 0)?.st).toBe(undefined);

        // change A1:B2 Font Line
        const range2 = activeSheet?.getRange(0, 0, 2, 2);
        range2?.setFontLine('underline');
        expect(getStyleByPosition(0, 0, 0, 0)?.ul?.s).toBe(1);
        expect(getStyleByPosition(0, 1, 0, 1)?.ul?.s).toBe(1);
        expect(getStyleByPosition(1, 0, 1, 0)?.ul?.s).toBe(1);
        expect(getStyleByPosition(1, 1, 1, 1)?.ul?.s).toBe(1);

        range2?.setFontLine('line-through');
        expect(getStyleByPosition(0, 0, 0, 0)?.st?.s).toBe(1);
        expect(getStyleByPosition(0, 1, 0, 1)?.st?.s).toBe(1);
        expect(getStyleByPosition(1, 0, 1, 0)?.st?.s).toBe(1);
        expect(getStyleByPosition(1, 1, 1, 1)?.st?.s).toBe(1);

        range2?.setFontLine('none');
        expect(getStyleByPosition(0, 0, 0, 0)?.ul?.s).toBe(0);
        expect(getStyleByPosition(0, 1, 0, 1)?.ul?.s).toBe(0);
        expect(getStyleByPosition(1, 0, 1, 0)?.ul?.s).toBe(0);
        expect(getStyleByPosition(1, 1, 1, 1)?.ul?.s).toBe(0);

        range2?.setFontLine(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.ul).toBe(undefined);
        expect(getStyleByPosition(0, 1, 0, 1)?.ul).toBe(undefined);
        expect(getStyleByPosition(1, 0, 1, 0)?.ul).toBe(undefined);
        expect(getStyleByPosition(1, 1, 1, 1)?.ul).toBe(undefined);

        expect(getStyleByPosition(0, 0, 0, 0)?.st).toBe(undefined);
        expect(getStyleByPosition(0, 1, 0, 1)?.st).toBe(undefined);
        expect(getStyleByPosition(1, 0, 1, 0)?.st).toBe(undefined);
        expect(getStyleByPosition(1, 1, 1, 1)?.st).toBe(undefined);
    });

    it('Range setFontFamily', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // change A1 Font Family
        const range = activeSheet?.getRange(0, 0);
        range?.setFontFamily(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe(undefined);
        range?.setFontFamily('Arial');
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe('Arial');
        range?.setFontFamily('宋体');
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe('宋体');
        range?.setFontFamily(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe(undefined);

        // change A1:B2 Font Family
        const range2 = activeSheet?.getRange(0, 0, 2, 2);
        range2?.setFontFamily('Arial');
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe('Arial');
        expect(getStyleByPosition(0, 1, 0, 1)?.ff).toBe('Arial');
        expect(getStyleByPosition(1, 0, 1, 0)?.ff).toBe('Arial');
        expect(getStyleByPosition(1, 1, 1, 1)?.ff).toBe('Arial');

        range2?.setFontFamily('宋体');
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe('宋体');
        expect(getStyleByPosition(0, 1, 0, 1)?.ff).toBe('宋体');
        expect(getStyleByPosition(1, 0, 1, 0)?.ff).toBe('宋体');
        expect(getStyleByPosition(1, 1, 1, 1)?.ff).toBe('宋体');

        range2?.setFontFamily(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe(undefined);
        expect(getStyleByPosition(0, 1, 0, 1)?.ff).toBe(undefined);
        expect(getStyleByPosition(1, 0, 1, 0)?.ff).toBe(undefined);
        expect(getStyleByPosition(1, 1, 1, 1)?.ff).toBe(undefined);
    });

    it('Range setFontSize', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // change A1 Font Size
        const range = activeSheet?.getRange(0, 0);
        range?.setFontSize(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(undefined);
        range?.setFontSize(12);
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(12);
        range?.setFontSize(24);
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(24);
        range?.setFontSize(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(undefined);

        // change A1:B2 Font Size
        const range2 = activeSheet?.getRange(0, 0, 2, 2);
        range2?.setFontSize(12);
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(12);
        expect(getStyleByPosition(0, 1, 0, 1)?.fs).toBe(12);
        expect(getStyleByPosition(1, 0, 1, 0)?.fs).toBe(12);
        expect(getStyleByPosition(1, 1, 1, 1)?.fs).toBe(12);

        range2?.setFontSize(24);
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(24);
        expect(getStyleByPosition(0, 1, 0, 1)?.fs).toBe(24);
        expect(getStyleByPosition(1, 0, 1, 0)?.fs).toBe(24);
        expect(getStyleByPosition(1, 1, 1, 1)?.fs).toBe(24);

        range2?.setFontSize(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(undefined);
        expect(getStyleByPosition(0, 1, 0, 1)?.fs).toBe(undefined);
        expect(getStyleByPosition(1, 0, 1, 0)?.fs).toBe(undefined);
        expect(getStyleByPosition(1, 1, 1, 1)?.fs).toBe(undefined);
    });

    it('Range setFontColor', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // change A1 Font Color
        const range = activeSheet?.getRange(0, 0);
        range?.setFontColor(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.cl).toBe(undefined);
        range?.setFontColor('red');
        expect(getStyleByPosition(0, 0, 0, 0)?.cl?.rgb).toBe('red');
        range?.setFontColor('green');
        expect(getStyleByPosition(0, 0, 0, 0)?.cl?.rgb).toBe('green');
        range?.setFontColor(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.cl).toBe(undefined);

        // change A1:B2 Font Color
        const range2 = activeSheet?.getRange(0, 0, 2, 2);
        range2?.setFontColor('red');
        expect(getStyleByPosition(0, 0, 0, 0)?.cl?.rgb).toBe('red');
        expect(getStyleByPosition(0, 1, 0, 1)?.cl?.rgb).toBe('red');
        expect(getStyleByPosition(1, 0, 1, 0)?.cl?.rgb).toBe('red');
        expect(getStyleByPosition(1, 1, 1, 1)?.cl?.rgb).toBe('red');

        range2?.setFontColor('green');
        expect(getStyleByPosition(0, 0, 0, 0)?.cl?.rgb).toBe('green');
        expect(getStyleByPosition(0, 1, 0, 1)?.cl?.rgb).toBe('green');
        expect(getStyleByPosition(1, 0, 1, 0)?.cl?.rgb).toBe('green');
        expect(getStyleByPosition(1, 1, 1, 1)?.cl?.rgb).toBe('green');

        range2?.setFontColor(null);
        expect(getStyleByPosition(0, 0, 0, 0)?.cl).toBe(undefined);
        expect(getStyleByPosition(0, 1, 0, 1)?.cl).toBe(undefined);
        expect(getStyleByPosition(1, 0, 1, 0)?.cl).toBe(undefined);
        expect(getStyleByPosition(1, 1, 1, 1)?.cl).toBe(undefined);
    });

    it('Range chain call set font styles', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // set A1 font styles
        const range = activeSheet?.getRange(0, 0);

        range
            ?.setFontWeight('bold')
            .setFontLine('underline')
            .setFontFamily('Arial')
            .setFontSize(24)
            .setFontColor('red');

        expect(getStyleByPosition(0, 0, 0, 0)?.bl).toBe(1);
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(undefined);
        expect(getStyleByPosition(0, 0, 0, 0)?.ul?.s).toBe(1);
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe('Arial');
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(24);
        expect(getStyleByPosition(0, 0, 0, 0)?.cl?.rgb).toBe('red');

        // unset A1 font styles
        range
            ?.setFontWeight(null)
            .setFontLine(null)
            .setFontFamily(null)
            .setFontSize(null)
            .setFontColor(null);

        expect(getStyleByPosition(0, 0, 0, 0)?.bl).toBe(undefined);
        expect(getStyleByPosition(0, 0, 0, 0)?.it).toBe(undefined);
        expect(getStyleByPosition(0, 0, 0, 0)?.ul).toBe(undefined);
        expect(getStyleByPosition(0, 0, 0, 0)?.ff).toBe(undefined);
        expect(getStyleByPosition(0, 0, 0, 0)?.fs).toBe(undefined);
        expect(getStyleByPosition(0, 0, 0, 0)?.cl).toBe(undefined);
    });

    it('Range set range vertical and Horizontal and Warp', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        const range = activeSheet?.getRange(0, 0, 10, 10);

        await range!.setVerticalAlignment('middle');
        await range!.setHorizontalAlignment('center');

        expect(getStyleByPosition(0, 0, 0, 0)?.ht).toBe(HorizontalAlign.CENTER);
        expect(getStyleByPosition(0, 0, 0, 0)?.vt).toBe(VerticalAlign.MIDDLE);

        await range!.setWrap(true);
        expect(getStyleByPosition(0, 0, 0, 0)?.tb).toBe(WrapStrategy.WRAP);
        await range!.setWrapStrategy(WrapStrategy.CLIP);
        expect(getStyleByPosition(0, 0, 0, 0)?.tb).toBe(WrapStrategy.CLIP);
    });

    it('gets and sets shrink to fit', () => {
        const range = univerAPI.getActiveWorkbook()!.getActiveSheet()!.getRange('A1');

        expect(range.getShrinkToFit()).toBe(false);
        expect(range.setShrinkToFit(true)).toBe(range);
        expect(range.getShrinkToFit()).toBe(true);
        expect(range.setShrinkToFit(false)).toBe(range);
        expect(range.getShrinkToFit()).toBe(false);
    });

    // #region Merge cells
    it('test Merge', async () => {
        let hasError = false;
        try {
            const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!;
            let range = activeSheet.getRange(0, 2, 0, 2);
            expect(activeSheet.getMergedRanges().length).toBe(0);
            range = await range.merge();
            expect(activeSheet.getMergedRanges().length).toBe(1);
            range = range.breakApart();
            expect(activeSheet.getMergedRanges().length).toBe(0);
            range = await range.mergeAcross();
            expect(activeSheet.getMergedRanges().length).toBe(3);
            expect(activeSheet.getMergedRanges()[0].getRange()).toStrictEqual({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 });
            range = range.breakApart();
            expect(activeSheet.getMergedRanges().length).toBe(0);
            await range.mergeVertically();
            expect(activeSheet.getMergedRanges().length).toBe(3);
            expect(activeSheet.getMergedRanges()[0].getRange()).toStrictEqual({ startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 });
            const range2 = activeSheet.getRange(0, 2, 0, 0);
            expect(range2.isPartOfMerge()).toBeTruthy();
            const range3 = activeSheet.getRange(0, 5, 0, 5);
            await range3.merge();
        } catch {
            hasError = true;
        }
        expect(hasError).toBeTruthy();
    });

    it('Range merge variants and breakApart update merged ranges', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!;

        const across = activeSheet.getRange('A10:C11').mergeAcross();
        await Promise.resolve();
        expect(across.isPartOfMerge()).toBe(true);
        expect(activeSheet.getRange('A10:C10').isMerged()).toBe(true);
        expect(activeSheet.getRange('A11:C11').isMerged()).toBe(true);
        across.breakApart();
        expect(across.isPartOfMerge()).toBe(false);

        const vertical = activeSheet.getRange('E10:F12').mergeVertically();
        await Promise.resolve();
        expect(activeSheet.getRange('E10:E12').isMerged()).toBe(true);
        expect(activeSheet.getRange('F10:F12').isMerged()).toBe(true);
        vertical.breakApart();
        expect(vertical.isPartOfMerge()).toBe(false);
    });
    //#endregion

    it('Range supports rich text values and per-cell writes', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!;
        const richText = univerAPI.newRichTextValue({ body: { dataStream: 'Hello\r\n' } } as IDocumentData);
        const docData = { body: { dataStream: 'World\r\n' } } as IDocumentData;

        activeSheet.getRange('H1:I1').setRichTextValues([[richText, docData]]);
        const values = activeSheet.getRange('H1:I1').getValues(true);
        expect((values[0][0] as RichTextValue).toPlainText()).toBe('Hello');
        expect((values[0][1] as RichTextValue).toPlainText()).toBe('World');

        activeSheet.getRange('H2:I2').setValueForCell('only first');
        expect(activeSheet.getRange('H2').getValue()).toBe('only first');
        expect(activeSheet.getRange('I2').getValue()).toBeNull();

        activeSheet.getRange('H3:I3').setRichTextValueForCell(richText);
        expect((activeSheet.getRange('H3').getValue(true) as RichTextValue).toPlainText()).toBe('Hello');
        expect(activeSheet.getRange('I3').getValue(true)).toBeUndefined();
    });

    it('persists copied rich-text edits without changing the source cell', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const sheet = workbook.getActiveSheet()!;
        const style = { ff: '宋体', fs: 18, bl: 1, cl: { rgb: '#FF0000' } };
        const data = {
            id: 'imported-rich-text',
            documentStyle: {},
            body: {
                dataStream: 'Data\rData\r\n',
                textRuns: [
                    { st: 0, ed: 4, ts: { ...style, bl: 1 } },
                    { st: 5, ed: 9, ts: { ...style, bl: 1 } },
                ],
                paragraphs: [{ startIndex: 4 }, { startIndex: 9 }],
                sectionBreaks: [{ startIndex: 10 }],
            },
        } as unknown as IDocumentData;
        sheet.getRange('H4').setRichTextValueForCell(data);
        const original = sheet.getRange('H4').getValue(true) as RichTextValue;
        const before = JSON.parse(JSON.stringify(original.getData()));
        const edited = original.copy().setStyle(0, 4, { ff: 'Courier New', fs: 22, bl: 0 });
        sheet.getRange('I4').setRichTextValueForCell(edited);

        const saved = workbook.save().sheets[sheet.getSheetId()].cellData!;
        expect(saved[3][8].p?.body?.textRuns).toEqual([
            { st: 0, ed: 4, ts: { ...style, ff: 'Courier New', fs: 22, bl: 0 } },
            { st: 5, ed: 9, ts: style },
        ]);
        expect(saved[3][8].p?.body?.dataStream).toBe('Data\rData\r\n');
        expect(saved[3][7].p).toEqual(before);
        expect(original.getData()).toEqual(before);
    });

    it('Range inserts and deletes cells along both dimensions', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!;
        activeSheet.getRange('A20:D23').setValues([
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
        ]);

        activeSheet.getRange('A20:B21').insertCells(Dimension.COLUMNS);
        await Promise.resolve();
        expect(activeSheet.getRange('A20:D21').getValues()).toEqual([
            [null, null, 1, 2],
            [null, null, 5, 6],
        ]);

        activeSheet.getRange('A20:B21').deleteCells(Dimension.COLUMNS);
        await Promise.resolve();
        expect(activeSheet.getRange('A20:D21').getValues()).toEqual([
            [1, 2, 3, 4],
            [5, 6, 7, 8],
        ]);

        activeSheet.getRange('A20:B21').insertCells(Dimension.ROWS);
        await Promise.resolve();
        expect(activeSheet.getRange('A20:B23').getValues()).toEqual([
            [null, null],
            [null, null],
            [1, 2],
            [5, 6],
        ]);

        activeSheet.getRange('A20:B21').deleteCells(Dimension.ROWS);
        await Promise.resolve();
        expect(activeSheet.getRange('A20:B23').getValues()).toEqual([
            [1, 2],
            [5, 6],
            [9, 10],
            [13, 14],
        ]);
    });

    // Add these new test cases
    it('Range getRow, getColumn, getWidth, getHeight with A1 notation', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // Test range with A1 notation
        const rangeA1D5 = activeSheet?.getRange('A1:D5');
        expect(rangeA1D5?.getRow()).toBe(0);
        expect(rangeA1D5?.getColumn()).toBe(0);
        expect(rangeA1D5?.getWidth()).toBe(4);
        expect(rangeA1D5?.getHeight()).toBe(5);

        // Test single cell with A1 notation
        const rangeB3 = activeSheet?.getRange('B3');
        expect(rangeB3?.getRow()).toBe(2);
        expect(rangeB3?.getColumn()).toBe(1);
        expect(rangeB3?.getWidth()).toBe(1);
        expect(rangeB3?.getHeight()).toBe(1);

        // Test range with only column letters
        const rangeAD = activeSheet?.getRange('A:D');
        expect(rangeAD?.getRow()).toBe(0);
        expect(rangeAD?.getColumn()).toBe(0);
        expect(rangeAD?.getWidth()).toBe(4);
        expect(rangeAD?.getHeight()).toBe(100);

        // Test range with only row numbers
        const range15 = activeSheet?.getRange('1:5');
        expect(range15?.getRow()).toBe(0);
        expect(range15?.getColumn()).toBe(0);
        // Width should be the maximum number of columns in the sheet
        expect(range15?.getWidth()).toBeGreaterThan(0);
        expect(range15?.getHeight()).toBe(5);

        // Test with sheet name
        const rangeWithSheet = activeSheet?.getRange('sheet1!E6:G8');
        expect(rangeWithSheet?.getRow()).toBe(5);
        expect(rangeWithSheet?.getColumn()).toBe(4);
        expect(rangeWithSheet?.getWidth()).toBe(3);
        expect(rangeWithSheet?.getHeight()).toBe(3);

        // Test case insensitivity
        const rangeCaseInsensitive = activeSheet?.getRange('h10:J12');
        expect(rangeCaseInsensitive?.getRow()).toBe(9);
        expect(rangeCaseInsensitive?.getColumn()).toBe(7);
        expect(rangeCaseInsensitive?.getWidth()).toBe(3);
        expect(rangeCaseInsensitive?.getHeight()).toBe(3);

        // Test invalid range
        expect(() => activeSheet?.getRange('sheet_not_exist!A1:D5').getValues()).toThrow();
    });

    it('Range getValues with A1 notation', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        // Set up some test data
        activeSheet?.getRange(0, 0, 5, 4)?.setValues([
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
        ]);

        // Test single cell
        expect(activeSheet?.getRange('A1').getValues()).toEqual([[1]]);

        // Test range
        expect(activeSheet?.getRange('A1:D5').getValues()).toEqual([
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
        ]);

        // Test case insensitivity
        expect(activeSheet?.getRange('a1:d5').getValues()).toEqual([
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
        ]);

        // Test with sheet name
        expect(activeSheet?.getRange('sheet1!A1:D5').getValues()).toEqual([
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
        ]);

        // Test out of bounds range
        expect(activeSheet?.getRange('A1:Z100').getValues()).toEqual(expect.arrayContaining([
            expect.arrayContaining([1, 2, 3, 4, null, null, null, null, null, null]),
        ]));
    });

    describe('getDataRegion', () => {
        let worksheet: FWorksheet;

        beforeEach(() => {
            worksheet = univerAPI.createWorkbook({
                id: 'data-region',
                sheetOrder: ['data'],
                sheets: {
                    data: { id: 'data', name: 'data', rowCount: 8, columnCount: 8 },
                },
            }).getActiveSheet();
        });

        it.each([
            { dataRange: 'A1:A4', cells: ['A1', 'A2', 'A3', 'A4'] },
            { dataRange: 'A1:D1', cells: ['A1', 'B1', 'C1', 'D1'] },
        ])('expands every cell in $dataRange to the whole list', ({ dataRange, cells }) => {
            worksheet.getRange(dataRange).setValue(1);

            for (const cell of cells) {
                const range = worksheet.getRange(cell);
                expect(range.getDataRegion().getA1Notation()).toBe(dataRange);
                expect(range.getA1Notation()).toBe(cell);
            }
        });

        it('expands rectangles while respecting the requested dimension', () => {
            worksheet.getRange('A1:F6').setValue(1);

            expect(worksheet.getRange('C3').getDataRegion().getA1Notation()).toBe('A1:F6');
            expect(worksheet.getRange('C3:D4').getDataRegion().getA1Notation()).toBe('A1:F6');
            expect(worksheet.getRange('C3:D4').getDataRegion(Dimension.ROWS).getA1Notation()).toBe('C1:D6');
            expect(worksheet.getRange('C3:D4').getDataRegion(Dimension.COLUMNS).getA1Notation()).toBe('A3:F4');
        });

        it('rechecks boundaries exposed by expansion in another direction', () => {
            worksheet.getRange('B4:D4').setValue(1);
            worksheet.getRange('D2:D3').setValue(1);
            worksheet.getRange('A2:C2').setValue(1);
            worksheet.getRange('A1').setValue(1);

            expect(worksheet.getRange('B4').getDataRegion().getA1Notation()).toBe('A1:D4');
        });

        it('counts zero, false, formulas and rich text as data and stops at empty boundaries', () => {
            worksheet.getRange('A1:A4').setValues([
                [{ v: 0 }],
                [{ v: false }],
                [{ f: '=1' }],
                [{ p: { id: 'rich-text', documentStyle: {}, body: { dataStream: 'text\r\n' } } }],
            ]);
            worksheet.getRange('A5:B5').setValues([[{ v: '' }, {}]]);
            worksheet.getRange('A5:B5').setFontWeight('bold');
            worksheet.getRange('A6:B6').setValue('separate');
            worksheet.getRange('C1:C4').setValue('separate');

            expect(worksheet.getRange('A1').getDataRegion().getA1Notation()).toBe('A1:A4');
            expect(worksheet.getRange('A4').getDataRegion().getA1Notation()).toBe('A1:A4');
        });

        it('expands an empty starting cell when adjacent cells contain data', () => {
            worksheet.getRange('C2').setValue(1);
            worksheet.getRange('B3').setValue(1);
            worksheet.getRange('D3').setValue(1);
            worksheet.getRange('C4').setValue(1);

            expect(worksheet.getRange('C3').getDataRegion().getA1Notation()).toBe('B2:D4');
            expect(worksheet.getRange('C3').getDataRegion(Dimension.ROWS).getA1Notation()).toBe('C2:C4');
            expect(worksheet.getRange('C3').getDataRegion(Dimension.COLUMNS).getA1Notation()).toBe('B3:D3');
        });

        it('keeps isolated ranges and ignores diagonal-only neighbors', () => {
            worksheet.getRange('A1').setValue(1);
            worksheet.getRange('C3').setValue(1);
            worksheet.getRange('F6').setValue(1);

            expect(worksheet.getRange('A1').getDataRegion().getA1Notation()).toBe('A1');
            expect(worksheet.getRange('B2').getDataRegion().getA1Notation()).toBe('B2');
            expect(worksheet.getRange('D4:E5').getDataRegion().getA1Notation()).toBe('D4:E5');
        });

        it('stays within worksheet bounds when data reaches every edge', () => {
            worksheet.getRange('A1:H8').setValue(1);

            expect(worksheet.getRange('D4').getDataRegion().getA1Notation()).toBe('A1:H8');
            expect(worksheet.getRange('A1').getDataRegion(Dimension.ROWS).getA1Notation()).toBe('A1:A8');
            expect(worksheet.getRange('H8').getDataRegion(Dimension.COLUMNS).getA1Notation()).toBe('A8:H8');
        });
    });

    it('Range supports an analyst editing a formatted data island', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const activeSheet = workbook.getActiveSheet();
        const report = activeSheet.getRange('B2:D4');

        report
            .setValues([
                ['Region', 'Revenue', 'Margin'],
                ['East', 1200, 0.31],
                ['West', 900, 0.22],
            ])
            .setBackground('#f5f7fb')
            .setFontFamily('Inter')
            .setFontSize(12)
            .setWrap(true)
            .setHorizontalAlignment('center')
            .setVerticalAlignment('middle');

        expect(report.getUnitId()).toBe(workbook.getId());
        expect(report.getSheetName()).toBe('sheet1');
        expect(report.getSheetId()).toBe(activeSheet.getSheetId());
        expect(report.getRange()).toMatchObject({ startRow: 1, startColumn: 1, endRow: 3, endColumn: 3 });
        expect(report.getLastRow()).toBe(3);
        expect(report.getLastColumn()).toBe(3);
        expect(report.getA1Notation()).toBe('B2:D4');
        expect(report.getA1Notation(true, AbsoluteRefType.ALL, AbsoluteRefType.ALL)).toBe('sheet1!$B$2:$D$4');

        expect(report.getValue()).toBe('Region');
        expect(report.getRawValues()).toEqual([
            ['Region', 'Revenue', 'Margin'],
            ['East', 1200, 0.31],
            ['West', 900, 0.22],
        ]);
        expect(report.getDisplayValues()).toEqual([
            ['Region', 'Revenue', 'Margin'],
            ['East', '1200', '0.31'],
            ['West', '900', '0.22'],
        ]);
        expect(report.getCellDatas()[1][0]?.v).toBe('East');
        expect(report.getCellDataGrid()[2][1]?.v).toBe(900);
        expect(report.getValueAndRichTextValues()[1][1]).toBe(1200);

        expect(report.getBackground()).toBe('#f5f7fb');
        expect(report.getBackgrounds()).toEqual([
            ['#f5f7fb', '#f5f7fb', '#f5f7fb'],
            ['#f5f7fb', '#f5f7fb', '#f5f7fb'],
            ['#f5f7fb', '#f5f7fb', '#f5f7fb'],
        ]);
        expect(report.getFontFamily('cell')).toBe('Inter');
        expect(report.getFontSize('cell')).toBe(12);
        expect(report.getCellStyle('cell')?.fontFamily).toBe('Inter');
        expect(report.getCellStyles('cell')[0][0]?.fontSize).toBe(12);
        expect(report.getWrap()).toBe(true);
        expect(report.getWraps()).toEqual([
            [true, true, true],
            [true, true, true],
            [true, true, true],
        ]);
        expect(report.getWrapStrategy()).toBe(WrapStrategy.WRAP);
        expect(report.getHorizontalAlignment()).toBe('center');
        expect(report.getHorizontalAlignments()[0]).toEqual(['center', 'center', 'center']);
        expect(report.getVerticalAlignment()).toBe('middle');
        expect(report.getVerticalAlignments()[0]).toEqual(['middle', 'middle', 'middle']);

        const marginRange = activeSheet.getRange('E3:E4').setFormulas([
            ['=C3*D3'],
            ['=C4*D4'],
        ]);
        expect(marginRange.getFormula()).toBe('=C3*D3');
        expect(marginRange.getFormulas()).toEqual([['=C3*D3'], ['=C4*D4']]);

        activeSheet.getRange('B1').setValue('Header');
        activeSheet.getRange('A3').setValue('Neighbor');
        activeSheet.getRange('E3').setValue('Calculated');
        activeSheet.getRange('C5').setValue('Footer');
        expect(activeSheet.getRange('C3').getDataRegion().getA1Notation()).toBe('A1:E5');
        expect(activeSheet.getRange('C3').getDataRegion(Dimension.ROWS).getA1Notation()).toBe('C2:C5');
        expect(activeSheet.getRange('C3').getDataRegion(Dimension.COLUMNS).getA1Notation()).toBe('A3:E3');

        const offset = report.offset(1, 1, 2);
        expect(offset.getA1Notation()).toBe('C3:E4');
        expect(offset.getValues()).toEqual([
            [1200, 0.31, 'Calculated'],
            [900, 0.22, null],
        ]);
        expect(() => report.offset(-2, 0)).toThrow('The row or column index is out of range');

        expect(activeSheet.getRange('G7:H8').isBlank()).toBe(true);
        report.clear({ contentsOnly: true });
        expect(report.isBlank()).toBe(true);
        expect(report.getBackground()).toBe('#f5f7fb');

        report.setValue('restored');
        report.clear({ formatOnly: true });
        expect(report.getValue()).toBe('restored');
        expect(report.getBackground()).not.toBe('#f5f7fb');

        report.useThemeStyle('default');
        expect(report.getUsedThemeStyle()).toBe('default');
        report.useThemeStyle(undefined);
        expect(report.getUsedThemeStyle()).toBeUndefined();

        report.clear();
        expect(report.isBlank()).toBe(true);
        expect(report.getUsedThemeStyle()).toBeUndefined();
    });

    it('Range getRawValue and getDisplayValue', () => {
        univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
            if (stage === LifecycleStages.Steady) {
                const fWorkbook = univerAPI.getActiveWorkbook()!;
                const fWorksheet = fWorkbook.getActiveSheet();
                const fRange = fWorksheet.getRange('A1:B2');

                fRange.setValueForCell({
                    v: 0.2,
                    s: {
                        n: {
                            pattern: '0%',
                        },
                    },
                });

                expect(fRange.getRawValue()).toEqual(0.2);
                expect(fRange.getDisplayValue()).toEqual('20%');
            }
        });
    });

    it('Range getRawValues and getDisplayValues', () => {
        univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
            if (stage === LifecycleStages.Steady) {
                const fWorkbook = univerAPI.getActiveWorkbook()!;
                const fWorksheet = fWorkbook.getActiveSheet();
                const fRange = fWorksheet.getRange('A1:B2');

                fRange.setValues([
                    [
                        {
                            v: 0.2,
                            s: {
                                n: {
                                    pattern: '0%',
                                },
                            },
                        },
                        {
                            v: 45658,
                            s: {
                                n: {
                                    pattern: 'yyyy-mm-dd',
                                },
                            },
                        },
                    ],
                    [
                        {
                            v: 1234.567,
                            s: {
                                n: {
                                    pattern: '#,##0.00',
                                },
                            },
                        },
                        {
                            v: null,
                        },
                    ],
                ]);

                expect(fRange.getRawValues()).toEqual([
                    [0.2, 45658],
                    [1234.567, null],
                ]);
                expect(fRange.getDisplayValues()).toEqual([
                    ['20%', '2025-01-01'],
                    ['1,234.57', ''],
                ]);
            }
        });
    });
});
