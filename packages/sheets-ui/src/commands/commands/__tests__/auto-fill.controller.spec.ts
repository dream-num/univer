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

import type { ICellData, Injector, IStyleData, Nullable, Univer, Workbook } from '@univerjs/core';
import {
    CellValueType,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RedoCommand,
    set,
    ThemeService,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';

import {
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { IPlatformService, IShortcutService, PlatformService, ShortcutService } from '@univerjs/ui';
import { beforeEach, describe, expect, it } from 'vitest';
import { AutoFillController } from '../../../controllers/auto-fill.controller';
import { AutoFillService, IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { APPLY_TYPE } from '../../../services/auto-fill/type';
import { EditorBridgeService, IEditorBridgeService } from '../../../services/editor-bridge.service';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SheetSelectionRenderService } from '../../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { SheetsRenderService } from '../../../services/sheets-render.service';
import { AutoClearContentCommand, AutoFillCommand } from '../auto-fill.command';
import { RefillCommand } from '../refill.command';
import { createCommandTestBed } from './create-command-test-bed';

const theme = {
    colorBlack: '#35322b',
};

class mockSheetsRenderService {
    registerSkeletonChangingMutations(id: string) {
    }
}

const TEST_WORKBOOK_DATA = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                // Single Number
                0: {
                    0: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    1: {
                        v: 2,
                        t: CellValueType.NUMBER,
                    },
                },
                // Single Number. descending
                1: {
                    0: {
                        v: 2,
                        t: CellValueType.NUMBER,
                    },
                    1: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                },
                // Extend Number
                2: {
                    0: {
                        v: '第 1',
                        t: CellValueType.STRING,
                    },
                    1: {
                        v: '第 2',
                        t: CellValueType.STRING,
                    },
                },
                // Chinese Number
                3: {
                    0: {
                        v: '一',
                        t: CellValueType.STRING,
                    },
                    1: {
                        v: '三',
                        t: CellValueType.STRING,
                    },
                },
                // Chinese Week
                4: {
                    0: {
                        v: '星期一',
                        t: CellValueType.STRING,
                    },
                    1: {
                        v: '星期三',
                        t: CellValueType.STRING,
                    },
                },
                // Loop Series
                5: {
                    0: {
                        v: '甲',
                        t: CellValueType.STRING,
                    },
                    1: {
                        v: '乙',
                        t: CellValueType.STRING,
                    },
                },
                // Other String
                6: {
                    0: {
                        v: 'copy only',
                        t: CellValueType.STRING,
                    },
                    1: {
                        v: 'no series',
                        t: CellValueType.STRING,
                    },
                },
                // Mixed Mode
                7: {
                    0: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    1: {
                        v: 2,
                        t: CellValueType.NUMBER,
                    },
                    2: {
                        v: '第 1',
                        t: CellValueType.STRING,
                    },
                    3: {
                        v: '第 2',
                        t: CellValueType.STRING,
                    },
                },
                // db click to fill
                10: {
                    0: {
                        v: 1,
                        t: CellValueType.NUMBER,
                    },
                    1: {
                        v: 2,
                        t: CellValueType.NUMBER,
                    },
                    2: {
                        v: 3,
                        t: CellValueType.NUMBER,
                    },
                    3: {
                        v: 4,
                        t: CellValueType.NUMBER,
                    },
                },
                11: {
                    0: {
                        v: 2,
                        t: CellValueType.NUMBER,
                    },
                    2: {
                        v: 3,
                        t: CellValueType.NUMBER,
                    },
                },
                12: {
                    0: {
                        v: 3,
                        t: CellValueType.NUMBER,
                    },
                },
                13: {
                    0: {
                        v: 4,
                        t: CellValueType.NUMBER,
                    },
                },
                // left direction & equal ratio & styles
                14: {
                    2: {
                        v: 2,
                        t: CellValueType.NUMBER,
                        s: '_aRLOe',
                    },
                    3: {
                        v: 4,
                        t: CellValueType.NUMBER,
                    },
                    4: {
                        v: 8,
                        t: CellValueType.NUMBER,
                        s: '3UpAbI',
                    },
                },
                16: {
                    2: {
                        v: 2,
                        t: CellValueType.NUMBER,
                        s: '_aRLOe',
                    },
                },
            },
            mergeData: [
                {
                    startRow: 0,
                    endRow: 2,
                    startColumn: 5,
                    endColumn: 7,
                },
            ],
        },
    },
    createdTime: '',
    creator: '',
    lastModifiedBy: '',
    locale: LocaleType.ZH_CN,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {
        _aRLOe: {
            bg: {
                rgb: '#ccc',
            },
            ht: 2,
            vt: 2,
        },
        '3UpAbI': {
            bg: {
                rgb: '#eee',
            },
        },
    },
    timeZone: '',
};

