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

import type { Univer } from '@univerjs/core';
import {
    CellValueType,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RedoCommand,
    ThemeService,
    UndoCommand,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import { createCommandTestBed } from '@univerjs/sheets/commands/commands/__tests__/create-command-test-bed.js';
import { DesktopPlatformService, DesktopShortcutService, IPlatformService, IShortcutService } from '@univerjs/ui';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { AutoFillController } from '../../../controllers/auto-fill.controller';
import { AutoFillService, IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { EditorBridgeService, IEditorBridgeService } from '../../../services/editor-bridge.service';
import { ISelectionRenderService, SelectionRenderService } from '../../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';

const theme = {
    colorBlack: '#35322b',
};

const TEST_WORKBOOK_DATA = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                // Single Number
                '0': {
                    '0': {
                        v: 1,
                        m: '1',
                        t: CellValueType.NUMBER,
                    },
                    '1': {
                        v: 2,
                        m: '2',
                        t: CellValueType.NUMBER,
                    },
                },
                // Single Number. descending
                '1': {
                    '0': {
                        v: 2,
                        m: '2',
                        t: CellValueType.NUMBER,
                    },
                    '1': {
                        v: 1,
                        m: '1',
                        t: CellValueType.NUMBER,
                    },
                },
                // Extend Number
                '2': {
                    '0': {
                        v: '第1',
                        m: '第1',
                        t: CellValueType.STRING,
                    },
                    '1': {
                        v: '第2',
                        m: '第2',
                        t: CellValueType.STRING,
                    },
                },
                // Chinese Number
                '3': {
                    '0': {
                        v: '一',
                        m: '一',
                        t: CellValueType.STRING,
                    },
                    '1': {
                        v: '三',
                        m: '三',
                        t: CellValueType.STRING,
                    },
                },
                // Chinese Week
                '4': {
                    '0': {
                        v: '星期一',
                        m: '星期一',
                        t: CellValueType.STRING,
                    },
                    '1': {
                        v: '星期三',
                        m: '星期三',
                        t: CellValueType.STRING,
                    },
                },
                // Loop Series
                '5': {
                    '0': {
                        v: '甲',
                        m: '甲',
                        t: CellValueType.STRING,
                    },
                    '1': {
                        v: '乙',
                        m: '乙',
                        t: CellValueType.STRING,
                    },
                },
                // Other String
                '6': {
                    '0': {
                        v: 'copy only',
                        m: 'copy only',
                        t: CellValueType.STRING,
                    },
                    '1': {
                        v: 'no series',
                        m: 'no series',
                        t: CellValueType.STRING,
                    },
                },
                // Mixed Mode
                '7': {
                    '0': {
                        v: 1,
                        m: '1',
                        t: CellValueType.NUMBER,
                    },
                    '1': {
                        v: 2,
                        m: '2',
                        t: CellValueType.NUMBER,
                    },
                    '2': {
                        v: '第1',
                        m: '第1',
                        t: CellValueType.STRING,
                    },
                    '3': {
                        v: '第2',
                        m: '第2',
                        t: CellValueType.STRING,
                    },
                },
                // db click to fill
                '10': {
                    '0': {
                        v: 1,
                        m: '1',
                        t: CellValueType.NUMBER,
                    },
                    '1': {
                        v: 2,
                        m: '2',
                        t: CellValueType.NUMBER,
                    },
                    '2': {
                        v: 3,
                        m: '3',
                        t: CellValueType.NUMBER,
                    },
                    '3': {
                        v: 4,
                        m: '4',
                        t: CellValueType.NUMBER,
                    },
                },
                '11': {
                    '0': {
                        v: 2,
                        m: '2',
                        t: CellValueType.NUMBER,
                    },
                    '2': {
                        v: 3,
                        m: '3',
                        t: CellValueType.NUMBER,
                    },
                },
                '12': {
                    '0': {
                        v: 3,
                        m: '3',
                        t: CellValueType.NUMBER,
                    },
                },
                '13': {
                    '0': {
                        v: 4,
                        m: '4',
                        t: CellValueType.NUMBER,
                    },
                },
            },
        },
    },
    createdTime: '',
    creator: '',
    lastModifiedBy: '',
    locale: LocaleType.ZH_CN,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

