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

import type { Univer, Workbook } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RedoCommand,
    ThemeService,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISelectionWithCoordAndStyle } from '@univerjs/sheets';
import {
    AddWorksheetMergeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesCommand,
    SetRangeValuesMutation,
    SetSelectionsOperation,
} from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { FormatPainterController } from '../../../controllers/format-painter/format-painter.controller';
import { FormatPainterService, IFormatPainterService } from '../../../services/format-painter/format-painter.service';
import { SetFormatPainterOperation } from '../../operations/set-format-painter.operation';
import {
    ApplyFormatPainterCommand,
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../set-format-painter.command';
import { IMarkSelectionService } from '../../../services/mark-selection/mark-selection.service';
import { ISelectionRenderService } from '../../../services/selection/selection-render.service';
import { createCommandTestBed } from './create-command-test-bed';

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
                1: {
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
                0: {
                    0: {
                        v: 1,
                        t: 2,
                        s: 'yifA1t',
                    },
                    1: {
                        v: 2,
                        t: 2,
                        s: 'M5JbP2',
                    },
                    2: {
                        v: 3,
                    },
                    3: {
                        v: 1,
                        f: '=SUM(A1)',
                        si: '3e4r5t',
                        t: 2,
                    },
                },
                1: {
                    0: {
                        v: 4,
                    },
                    2: {
                        v: 1,
                        t: 2,
                    },
                    3: {
                        v: 1,
                        t: 2,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                    2: {
                        v: 1,
                        t: 2,
                    },
                    3: {
                        v: 1,
                        t: 2,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                    2: {
                        v: 1,
                        t: 2,
                    },
                    3: {
                        v: 1,
                        t: 2,
                    },
                },
                4: {
                    2: {
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

    refreshShapes() { /* TODO document why this method 'refreshShapes' is empty */ }

    removeShape(id: string): void { /* TODO document why this method 'removeShape' is empty */ }

    removeAllShapes(): void { /* TODO document why this method 'removeAllShapes' is empty */ }

    getShapeMap(): Map<string, any> {
        return new Map();
    }
}

class SelectionRenderService {
    private readonly _selectionMoveEnd$ = new BehaviorSubject<ISelectionWithCoordAndStyle[]>([]);
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();
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
            [ISelectionRenderService, { useClass: SelectionRenderService }],
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
                const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                if (!workbook) throw new Error('This is an error');
                await commandService.executeCommand(SetSelectionsOperation.id, {
                    unitId: 'workbook-01',
                    subUnitId: 'sheet-0011',
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

                get(IUniverInstanceService).focusUnit('workbook-01');
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

                await commandService.executeCommand(SetSelectionsOperation.id, {
                    unitId: 'workbook-01',
                    subUnitId: 'sheet-0011',
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
                    startRow: 10,
                    endRow: 13,
                    startColumn: 12,
                    endColumn: 13,
                });
                const mergeData = workbook.getSheetBySheetId('sheet-0011')?.getMergeData();
                expect(mergeData?.length).toBe(5);
                expect(mergeData?.[3].startRow).toBe(11);
                expect(mergeData?.[4].startRow).toBe(13);
            });
        });
    });
});
