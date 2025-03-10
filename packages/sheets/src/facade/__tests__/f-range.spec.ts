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

/* eslint-disable ts/no-non-null-asserted-optional-chain */

import type { ICellData, Injector, IStyleData, Nullable } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { HorizontalAlign, ICommandService, IUniverInstanceService, LifecycleStages, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { AddWorksheetMergeCommand, SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

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
        const testBed = createFacadeTestBed();
        get = testBed.get;

        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);
        commandService.registerCommand(AddWorksheetMergeCommand);

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

    it('Range getCellData', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        activeSheet?.getRange(0, 0)?.setValue(1);
        const range = activeSheet?.getRange(0, 0);
        expect(range?.getCellData()?.v).toBe(1);
    });

    it('Range isMerged', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet()!;
        const range = activeSheet!.getRange(2, 3);
        const isMerged = range?.isMerged()!;
        expect(isMerged).toBe(false);

        const range2 = activeSheet!.getRange(2, 3, 3, 3)!;
        const isMerged2 = range2.isMerged()!;
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

    // #region Merge cells
    it('test Merge', async () => {
        let hasError = false;
        try {
            const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet()!;
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
        } catch (error) {
            hasError = true;
        }
        expect(hasError).toBeTruthy();
    });
    //#endregion

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
