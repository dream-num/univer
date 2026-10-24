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
import type { ISheetDrawing, ISheetImage } from '@univerjs/sheets-drawing';
import type { ISheetClipboardHook } from '@univerjs/sheets-ui';
import {
    BooleanNumber,
    DrawingTypeEnum,
    ImageSourceType,
    LocaleType,
    ObjectMatrix,
    SheetTypes,
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
import { createAbsoluteChart } from '../../__tests__/chart-drawing-test-bed';
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

function createWorkbookData(unitId: string, subUnitId: string, sheetType = SheetTypes.GRID): IWorkbookData {
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
                type: sheetType,
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

function createController(options?: { focusedDrawings?: ISheetDrawing[]; drawingData?: Record<string, object>; sheetType?: SheetTypes; targetSheetType?: SheetTypes }) {
    const clipboardInterfaceService: IClipboardInterfaceService = {
        supportClipboard: false,
        write: vi.fn(async () => {}),
        writeText: vi.fn(async () => {}),
        read: vi.fn(async () => []),
        readText: vi.fn(async () => ''),
    };
    const bed = createSheetsDrawingUiTestBed(createWorkbookData('unit-1', 'sheet-1', options?.sheetType), [
        [ISheetClipboardService, { useClass: SheetClipboardService }],
        [IMarkSelectionService, { useClass: MarkSelectionService }],
        [IClipboardInterfaceService, { useValue: clipboardInterfaceService }],
        [INotificationService, { useClass: DesktopNotificationService }],
        [IPlatformService, { useClass: PlatformService }],
        [IUIPartsService, { useClass: UIPartsService }],
        [SheetsDrawingCopyPasteController],
    ]);
    testBeds.push(bed);
    bed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, createWorkbookData('unit-2', 'sheet-2', options?.targetSheetType));
    const skeletonService = bed.get(SheetSkeletonService);
    if (options?.sheetType !== SheetTypes.CHART) {
        skeletonService.ensureSkeleton('unit-1', 'sheet-1');
    }
    if (options?.targetSheetType !== SheetTypes.CHART) {
        skeletonService.ensureSkeleton('unit-2', 'sheet-2');
    }
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
        bed,
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

    it.each([
        SheetDrawingAnchorType.Both,
        SheetDrawingAnchorType.Position,
        undefined,
    ])('copies contained images with range offsets (%s)', (anchorType) => {
        const containedDrawing = createImageDrawing({ anchorType });
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

describe('SheetsDrawingCopyPasteController Chart-parent COPY consumers', () => {
    afterEach(() => {
        testBeds.splice(0).forEach((bed) => bed.univer.dispose());
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    function createSubtree() {
        const root = { ...createAbsoluteChart('root', 'sheet-1'), unitId: 'unit-1' };
        const nested = { ...root, drawingId: 'nested', chartParent: { drawingId: 'root', resizeWithParent: true }, transform: { ...root.transform, left: 180, top: 140 } };
        const shape = { ...root, drawingId: 'shape', drawingType: DrawingTypeEnum.DRAWING_SHAPE, chartParent: { drawingId: 'nested', resizeWithParent: false } };
        const image = createImageDrawing({
            drawingId: 'image',
            anchorType: SheetDrawingAnchorType.None,
            chartParent: { drawingId: 'nested', resizeWithParent: true },
        });
        return { root, nested, shape, image };
    }

    function planPaste(hook: ITestClipboardHook) {
        return hook.onPasteCells(
            { unitId: 'unit-1', subUnitId: 'sheet-1', range: { rows: [0], cols: [0] } },
            { unitId: 'unit-2', subUnitId: 'sheet-2', range: { rows: [3], cols: [4] } },
            new ObjectMatrix(),
            { copyId: 'chart-parent-copy', copyType: COPY_TYPE.COPY, pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE }
        );
    }

    it('copies the complete Chart/Shape/Image graph with fresh remapped identities and symmetric Drawing replay', () => {
        const originals = createSubtree();
        const runtime = createController({ focusedDrawings: [originals.root], drawingData: originals });
        const source = JSON.parse(JSON.stringify(runtime.bed.get(ISheetDrawingService).getDrawingData('unit-1', 'sheet-1')));
        const copiedGraphs: ISheetDrawing[][] = [];
        let expectedOrder: string[] = [];
        runtime.controller.registerFeatureCopyHook(DrawingTypeEnum.DRAWING_CHART, ({ copies, idMap }) => {
            expectedOrder = runtime.bed.get(ISheetDrawingService).getDrawingOrder('unit-1', 'sheet-1').map((id) => idMap.get(id)!);
            copiedGraphs.push(copies);
            return { redos: [], undos: [] };
        });
        runtime.controller.registerFeatureCopyHook(DrawingTypeEnum.DRAWING_SHAPE, () => ({ redos: [], undos: [] }));
        expect(runtime.hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toBe(true);
        expect(runtime.commandService.executeCommand).not.toHaveBeenCalled();

        const plan = planPaste(runtime.hook)!;
        expect(copiedGraphs[0]).toHaveLength(4);
        const copied = copiedGraphs[0];
        expect(copied.every((drawing) => !Object.values(originals).some((original) => original.drawingId === drawing.drawingId))).toBe(true);
        expect(copied.every((drawing) => drawing.unitId === 'unit-2' && drawing.subUnitId === 'sheet-2')).toBe(true);
        const root = copied.find((drawing) => !drawing.chartParent)!;
        const nested = copied.find((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_CHART && drawing.chartParent)!;
        expect(nested.chartParent).toEqual({ drawingId: root.drawingId, resizeWithParent: true });
        expect(copied.filter((drawing) => drawing.drawingType !== DrawingTypeEnum.DRAWING_CHART)
            .every((drawing) => drawing.chartParent?.drawingId === nested.drawingId)).toBe(true);
        expect(nested.transform!.left! - root.transform!.left!).toBe(originals.nested.transform.left! - originals.root.transform!.left!);
        expect(copied.every((drawing) => drawing.anchorType === SheetDrawingAnchorType.None)).toBe(true);
        for (const mutation of plan.redos) {
            expect(runtime.bed.commandService.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
        }
        expect(runtime.bed.get(ISheetDrawingService).getDrawingOrder('unit-2', 'sheet-2')).toEqual(expectedOrder);
        expect(runtime.bed.get(ISheetDrawingService).getDrawingData('unit-2', 'sheet-2')).toEqual(Object.fromEntries(copied.map((drawing) => [drawing.drawingId, drawing])));
        for (const mutation of plan.undos) {
            expect(runtime.bed.commandService.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
        }
        expect(runtime.bed.get(ISheetDrawingService).getDrawingData('unit-2', 'sheet-2')).toEqual({});
        for (const mutation of plan.redos) {
            expect(runtime.bed.commandService.syncExecuteCommand(mutation.id, mutation.params)).toBe(true);
        }
        expect(runtime.bed.get(ISheetDrawingService).getDrawingOrder('unit-2', 'sheet-2')).toEqual(expectedOrder);
        expect(runtime.bed.get(ISheetDrawingService).getDrawingData('unit-1', 'sheet-1')).toEqual(source);
        planPaste(runtime.hook);
        expect(copiedGraphs[1].every((drawing) => !copied.some((old) => old.drawingId === drawing.drawingId))).toBe(true);
    });

    it.each(['missing Shape owner', 'disposed Chart owner'] as const)('rejects %s before target batch preparation', (condition) => {
        const originals = createSubtree();
        const runtime = createController({ focusedDrawings: [originals.root], drawingData: originals });
        const registration = runtime.controller.registerFeatureCopyHook(DrawingTypeEnum.DRAWING_CHART, () => ({ redos: [], undos: [] }));
        if (condition === 'disposed Chart owner') {
            runtime.controller.registerFeatureCopyHook(DrawingTypeEnum.DRAWING_SHAPE, () => ({ redos: [], undos: [] }));
        }
        expect(runtime.hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toBe(true);
        if (condition === 'disposed Chart owner') {
            registration.dispose();
        }
        const prepare = vi.spyOn(runtime.bed.get(ISheetDrawingService), 'getBatchAddOp');
        expect(() => planPaste(runtime.hook)).toThrow();
        expect(prepare).not.toHaveBeenCalled();
        expect(runtime.bed.get(ISheetDrawingService).getDrawingData('unit-2', 'sheet-2')).toEqual({});
    });

    it.each(['Shape', 'Image'] as const)('rejects Chart-parent graph plus %s focus before any clipboard or model writes', (otherType) => {
        const originals = createSubtree();
        const other = otherType === 'Shape' ? originals.shape : originals.image;
        const runtime = createController({ focusedDrawings: [originals.root, other], drawingData: originals });
        runtime.controller.registerFeatureCopyHook(DrawingTypeEnum.DRAWING_CHART, () => ({ redos: [], undos: [] }));
        expect(() => runtime.hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toThrow();
        expect(runtime.commandService.executeCommand).not.toHaveBeenCalled();
        expect(runtime.clipboardInterfaceService.writeText).not.toHaveBeenCalled();
        expect(runtime.bed.get(ISheetDrawingService).getDrawingData('unit-2', 'sheet-2')).toEqual({});
    });

    it.each(['Shape', 'Image'] as const)('retains the GRID standalone Chart plus %s per-owner Copy path', (otherType) => {
        vi.useFakeTimers();
        const originals = createSubtree();
        const other = { ...(otherType === 'Shape' ? originals.shape : originals.image), chartParent: undefined };
        const runtime = createController({ focusedDrawings: [originals.root, other], drawingData: { root: originals.root, [other.drawingId]: other } });
        runtime.controller.registerFeatureCopyHook(DrawingTypeEnum.DRAWING_CHART, () => ({ redos: [], undos: [] }));
        expect(runtime.hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toBe(otherType === 'Image');
        expect(runtime.commandService.executeCommand).not.toHaveBeenCalled();
    });

    it('rejects standalone multiple focus on a CHART source before clipboard writes', () => {
        const originals = createSubtree();
        const shape = { ...originals.shape, chartParent: undefined };
        const runtime = createController({ focusedDrawings: [originals.root, shape], drawingData: { root: originals.root, shape }, sheetType: SheetTypes.CHART });
        runtime.controller.registerFeatureCopyHook(DrawingTypeEnum.DRAWING_CHART, () => ({ redos: [], undos: [] }));
        expect(() => runtime.hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toThrow();
        expect(runtime.clipboardInterfaceService.writeText).not.toHaveBeenCalled();
        expect(runtime.commandService.executeCommand).not.toHaveBeenCalled();
    });

    it('rejects GRID standalone mixed Copy pasted into CHART before preparing any Drawing batch', () => {
        vi.useFakeTimers();
        const originals = createSubtree();
        const image = { ...originals.image, chartParent: undefined };
        const runtime = createController({ focusedDrawings: [originals.root, image], drawingData: { root: originals.root, image }, targetSheetType: SheetTypes.CHART });
        expect(runtime.hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toBe(true);
        const prepare = vi.spyOn(runtime.bed.get(ISheetDrawingService), 'getBatchAddOp');
        expect(() => planPaste(runtime.hook)).toThrow();
        expect(prepare).not.toHaveBeenCalled();
        expect(runtime.bed.get(ISheetDrawingService).getDrawingData('unit-2', 'sheet-2')).toEqual({});
    });

    it('rejects a parent cycle before claiming Copy and preserves the source', () => {
        const originals = createSubtree();
        const root = { ...originals.root, chartParent: { drawingId: 'nested', resizeWithParent: true } };
        const runtime = createController({ focusedDrawings: [root], drawingData: { ...originals, root } });
        runtime.controller.registerFeatureCopyHook(DrawingTypeEnum.DRAWING_CHART, () => ({ redos: [], undos: [] }));
        expect(() => runtime.hook.onBeforeCopyFocusedObject?.('unit-1', 'sheet-1', COPY_TYPE.COPY)).toThrow();
        expect(runtime.commandService.executeCommand).not.toHaveBeenCalled();
        expect(runtime.bed.get(ISheetDrawingService).getDrawingData('unit-1', 'sheet-1').root).toEqual(root);
    });
});
