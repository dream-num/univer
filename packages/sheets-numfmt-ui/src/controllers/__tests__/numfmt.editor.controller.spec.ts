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

import type { ICellData, Injector, IWorkbookData, Workbook, Worksheet } from '@univerjs/core';
import type { ISetNumfmtMutationParams } from '@univerjs/sheets';
import {
    CellModeEnum,
    CellValueType,
    excelDateSerial,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RedoCommand,
    RegionService,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AFTER_CELL_EDIT,
    BEFORE_CELL_EDIT,
    INumfmtService,
    NumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SheetsNumfmtCellContentController } from '@univerjs/sheets-numfmt';
import { getMatrixPlainText, IEditorBridgeService } from '@univerjs/sheets-ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NumfmtEditorController } from '../numfmt.editor.controller';
import { createTestBed } from './test.util';

// The controller uses the bridge registration to enable its editor interceptors.
const editorBridge = {} as IEditorBridgeService;

describe('NumfmtEditorController explicit command targets', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([INumfmtService, { useClass: NumfmtService }]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetsSelectionsService]);
        injector.add([SheetsNumfmtCellContentController]);
        injector.add([NumfmtEditorController]);
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: {} });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = injector.get(ICommandService);
        for (const command of [
            SetRangeValuesCommand,
            SetRangeValuesMutation,
            SetNumfmtMutation,
            RemoveNumfmtMutation,
            SetSelectionsOperation,
            SetWorksheetActiveOperation,
        ]) {
            commands.registerCommand(command);
        }
    });

    afterEach(() => univer.dispose());

    it('commits a numeric draft using the region in which the edit began', () => {
        const injector = univer.__getInjector();
        const workbook = injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            workbookData('regional-edit')
        );
        const worksheet = workbook.getSheetBySheetId('sheet2')!;
        injector.get(NumfmtEditorController);
        const region = injector.get(RegionService);
        region.setRegion('de-DE');
        const editRegion = region.getCurrentRegion();
        region.setRegion('en-US');

        const writer = injector.get(SheetInterceptorService);
        expect(writer.onWriteCell(workbook, worksheet, 5, 0, { v: '1,234' }, editRegion)).toMatchObject({
            t: CellValueType.NUMBER,
            v: 1.234,
        });
        expect(writer.onWriteCell(workbook, worksheet, 6, 0, { v: '1,234' })).toMatchObject({
            t: CellValueType.NUMBER,
            v: 1234,
        });
    });

    for (const current of ['none', 'peer', 'other-worksheet'] as const) {
        for (const formatted of [false, true]) {
            it(`writes ${formatted ? 'parsed percentage' : 'plain numeric data'} with ${current} current and preserves history`, async () => {
                const injector = univer.__getInjector();
                const instances = injector.get(IUniverInstanceService);
                const peer = instances.createUnit<IWorkbookData, Workbook>(
                    UniverInstanceType.UNIVER_SHEET,
                    workbookData('peer'),
                    { makeCurrent: false }
                );
                const child = instances.createUnit<IWorkbookData, Workbook>(
                    UniverInstanceType.UNIVER_SHEET,
                    workbookData('child'),
                    { makeCurrent: false }
                );
                if (current !== 'none') {
                    instances.setCurrentUnitForType(current === 'peer' ? 'peer' : 'child');
                }
                injector.get(NumfmtEditorController);
                const worksheet = child.getSheetBySheetId('sheet2')!;
                const before = Tools.deepClone(worksheet.getCellRaw(0, 0));
                const peerBefore = Tools.deepClone(peer.getSnapshot());
                const otherSheetBefore = Tools.deepClone(child.getSheetBySheetId('sheet1')!.getSnapshot());
                let value: ICellData = { v: 42 };
                if (formatted) {
                    const interceptor = injector.get(SheetInterceptorService).writeCellInterceptor;
                    value = interceptor.fetchThroughInterceptors(AFTER_CELL_EDIT)({ v: '50%' }, {
                        workbook: child,
                        worksheet,
                        unitId: 'child',
                        subUnitId: 'sheet2',
                        row: 0,
                        col: 0,
                        origin: before,
                    })!;
                }
                const commands = injector.get(ICommandService);
                expect(await commands.executeCommand(SetRangeValuesCommand.id, {
                    unitId: 'child',
                    subUnitId: 'sheet2',
                    range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                    value,
                })).toBe(true);
                expect(worksheet.getCellRaw(0, 0)?.v).toBe(formatted ? 0.5 : 42);
                const pattern = injector.get(INumfmtService).getValue('child', 'sheet2', 0, 0)?.pattern;
                expect(pattern).toBe(formatted ? '0%' : undefined);
                expect(peer.getSnapshot()).toEqual(peerBefore);
                expect(child.getSheetBySheetId('sheet1')!.getSnapshot()).toEqual(otherSheetBefore);

                instances.focusUnit('child');
                expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
                expect(worksheet.getCellRaw(0, 0)?.v).toBe(before?.v);
                expect(injector.get(INumfmtService).getValue('child', 'sheet2', 0, 0)?.pattern).toBeUndefined();
                expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
                expect(worksheet.getCellRaw(0, 0)?.v).toBe(formatted ? 0.5 : 42);
                expect(injector.get(INumfmtService).getValue('child', 'sheet2', 0, 0)?.pattern).toBe(pattern);
                expect(peer.getSnapshot()).toEqual(peerBefore);
                expect(child.getSheetBySheetId('sheet1')!.getSnapshot()).toEqual(otherSheetBefore);
            });
        }
    }

    it('shows the regional short time and preserves its hidden date when editing seconds', () => {
        const injector = univer.__getInjector();
        injector.add([IEditorBridgeService, { useValue: editorBridge }]);
        const snapshot = workbookData('time');
        snapshot.sheets.sheet2.cellData = { 0: { 0: { t: CellValueType.NUMBER, v: 2 } } };
        const interceptor = injector.get(SheetInterceptorService);
        const workbook = injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            snapshot
        );
        injector.get(NumfmtEditorController);
        injector.get(SheetsNumfmtCellContentController);
        injector.get(RegionService).setRegion('zh-CN');
        const worksheet = workbook.getSheetBySheetId('sheet2')!;
        injector.get(ICommandService).syncExecuteCommand(SetNumfmtMutation.id, {
            unitId: 'time',
            subUnitId: 'sheet2',
            values: { 1: { ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] } },
            refMap: { 1: { pattern: 'h:mm' } },
        });
        const cell = worksheet.getCell(0, 0)!;
        expect(cell.v).toBe('00:00');
        const location = { workbook, worksheet, unitId: 'time', subUnitId: 'sheet2', row: 0, col: 0, origin: cell };
        const edit = interceptor.writeCellInterceptor.fetchThroughInterceptors(BEFORE_CELL_EDIT);
        expect(edit(cell, location)?.v).toBe('0:00:00');
        const commit = interceptor.writeCellInterceptor.fetchThroughInterceptors(AFTER_CELL_EDIT);
        expect(commit({ v: '12:33:22' }, location)).toMatchObject({
            v: 2 + (12 * 3600 + 33 * 60 + 22) / 86400,
            t: CellValueType.NUMBER,
        });
    });

    it('uses the active region when committing text in the same workbook', async () => {
        const injector = univer.__getInjector();
        const workbook = injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            workbookData('regions')
        );
        injector.get(NumfmtEditorController);
        const region = injector.get(RegionService);
        const worksheet = workbook.getSheetBySheetId('sheet2')!;
        const edit = injector.get(SheetInterceptorService).writeCellInterceptor.fetchThroughInterceptors(AFTER_CELL_EDIT);
        const commands = injector.get(ICommandService);
        const samples = [
            ['en-US', '$1000', 1000, CellValueType.NUMBER],
            ['zh-CN', '$1000', '$1000', CellValueType.STRING],
            ['zh-CN', '5 A', 5 / 24, CellValueType.NUMBER],
            ['zh-CN', '¥1000', 1000, CellValueType.NUMBER],
            ['id-ID', '02.03.2025', 9405 / 86400, CellValueType.NUMBER],
            ['en-US', '2.8%', 0.028, CellValueType.NUMBER],
            ['en-US', '1,234', 1234, CellValueType.NUMBER],
            ['de-DE', '1,234', 1.234, CellValueType.NUMBER],
            ['fr-CH', '1,234', '1,234', CellValueType.STRING],
            ['de-DE', '1234.56', '1234.56', CellValueType.STRING],
            ['en-IN', '1,23,456.70', 123456.7, CellValueType.NUMBER],
            ['fr-FR', '123456789123456789,01', 123456789123456000, CellValueType.NUMBER],
        ] as const;
        for (const [row, [tag, input, expected, type]] of samples.entries()) {
            region.setRegion(tag);
            const target = { unitId: 'regions', subUnitId: 'sheet2' };
            const value = edit({ v: input }, { ...target, row, col: 1, workbook, worksheet, origin: null });
            await commands.executeCommand(SetRangeValuesCommand.id, {
                ...target,
                range: { startRow: row, endRow: row, startColumn: 1, endColumn: 1 },
                value,
            });
            expect(worksheet.getCellRaw(row, 1)).toMatchObject({ v: expected, t: type });
        }
    });

    it('uses the active UI language for full-width entry when opening an English workbook', async () => {
        const injector = univer.__getInjector();
        const workbook = injector.get(IUniverInstanceService).createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            workbookData('full-width')
        );
        injector.get(NumfmtEditorController);
        const worksheet = workbook.getSheetBySheetId('sheet2')!;
        const edit = injector.get(SheetInterceptorService).writeCellInterceptor.fetchThroughInterceptors(AFTER_CELL_EDIT);
        const target = { unitId: 'full-width', subUnitId: 'sheet2' };
        injector.get(RegionService).setRegion('en-US');
        const locales = injector.get(LocaleService);
        locales.setLocale(LocaleType.JA_JP);
        const value = edit({ v: '１２．５' }, { ...target, row: 0, col: 0, workbook, worksheet, origin: null });
        await injector.get(ICommandService).executeCommand(SetRangeValuesCommand.id, {
            ...target,
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            value,
        });
        expect(worksheet.getCellRaw(0, 0)).toMatchObject({ v: 12.5, t: CellValueType.NUMBER });
    });

    it('writes accounting negatives without inventing a number format', async () => {
        const injector = univer.__getInjector();
        const instances = injector.get(IUniverInstanceService);
        const workbook = instances.createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            workbookData('paren'),
            { makeCurrent: true }
        );
        injector.get(NumfmtEditorController);
        const worksheet = workbook.getSheetBySheetId('sheet2')!;
        const commands = injector.get(ICommandService);
        const interceptor = injector.get(SheetInterceptorService).writeCellInterceptor;
        const numfmt = injector.get(INumfmtService);

        const cases: Array<{ input: string; value: number | string; pattern?: string }> = [
            { input: '(5)', value: -5 },
            { input: '(1,000)', value: -1000, pattern: '#,##0' },
            { input: '($1,000)', value: -1000, pattern: '$#,##0_);[Red]($#,##0)' },
            { input: '(5', value: '(5' },
            { input: '(+5)', value: '(+5)' },
        ];

        for (const [row, testCase] of cases.entries()) {
            const value = interceptor.fetchThroughInterceptors(AFTER_CELL_EDIT)({ v: testCase.input }, {
                workbook,
                worksheet,
                unitId: 'paren',
                subUnitId: 'sheet2',
                row,
                col: 0,
                origin: worksheet.getCellRaw(row, 0),
            })!;

            expect(await commands.executeCommand(SetRangeValuesCommand.id, {
                unitId: 'paren',
                subUnitId: 'sheet2',
                range: { startRow: row, endRow: row, startColumn: 0, endColumn: 0 },
                value,
            })).toBe(true);

            expect(worksheet.getCellRaw(row, 0)?.v).toBe(testCase.value);
            expect(numfmt.getValue('paren', 'sheet2', row, 0)?.pattern).toBe(testCase.pattern);
        }
    });
});

