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

import type { Dependency, ICommandService } from '@univerjs/core';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum } from '@univerjs/core';
import { IDrawingManagerService, ImageSourceType } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { COPY_TYPE, ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '@univerjs/sheets-ui';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { InsertFloatImageCommand } from '../../commands/commands/insert-image.command';
import { SheetsDrawingCopyPasteController } from '../sheet-drawing-copy-paste.controller';

function createDrawing(drawingId: string, overrides?: Partial<ISheetDrawing>): ISheetDrawing {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        anchorType: SheetDrawingAnchorType.Both,
        imageSourceType: ImageSourceType.BASE64,
        source: 'data:image/png;base64,Zm9v',
        transform: {
            left: 10,
            top: 10,
            width: 20,
            height: 20,
            angle: 0,
        },
        sheetTransform: {
            from: {
                row: 1,
                rowOffset: 0,
                column: 1,
                columnOffset: 0,
            },
            to: {
                row: 2,
                rowOffset: 0,
                column: 2,
                columnOffset: 0,
            },
        },
        axisAlignSheetTransform: {
            from: {
                row: 1,
                rowOffset: 0,
                column: 1,
                columnOffset: 0,
            },
            to: {
                row: 2,
                rowOffset: 0,
                column: 2,
                columnOffset: 0,
            },
        },
        ...overrides,
    } as unknown as ISheetDrawing;
}

function setupController() {
    let clipboardHook: any;
    const clipboardInterfaceService = {
        writeText: vi.fn(),
    };
    const sheetClipboardService = {
        addClipboardHook: vi.fn((hook) => {
            clipboardHook = hook;
            return {
                dispose: vi.fn(),
            };
        }),
    };
    const sheetSkeletonService = {
        getSkeleton: () => ({
            getNoMergeCellWithCoordByIndex: (row: number, col: number) => ({
                startX: col * 10,
                endX: col * 10 + 10,
                startY: row * 10,
                endY: row * 10 + 10,
            }),
            getOffsetRelativeToRowCol: (left: number, top: number) => ({
                row: Math.floor(top / 10),
                rowOffset: top % 10,
                column: Math.floor(left / 10),
                columnOffset: left % 10,
            }),
        }),
    };

    const testBed = createSheetsDrawingUiTestBed(undefined, [
        [ISheetClipboardService, { useValue: sheetClipboardService as unknown as ISheetClipboardService }],
        [IClipboardInterfaceService, { useValue: clipboardInterfaceService as unknown as IClipboardInterfaceService }],
        [SheetSkeletonService, { useValue: sheetSkeletonService as unknown as SheetSkeletonService }],
    ] as Dependency[]);

    const drawingManagerService = testBed.get(IDrawingManagerService);
    const sheetDrawingService = testBed.get(ISheetDrawingService);
    drawingManagerService.registerDrawingData('test', {
        sheet1: {
            data: {},
            order: [],
        },
    });
    sheetDrawingService.registerDrawingData('test', {
        sheet1: {
            data: {},
            order: [],
        },
    });

    const controller = testBed.injector.createInstance(SheetsDrawingCopyPasteController);

    return {
        ...testBed,
        controller,
        clipboardHook: () => clipboardHook,
        clipboardInterfaceService,
        drawingManagerService,
        sheetDrawingService,
    };
}

async function applyMutations(commandService: ICommandService, mutations: Array<{ id: string; params: unknown }>) {
    for (const mutation of mutations) {
        await commandService.executeCommand(mutation.id, mutation.params as never);
    }
}

