/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IStyleData, Nullable } from '@univerjs/core';
import { HorizontalAlign, ICommandService, IUniverInstanceService, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { FormulaDataModel } from '@univerjs/engine-formula';
import type { FUniver } from '../../facade';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';

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

    it('Range getCellData', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        activeSheet?.getRange(0, 0)?.setValue(1);
        const range = activeSheet?.getRange(0, 0);
        expect(range?.getCellData()?.v).toBe(1);
    });

    it('Range getCell', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const range = activeSheet?.getRange(2, 3);
        const cell = range?.getCell()!;
        expect(cell.actualColumn).toBe(3);
        expect(cell.actualRow).toBe(2);
    });

    it('Range getCellRect', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const range = activeSheet?.getRange(0, 0);
        const cell = range?.getCell()!;
        const rect = range?.getCellRect()!;
        expect(rect.x).toBe(cell.startX);
        expect(rect.y).toBe(cell.startY);
        expect(rect.width).toBe(cell.endX - cell.startX);
        expect(rect.height).toBe(cell.endY - cell.startY);
        expect(rect.toJSON()).toContain(rect.height);
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
        const formulaDataModel = get(FormulaDataModel);
        formulaDataModel.initFormulaData();

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
});
