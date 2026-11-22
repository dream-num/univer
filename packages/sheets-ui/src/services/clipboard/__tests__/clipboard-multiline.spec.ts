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

import type { ICellData, Injector, Nullable, Univer, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IClipboardInterfaceService } from '@univerjs/ui';
import {
    CellValueType,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RANGE_TYPE,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    MoveRangeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetCopyCommand } from '../../../commands/commands/clipboard.command';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { ISheetClipboardService } from '../clipboard.service';
import { clipboardTestBed } from './clipboard-test-bed';

class TestClipboardInterfaceService implements IClipboardInterfaceService {
    readonly writes: Array<{ text: string; html: string; customData?: Record<string, string> }> = [];

    get supportClipboard(): boolean {
        return true;
    }

    async writeText(text: string): Promise<void> {
        this.writes.push({ text, html: '' });
    }

    async write(text: string, html: string, customData?: Record<string, string>): Promise<void> {
        this.writes.push({ text, html, customData });
    }

    async readText(): Promise<string> {
        return '';
    }

    async read(): Promise<ClipboardItem[]> {
        return [];
    }
}

describe('Clipboard multiline cell copy and Excel paste', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let clipboardInterface: TestClipboardInterfaceService;

    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        clipboardInterface = new TestClipboardInterfaceService();
        const testBed = clipboardTestBed(
            {
                id: 'test',
                appVersion: '3.0.0-alpha',
                sheets: {
                    sheet1: {
                        id: 'sheet1',
                        cellData: {
                            0: {
                                0: {
                                    p: {
                                        id: 'doc-multiline',
                                        body: {
                                            dataStream: 'line1\rline2\r\n',
                                            paragraphs: [
                                                { startIndex: 5, paragraphId: 'p1' },
                                                { startIndex: 11, paragraphId: 'p2' },
                                            ],
                                            sectionBreaks: [{ startIndex: 12, sectionId: 's1' }],
                                        },
                                        documentStyle: {},
                                    },
                                },
                                1: {
                                    v: 'plain1\nplain2',
                                    t: CellValueType.STRING,
                                },
                            },
                            1: {
                                0: {
                                    v: 'quote "here"',
                                    t: CellValueType.STRING,
                                },
                                1: {
                                    v: 'next',
                                    t: CellValueType.STRING,
                                },
                            },
                        },
                    },
                },
                locale: LocaleType.EN_US,
                name: '',
                sheetOrder: [],
                styles: {},
            },
            undefined,
            clipboardInterface
        );

        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(MoveRangeMutation);
        commandService.registerCommand(SetWorksheetRowAutoHeightMutation);

        get(SheetSkeletonManagerService).setCurrent({ sheetId: 'sheet1' });
        sheetClipboardService = get(ISheetClipboardService);

        getValues = (startRow, startColumn, endRow, endColumn) =>
            get(IUniverInstanceService)
                .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => {
        univer?.dispose();
    });

    it('formats multiline cells with Excel-compatible <br> rules and quoted TSV on copy', async () => {
        const selection: ISelectionWithStyle = {
            range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
            primary: null,
            style: null,
        };
        await commandService.executeCommand(SetSelectionsOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            selections: [selection],
        });

        expect(await commandService.executeCommand(SheetCopyCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);

        expect(clipboardInterface.writes).toHaveLength(1);
        const { text, html } = clipboardInterface.writes[0];

        expect(html).toContain('br { mso-data-placement: same-cell; }');
        expect(html).toContain('<td>line1<br>line2</td>');
        expect(html).toContain('<td>plain1<br>plain2</td>');
        expect(html).not.toContain('UniverNormal');

        expect(text).toBe('"line1\nline2"\t"plain1\nplain2"\n"quote ""here"""\tnext');
    });

    it('pastes multiline Excel HTML without splitting cells or inserting leading spaces', async () => {
        get(SheetsSelectionsService).addSelections([
            {
                range: { startRow: 3, startColumn: 0, endRow: 3, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        const excelHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <style>
                    br { mso-data-placement: same-cell; }
                    .xl65 { color: #ff0000; }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <td class="xl65">first<br>\r\n  second</td>
                        <td><span style="font-weight:bold">alpha<br>beta</span></td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        expect(await sheetClipboardService.legacyPaste(excelHtml)).toBe(true);

        const firstCell = getValues(3, 0, 3, 0)?.[0]?.[0];
        const secondCell = getValues(3, 1, 3, 1)?.[0]?.[0];

        expect(firstCell?.p?.body?.dataStream).toBe('first\rsecond\r\n');
        expect(firstCell?.p?.body?.paragraphs).toHaveLength(2);
        expect(secondCell?.p?.body?.dataStream).toBe('alpha\rbeta\r\n');
        expect(secondCell?.p?.body?.paragraphs).toHaveLength(2);
    });

    it('pastes quoted multiline TSV from plain text into a single cell', async () => {
        get(SheetsSelectionsService).addSelections([
            {
                range: { startRow: 5, startColumn: 0, endRow: 5, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ]);

        const tsv = '"row1-a\nrow1-b"\tcol2\r\nrow2-a\trow2-b\r\n';
        expect(await sheetClipboardService.legacyPaste(undefined, tsv)).toBe(true);

        const multilineCell = getValues(5, 0, 5, 0)?.[0]?.[0];
        const nextCol = getValues(5, 1, 5, 1)?.[0]?.[0];
        const nextRow = getValues(6, 0, 6, 0)?.[0]?.[0];

        expect(multilineCell?.p?.body?.dataStream).toBe('row1-a\rrow1-b\r\n');
        expect(nextCol?.v).toBe('col2');
        expect(nextRow?.v).toBe('row2-a');
    });
});
