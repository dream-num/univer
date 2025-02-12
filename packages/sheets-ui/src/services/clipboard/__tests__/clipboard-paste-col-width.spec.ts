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

import { ICommandService, IUniverInstanceService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Injector, Univer } from '@univerjs/core';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { ISheetClipboardService } from '../clipboard.service';
import { parseTableRows } from '../html-to-usm/converter';
import { clipboardTestBed } from './clipboard-test-bed';

const colWidthHtml = `<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv=Content-Type content="text/html; charset=utf-8"><meta name=ProgId content=Excel.Sheet><meta name=Generator content="Microsoft Excel 15"><link id=Main-File rel=Main-File href="file:////Users/yuanbin/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip.htm"><link rel=File-List href="file:////Users/yuanbin/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip_filelist.xml"><style><!--table{mso-displayed-decimal-separator:"\.";mso-displayed-thousand-separator:"\,";}@page{margin:1.0in .75in 1.0in .75in;mso-header-margin:.5in;mso-footer-margin:.5in;}.font5{color:windowtext;font-size:9.0pt;font-weight:400;font-style:normal;text-decoration:none;font-family:宋体;mso-generic-font-family:auto;mso-font-charset:134;}tr{mso-height-source:auto;mso-ruby-visibility:none;}col{mso-width-source:auto;mso-ruby-visibility:none;}br{mso-data-placement:same-cell;}td{padding-top:1px;padding-right:1px;padding-left:1px;mso-ignore:padding;color:black;font-size:11.0pt;font-weight:400;font-style:normal;text-decoration:none;font-family:宋体;mso-generic-font-family:auto;mso-font-charset:134;mso-number-format:General;text-align:general;vertical-align:middle;border:none;mso-background-source:auto;mso-pattern:auto;mso-protection:locked visible;white-space:nowrap;mso-rotate:0;}.xl65{text-align:center;vertical-align:bottom;}ruby{ruby-align:left;}rt{color:windowtext;font-size:9.0pt;font-weight:400;font-style:normal;text-decoration:none;font-family:宋体;mso-generic-font-family:auto;mso-font-charset:134;mso-char-type:none;display:none;}--></style></head><body link=blue vlink=purple><table border=0 cellpadding=0 cellspacing=0 width=2573 style='border-collapse:collapse;width:1931pt'><col width=573 style='mso-width-source:userset;mso-width-alt:18346;width:430pt'><col width=415 style='mso-width-source:userset;mso-width-alt:13269;width:311pt'><col width=441 style='mso-width-source:userset;mso-width-alt:14122;width:331pt'><col width=73 span=3 style='width:55pt'><col width=713 style='mso-width-source:userset;mso-width-alt:22826;width:535pt'><col width=139 style='mso-width-source:userset;mso-width-alt:4437;width:104pt'><col width=73 style='width:55pt'><tr height=67 style='mso-height-source:userset;height:50.0pt'><!--StartFragment--><td height=67 width=573 style='height:50.0pt;width:430pt'>test col width<span style='mso-spacerun:yes'> </span></td><td width=415 style='width:311pt'>test col width</td><td width=441 style='width:331pt'></td><td colspan=2 width=146 style='mso-ignore:colspan;width:110pt'>col width</td><td class=xl65 width=73 style='width:55pt'></td><td width=713 style='width:535pt'>col width</td><td width=139 style='width:104pt'></td><td width=73 style='width:55pt'></td><!--EndFragment--></tr></table></body></html>`;

const rowHeightFloatHtml = `<meta charset='utf-8'><html><head></head><body><google data-copy-id="Uv1RxY" -sheets-html-origin=""><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"><colgroup><col width="88"><col width="88"><col width="88"></colgroup><tbody><tr style="height: 73.546875px;"><td>qweqwe</td><td></td><td></td></tr></tbody></table></google></body></html>`;

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let sheetSkeletonManagerService: SheetSkeletonManagerService;

    beforeEach(async () => {
        const testBed = clipboardTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    cellData: {
                        0: {
                            0: {
                                v: 1,
                            },
                        },
                    },
                    columnCount: 100,
                    rowCount: 100,
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
        sheetSkeletonManagerService = get(SheetSkeletonManagerService);
        sheetClipboardService = get(ISheetClipboardService);
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Test paste col width ', () => {
        beforeEach(() => {
            const selectionManager = get(SheetsSelectionsService);

            const startRow = 10;
            const startColumn = 10;
            const endRow = 10;
            const endColumn = 10;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            sheetSkeletonManagerService.setCurrent({
                sheetId: 'sheet1',
            });
        });
        it('test col width', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = await sheetClipboardService.legacyPaste(colWidthHtml);
            expect(res).toBeTruthy();
            const columnManager = worksheet.getColumnManager();
            expect(columnManager.getColumnWidth(10)).toBe(573);
            expect(columnManager.getColumnWidth(11)).toBe(415);
            expect(columnManager.getColumnWidth(12)).toBe(441);
            expect(columnManager.getColumnWidth(13)).toBe(88);
            expect(columnManager.getColumnWidth(16)).toBe(713);
            expect(columnManager.getColumnWidth(17)).toBe(139);
            expect(columnManager.getColumnWidth(18)).toBe(88);
        });
    });

    describe('Test paste row height ', () => {
        beforeEach(() => {
            const selectionManager = get(SheetsSelectionsService);

            const startRow = 10;
            const startColumn = 10;
            const endRow = 10;
            const endColumn = 10;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            sheetSkeletonManagerService.setCurrent({
                sheetId: 'sheet1',
            });
        });
        it('test row height', async () => {
            const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            if (!worksheet) return false;
            const res = parseTableRows(rowHeightFloatHtml);
            expect(Number(res.rowProperties[0]?.height)).toBe(73);
            const pasteRes = await sheetClipboardService.legacyPaste(rowHeightFloatHtml);
            expect(pasteRes).toBeTruthy();
            const rowManager = worksheet.getRowManager();
            expect(rowManager.getRowHeight(10)).toBe(73);
        });
    });
});
