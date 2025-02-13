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

import type { ICellDataForSheetInterceptor, Injector, Univer, Workbook, Worksheet } from '@univerjs/core';
import type { ISetNumfmtMutationParams, ISheetLocation } from '@univerjs/sheets';
import { CellModeEnum, createInterceptorKey, ICommandService, InterceptorManager, IUniverInstanceService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { SetNumfmtMutation, SheetInterceptorService } from '@univerjs/sheets';

import { SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { getMatrixPlainText, IEditorBridgeService } from '@univerjs/sheets-ui';
import { beforeEach, describe, expect, it } from 'vitest';
import { NumfmtEditorController } from '../numfmt.editor.controller';
import { createTestBed } from './test.util';

const BEFORE_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('BEFORE_CELL_EDIT');
const AFTER_CELL_EDIT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('AFTER_CELL_EDIT');

class MockEditorBridgeService {
    interceptor = new InterceptorManager({
        BEFORE_CELL_EDIT,
        AFTER_CELL_EDIT,
    });
}

describe('test editor', () => {
    let unitId: string = '';
    let subUnitId: string = '';
    let workbook: Workbook;
    let worksheet: Worksheet;
    let testBed: ReturnType<typeof createTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        testBed = createTestBed(undefined, [
            [NumfmtEditorController],
            [SheetsNumfmtCellContentController],
            [IEditorBridgeService, { useClass: MockEditorBridgeService }],
        ]);

        unitId = testBed.unitId;
        subUnitId = testBed.subUnitId;
        commandService = testBed.get(ICommandService);
        const univerInstanceService = testBed.get(IUniverInstanceService);
        testBed.get(NumfmtEditorController);
        testBed.get(SheetsNumfmtCellContentController);
        workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        worksheet = workbook.getActiveSheet()!;
    });

    it('before edit with currency', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
            refMap: {
                1: {
                    pattern: '$#,##0;(#,##0)',
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = worksheet.getCell(0, 0);
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 0,
            origin: cellData,
        };

        expect(cellData!.v).toEqual('$0');
        expect(cellData!.t).toEqual(2);

        const result = sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(BEFORE_CELL_EDIT)(cellData, location);
        // The currency  format needs to be entered in the editor with real values, not with currency symbols
        expect(result!.v).toEqual(0);
        expect(result!.t).toEqual(2);
    });
    it('before edit with data', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
            refMap: {
                1: {
                    pattern: 'A/P h:mm:ss',
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = worksheet.getCell(0, 0);
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 0,
            origin: cellData,
        };

        const result = sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(BEFORE_CELL_EDIT)(cellData, location);
        // The data format needs to be entered in the editor with data string, not with real values
        expect(result!.v).toEqual(cellData!.v);
    });
    it('after edit with data', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
            refMap: {
                1: {
                    pattern: 'h:mm:ss',
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '12:33:22', t: 2 };
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 0,
            origin: cellData,
        };

        const result = sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(AFTER_CELL_EDIT)(cellData, location);
        // The date-time drop is a numeric value, not a literal string
        expect(result?.v).toBe(0.5231712962962963);
    });

    it('edit number will throw style in this editing', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = {
            p: {
                id: '__INTERNAL_EDITOR__DOCS_NORMAL',
                documentStyle: {
                    pageSize: {
                        width: 230.41758728027344,
                    },
                    marginTop: 6,
                    marginBottom: 2,
                    marginRight: 2,
                    marginLeft: 2,
                    renderConfig: {
                        verticalAlign: 0,
                        horizontalAlign: 0,
                        wrapStrategy: 0,
                        background: {},
                        centerAngle: 0,
                        vertexAngle: 0,
                    },
                },
                body: {
                    dataStream: '2022-11-11\r\n',
                    textRuns: [
                        {
                            st: 0,
                            ed: 2,
                            ts: {
                                ff: 'Arial',
                                fs: 11,
                            },
                        },
                        {
                            st: 2,
                            ed: 10,
                            ts: {
                                ff: 'Arial',
                                fs: 11,
                                bl: 1,
                            },
                        },
                    ],
                    paragraphs: [
                        {
                            startIndex: 10,
                            paragraphStyle: {
                                horizontalAlign: 0,
                            },
                        },
                    ],
                    customRanges: [],
                    customDecorations: [],
                },
                drawings: {},
                drawingsOrder: [],
                settings: {
                    zoomRatio: 1,
                },
            },
            v: null,
            f: null,
            si: null,
        };
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 0,
            origin: cellData,
        };

        const result = sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(AFTER_CELL_EDIT)(cellData, location);
        expect(result?.s).toBeFalsy();
        expect(result?.p).toBeFalsy();
        expect(result?.v).toBe(44876);
    });

    it('edit number with bullet should keep rich text', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const richTextParams = {
            id: '__INTERNAL_EDITOR__ZEN_EDITOR',
            documentStyle: {
                pageSize: {
                    width: 595,
                },
                documentFlavor: 0,
                marginTop: 0,
                marginBottom: 0,
                marginRight: 0,
                marginLeft: 0,
                renderConfig: {
                    vertexAngle: 0,
                    centerAngle: 0,
                },
            },
            drawings: {},
            drawingsOrder: [],
            body: {
                dataStream: '123123123\r\n',
                textRuns: [
                    {
                        st: 0,
                        ed: 9,
                        ts: {
                            ff: 'Arial',
                            fs: 11,
                        },
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 9,
                        paragraphStyle: {
                            horizontalAlign: 0,
                        },
                        bullet: {
                            nestingLevel: 0,
                            textStyle: {
                                fs: 20,
                            },
                            listType: 'CHECK_LIST',
                            listId: 'xIECkc',
                        },
                    },
                ],
                sectionBreaks: [
                    {
                        startIndex: 10,
                    },
                ],
                customRanges: [],
                customDecorations: [],
            },
        };
        const cellData = {
            p: richTextParams,
            v: null,
            f: null,
            si: null,
        };
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 0,
            origin: cellData,
        };

        const result = sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(AFTER_CELL_EDIT)(cellData, location);
        expect(result?.p).toEqual(richTextParams);
        expect(result?.v).toBeFalsy();
    });
});