function workbookData(id: string): IWorkbookData {
    return {
        id,
        name: id,
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['sheet1', 'sheet2'],
        sheets: {
            sheet1: { id: 'sheet1', name: 'Other', cellData: { 0: { 0: { v: 7 } } } },
            sheet2: { id: 'sheet2', name: 'Target', cellData: { 0: { 0: { v: 11 } } } },
        },
    };
}

describe('number format editor interceptors', () => {
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
            [IEditorBridgeService, { useValue: editorBridge }],
        ]);

        unitId = testBed.unitId;
        subUnitId = testBed.subUnitId;
        commandService = testBed.get(ICommandService);
        const univerInstanceService = testBed.get(IUniverInstanceService);
        testBed.get(NumfmtEditorController);
        testBed.get(SheetsNumfmtCellContentController);
        workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
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

    it('before edit with a conditional text format uses the raw value', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }],
                },
            },
            refMap: {
                1: {
                    pattern: '[>0]"A";[<0]"B";"B"',
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = worksheet.getCell(0, 1);
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 0,
            col: 1,
            origin: cellData,
        };

        expect(cellData!.v).toBe('A');

        const result = sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(BEFORE_CELL_EDIT)(cellData, location);
        expect(result!.v).toBe(1);
        expect(result!.t).toBe(CellValueType.NUMBER);
    });

    it('before edit with percent', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            values: {
                1: {
                    ranges: [{ startRow: 10, endRow: 10, startColumn: 0, endColumn: 0 }],
                },
            },
            refMap: {
                1: {
                    pattern: '0.00%',
                },
            },
        };
        commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = worksheet.getCell(10, 0);
        const location = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            row: 10,
            col: 0,
            origin: cellData,
        };

        expect(cellData!.v).toEqual('100.12%');
        expect(cellData!.t).toEqual(2);

        const result = sheetInterceptorService.writeCellInterceptor.fetchThroughInterceptors(BEFORE_CELL_EDIT)(cellData, location);
        // The currency  format needs to be entered in the editor with real values, not with currency symbols
        expect(result!.v).toEqual('100.1234567%');
        expect(result!.t).toEqual(2);
        expect(result!.isPercentFormat).toBe(true);
    });

    describe('after edit with percent', () => {
        function setPercentFormat() {
            const params: ISetNumfmtMutationParams = {
                unitId,
                subUnitId,
                values: {
                    1: {
                        ranges: [{ startRow: 10, endRow: 10, startColumn: 0, endColumn: 0 }],
                    },
                },
                refMap: {
                    1: {
                        pattern: '0.00%',
                    },
                },
            };
            commandService.syncExecuteCommand(SetNumfmtMutation.id, params);
        }

        it.each([
            ['35%', 0.35],
            ['0.35%', 0.0035],
        ])('stores edited percent text %s as %s', (content, expected) => {
            setPercentFormat();
            const sheetInterceptorService = testBed.get(SheetInterceptorService);
            const result = sheetInterceptorService.writeCellInterceptor
                .fetchThroughInterceptors(AFTER_CELL_EDIT)({ v: content, t: CellValueType.NUMBER }, {
                    workbook,
                    worksheet,
                    unitId,
                    subUnitId,
                    row: 10,
                    col: 0,
                    origin: worksheet.getCellRaw(10, 0),
                });

            expect(result?.v).toBe(expected);
        });
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
                            paragraphId: 'para_sheets_numfmt_edit_date',
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
            id: '__INTERNAL_EDITOR__DOCS_NORMAL',
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
                        paragraphId: 'para_sheets_numfmt_bullet',
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
                        sectionId: 'section_fixture_1028',
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

    it('edit number 123456789123456789', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '123456789123456789' };
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

        expect(result?.v).toBe(123456789123456000);
        expect(result?.t).toBe(CellValueType.NUMBER);
    });

    it('edit number 1212121212121212.2345', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '1212121212121212.2345' };
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

        expect(result?.v).toBe(1212121212121210);
        expect(result?.t).toBe(CellValueType.NUMBER);
    });

    it('edit number 1212121212121212', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '1212121212121212' };
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

        expect(result?.v).toBe(1212121212121210);
        expect(result?.t).toBe(CellValueType.NUMBER);
    });

    it('edit number 1e3', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '1e3' };
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

        expect(result?.v).toBe(1000);
        expect(result?.t).toBe(CellValueType.NUMBER);
    });

    it('edit number 001', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '001' };
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

        expect(result?.v).toBe(1);
        expect(result?.t).toBe(CellValueType.NUMBER);
    });

    it('edit number +123.', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '+123.' };
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

        expect(result?.v).toBe(123);
        expect(result?.t).toBe(CellValueType.NUMBER);
    });

    it('edit content 5A', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '5A' };
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

        expect(result?.v).toBe('5A');
    });

    it('edit content 1 23', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '1 23' };
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

        expect(result?.v).toBe('1 23');
    });

    it('edit content 2/3', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '2/3' };
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
        expect(result?.v).toBe(excelDateSerial(new Date(Date.UTC(new Date().getUTCFullYear(), 1, 3))));
        expect(result?.t).toBe(CellValueType.NUMBER);
    });

    it('edit content 1000,', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '1000,' };
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

        expect(result?.v).toBe('1000,');
    });

    it('edit content 1000,1.00', () => {
        const sheetInterceptorService = testBed.get(SheetInterceptorService);
        const cellData = { v: '1000,1.00' };
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

        expect(result?.v).toBe('1000,1.00');
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
                                                paragraphId: 'para_sheets_numfmt_rich_text',
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
            [IEditorBridgeService, { useValue: editorBridge }],
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
