/**
 * Copyright 2023 DreamNum Inc.
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
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RedoCommand,
    ThemeService,
    UndoCommand,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    AddWorksheetMergeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import { createCommandTestBed } from '@univerjs/sheets/commands/commands/__tests__/create-command-test-bed.js';
import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { IMarkSelectionService } from '../../..';
import { FormatPainterController } from '../../../controllers/format-painter/format-painter.controller';
import { FormatPainterService, IFormatPainterService } from '../../../services/format-painter/format-painter.service';
import { SetFormatPainterOperation } from '../../operations/set-format-painter.operation';
import {
    ApplyFormatPainterCommand,
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../set-format-painter.command';

const theme = {
    colorBlack: '#35322b',
};

const TEST_WORKBOOK_DATA = {
    id: 'workbook-01',
    sheetOrder: ['sheet-0011'],
    name: 'UniverSheet Demo',
    appVersion: '3.0.0-alpha',
    styles: {
        yifA1t: {
            bl: 1,
            it: 1,
            ul: {
                s: 1,
            },
            st: {
                s: 1,
            },
        },
        M5JbP2: {
            bg: {
                rgb: '#409f11',
            },
            cl: {
                rgb: '#E30909',
            },
            ff: 'Microsoft YaHei',
        },
    },
    sheets: {
        'sheet-0011': {
            type: 0,
            id: 'sheet-0011',
            name: 'sheet11',
            columnData: {
                '1': {
                    hd: 0,
                },
            },
            mergeData: [
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
            ],
            status: 1,
            cellData: {
                '0': {
                    '0': {
                        v: 1,
                        t: 2,
                        s: 'yifA1t',
                    },
                    '1': {
                        v: 2,
                        t: 2,
                        s: 'M5JbP2',
                    },
                    '2': {
                        v: 3,
                    },
                    '3': {
                        v: 1,
                        f: '=SUM(A1)',
                        si: '3e4r5t',
                        t: 2,
                    },
                },
                '1': {
                    '0': {
                        v: 4,
                    },
                    '2': {
                        v: 1,
                        t: 2,
                    },
                    '3': {
                        v: 1,
                        t: 2,
                    },
                },
                '2': {
                    '0': {
                        v: 44,
                    },
                    '2': {
                        v: 1,
                        t: 2,
                    },
                    '3': {
                        v: 1,
                        t: 2,
                    },
                },
                '3': {
                    '0': {
                        v: 444,
                    },
                    '2': {
                        v: 1,
                        t: 2,
                    },
                    '3': {
                        v: 1,
                        t: 2,
                    },
                },
                '4': {
                    '2': {
                        v: 1,
                        t: 2,
                    },
                },
            },
        },
    },
    createdTime: '',
    creator: '',
    lastModifiedBy: '',
    locale: LocaleType.EN_US,
    modifiedTime: '',
    timeZone: '',
};

class MarkSelectionService extends Disposable implements IMarkSelectionService {
    addShape(): string | null {
        return null;
    }

    refreshShapes() {}

    removeShape(id: string): void {}

    removeAllShapes(): void {}
}

class RenderManagerService {
    getRenderById(id: string) {
        return null;
    }
}

describe('Test format painter rules in controller', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let themeService: ThemeService;
    let formatPainterController: FormatPainterController;
    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA, [
            [IMarkSelectionService, { useClass: MarkSelectionService }],
            [IFormatPainterService, { useClass: FormatPainterService }],
            [IRenderManagerService, { useClass: RenderManagerService }],
            [FormatPainterController],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        themeService = get(ThemeService);
        themeService.setTheme(theme);

        formatPainterController = get(FormatPainterController);
        commandService.registerCommand(SetFormatPainterOperation);
        commandService.registerCommand(SetInfiniteFormatPainterCommand);
        commandService.registerCommand(SetOnceFormatPainterCommand);
        commandService.registerCommand(ApplyFormatPainterCommand);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);

        const selectionManagerService = get(SelectionManagerService);
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'workbook-01',
            sheetId: 'sheet-0011',
        });
    });

    describe('format painter', () => {
        describe('format painter the numbers', async () => {
            it('correct situation', async () => {
                const workbook = get(IUniverInstanceService).getCurrentUniverSheetInstance();
                if (!workbook) throw new Error('This is an error');
                await commandService.executeCommand(SetSelectionsOperation.id, {
                    workbookId: 'workbook-01',
                    worksheetId: 'sheet-0011',
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    selections: [
                        {
                            range: {
                                startRow: 0,
                                endRow: 1,
                                startColumn: 0,
                                endColumn: 1,
                            },
                        },
                    ],
                });
                await commandService.executeCommand(SetOnceFormatPainterCommand.id);
                await (formatPainterController as any)._applyFormatPainter({
                    startRow: 0,
                    endRow: 4,
                    startColumn: 2,
                    endColumn: 3,
                });
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(0, 2)?.s).toBe('yifA1t');
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(0, 3)?.s).toBe('M5JbP2');
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(2, 3)?.s).toBe('M5JbP2');
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(2, 3)?.s).toBe('M5JbP2');
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData().length).toBe(3);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData()[0].startRow).toBe(1);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData()[1].startRow).toBe(1);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData()[2].startRow).toBe(3);

                get(IUniverInstanceService).focusUniverInstance('workbook-01');
                // undo
                await commandService.executeCommand(UndoCommand.id);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(0, 2)?.s).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(0, 3)?.s).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(2, 3)?.s).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(2, 3)?.s).toBe(undefined);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData().length).toBe(1);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData()[0].startRow).toBe(1);
                //redo
                await commandService.executeCommand(RedoCommand.id);

                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(0, 3)?.s).toBe('M5JbP2');
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(2, 3)?.s).toBe('M5JbP2');
                expect(workbook.getSheetBySheetId('sheet-0011')?.getCell(2, 3)?.s).toBe('M5JbP2');
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData().length).toBe(3);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData()[0].startRow).toBe(1);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData()[1].startRow).toBe(1);
                expect(workbook.getSheetBySheetId('sheet-0011')?.getMergeData()[2].startRow).toBe(3);
            });
        });
    });
});