describe('test get cell text/plain', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(async () => {
        const testBed = createTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    cellData: {
                        0: {
                            0: {
                                v: 44876,
                                t: 2,
                            },
                            1: {
                                p: {
                                    id: '__INTERNAL_EDITOR__DOCS_NORMAL',
                                    documentStyle: {
                                        pageSize: {
                                            width: 72.90791320800781,
                                        },
                                        marginTop: 0,
                                        marginBottom: 2,
                                        marginRight: 2,
                                        marginLeft: 2,
                                        renderConfig: {
                                            verticalAlign: 0,
                                            horizontalAlign: 0,
                                            wrapStrategy: 0,
                                            background: {},
                                            centerAngle: 0,
                                            vertexAngle: 0,
                                            zeroWidthParagraphBreak: 1,
                                        },
                                    },
                                    body: {
                                        dataStream: 'univer\r\n',
                                        textRuns: [
                                            {
                                                st: 0,
                                                ed: 1,
                                                ts: {
                                                    ff: 'Arial',
                                                    fs: 11,
                                                },
                                            },
                                            {
                                                st: 1,
                                                ed: 4,
                                                ts: {
                                                    ff: 'Arial',
                                                    fs: 28,
                                                },
                                            },
                                            {
                                                st: 4,
                                                ed: 6,
                                                ts: {
                                                    ff: 'Arial',
                                                    fs: 11,
                                                },
                                            },
                                        ],
                                        paragraphs: [
                                            {
                                                startIndex: 6,
                                                paragraphStyle: {
                                                    horizontalAlign: 0,
                                                },
                                            },
                                        ],
                                        customRanges: [],
                                        customDecorations: [],
                                        customBlocks: [],
                                    },
                                    drawings: {},
                                    drawingsOrder: [],
                                    settings: {
                                        zoomRatio: 1,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            locale: LocaleType.ZH_CN,
            name: '',
            sheetOrder: [],
            styles: {},
        }, [
            [NumfmtEditorController],
            [SheetsNumfmtCellContentController],
            [IEditorBridgeService, { useClass: MockEditorBridgeService }],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        testBed.get(NumfmtEditorController);
        testBed.get(SheetsNumfmtCellContentController);
        testBed.get(SheetInterceptorService);
    });

    it('when the cell has a numfmt should use both to get displayV', () => {
        const univerInstanceService = get(IUniverInstanceService);

        const workbook = univerInstanceService.getUnit<Workbook>('test');
        const worksheet = workbook?.getActiveSheet();
        if (worksheet) {
            const unitId = 'test';
            const subUnitId = worksheet.getSheetId();
            const params: ISetNumfmtMutationParams = {
                unitId,
                subUnitId,
                values: {
                    1: {
                        ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                    },
                },
                refMap: {
                    1: {
                        pattern: 'yyyy-mm-dd',
                    },
                },
            };
            commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
            const matrix = worksheet.getMatrixWithMergedCells(0, 0, 0, 1, CellModeEnum.Both);
            const plain = getMatrixPlainText(matrix);
            expect(plain).toBe('2022-11-11\tuniver');
        }
    });
});