describe('SheetsDrawingCopyPasteController', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('HTMLElement', class HTMLElement {});
        vi.stubGlobal('ClipboardItem', class ClipboardItem {
            constructor(_items: Record<string, Blob>) {}
        });
        vi.stubGlobal('navigator', {
            clipboard: {
                write: vi.fn().mockResolvedValue(undefined),
            },
        });
        vi.stubGlobal('document', {
            activeElement: null,
            createElement: () => ({
                style: {},
                focus: vi.fn(),
                blur: vi.fn(),
            }),
            body: {
                appendChild: vi.fn(),
                removeChild: vi.fn(),
            },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('copies a focused image and pastes a new drawing into the target cell via redo mutations', async () => {
        const testBed = setupController();
        const drawing = createDrawing('drawing-1');

        testBed.drawingManagerService.setDrawingData('test', 'sheet1', {
            'drawing-1': drawing,
        });
        testBed.drawingManagerService.setDrawingOrder('test', 'sheet1', ['drawing-1']);
        testBed.sheetDrawingService.setDrawingData('test', 'sheet1', {
            'drawing-1': drawing,
        });
        testBed.sheetDrawingService.setDrawingOrder('test', 'sheet1', ['drawing-1']);
        testBed.drawingManagerService.focusDrawing([{ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' }]);

        const hook = testBed.clipboardHook();

        hook.onBeforeCopy('test', 'sheet1', {
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 1,
        }, COPY_TYPE.COPY);
        vi.runAllTimers();

        const result = hook.onPasteUnrecognized({
            unitId: 'test',
            subUnitId: 'sheet1',
            range: {
                rows: [4],
                cols: [5],
            },
        });

        expect(result.redos).toHaveLength(1);
        expect(result.redos[0]).toEqual(expect.objectContaining({
            id: SetDrawingApplyMutation.id,
            params: expect.objectContaining({
                type: DrawingApplyType.INSERT,
            }),
        }));

        await applyMutations(testBed.commandService, result.redos);

        const drawings = Object.values(testBed.sheetDrawingService.getDrawingData('test', 'sheet1')) as ISheetDrawing[];
        expect(drawings).toHaveLength(2);
        expect(drawings).toEqual(expect.arrayContaining([
            expect.objectContaining({
                drawingId: 'drawing-1',
                transform: expect.objectContaining({
                    left: 10,
                    top: 10,
                }),
            }),
            expect.objectContaining({
                transform: expect.objectContaining({
                    left: 50,
                    top: 40,
                }),
            }),
        ]));
        expect((navigator as any).clipboard.write).toHaveBeenCalled();
    });

    it('copies drawings inside a selected range and offsets them when pasting to another range', async () => {
        const testBed = setupController();
        const contained = createDrawing('drawing-1', {
            transform: {
                left: 10,
                top: 10,
                width: 10,
                height: 10,
                angle: 0,
            },
            sheetTransform: {
                from: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
                to: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
            },
            axisAlignSheetTransform: {
                from: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
                to: { row: 1, rowOffset: 0, column: 1, columnOffset: 0 },
            },
        });
        const outside = createDrawing('drawing-2', {
            transform: {
                left: 120,
                top: 120,
                width: 10,
                height: 10,
                angle: 0,
            },
        });

        testBed.drawingManagerService.setDrawingData('test', 'sheet1', {
            'drawing-1': contained,
            'drawing-2': outside,
        });
        testBed.drawingManagerService.setDrawingOrder('test', 'sheet1', ['drawing-1', 'drawing-2']);
        testBed.sheetDrawingService.setDrawingData('test', 'sheet1', {
            'drawing-1': contained,
            'drawing-2': outside,
        });
        testBed.sheetDrawingService.setDrawingOrder('test', 'sheet1', ['drawing-1', 'drawing-2']);
        testBed.drawingManagerService.focusDrawing(null);

        const hook = testBed.clipboardHook();

        hook.onBeforeCopy('test', 'sheet1', {
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 1,
        }, COPY_TYPE.COPY);

        const result = hook.onPasteCells(
            {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    rows: [1],
                    cols: [1],
                },
            },
            {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    rows: [3],
                    cols: [4],
                },
            },
            null,
            {
                copyType: COPY_TYPE.COPY,
                pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
            }
        );

        expect(result.redos).toHaveLength(1);
        await applyMutations(testBed.commandService, result.redos);

        const drawings = Object.values(testBed.sheetDrawingService.getDrawingData('test', 'sheet1')) as ISheetDrawing[];
        expect(drawings).toHaveLength(3);
        expect(drawings).toEqual(expect.arrayContaining([
            expect.objectContaining({
                drawingId: 'drawing-1',
                transform: expect.objectContaining({
                    left: 10,
                    top: 10,
                }),
            }),
            expect.objectContaining({
                drawingId: 'drawing-2',
            }),
            expect.objectContaining({
                drawingId: expect.not.stringMatching(/^drawing-1$/),
                transform: expect.objectContaining({
                    left: 40,
                    top: 30,
                }),
            }),
        ]));
    });

    it('skips special paste paths and delegates external image paste to InsertFloatImageCommand', () => {
        const testBed = setupController();
        const hook = testBed.clipboardHook();

        const specialPaste = hook.onPasteCells(
            null,
            {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    rows: [2],
                    cols: [2],
                },
            },
            null,
            {
                copyType: COPY_TYPE.COPY,
                pasteType: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
            }
        );

        const externalPaste = hook.onPasteFiles(
            {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    rows: [0],
                    cols: [0],
                },
            },
            [
                new File(['image'], 'image.png', { type: 'image/png' }),
                new File(['text'], 'note.txt', { type: 'text/plain' }),
            ]
        );

        expect(specialPaste).toEqual({ redos: [], undos: [] });
        expect(externalPaste).toEqual({
            undos: [],
            redos: [{
                id: InsertFloatImageCommand.id,
                params: {
                    files: [expect.objectContaining({ name: 'image.png' })],
                },
            }],
        });
    });
});