describe('Test auto fill rules in controller', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let autoFillController: AutoFillController;
    let themeService: ThemeService;
    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA, [
            [ISelectionRenderService, { useClass: SelectionRenderService }],
            [IAutoFillService, { useClass: AutoFillService }],
            [IShortcutService, { useClass: DesktopShortcutService }],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [IEditorBridgeService, { useClass: EditorBridgeService }],
            [SheetSkeletonManagerService],
            [AutoFillController],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        themeService = get(ThemeService);
        themeService.setTheme(theme);
        autoFillController = get(AutoFillController);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
    });

    describe('auto fill', () => {
        describe('auto fill the numbers', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');
                // test number
                (autoFillController as any)._triggerAutoFill(
                    {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 1,
                    },
                    {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 3,
                    }
                );
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(0, 2)?.v).toBe(3);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(0, 3)?.v).toBe(4);
                // test number. descending
                (autoFillController as any)._triggerAutoFill(
                    {
                        startRow: 1,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 1,
                    },
                    {
                        startRow: 1,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 3,
                    }
                );
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(1, 2)?.v).toBe(0);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(1, 3)?.v).toBe(-1);
            });
        });

        describe('auto fill the extend numbers', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');
                // test extend number
                (autoFillController as any)._triggerAutoFill(
                    {
                        startRow: 2,
                        startColumn: 0,
                        endRow: 2,
                        endColumn: 1,
                    },
                    {
                        startRow: 2,
                        startColumn: 0,
                        endRow: 2,
                        endColumn: 3,
                    }
                );
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(2, 2)?.v).toBe('第3');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(2, 3)?.v).toBe('第4');
            });
        });

        describe('auto fill the chinese numbers', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');
                // test chinese number
                (autoFillController as any)._triggerAutoFill(
                    {
                        startRow: 3,
                        startColumn: 0,
                        endRow: 3,
                        endColumn: 2,
                    },
                    {
                        startRow: 3,
                        startColumn: 0,
                        endRow: 3,
                        endColumn: 4,
                    }
                );
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(3, 3)?.v).toBe('五');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(3, 4)?.v).toBe('日');
            });
        });

        describe('auto fill the chinese week', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');

                // test chinese week
                (autoFillController as any)._triggerAutoFill(
                    {
                        startRow: 4,
                        startColumn: 0,
                        endRow: 4,
                        endColumn: 2,
                    },
                    {
                        startRow: 4,
                        startColumn: 0,
                        endRow: 4,
                        endColumn: 4,
                    }
                );
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(4, 3)?.v).toBe('星期五');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(4, 4)?.v).toBe('星期日');
            });
        });

        describe('auto fill the loop series', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');
                // test loop series
                (autoFillController as any)._triggerAutoFill(
                    {
                        startRow: 5,
                        startColumn: 0,
                        endRow: 5,
                        endColumn: 1,
                    },
                    {
                        startRow: 5,
                        startColumn: 0,
                        endRow: 5,
                        endColumn: 3,
                    }
                );
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(5, 2)?.v).toBe('丙');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(5, 3)?.v).toBe('丁');
            });
        });

        describe('auto fill the other string', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');
                // test other string
                (autoFillController as any)._triggerAutoFill(
                    {
                        startRow: 6,
                        startColumn: 0,
                        endRow: 6,
                        endColumn: 1,
                    },
                    {
                        startRow: 6,
                        startColumn: 0,
                        endRow: 6,
                        endColumn: 3,
                    }
                );
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(6, 2)?.v).toBe('copy only');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(6, 3)?.v).toBe('no series');
            });
        });

        describe('auto fill the mixed mode', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');
                // test mixed mode
                (autoFillController as any)._triggerAutoFill(
                    {
                        startRow: 7,
                        startColumn: 0,
                        endRow: 7,
                        endColumn: 3,
                    },
                    {
                        startRow: 7,
                        startColumn: 0,
                        endRow: 7,
                        endColumn: 7,
                    }
                );
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 4)?.v).toBe(3);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 5)?.v).toBe(4);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 6)?.v).toBe('第3');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 7)?.v).toBe('第4');

                // undo redo
                await commandService.executeCommand(UndoCommand.id);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 4)?.v).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 5)?.v).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 6)?.v).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 7)?.v).toBe(undefined);

                await commandService.executeCommand(RedoCommand.id);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 4)?.v).toBe(3);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 5)?.v).toBe(4);
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 6)?.v).toBe('第3');
                expect(workbook.getSheetBySheetId('sheet1')?.getCell(7, 7)?.v).toBe('第4');
            });
        });
    });

    describe('auto fill range is auto detected', async () => {
        it('correct situation', async () => {
            const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
            if (!workbook) throw new Error('This is an error');
            // test other string
            (autoFillController as any)._handleDbClickFill({
                startRow: 10,
                startColumn: 1,
                endRow: 10,
                endColumn: 1,
            });
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(11, 1)?.v).toBe(3);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(12, 1)?.v).toBe(4);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(13, 1)?.v).toBe(5);

            // undo redo
            await commandService.executeCommand(UndoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(11, 1)?.v).toBe(undefined);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(12, 1)?.v).toBe(undefined);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(13, 1)?.v).toBe(undefined);

            await commandService.executeCommand(RedoCommand.id);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(11, 1)?.v).toBe(3);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(12, 1)?.v).toBe(4);
            expect(workbook.getSheetBySheetId('sheet1')?.getCell(13, 1)?.v).toBe(5);
        });
    });
});
