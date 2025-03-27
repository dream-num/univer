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

import type { IColorStyle, Injector, Univer, Workbook } from '@univerjs/core';
import type { RangeThemeStyle } from '../../../model/range-theme-util';
import type { ISetStyleCommandParams } from '../set-style.command';

import { ICommandService, IUniverInstanceService, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetRangeThemeModel } from '../../../model/range-theme-model';
import { SetWorksheetRangeThemeStyleMutation } from '../../mutations/add-worksheet-range-theme.mutation';
import { DeleteWorksheetRangeThemeStyleMutation } from '../../mutations/delete-worksheet-range-theme.mutation';
import { SetWorksheetRangeThemeStyleCommand } from '../add-worksheet-range-theme.command';
import { DeleteWorksheetRangeThemeStyleCommand } from '../delete-worksheet-range-theme.command';
import { SetStyleCommand } from '../set-style.command';
import { createCommandTestBed } from './create-command-test-bed';

// eslint-disable-next-line max-lines-per-function
describe('Test set worksheet default style commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let defaultTheme: RangeThemeStyle;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetWorksheetRangeThemeStyleMutation);
        commandService.registerCommand(DeleteWorksheetRangeThemeStyleMutation);
        commandService.registerCommand(SetWorksheetRangeThemeStyleCommand);
        commandService.registerCommand(DeleteWorksheetRangeThemeStyleCommand);
        commandService.registerCommand(SetStyleCommand);

        const sheetRangeThemeModel = get(SheetRangeThemeModel);
        defaultTheme = sheetRangeThemeModel.getDefaultRangeThemeStyle('default');
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('set worksheet range style', () => {
        it('correct situation', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getSheetBySheetId('sheet1');
            if (!workbook) throw new Error('This is an error');

            expect(
                await commandService.executeCommand(SetWorksheetRangeThemeStyleCommand.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    // 'A1:D21'
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 20,
                        endColumn: 3,
                    },
                    themeName: 'default',
                })
            ).toBeTruthy();

            expect(worksheet?.getCell(0, 0)).toEqual(defaultTheme.getHeaderRowStyle());
            expect(worksheet?.getCell(0, 1)).toEqual(defaultTheme.getHeaderRowStyle());

            expect(worksheet?.getCell(1, 0)).toEqual(defaultTheme.getFirstRowStyle());
            expect(worksheet?.getCell(2, 0)).toEqual(defaultTheme.getSecondRowStyle());

            // undo;
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('ensure range theme style can not overwrite cell style', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            if (!workbook) throw new Error('This is an error');

            await commandService.executeCommand(SetStyleCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 1,
                },
                style: {
                    type: 'bg',
                    value: {
                        rgb: 'red',
                    },
                },
            } as ISetStyleCommandParams<IColorStyle>);

            expect(
                await commandService.executeCommand(SetWorksheetRangeThemeStyleCommand.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    // 'A1:D21'
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 20,
                        endColumn: 3,
                    },
                    themeName: 'default',
                })
            ).toBeTruthy();

            const worksheet = workbook.getSheetBySheetId('sheet1');

            expect(worksheet?.getCell(0, 0)).toEqual({
                bg: {
                    rgb: 'red',
                },
            });

            expect(worksheet?.getCell(0, 1)).toEqual(defaultTheme.getHeaderRowStyle());
        });
    });
});
