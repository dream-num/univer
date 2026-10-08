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

import type { IRange, IWorkbookData } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import type { ISheetClipboardHook } from '@univerjs/sheets-ui';
import {
    BooleanNumber,
    DrawingTypeEnum,
    ImageSourceType,
    LocaleType,
    ObjectMatrix,
    UniverInstanceType,
} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import { ISheetDrawingService, RemoveSheetDrawingCommand, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import {
    COPY_TYPE,
    IMarkSelectionService,
    ISheetClipboardService,
    MarkSelectionService,
    PREDEFINED_HOOK_NAME_PASTE,
    SheetClipboardService,
} from '@univerjs/sheets-ui';
import {
    DesktopNotificationService,
    IClipboardInterfaceService,
    INotificationService,
    IPlatformService,
    IUIPartsService,
    PlatformService,
    UIPartsService,
} from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { InsertFloatImageCommand } from '../../commands/commands/insert-image.command';
import { SheetsDrawingCopyPasteController } from '../sheet-drawing-copy-paste.controller';

function createImageDrawing(overrides: Partial<ISheetImage> = {}): ISheetImage {
    return {
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        drawingId: 'image-1',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.BASE64,
        source: 'data:image/png;base64,AA==',
        anchorType: SheetDrawingAnchorType.Both,
        transform: { left: 5, top: 5, width: 10, height: 20 },
        sheetTransform: {
            from: { row: 0, column: 0, rowOffset: 5, columnOffset: 5 },
            to: { row: 1, column: 1, rowOffset: 5, columnOffset: 5 },
        },
        axisAlignSheetTransform: {
            from: { row: 0, column: 0, rowOffset: 5, columnOffset: 5 },
            to: { row: 1, column: 1, rowOffset: 5, columnOffset: 5 },
        },
        ...overrides,
    };
}

type IImageDrawing = ReturnType<typeof createImageDrawing>;

interface IPrivateControllerAccess {
    _copyInfo: {
        unitId: string;
        subUnitId: string;
        copyRange?: IRange;
        drawings: IImageDrawing[];
    } | null;
}

interface ITestClipboardHook extends ISheetClipboardHook {
    onBeforeCopy: NonNullable<ISheetClipboardHook['onBeforeCopy']>;
    onBeforeCopyFocusedObject?: (unitId: string, subUnitId: string, copyType: COPY_TYPE) => boolean;
    onPasteCells: NonNullable<ISheetClipboardHook['onPasteCells']>;
    onPasteFiles: NonNullable<ISheetClipboardHook['onPasteFiles']>;
    onPasteUnrecognized: NonNullable<ISheetClipboardHook['onPasteUnrecognized']>;
}

const testBeds: ReturnType<typeof createSheetsDrawingUiTestBed>[] = [];

function createWorkbookData(unitId: string, subUnitId: string): IWorkbookData {
    return {
        id: unitId,
        name: 'Book',
        appVersion: '1.0.0',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: [subUnitId],
        sheets: {
            [subUnitId]: {
                id: subUnitId,
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                defaultRowHeight: 20,
                defaultColumnWidth: 10,
                rowHeader: { width: 0, hidden: BooleanNumber.TRUE },
                columnHeader: { height: 0, hidden: BooleanNumber.TRUE },
                cellData: {},
            },
        },
    };
}

function createController(options?: { focusedDrawings?: IImageDrawing[]; drawingData?: Record<string, object> }) {
    const clipboardInterfaceService = { writeText: vi.fn() };
    const bed = createSheetsDrawingUiTestBed(createWorkbookData('unit-1', 'sheet-1'), [
        [ISheetClipboardService, { useClass: SheetClipboardService }],
        [IMarkSelectionService, { useClass: MarkSelectionService }],
        [IClipboardInterfaceService, { useValue: clipboardInterfaceService }],
        [INotificationService, { useClass: DesktopNotificationService }],
        [IPlatformService, { useClass: PlatformService }],
        [IUIPartsService, { useClass: UIPartsService }],
        [SheetsDrawingCopyPasteController],
    ]);
    testBeds.push(bed);
    bed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, createWorkbookData('unit-2', 'sheet-2'));
    const skeletonService = bed.get(SheetSkeletonService);
    skeletonService.ensureSkeleton('unit-1', 'sheet-1');
    skeletonService.ensureSkeleton('unit-2', 'sheet-2');
    const drawingManager = bed.get(IDrawingManagerService);
    const data: Record<string, object> = { ...options?.drawingData };
    for (const drawing of options?.focusedDrawings ?? []) {
        data[drawing.drawingId] = drawing;
    }
    const drawingData = { 'sheet-1': { data, order: Object.keys(data) } };
    bed.get(ISheetDrawingService).registerDrawingData('unit-1', drawingData as never);
    drawingManager.registerDrawingData('unit-1', drawingData as never);
    drawingManager.focusDrawing(options?.focusedDrawings ?? []);
    const drawingService = {
        getBatchAddOp: vi.spyOn(drawingManager, 'getBatchAddOp'),
    };
    const commandService = { executeCommand: vi.spyOn(bed.commandService, 'executeCommand') };
    const sheetClipboardService = bed.get(ISheetClipboardService);
    const addClipboardHook = vi.spyOn(sheetClipboardService, 'addClipboardHook');
    const controller = bed.get(SheetsDrawingCopyPasteController);
    const hookDisposable = addClipboardHook.mock.results[0].value;
    vi.spyOn(hookDisposable, 'dispose');

    return {
        controller,
        hook: sheetClipboardService.getClipboardHooks()[0] as ITestClipboardHook,
        drawingService,
        commandService,
        clipboardInterfaceService,
        hookDisposable,
    };
}

