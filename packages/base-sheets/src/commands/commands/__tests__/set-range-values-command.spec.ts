import {
    CellValueType,
    ICellData,
    ICommandService,
    ICurrentUniverService,
    IDocumentData,
    Nullable,
    SELECTION_TYPE,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { ISetRangeValuesCommandParams, SetRangeValuesCommand } from '../set-range-values.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test set range values commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let currentUniverService: ICurrentUniverService;
    let params: ISetRangeValuesCommandParams;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);

        currentUniverService = get(ICurrentUniverService);
        currentUniverService.focusUniverInstance('test'); // used in undo

        const richTextDemo: IDocumentData = {
            id: 'd',
            body: {
                dataStream: `Instructions:\f①Project division - Fill in the specific division of labor after the project is disassembled:\f②Responsible Person - Enter the responsible person's name here:\f③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example,\fthe specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. \r\n`,
                textRuns: [
                    {
                        st: 0,
                        ed: 488,
                        ts: {
                            cl: {
                                rgb: 'rgb(92,92,92)',
                            },
                        },
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 489,
                        paragraphStyle: {
                            spaceAbove: 10,
                            lineSpacing: 1.2,
                        },
                    },
                ],
            },
            documentStyle: {
                pageSize: {
                    width: Infinity,
                    height: Infinity,
                },
                marginTop: 0,
                marginBottom: 0,
                marginRight: 2,
                marginLeft: 2,
            },
        };

        params = {
            value: {
                p: richTextDemo,
                v: 'a1',
                m: 'a1',
            },
        };
    });

    afterEach(() => {
        univer.dispose();
    });
    // TODO clear formats
    describe('set range values', () => {
        describe('correct situations', () => {
            it('will set range values when there is a selected range', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: null,
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                const richTextDemo: IDocumentData = {
                    id: 'd',
                    body: {
                        dataStream: `Instructions:\f①Project division - Fill in the specific division of labor after the project is disassembled:\f②Responsible Person - Enter the responsible person's name here:\f③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example,\fthe specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. \r\n`,
                        textRuns: [
                            {
                                st: 0,
                                ed: 488,
                                ts: {
                                    cl: {
                                        rgb: 'rgb(92,92,92)',
                                    },
                                },
                            },
                        ],
                        paragraphs: [
                            {
                                startIndex: 489,
                                paragraphStyle: {
                                    spaceAbove: 10,
                                    lineSpacing: 1.2,
                                },
                            },
                        ],
                    },
                    documentStyle: {
                        pageSize: {
                            width: Infinity,
                            height: Infinity,
                        },
                        marginTop: 0,
                        marginBottom: 0,
                        marginRight: 2,
                        marginLeft: 2,
                    },
                };

                params = {
                    value: {
                        p: richTextDemo,
                        v: 'a1',
                        m: 'a1',
                        t: CellValueType.STRING,
                    },
                };

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, params)).toBeTruthy();
                expect(getValue()).toStrictEqual(params.value);
                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValue()).toStrictEqual({
                    v: 'A1',
                });
            });
            it('clear all', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: null,
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                const parseValue: ISetRangeValuesCommandParams = {
                    value: null,
                };

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, parseValue)).toBeTruthy();
                console.info(getValue());
                expect(getValue()).toStrictEqual({});
            });
            it('clear formats', async () => {
                const selectionManager = get(SelectionManagerService);
                selectionManager.setCurrentSelection({
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    unitId: 'test',
                    sheetId: 'sheet1',
                });
                selectionManager.add([
                    {
                        rangeData: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
                        cellRange: null,
                        selectionType: SELECTION_TYPE.NORMAL,
                        style: null,
                    },
                ]);

                function getValue(): Nullable<ICellData> {
                    return get(ICurrentUniverService)
                        .getUniverSheetInstance('test')
                        ?.getWorkBook()
                        .getSheetBySheetId('sheet1')
                        ?.getRange(0, 0, 0, 0)
                        .getValue();
                }

                const parseValue: ISetRangeValuesCommandParams = {
                    value: null,
                };

                expect(await commandService.executeCommand(SetRangeValuesCommand.id, parseValue)).toBeTruthy();
                console.info(getValue());
                expect(getValue()).toStrictEqual({});
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                const result = await commandService.executeCommand(SetRangeValuesCommand.id, params);
                expect(result).toBeFalsy();
            });
        });
    });
});