describe('Test auto fill rules in controller', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let autoFillController: AutoFillController;
    let themeService: ThemeService;

    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    let getStyles: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<IStyleData>>> | undefined;
    let selectionManagerService: SheetsSelectionsService;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA, [
            [DocSelectionManagerService],
            [ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }],
            [IAutoFillService, { useClass: AutoFillService }],
            [IShortcutService, { useClass: ShortcutService }],
            [IPlatformService, { useClass: PlatformService }],
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [IEditorService, { useClass: EditorService }],
            [IRenderManagerService, { useClass: RenderManagerService }],
            [SheetSkeletonManagerService],
            [AutoFillController],
            [SheetsRenderService, { useClass: mockSheetsRenderService }],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        themeService = get(ThemeService);
        const theme = themeService.getCurrentTheme();
        const newTheme = set(theme, 'black', '#35322b');
        themeService.setTheme(newTheme);

        autoFillController = get(AutoFillController);
        selectionManagerService = get(SheetsSelectionsService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RefillCommand);
        commandService.registerCommand(AutoClearContentCommand);
        commandService.registerCommand(AutoFillCommand);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getStyles = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<IStyleData>>> | undefined => {
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (values && styles) {
                return values.map((row) => row.map((cell) => styles.getStyleByCell(cell)));
            }
        };
    });

    describe('auto fill', () => {
        describe('auto fill the numbers', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');
                // test number

                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 1,
                    },
                    targetRange: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 3,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(0, 2)?.v).toBe(3);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(0, 3)?.v).toBe(4);
                // test number. descending
                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 1,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 1,
                    },
                    targetRange: {
                        startRow: 1,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 3,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(1, 2)?.v).toBe(0);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(1, 3)?.v).toBe(-1);
            });
        });

        describe('auto fill the extend numbers', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');
                // test extend number
                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 2,
                        startColumn: 0,
                        endRow: 2,
                        endColumn: 1,
                    },
                    targetRange: {
                        startRow: 2,
                        startColumn: 0,
                        endRow: 2,
                        endColumn: 3,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(2, 2)?.v).toBe('第 3');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(2, 3)?.v).toBe('第 4');
            });
        });

        describe('auto fill the chinese numbers', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');
                // test chinese number
                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 3,
                        startColumn: 0,
                        endRow: 3,
                        endColumn: 2,
                    },
                    targetRange: {
                        startRow: 3,
                        startColumn: 0,
                        endRow: 3,
                        endColumn: 4,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(3, 3)?.v).toBe('五');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(3, 4)?.v).toBe('日');
            });
        });

        describe('auto fill the chinese week', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');

                // test chinese week
                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 4,
                        startColumn: 0,
                        endRow: 4,
                        endColumn: 2,
                    },
                    targetRange: {
                        startRow: 4,
                        startColumn: 0,
                        endRow: 4,
                        endColumn: 4,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(4, 3)?.v).toBe('星期五');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(4, 4)?.v).toBe('星期日');
            });
        });

        describe('auto fill the loop series', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');
                // test loop series
                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 5,
                        startColumn: 0,
                        endRow: 5,
                        endColumn: 1,
                    },
                    targetRange: {
                        startRow: 5,
                        startColumn: 0,
                        endRow: 5,
                        endColumn: 3,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(5, 2)?.v).toBe('丙');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(5, 3)?.v).toBe('丁');
            });
        });

        describe('auto fill the other string', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');
                // test other string
                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 6,
                        startColumn: 0,
                        endRow: 6,
                        endColumn: 1,
                    },
                    targetRange: {
                        startRow: 6,
                        startColumn: 0,
                        endRow: 6,
                        endColumn: 3,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(6, 2)?.v).toBe('copy only');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(6, 3)?.v).toBe('no series');
            });
        });

        describe('auto fill the mixed mode', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');
                // test mixed mode
                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 7,
                        startColumn: 0,
                        endRow: 7,
                        endColumn: 3,
                    },
                    targetRange: {
                        startRow: 7,
                        startColumn: 0,
                        endRow: 7,
                        endColumn: 7,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 4)?.v).toBe(3);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 5)?.v).toBe(4);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 6)?.v).toBe('第 3');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 7)?.v).toBe('第 4');

                // undo redo
                await commandService.executeCommand(UndoCommand.id);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 4)?.v).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 5)?.v).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 6)?.v).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 7)?.v).toBe(undefined);

                await commandService.executeCommand(RedoCommand.id);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 4)?.v).toBe(3);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 5)?.v).toBe(4);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 6)?.v).toBe('第 3');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 7)?.v).toBe('第 4');
            });
        });

        describe('auto fill the merged cell', async () => {
            it('test primary', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');

                const selectionManagerService = get(SheetsSelectionsService);
                selectionManagerService.addSelections([{
                    style: null,
                    range: {
                        startRow: 0,
                        startColumn: 5,
                        endRow: 2,
                        endColumn: 7,
                    },
                    primary: {
                        startRow: 0,
                        startColumn: 5,
                        endRow: 2,
                        endColumn: 7,
                        actualColumn: 5,
                        actualRow: 0,
                        isMerged: true,
                        isMergedMainCell: true,
                    },
                }]);

                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 0,
                        startColumn: 5,
                        endRow: 2,
                        endColumn: 7,
                    },
                    targetRange: {
                        startRow: 0,
                        startColumn: 5,
                        endRow: 5,
                        endColumn: 7,
                    },
                });
                expect(workbook.getActiveSheet()?.getMergeData().length).toBe(2);
                expect(selectionManagerService.getCurrentLastSelection()?.primary).toEqual(expect.objectContaining({
                    startRow: 0,
                    startColumn: 5,
                    endRow: 2,
                    endColumn: 7,
                }));
            });
        });

        describe('auto fill clear', async () => {
            it('test primary will move to upper left corner', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');

                const selectionManagerService = get(SheetsSelectionsService);
                selectionManagerService.addSelections([{
                    style: null,
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 5,
                        endColumn: 2,
                    },
                    // primary not in the upper left corner, but after fill clear will move to upper left corner
                    primary: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 0,
                        actualColumn: 0,
                        actualRow: 1,
                        isMerged: true,
                        isMergedMainCell: true,
                    },
                }]);

                commandService.executeCommand(AutoFillCommand.id, {
                    sourceRange: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 5,
                        endColumn: 2,
                    },
                    targetRange: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 3,
                        endColumn: 2,
                    },
                });
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(4, 0)?.v).toBeFalsy();
                expect(selectionManagerService.getCurrentLastSelection()?.primary).toEqual(expect.objectContaining({
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 0,
                }));
            });
        });
    });

    describe('auto fill range is auto detected', async () => {
        it('correct situation', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            if (!workbook) throw new Error('This is an error');
            // test other string
            (autoFillController as any)._handleDbClickFill({
                startRow: 10,
                startColumn: 1,
                endRow: 10,
                endColumn: 1,
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(11, 1)?.v).toBe(2);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(12, 1)?.v).toBe(2);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(13, 1)?.v).toBe(2);

            // undo redo
            await commandService.executeCommand(UndoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(11, 1)?.v).toBe(undefined);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(12, 1)?.v).toBe(undefined);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(13, 1)?.v).toBe(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(11, 1)?.v).toBe(2);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(12, 1)?.v).toBe(2);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(13, 1)?.v).toBe(2);
        });
    });

    describe('auto fill in left direction', async () => {
        it('correct situation', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            if (!workbook) throw new Error('This is an error');
            // test other string
            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startRow: 14,
                    startColumn: 2,
                    endRow: 14,
                    endColumn: 4,
                },
                targetRange: {
                    startRow: 14,
                    startColumn: 0,
                    endRow: 14,
                    endColumn: 4,
                },
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 0)?.v).toBe(0.5);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 1)?.v).toBe(1);
            // undo redo
            await commandService.executeCommand(UndoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 0)?.v).toBe(undefined);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 1)?.v).toBe(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 0)?.v).toBe(0.5);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 1)?.v).toBe(1);
        });
    });

    describe('auto fill with equal ratio & style', async () => {
        it('correct situation', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            if (!workbook) throw new Error('This is an error');
            // equal ratio
            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startRow: 14,
                    startColumn: 2,
                    endRow: 14,
                    endColumn: 4,
                },
                targetRange: {
                    startRow: 14,
                    startColumn: 2,
                    endRow: 14,
                    endColumn: 7,
                },
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 5)?.v).toBe(16);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 6)?.v).toBe(32);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 7)?.v).toBe(64);
            const styles = getStyles(14, 5, 14, 7);
            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: '#ccc',
                },
                ht: 2,
                vt: 2,
            });
            expect(styles && styles[0][1]).toStrictEqual(undefined);
            expect(styles && styles[0][2]).toStrictEqual({
                bg: {
                    rgb: '#eee',
                },
            });

            // undo redo
            await commandService.executeCommand(UndoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 5)?.v).toBe(undefined);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 6)?.v).toBe(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 5)?.v).toBe(16);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 6)?.v).toBe(32);
        });
    });

    describe('auto fill without format', async () => {
        it('correct situation', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            if (!workbook) throw new Error('This is an error');
            // equal ratio
            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startRow: 14,
                    startColumn: 2,
                    endRow: 14,
                    endColumn: 3,
                },
                targetRange: {
                    startRow: 14,
                    startColumn: 2,
                    endRow: 14,
                    endColumn: 4,
                },
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 4)?.v).toBe(6);
            const styles = getStyles(14, 4, 14, 4);
            expect(styles && styles[0][0]).toStrictEqual({
                bg: {
                    rgb: '#ccc',
                },
                ht: 2,
                vt: 2,
            });

            commandService.executeCommand(RefillCommand.id, { type: APPLY_TYPE.NO_FORMAT });

            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 4)?.v).toBe(6);
            const styles_refill = getStyles(14, 4, 14, 4);
            expect(styles_refill && styles_refill[0][0]).toStrictEqual({
                bg: {
                    rgb: '#eee',
                },
            });

            // undo redo
            await commandService.executeCommand(UndoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 4)?.v).toBe(8);
            const styles_undo = getStyles(14, 4, 14, 4);
            expect(styles_undo && styles_undo[0][0]).toStrictEqual({
                bg: {
                    rgb: '#eee',
                },
            });

            // redo
            await commandService.executeCommand(RedoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(14, 4)?.v).toBe(6);
            const styles_redo = getStyles(14, 4, 14, 4);
            expect(styles_redo && styles_redo[0][0]).toStrictEqual({
                bg: {
                    rgb: '#eee',
                },
            });
        });
    });

    describe('auto fill from single cell', async () => {
        it('correct situation', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            if (!workbook) throw new Error('This is an error');
            // test right
            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startRow: 16,
                    startColumn: 2,
                    endRow: 16,
                    endColumn: 2,
                },
                targetRange: {
                    startRow: 16,
                    startColumn: 2,
                    endRow: 16,
                    endColumn: 4,
                },
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(16, 3)?.v).toBe(2);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(16, 4)?.v).toBe(2);
            // test left
            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startRow: 16,
                    startColumn: 2,
                    endRow: 16,
                    endColumn: 2,
                },
                targetRange: {
                    startRow: 16,
                    startColumn: 0,
                    endRow: 16,
                    endColumn: 2,
                },
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(16, 1)?.v).toBe(2);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(16, 0)?.v).toBe(2);
            // test up
            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startRow: 16,
                    startColumn: 2,
                    endRow: 16,
                    endColumn: 2,
                },
                targetRange: {
                    startRow: 15,
                    startColumn: 2,
                    endRow: 16,
                    endColumn: 2,
                },
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(15, 2)?.v).toBe(2);
            // test down
            commandService.executeCommand(AutoFillCommand.id, {
                sourceRange: {
                    startRow: 16,
                    startColumn: 2,
                    endRow: 16,
                    endColumn: 2,
                },
                targetRange: {
                    startRow: 16,
                    startColumn: 2,
                    endRow: 17,
                    endColumn: 2,
                },
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(17, 2)?.v).toBe(2);
        });
    });
});