describe('SheetsDrawingCopyPasteController', () => {
    afterEach(() => {
        testBeds.splice(0).forEach((bed) => bed.univer.dispose());
        vi.restoreAllMocks();
    });
    it('cancels all pending clipboard writes when disposed', () => {
        vi.useFakeTimers();
        const { controller, hook, clipboardInterfaceService } = createController({
            focusedDrawings: [createImageDrawing({ imageSourceType: ImageSourceType.URL })],
        });
        const activeElement = document.activeElement;
        const childCount = document.body.childElementCount;

        try {
            expect(hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toBe(true);
            expect(hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.CUT)).toBe(true);
            controller.dispose();
            vi.runAllTimers();

            expect(clipboardInterfaceService.writeText).not.toHaveBeenCalled();
            expect(document.activeElement).toBe(activeElement);
            expect(document.body.childElementCount).toBe(childCount);
        } finally {
            controller.dispose();
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    });

    it('releases the clipboard hook exactly once when disposed', () => {
        const { controller, hookDisposable } = createController();

        controller.dispose();
        controller.dispose();

        expect(hookDisposable.dispose).toHaveBeenCalledTimes(1);
    });

    it('rewrites the clipboard while active and restores document focus', () => {
        vi.useFakeTimers();
        const { controller, hook, clipboardInterfaceService } = createController({
            focusedDrawings: [createImageDrawing({ imageSourceType: ImageSourceType.URL })],
        });
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();
        const childCount = document.body.childElementCount;

        try {
            hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY);
            expect(clipboardInterfaceService.writeText).not.toHaveBeenCalled();
            vi.advanceTimersByTime(200);

            expect(clipboardInterfaceService.writeText).toHaveBeenCalledExactlyOnceWith('');
            expect(document.activeElement).toBe(input);
            expect(document.body.childElementCount).toBe(childCount);

            controller.dispose();
            vi.runAllTimers();
            expect(clipboardInterfaceService.writeText).toHaveBeenCalledTimes(1);
        } finally {
            controller.dispose();
            input.remove();
            vi.clearAllTimers();
            vi.useRealTimers();
        }
    });

    it('does not copy explicitly absolute images with a cell range', () => {
        const defaultDrawing = createImageDrawing({
            drawingId: 'absolute-anchor',
            anchorType: SheetDrawingAnchorType.None,
        });
        const { controller, hook, drawingService } = createController({
            drawingData: {
                [defaultDrawing.drawingId]: defaultDrawing,
            },
        });

        hook.onBeforeCopy('unit-1', 'sheet-1', {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        }, COPY_TYPE.COPY);
        hook.onPasteCells(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0, 1], cols: [0, 1] },
            },
            {
                unitId: 'unit-2',
                subUnitId: 'sheet-2',
                range: { rows: [2, 3], cols: [3, 4] },
            },
            new ObjectMatrix(),
            { copyId: 'range-copy', copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(drawingService.getBatchAddOp).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('copies legacy drawings contained in a cell range and pastes them with the range offset', () => {
        const containedDrawing = createImageDrawing({ anchorType: undefined });
        const outsideDrawing = createImageDrawing({
            drawingId: 'outside-image',
            transform: { left: 80, top: 80, width: 10, height: 20 },
        });
        const positionOnlyDrawing = createImageDrawing({
            drawingId: 'position-only',
            anchorType: SheetDrawingAnchorType.Position,
            transform: { left: 50, top: 50, width: 10, height: 20 },
        });
        const unanchoredDrawing = createImageDrawing({
            drawingId: 'unanchored',
            anchorType: SheetDrawingAnchorType.None,
        });
        const { controller, hook, drawingService } = createController({
            focusedDrawings: [outsideDrawing],
            drawingData: {
                [containedDrawing.drawingId]: containedDrawing,
                [outsideDrawing.drawingId]: outsideDrawing,
                [positionOnlyDrawing.drawingId]: positionOnlyDrawing,
                [unanchoredDrawing.drawingId]: unanchoredDrawing,
                chart: { drawingId: 'chart', drawingType: DrawingTypeEnum.DRAWING_CHART },
            },
        });

        hook.onBeforeCopy('unit-1', 'sheet-1', {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        }, COPY_TYPE.COPY);
        const mutations = hook.onPasteCells(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0, 1], cols: [0, 1] },
            },
            {
                unitId: 'unit-2',
                subUnitId: 'sheet-2',
                range: { rows: [2, 3], cols: [3, 4] },
            },
            new ObjectMatrix(),
            { copyId: 'range-copy', copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(drawingService.getBatchAddOp).toHaveBeenCalledTimes(1);
        const pastedDrawing = drawingService.getBatchAddOp.mock.calls[0][0][0];
        expect(pastedDrawing).toMatchObject({
            unitId: 'unit-2',
            subUnitId: 'sheet-2',
            transform: { left: 35, top: 45, width: 10, height: 20 },
            sheetTransform: {
                from: { row: 2, column: 3, rowOffset: 5, columnOffset: 5 },
                to: { row: 3, column: 4, rowOffset: 5, columnOffset: 5 },
            },
        });
        expect(pastedDrawing.drawingId).not.toBe(containedDrawing.drawingId);
        const addOperation = drawingService.getBatchAddOp.mock.results[0].value as IDrawingJsonUndo1;
        expect(mutations.redos).toEqual([
            expect.objectContaining({ params: expect.objectContaining({ op: addOperation.redo, objects: addOperation.objects }) }),
        ]);

        controller.dispose();
    });

    it('cuts a focused image drawing and pastes it as a new drawing at the target range', () => {
        const focusedDrawing = createImageDrawing({ drawingId: 'focused-image' });
        const { controller, hook, drawingService, commandService } = createController({
            focusedDrawings: [focusedDrawing],
        });

        expect(hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.CUT)).toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(RemoveSheetDrawingCommand.id, {
            unitId: 'unit-1',
            drawings: [focusedDrawing],
        });

        const mutations = hook.onPasteCells(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [3], cols: [4] },
            },
            new ObjectMatrix(),
            { copyId: 'image-cut', copyType: COPY_TYPE.CUT, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(drawingService.getBatchAddOp).toHaveBeenCalledTimes(1);
        const pastedDrawing = drawingService.getBatchAddOp.mock.calls[0][0][0];
        expect(pastedDrawing).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            transform: { left: 40, top: 60, width: 10, height: 20 },
        });
        expect(pastedDrawing.drawingId).not.toBe(focusedDrawing.drawingId);
        const addOperation = drawingService.getBatchAddOp.mock.results[0].value as IDrawingJsonUndo1;
        expect(mutations.redos).toEqual([
            expect.objectContaining({ params: expect.objectContaining({ op: addOperation.redo, objects: addOperation.objects }) }),
        ]);

        controller.dispose();
    });

    it('copies all focused image drawings', () => {
        const firstDrawing = createImageDrawing({ drawingId: 'first-image' });
        const secondDrawing = createImageDrawing({
            drawingId: 'second-image',
            transform: { left: 30, top: 40, width: 10, height: 20 },
        });
        const { controller, hook, drawingService } = createController({
            focusedDrawings: [firstDrawing, secondDrawing],
        });

        expect(hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toBe(true);

        const mutations = hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [3], cols: [4] },
            },
            [new File(['clipboard'], 'clipboard-image.png', { type: 'image/png' })],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(drawingService.getBatchAddOp).toHaveBeenCalledTimes(2);
        expect(drawingService.getBatchAddOp.mock.calls.map(([drawings]) => drawings[0].transform)).toEqual([
            expect.objectContaining({ left: 40, top: 60 }),
            expect.objectContaining({ left: 65, top: 95 }),
        ]);
        expect(mutations.redos).toHaveLength(2);

        controller.dispose();
    });

    it('pastes external image files instead of the previous copied drawing', () => {
        const focusedDrawing = createImageDrawing({ drawingId: 'focused-image' });
        const { controller, hook } = createController({
            focusedDrawings: [focusedDrawing],
        });
        const internalImage = new File(['internal'], 'clipboard-image.png', { type: 'image/png' });
        const externalImage = new File(['external'], 'external.png', { type: 'image/png' });

        (controller as unknown as IPrivateControllerAccess)._copyInfo = {
            unitId: focusedDrawing.unitId,
            subUnitId: focusedDrawing.subUnitId,
            drawings: [focusedDrawing],
        };

        hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            [internalImage],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        const mutations = hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            [externalImage],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(mutations).toEqual({
            undos: [],
            redos: [{
                id: InsertFloatImageCommand.id,
                params: { files: [externalImage] },
            }],
        });

        controller.dispose();
    });

    it('clears a copied image after pasting external cell content', () => {
        const focusedDrawing = createImageDrawing({ drawingId: 'focused-image' });
        const { controller, hook } = createController({
            focusedDrawings: [focusedDrawing],
        });

        (controller as unknown as IPrivateControllerAccess)._copyInfo = {
            unitId: focusedDrawing.unitId,
            subUnitId: focusedDrawing.subUnitId,
            drawings: [focusedDrawing],
        };

        const mutations = hook.onPasteCells(
            null,
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            new ObjectMatrix(),
            { copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(mutations).toEqual({ undos: [], redos: [] });

        const externalImage = new File(['external'], 'external.png', { type: 'image/png' });
        expect(hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            [externalImage],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        ).redos).toEqual([{
            id: InsertFloatImageCommand.id,
            params: { files: [externalImage] },
        }]);

        expect(hook.onPasteUnrecognized({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { rows: [0], cols: [0] },
        })).toEqual({ undos: [], redos: [] });

        controller.dispose();
    });

    it('clears a copied image after an unrecognized internal paste', () => {
        const focusedDrawing = createImageDrawing({ drawingId: 'focused-image' });
        const { controller, hook } = createController({
            focusedDrawings: [focusedDrawing],
        });
        const externalImage = new File(['external'], 'external.png', { type: 'image/png' });

        (controller as unknown as IPrivateControllerAccess)._copyInfo = {
            unitId: focusedDrawing.unitId,
            subUnitId: focusedDrawing.subUnitId,
            drawings: [focusedDrawing],
        };

        hook.onPasteUnrecognized({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { rows: [0], cols: [0] },
        });

        const mutations = hook.onPasteFiles(
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                range: { rows: [0], cols: [0] },
            },
            [externalImage],
            { pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );

        expect(mutations.redos).toEqual([{
            id: InsertFloatImageCommand.id,
            params: { files: [externalImage] },
        }]);

        controller.dispose();
    });
});
