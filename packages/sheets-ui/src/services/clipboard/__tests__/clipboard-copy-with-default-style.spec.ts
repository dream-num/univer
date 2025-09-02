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

import type { Injector, Univer } from '@univerjs/core';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import { ICommandService, LocaleType, RANGE_TYPE, set, ThemeService } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SheetCopyCommand } from '../../../commands/commands/clipboard.command';
import { ISheetClipboardService } from '../clipboard.service';
import { clipboardTestBed } from './clipboard-test-bed';

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let themeService: ThemeService;

    beforeEach(async () => {
        const testBed = clipboardTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    defaultStyle: {
                        fs: 20,
                        cl: {
                            rgb: 'red',
                        },
                        bd: {
                            t: {
                                s: 1,
                                cl: {
                                    rgb: '#000',
                                },
                            },
                            b: {
                                s: 1,
                                cl: {
                                    rgb: '#000',
                                },
                            },
                            l: {
                                s: 1,
                                cl: {
                                    rgb: '#000',
                                },
                            },
                            r: {
                                s: 1,
                                cl: {
                                    rgb: '#000',
                                },
                            },
                        },
                    },
                    cellData: {
                        0: {
                            0: {
                                v: 1,
                            },
                        },
                        1: {
                            0: {
                                v: 2,
                            },
                        },
                        2: {
                            0: {
                                v: 3,
                            },
                        },
                        3: {
                            0: {
                                v: 4,
                            },
                        },
                    },
                },
            },
            locale: LocaleType.ZH_CN,
            name: '',
            sheetOrder: [],
            styles: {},
        });

        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);

        sheetClipboardService = get(ISheetClipboardService);

        themeService = get(ThemeService);
        const theme = themeService.getCurrentTheme();
        const newTheme = set(theme, 'black', '#35322b');
        themeService.setTheme(newTheme);
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Copy cells of a worksheet with default styles', () => {
        it('worksheet has default style', async () => {
            const selection = {
                range: { startRow: 0, startColumn: 0, endRow: 3, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: { actualRow: 0, actualColumn: 0, isMerged: false, isMergedMainCell: false },
                style: null,
            };
            expect(await commandService.executeCommand(SetSelectionsOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                selections: [selection],
            } as ISetSelectionsOperationParams)).toBeTruthy();

            expect(await commandService.executeCommand(SheetCopyCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
            })).toBeTruthy();

            const { html, copyId } = sheetClipboardService.generateCopyContent('test', 'sheet1', selection.range)!;
            const result = `<google data-copy-id="${copyId}"-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"><colgroup><col  width="88" /></colgroup>
<tbody><tr style="height: 24px;"><td style="font-size: 20pt; color: #ff0000; border-bottom: 0.5pt solid #000000; border-top: 0.5pt solid #000000; border-right: 0.5pt solid #000000; border-left: 0.5pt solid #000000; ">1</td></tr><tr style="height: 24px;"><td style="font-size: 20pt; color: #ff0000; border-bottom: 0.5pt solid #000000; border-top: 0.5pt solid #000000; border-right: 0.5pt solid #000000; border-left: 0.5pt solid #000000; ">2</td></tr><tr style="height: 24px;"><td style="font-size: 20pt; color: #ff0000; border-bottom: 0.5pt solid #000000; border-top: 0.5pt solid #000000; border-right: 0.5pt solid #000000; border-left: 0.5pt solid #000000; ">3</td></tr><tr style="height: 24px;"><td style="font-size: 20pt; color: #ff0000; border-bottom: 0.5pt solid #000000; border-top: 0.5pt solid #000000; border-right: 0.5pt solid #000000; border-left: 0.5pt solid #000000; ">4</td></tr></tbody></table>`;
            expect(html).toBe(result);
        });
    });
});
