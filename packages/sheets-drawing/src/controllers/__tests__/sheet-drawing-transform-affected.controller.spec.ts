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

import type { ICommandInfo, IWorkbookData, Workbook } from '@univerjs/core';
import {
    DesktopLogService,
    Direction,
    DrawingTypeEnum,
    ImageSourceType,
    IResourceLoaderService,
    IUniverInstanceService,
    RANGE_TYPE,
    RedoCommandId,
    Tools,
    UndoCommandId,
    UniverInstanceType,
} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    DeltaColumnWidthCommand,
    DeltaRowHeightCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColByRangeCommand,
    RemoveColCommand,
    RemoveRowByRangeCommand,
    RemoveRowCommand,
    SetColHiddenCommand,
    SetColWidthCommand,
    SetRangeValuesMutation,
    SetRowHeightCommand,
    SetRowHiddenCommand,
    SetSpecificColsVisibleCommand,
    SetSpecificRowsVisibleCommand,
    SetWorksheetRowAutoHeightMutation,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ISheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { drawingPositionToTransform, transformToAxisAlignPosition, transformToDrawingPosition } from '../../basics/transform-position';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { SetSheetDrawingPlacementCommand } from '../../commands/commands/set-sheet-drawing-placement.command';
import { SetSheetDrawingCommand } from '../../commands/commands/set-sheet-drawing.command';
import { SetDrawingApplyMutation } from '../../commands/mutations/set-drawing-apply.mutation';
import {
    applySheetDrawingPlacement,
    getLegacySheetDrawingPosition,
    getSheetDrawingPlacement,
    normalizeSheetDrawingPlacement,
} from '../../services/sheet-drawing-placement';
import { SheetDrawingTransformPlanService } from '../../services/sheet-drawing-transform-plan.service';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';
import { SheetDrawingTransformAffectedController } from '../sheet-drawing-transform-affected.controller';
import { SHEET_DRAWING_PLUGIN } from '../sheet-drawing.controller';

describe('explicit deletion targets', () => {
    it.each([
        ['row', 'worksheet'],
        ['column', 'worksheet'],
        ['row', 'workbook'],
        ['column', 'workbook'],
    ] as const)('deletes a %s in an inactive %s without changing the active drawing owner', async (axis, context) => {
        const testBed = createSheetsDrawingTestBed();
        try {
            testBed.get(SheetDrawingTransformAffectedController);
            const { workbook, commandService } = testBed;
            const sheetTransform = {
                from: { row: 3, column: 3, rowOffset: 0, columnOffset: 0 },
                to: { row: 6, column: 6, rowOffset: 0, columnOffset: 0 },
            };
            const skeleton = testBed.get(SheetSkeletonService).getSkeletonParam('test', 'sheet1');
            const drawing: ISheetDrawing = {
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'inactive-target-drawing',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                imageSourceType: ImageSourceType.URL,
                source: 'https://example.com/drawing.png',
                anchorType: SheetDrawingAnchorType.Both,
                sheetTransform,
                axisAlignSheetTransform: sheetTransform,
                transform: drawingPositionToTransform(sheetTransform, skeleton)!,
            };
            expect(await commandService.executeCommand(InsertSheetDrawingCommand.id, {
                unitId: 'test',
                drawings: [drawing],
            })).toBe(true);
            const drawingService = testBed.get(ISheetDrawingService);
            const readDrawing = () => drawingService.getDrawingByParam({
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: drawing.drawingId,
            })!;
            const before = Tools.deepClone(readDrawing());
            let peer = workbook;
            if (context === 'worksheet') {
                workbook.setActiveSheet(workbook.getSheetBySheetId('sheet2')!);
            } else {
                peer = testBed.univer.createUnit<ReturnType<Workbook['getSnapshot']>, Workbook>(
                    UniverInstanceType.UNIVER_SHEET,
                    { ...Tools.deepClone(workbook.getSnapshot()), id: 'peer-workbook' }
                );
                testBed.get(IUniverInstanceService).focusUnit(peer.getUnitId());
            }
            const peerSheetBefore = Tools.deepClone(peer.getActiveSheet()!.getSnapshot());
            const range = axis === 'row'
                ? { startRow: 1, endRow: 1, startColumn: 0, endColumn: 19 }
                : { startRow: 0, endRow: 19, startColumn: 1, endColumn: 1 };
            expect(await commandService.executeCommand(
                axis === 'row' ? RemoveRowByRangeCommand.id : RemoveColByRangeCommand.id,
                { unitId: 'test', subUnitId: 'sheet1', range }
            )).toBe(true);
            const after = Tools.deepClone(readDrawing());
            expect(after.axisAlignSheetTransform.from[axis]).toBe(before.axisAlignSheetTransform.from[axis] - 1);
            expect(after.axisAlignSheetTransform.to[axis]).toBe(before.axisAlignSheetTransform.to[axis] - 1);
            const position = axis === 'row' ? 'top' : 'left';
            expect(after.transform?.[position]).toBeLessThan(before.transform![position]!);
            expect(after.transform?.width).toBe(before.transform?.width);
            expect(after.transform?.height).toBe(before.transform?.height);
            expect(peer.getActiveSheet()!.getSnapshot()).toEqual(peerSheetBefore);
            testBed.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
            expect(commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
            expect(readDrawing()).toEqual(before);
            expect(commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
            expect(readDrawing()).toEqual(after);
        } finally {
            testBed.univer.dispose();
        }
    });
});

describe('sheet drawing transforms without UI plugins', () => {
    let testBed: ReturnType<typeof createSheetsDrawingTestBed>;

    beforeEach(() => {
        testBed = createSheetsDrawingTestBed();
    });

    afterEach(() => testBed.univer.dispose());

    async function insertDrawing(anchorType: SheetDrawingAnchorType | undefined) {
        const sheetTransform = {
            from: { row: 1, column: 1, rowOffset: 0, columnOffset: 0 },
            to: { row: 4, column: 3, rowOffset: 0, columnOffset: 0 },
        };
        const skeleton = testBed.get(SheetSkeletonService).getSkeletonParam('test', 'sheet1');
        const drawing: ISheetDrawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'drawing-1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: 'https://example.com/drawing.png',
            anchorType,
            sheetTransform,
            axisAlignSheetTransform: sheetTransform,
            transform: drawingPositionToTransform(sheetTransform, skeleton)!,
        };
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [drawing],
        })).toBe(true);
        return testBed.get(ISheetDrawingService);
    }

    function getDrawing(service: ISheetDrawingService) {
        return service.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })!;
    }

    it('applies extension state around structural drawing updates and restores it through history', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = Tools.deepClone(getDrawing(service));
        const worksheet = testBed.workbook.getSheetBySheetId('sheet1')!;
        const cell = (value: string | null) => ({
            id: SetRangeValuesMutation.id,
            params: { unitId: 'test', subUnitId: 'sheet1', cellValue: { 0: { 0: value === null ? null : { v: value } } } },
        });
        const extension = testBed.get(SheetDrawingTransformPlanService).register({
            transform: (plan) => {
                if (plan.mode !== 'command' || plan.command.id !== InsertColCommand.id) return;
                const candidate = plan.updates.get(before.drawingId)!;
                plan.updates.set(before.drawingId, { ...candidate, selectable: false });
                return {
                    preRedos: [cell('before')],
                    redos: [cell('after')],
                    preUndos: [cell('before-undo')],
                    undos: [cell(null)],
                };
            },
        });
        const observed: unknown[] = [];
        const notification = service.update$.subscribe(() => observed.push(worksheet.getCell(0, 0)?.v));
        try {
            expect(await testBed.commandService.executeCommand(InsertColCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                direction: Direction.LEFT,
                range: { startRow: 0, endRow: 19, startColumn: 0, endColumn: 0 },
            })).toBe(true);
            const after = Tools.deepClone(getDrawing(service));
            expect(after.selectable).toBe(false);
            expect(after.transform!.left).toBe(before.transform!.left! + 88);
            expect(worksheet.getCell(0, 0)?.v).toBe('after');
            expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
            expect(getDrawing(service)).toEqual(before);
            expect(worksheet.getCell(0, 0)).toBeFalsy();
            expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
            expect(getDrawing(service)).toEqual(after);
            expect(worksheet.getCell(0, 0)?.v).toBe('after');
            expect(observed).toEqual(['before', 'before-undo', 'before']);
        } finally {
            notification.unsubscribe();
            extension.dispose();
        }
    });

    it.each([30, 60, 90])('hydrates an imported two-cell drawing at %s degrees before rendering', (angle) => {
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const transform = { left: 200, top: 200, width: 160, height: 40, angle };
        const drawing: ISheetDrawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'drawing-1',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            anchorType: SheetDrawingAnchorType.Both,
            sheetTransform: transformToDrawingPosition(transform, skeleton),
            axisAlignSheetTransform: transformToAxisAlignPosition(transform, skeleton),
            transform: { left: 0, top: 0, width: 0, height: 0 },
        };
        expect(testBed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [drawing] })).toBe(true);
        const current = getDrawing(testBed.get(ISheetDrawingService));
        expect(current.transform).toMatchObject(transform);
        expect(testBed.get(IDrawingManagerService).getDrawingByParam(drawing)).toEqual(current);
    });

    it('resizes a rotated drawing when the changed row is outside its unrotated rectangle', () => {
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const transform = { left: 200, top: 200, width: 160, height: 40, angle: 90 };
        const drawing: ISheetDrawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'drawing-1',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            anchorType: SheetDrawingAnchorType.Both,
            sheetTransform: transformToDrawingPosition(transform, skeleton),
            axisAlignSheetTransform: transformToAxisAlignPosition(transform, skeleton),
            transform,
        };
        expect(testBed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [drawing] })).toBe(true);
        const row = drawing.axisAlignSheetTransform.to.row - 1;
        expect(row).toBeGreaterThan(transformToDrawingPosition(transform, skeleton).to.row);
        const rowHeight = testBed.workbook.getSheetBySheetId('sheet1')!.getRowHeight(row);
        expect(testBed.commandService.syncExecuteCommand(SetRowHeightCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value: rowHeight + 40,
            ranges: [{ startRow: row, endRow: row, startColumn: 0, endColumn: 19 }],
        })).toBe(true);
        expect(getDrawing(testBed.get(ISheetDrawingService)).transform).toMatchObject({ left: 180, top: 220, width: 200, height: 40, angle: 90 });
    });

    it('preserves relative child transforms while resizing and persisting their group', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const base = Tools.deepClone(getDrawing(service));
        const parent = { ...base, drawingId: 'group', drawingType: DrawingTypeEnum.DRAWING_GROUP, groupBaseBound: base.transform };
        const child = {
            ...base,
            drawingId: 'child',
            groupId: 'group',
            transform: { left: 8, top: 12, width: 40, height: 20, angle: 30 },
        };
        expect(testBed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [parent, child],
        })).toBe(true);
        const rowHeight = testBed.workbook.getSheetBySheetId('sheet1')!.getRowHeight(2);
        expect(testBed.commandService.syncExecuteCommand(SetRowHeightCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value: rowHeight + 40,
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
        })).toBe(true);
        expect(service.getDrawingByParam(parent)!.transform!.height).toBe(base.transform!.height! + 40);
        expect(service.getDrawingByParam(child)).toEqual(child);
        const snapshot = testBed.get(IResourceLoaderService).saveUnit<IWorkbookData>('test')!;
        const data = JSON.parse(snapshot.resources!.find(({ name }) => name === SHEET_DRAWING_PLUGIN)!.data);
        expect(data.sheet1.data.child.transform).toEqual(child.transform);
        expect(data.sheet1.data.group.transform.height).toBe(base.transform!.height! + 40);
        expect(testBed.commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
        expect(service.getDrawingByParam(parent)).toEqual(parent);
        expect(service.getDrawingByParam(child)).toEqual(child);
    });

    it('preserves raw imported offsets during a metadata-only drawing edit', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        expect(testBed.commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{ drawingId: 'drawing-1', placement: {
                kind: SheetDrawingAnchorType.Both,
                from: { row: 1, column: 1, rowOffset: 144, columnOffset: 0 },
                to: { row: 8, column: 3, rowOffset: 0, columnOffset: 0 },
            } }],
        })).toBe(true);
        const before = Tools.deepClone(getDrawing(service));
        expect(testBed.commandService.syncExecuteCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{ ...before, source: 'https://example.com/updated.png' }],
        })).toBe(true);
        expect(getDrawing(service)).toMatchObject({
            source: 'https://example.com/updated.png',
            axisAlignSheetTransform: before.axisAlignSheetTransform,
            transform: before.transform,
        });
    });

    it.each([DeleteRangeMoveLeftCommand.id, DeleteRangeMoveUpCommand.id])('%s removes a legacy cell anchor and preserves an explicit absolute image', async (commandId) => {
        const service = await insertDrawing(undefined);
        const before = structuredClone(getDrawing(service));
        const absolute = { ...before, drawingId: 'absolute-image', anchorType: SheetDrawingAnchorType.None };
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [absolute],
        })).toBe(true);

        expect(await testBed.commandService.executeCommand(commandId, {
            range: { startRow: 1, endRow: 4, startColumn: 1, endColumn: 3 },
        })).toBe(true);
        expect(getDrawing(service)).toBeUndefined();
        expect(service.getDrawingByParam(absolute)).toEqual(absolute);
        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toBeUndefined();
        expect(service.getDrawingByParam(absolute)).toEqual(absolute);
    });

    it('inserts rows and restores the exact drawing through undo and redo', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));

        expect(await testBed.commandService.executeCommand(InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
            direction: Direction.DOWN,
        })).toBe(true);
        const after = structuredClone(getDrawing(service));
        expect(after.transform?.height).toBeGreaterThan(before.transform?.height ?? 0);

        expect(testBed.commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(testBed.commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    it.each([true, false])('preserves fixed image dimensions after repeated deletion with rows=%s', async (rows) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Position);
        const original = Tools.deepClone(getDrawing(service));
        const legacy = {
            ...original,
            sheetTransform: { ...original.axisAlignSheetTransform, to: { ...original.axisAlignSheetTransform.to, row: -2, column: -2 } },
        };
        expect(testBed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{ ...legacy, drawingId: 'legacy-position' }],
        })).toBe(true);
        const read = () => Tools.deepClone(service.getDrawingByParam({ ...legacy, drawingId: 'legacy-position' })!);
        const before = read();
        expect(before.axisAlignSheetTransform.to).toEqual(original.axisAlignSheetTransform.to);
        const commandId = rows ? RemoveRowCommand.id : RemoveColCommand.id;
        for (let i = 0; i < 2; i++) {
            expect(await testBed.commandService.executeCommand(commandId, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: rows ? 0 : 19, startColumn: 0, endColumn: rows ? 19 : 0 },
            })).toBe(true);
            expect(read().transform).toMatchObject({ width: before.transform?.width, height: before.transform?.height });
            expect(read().axisAlignSheetTransform.to.row).toBeGreaterThanOrEqual(0);
            expect(read().axisAlignSheetTransform.to.column).toBeGreaterThanOrEqual(0);
        }
        const after = read();
        for (let i = 0; i < 2; i++) {
            expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        }
        expect(read()).toEqual(before);
        for (let i = 0; i < 2; i++) {
            expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        }
        expect(read()).toEqual(after);
    });

    it.each([DeleteRangeMoveLeftCommand.id, DeleteRangeMoveUpCommand.id])('keeps fractional fixed sizes through %s', async (commandId) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Position);
        expect(testBed.commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{
                drawingId: 'drawing-1',
                placement: {
                    kind: SheetDrawingAnchorType.Position,
                    from: { row: 3, column: 3, rowOffset: 2, columnOffset: 2 },
                    width: 180.35,
                    height: 46.25,
                },
            }],
        })).toBe(true);
        const before = Tools.deepClone(getDrawing(service));
        const rows = commandId === DeleteRangeMoveUpCommand.id;
        expect(await testBed.commandService.executeCommand(commandId, {
            range: { startRow: 0, endRow: rows ? 0 : 19, startColumn: 0, endColumn: rows ? 19 : 0 },
        })).toBe(true);
        expect(getDrawing(service).transform).toMatchObject({ width: 180.35, height: 46.25 });
        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
    });

    it.each([true, false])('moves a deleted Position anchor to the boundary with unequal cell sizes and rows=%s', async (rows) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Position);
        expect(await testBed.commandService.executeCommand(rows ? SetRowHeightCommand.id : SetColWidthCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }],
            value: 100,
        })).toBe(true);
        expect(testBed.commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{
                drawingId: 'drawing-1',
                placement: {
                    kind: SheetDrawingAnchorType.Position,
                    from: { row: 3, column: 3, rowOffset: 2, columnOffset: 2 },
                    width: 180.35,
                    height: 46.25,
                },
            }],
        })).toBe(true);
        const before = Tools.deepClone(getDrawing(service));
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const boundary = skeleton.getNoMergeCellWithCoordByIndex(1, 1);
        expect(await testBed.commandService.executeCommand(rows ? RemoveRowCommand.id : RemoveColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: rows ? 1 : 0, endRow: rows ? 3 : 19, startColumn: rows ? 0 : 1, endColumn: rows ? 19 : 3 },
        })).toBe(true);
        expect(getDrawing(service).transform).toMatchObject({
            [rows ? 'top' : 'left']: rows ? boundary.startY : boundary.startX,
            width: 180.35,
            height: 46.25,
        });
        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
    });

    it.each([true, false])('clips a Both endpoint at the sheet boundary when deleting the last rows=%s', async (rows) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        expect(testBed.commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{
                drawingId: 'drawing-1',
                placement: {
                    kind: SheetDrawingAnchorType.Both,
                    from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
                    to: { row: 18, column: 18, rowOffset: 0, columnOffset: 0 },
                },
            }],
        })).toBe(true);
        const before = Tools.deepClone(getDrawing(service));
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const boundary = skeleton.getNoMergeCellWithCoordByIndex(15, 15);
        expect(await testBed.commandService.executeCommand(rows ? RemoveRowCommand.id : RemoveColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: rows ? 15 : 0, endRow: 19, startColumn: rows ? 0 : 15, endColumn: 19 },
        })).toBe(true);
        const after = getDrawing(service);
        const position = rows ? 'top' : 'left';
        const size = rows ? 'height' : 'width';
        expect((after.transform?.[position] ?? 0) + (after.transform?.[size] ?? 0))
            .toBe(rows ? boundary.startY : boundary.startX);
        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
    });

    it.each([true, false])('keeps both anchors valid when deleting the first rows=%s', async (rows) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        expect(testBed.commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{
                drawingId: 'drawing-1',
                placement: {
                    kind: SheetDrawingAnchorType.Both,
                    from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
                    to: { row: 4, column: 4, rowOffset: 0, columnOffset: 0 },
                },
            }],
        })).toBe(true);
        const before = Tools.deepClone(getDrawing(service));
        expect(await testBed.commandService.executeCommand(rows ? RemoveRowCommand.id : RemoveColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: rows ? 2 : 19, startColumn: 0, endColumn: rows ? 19 : 2 },
        })).toBe(true);
        const after = Tools.deepClone(getDrawing(service));
        expect(after.axisAlignSheetTransform.from).toMatchObject({ row: 0, column: 0 });
        expect(after.axisAlignSheetTransform.to[rows ? 'row' : 'column']).toBe(1);
        expect(after.transform?.[rows ? 'height' : 'width']).toBeGreaterThanOrEqual(0);
        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    it.each([true, false])('expands both anchors when an inserted block overlaps the endpoint with rows=%s', async (rows) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = Tools.deepClone(getDrawing(service));
        expect(await testBed.commandService.executeCommand(rows ? InsertRowCommand.id : InsertColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            direction: rows ? Direction.DOWN : Direction.RIGHT,
            range: { startRow: rows ? 2 : 0, endRow: rows ? 5 : 19, startColumn: rows ? 0 : 2, endColumn: rows ? 19 : 5 },
        })).toBe(true);
        const size = rows ? 'height' : 'width';
        expect(getDrawing(service).transform?.[size]).toBeGreaterThan(before.transform?.[size] ?? 0);
        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
    });

    it.each([
        ['insert row', InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
            direction: Direction.DOWN,
        }],
        ['delete row', RemoveRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
        }],
        ['insert column', InsertColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 },
            direction: Direction.RIGHT,
        }],
        ['delete column', RemoveColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 },
        }],
        ['resize row', SetRowHeightCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value: 60,
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
        }],
        ['resize column', SetColWidthCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value: 120,
            ranges: [{ startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 }],
        }],
        ['resize row by dragging', DeltaRowHeightCommand.id, {
            anchorRow: 2,
            deltaY: 40,
        }],
        ['resize column by dragging', DeltaColumnWidthCommand.id, {
            anchorCol: 2,
            deltaX: 50,
        }],
        ['hide row', SetRowHiddenCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
        }],
        ['hide column', SetColHiddenCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 }],
        }],
    ])('%s preserves explicit and default placement contracts in headless mode', async (_name, commandId, params) => {
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
        if (!skeleton) {
            throw new Error('Expected the Sheet skeleton to exist.');
        }
        const base = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: 'https://example.com/anchor.png',
            sheetTransform: {
                from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
                to: { row: 0, column: 0, rowOffset: 1, columnOffset: 1 },
            },
            axisAlignSheetTransform: {
                from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
                to: { row: 0, column: 0, rowOffset: 1, columnOffset: 1 },
            },
            transform: { left: 0, top: 0, width: 1, height: 1 },
        };
        const placements: ISheetDrawingPlacement[] = [
            {
                kind: SheetDrawingAnchorType.Position,
                from: { row: 3, column: 3, rowOffset: 4, columnOffset: 6 },
                width: 240,
                height: 120,
            },
            {
                kind: SheetDrawingAnchorType.Both,
                from: { row: 1, column: 1, rowOffset: 4, columnOffset: 6 },
                to: { row: 8, column: 6, rowOffset: 0, columnOffset: 0 },
            },
            {
                kind: SheetDrawingAnchorType.None,
                left: 640,
                top: 96,
                width: 240,
                height: 120,
            },
        ];
        const drawings = placements.map((placement, index) => applySheetDrawingPlacement({
            ...base,
            drawingId: `placement-${index}`,
        }, placement, placement.kind === SheetDrawingAnchorType.None ? undefined : skeleton));
        drawings.push({
            ...applySheetDrawingPlacement({
                ...base,
                drawingId: 'implicit-position',
            }, placements[0], skeleton),
            anchorType: undefined,
        });
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings,
        })).toBe(true);

        const service = testBed.get(ISheetDrawingService);
        const readDrawings = () => drawings.map((drawing) => {
            const current = service.getDrawingByParam(drawing);
            if (!current) {
                throw new Error(`Expected drawing "${drawing.drawingId}" to exist.`);
            }
            return structuredClone(current);
        });
        const before = readDrawings();

        if (commandId === DeltaRowHeightCommand.id || commandId === DeltaColumnWidthCommand.id) {
            testBed.get(SheetsSelectionsService).setSelections([{
                range: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                    rangeType: RANGE_TYPE.NORMAL,
                },
                primary: null,
                style: null,
            }]);
        }

        expect(await testBed.commandService.executeCommand(commandId, params)).toBe(true);
        const after = readDrawings();
        expect(after[0].transform).not.toEqual(before[0].transform);
        expect(after[2].transform).toEqual(before[2].transform);
        expect(after[3].transform).toEqual(after[0].transform);
        expect(getSheetDrawingPlacement(after[3])).toEqual(getSheetDrawingPlacement(after[0]));
        expect(getSheetDrawingPlacement(after[2])).toEqual(getSheetDrawingPlacement(before[2]));
        expect(after[0].transform?.width).toBe(before[0].transform?.width);
        expect(after[0].transform?.height).toBe(before[0].transform?.height);
        expect(after[3].transform?.width).toBe(before[3].transform?.width);
        expect(after[3].transform?.height).toBe(before[3].transform?.height);
        if (commandId === SetRowHiddenCommand.id || commandId === SetColHiddenCommand.id) {
            expect(after[1]).not.toEqual(before[1]);
        } else {
            expect(after[1].transform).not.toEqual(before[1].transform);
            expect([
                after[1].transform?.width !== before[1].transform?.width,
                after[1].transform?.height !== before[1].transform?.height,
            ]).toContain(true);
        }
        expect(after.map((drawing) => getSheetDrawingPlacement(drawing)).map(({ kind }) => kind)).toEqual([
            SheetDrawingAnchorType.Position,
            SheetDrawingAnchorType.Both,
            SheetDrawingAnchorType.None,
            SheetDrawingAnchorType.Position,
        ]);

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(readDrawings()).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(readDrawings()).toEqual(after);
    });

    it.each([
        [DeltaRowHeightCommand.id, { anchorRow: 2, deltaY: 48 }, SheetDrawingAnchorType.Position],
        [DeltaColumnWidthCommand.id, { anchorCol: 2, deltaX: 48 }, SheetDrawingAnchorType.Position],
        [DeltaRowHeightCommand.id, { anchorRow: 2, deltaY: 48 }, undefined],
        [DeltaColumnWidthCommand.id, { anchorCol: 2, deltaX: 48 }, undefined],
    ])('%s with %j preserves drawing size for anchor %s', async (commandId, params, anchorType) => {
        const service = await insertDrawing(anchorType);
        const before = structuredClone(getDrawing(service).transform);
        testBed.get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
        }]);

        expect(await testBed.commandService.executeCommand(commandId, params)).toBe(true);
        expect(getDrawing(service).transform).toEqual(before);
    });

    it.each([SheetDrawingAnchorType.Position, undefined])('keeps anchor %s drawing size across auto-height and a preceding column resize', async (anchorType) => {
        const service = await insertDrawing(anchorType);
        const before = structuredClone(getDrawing(service).transform)!;
        const worksheet = testBed.workbook.getSheetBySheetId('sheet1')!;
        testBed.get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
        }]);

        testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rowsAutoHeightInfo: [{ row: 2, autoHeight: worksheet.getRowHeight(2) + 30 }],
        });
        await Promise.resolve();
        await testBed.commandService.executeCommand(DeltaColumnWidthCommand.id, { anchorCol: 0, deltaX: 48 });

        expect(getDrawing(service).transform).toEqual({ ...before, left: before.left! + 48 });
    });

    it('round-trips legacy floating cell anchors through saved resources and undo/redo', async () => {
        const service = await insertDrawing(undefined);
        const original = getDrawing(service);
        const floating = { ...original, drawingId: 'legacy-floating', drawingType: DrawingTypeEnum.DRAWING_DOM };
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [floating],
        })).toBe(true);
        const snapshot = testBed.get(IResourceLoaderService).saveUnit<IWorkbookData>('test');
        if (!snapshot) {
            throw new Error('Expected the Sheet snapshot to exist.');
        }
        const resource = snapshot.resources.find(({ name }) => name === SHEET_DRAWING_PLUGIN);
        if (!resource) {
            throw new Error('Expected the drawing resource to exist.');
        }
        const persisted = JSON.parse(resource.data).sheet1.data['legacy-floating'];
        expect(persisted).not.toHaveProperty('anchorType');
        const restored = createSheetsDrawingTestBed(snapshot);
        try {
            const restoredService = restored.get(ISheetDrawingService);
            const readDrawing = () => restoredService.getDrawingByParam(floating)!;
            const before = structuredClone(readDrawing());
            expect(getSheetDrawingPlacement(before)).toMatchObject({
                kind: SheetDrawingAnchorType.Position,
                from: floating.axisAlignSheetTransform.from,
                width: floating.transform?.width,
                height: floating.transform?.height,
            });
            expect(await restored.commandService.executeCommand(InsertRowCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 19 },
                direction: Direction.UP,
            })).toBe(true);
            const after = structuredClone(readDrawing());
            expect(after.transform?.top).toBeGreaterThan(before.transform?.top ?? 0);
            expect(after.transform?.width).toBe(before.transform?.width);
            expect(after.transform?.height).toBe(before.transform?.height);
            expect(await restored.commandService.executeCommand(UndoCommandId)).toBe(true);
            expect(readDrawing()).toEqual(before);
            expect(await restored.commandService.executeCommand(RedoCommandId)).toBe(true);
            expect(readDrawing()).toEqual(after);
        } finally {
            restored.univer.dispose();
        }
    });

    it.each([
        {
            operation: 'row resize',
            commandId: SetRowHeightCommand.id,
            params: { ranges: [{ startRow: 8, endRow: 8, startColumn: 0, endColumn: 19 }], value: 60 },
        },
        {
            operation: 'delete cells',
            commandId: DeleteRangeMoveUpCommand.id,
            params: { range: { startRow: 8, endRow: 8, startColumn: 0, endColumn: 19 } },
        },
    ])('keeps the Excel start marker of an imported rotated one-cell image across $operation and history', async ({ commandId, params }) => {
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const anchor = skeleton.getNoMergeCellWithCoordByIndex(7, 2);
        const bounds = { left: 200, top: anchor.startY + 61, width: 160, height: 40, angle: 90 };
        const drawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'rotated-one-cell',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: 'https://example.com/one-cell.png',
            anchorType: SheetDrawingAnchorType.Position,
            sheetTransform: { ...transformToAxisAlignPosition(bounds, skeleton), angle: 90 },
            transform: { left: 0, top: 0, width: 0, height: 0 },
        } as ISheetDrawing;
        const { commandService } = testBed;
        expect(await commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [drawing] })).toBe(true);
        const service = testBed.get(ISheetDrawingService);
        const manager = testBed.get(IDrawingManagerService);
        const before = Tools.deepClone(service.getDrawingByParam(drawing)!);
        expect(before.axisAlignSheetTransform.from.row).toBe(7);
        expect(getLegacySheetDrawingPosition(before, skeleton).from.row).toBeGreaterThan(8);
        expect(before.transform).toMatchObject(bounds);

        expect(await commandService.executeCommand(commandId, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ...params,
        })).toBe(true);
        const after = Tools.deepClone(service.getDrawingByParam(drawing)!);
        expect(after.transform).toMatchObject(bounds);
        expect(after.axisAlignSheetTransform.from).toEqual(before.axisAlignSheetTransform.from);
        expect(after.sheetTransform).toBeUndefined();
        expect(manager.getDrawingByParam(drawing)).toEqual(after);

        expect(await commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(service.getDrawingByParam(drawing)).toEqual(before);
        expect(await commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(service.getDrawingByParam(drawing)).toEqual(after);
    });

    it('resizes both-anchored drawings when row height changes', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));
        const manager = testBed.get(IDrawingManagerService);
        const observed: Array<{ sheet: ISheetDrawing; drawing: unknown }> = [];
        const capture = () => observed.push({
            sheet: Tools.deepClone(getDrawing(service)),
            drawing: Tools.deepClone(manager.getDrawingByParam(before)),
        });
        const subscriptions = [service.refreshTransform$.subscribe(capture), manager.refreshTransform$.subscribe(capture)];

        try {
            expect(testBed.commandService.syncExecuteCommand(SetRowHeightCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
                value: 40,
            })).toBe(true);
            const after = structuredClone(getDrawing(service));
            expect(after.transform?.height).toBeGreaterThan(before.transform?.height ?? 0);

            expect(testBed.commandService.syncExecuteCommand(UndoCommandId)).toBe(true);
            expect(getDrawing(service)).toEqual(before);
            expect(testBed.commandService.syncExecuteCommand(RedoCommandId)).toBe(true);
            expect(getDrawing(service)).toEqual(after);
        } finally {
            subscriptions.forEach((subscription) => subscription.unsubscribe());
        }
        expect(observed.length).toBeGreaterThan(0);
        for (const state of observed) {
            expect(state.drawing).toEqual(state.sheet);
        }
    });

    it.each(['fromCollab', 'fromChangeset'])('keeps local layout on %s resize followed by a drawing-only move', async (source) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const peer = createSheetsDrawingTestBed();
        const mutations: ICommandInfo[] = [];
        const subscription = peer.commandService.onCommandExecuted((command) => {
            if (command.id.startsWith('sheet.mutation.')) {
                mutations.push(Tools.deepClone(command));
            }
        });
        const range = (row: number) => [{ startRow: row, endRow: row, startColumn: 0, endColumn: 19 }];
        const resize = (bed: typeof testBed, row: number, value: number) => bed.commandService.syncExecuteCommand(SetRowHeightCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value,
            ranges: range(row),
        });
        const replay = () => {
            for (const mutation of mutations.splice(0)) {
                expect(testBed.commandService.syncExecuteCommand(mutation.id, mutation.params, { [source]: true })).toBe(true);
            }
        };
        try {
            expect(peer.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, {
                unitId: 'test',
                drawings: [Tools.deepClone(getDrawing(service))],
            })).toBe(true);
            mutations.length = 0;
            const before = Tools.deepClone(getDrawing(service));
            const originalHeight = testBed.workbook.getSheetBySheetId('sheet1')!.getRowHeight(0);
            expect(resize(testBed, 0, originalHeight + 50)).toBe(true);
            expect(resize(peer, 0, originalHeight + 30)).toBe(true);
            expect(mutations.some(({ id }) => id === SetDrawingApplyMutation.id)).toBe(false);
            // A local read-only layout stays different from the shared row height.
            // Use another row for the remote edit, leaving A's local row 0 intact.
            mutations.length = 0;
            expect(resize(peer, 2, originalHeight + 30)).toBe(true);
            replay();
            expect(getDrawing(service).transform?.top).toBe(before.transform!.top! + 50);
            expect(getDrawing(service).transform?.height).toBe(before.transform!.height! + 30);

            const peerDrawing = peer.get(ISheetDrawingService).getDrawingByParam(before)!;
            expect(peer.commandService.syncExecuteCommand(SetSheetDrawingPlacementCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                drawings: [{ drawingId: before.drawingId, placement: {
                    kind: SheetDrawingAnchorType.Both,
                    from: { ...peerDrawing.axisAlignSheetTransform.from, row: 5 },
                    to: { ...peerDrawing.axisAlignSheetTransform.to, row: 8 },
                } }],
            })).toBe(true);
            const moved = peer.get(ISheetDrawingService).getDrawingByParam(before)!;
            const previous = Tools.deepClone(getDrawing(service));
            const notifiedPositions: number[] = [];
            const manager = testBed.get(IDrawingManagerService);
            const visibleStates: Array<{ sheet: ISheetDrawing; drawing: unknown }> = [];
            const recordState = () => visibleStates.push({
                sheet: Tools.deepClone(getDrawing(service)),
                drawing: Tools.deepClone(manager.getDrawingByParam(before)),
            });
            const refresh = service.refreshTransform$.subscribe(recordState);
            const notification = manager.update$.subscribe((objects) => {
                if (objects.some(({ drawingId }) => drawingId === before.drawingId)) {
                    notifiedPositions.push(getDrawing(service).transform!.top!);
                    recordState();
                    // Renderers need the state before the remote edit to restore
                    // removed metadata such as selectable, not the peer's pixel cache.
                    expect(testBed.get(IDrawingManagerService).getOldDrawingByParam(before)).toEqual(previous);
                }
            });
            try {
                replay();
            } finally {
                refresh.unsubscribe();
                notification.unsubscribe();
            }
            expect(notifiedPositions).toEqual([moved.transform!.top! + 20]);
            for (const state of visibleStates) {
                expect(state).toEqual({ sheet: getDrawing(service), drawing: getDrawing(service) });
            }
            expect(getDrawing(service).transform?.top).toBe(moved.transform!.top! + 20);
            expect(testBed.get(IDrawingManagerService).getDrawingByParam(before)).toEqual(getDrawing(service));
        } finally {
            subscription.dispose();
            peer.univer.dispose();
        }
    });

    it('updates placement through a command and round-trips through undo and redo', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));
        const placement: ISheetDrawingPlacement = {
            kind: SheetDrawingAnchorType.None,
            left: 640,
            top: 96,
            width: 240,
            height: 120,
        };

        expect(await testBed.commandService.executeCommand(SetSheetDrawingPlacementCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{ drawingId: 'drawing-1', placement }],
        })).toBe(true);
        const after = structuredClone(getDrawing(service));
        expect(getSheetDrawingPlacement(after)).toEqual(placement);

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    it('requires a loaded Sheet for bounds inference and preserves rotation state', () => {
        expect(() => normalizeSheetDrawingPlacement({
            kind: SheetDrawingAnchorType.Position,
            bounds: { left: 120, top: 80, width: 240, height: 120 },
        })).toThrow('SHEET_DRAWING_PLACEMENT_SKELETON_REQUIRED');

        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
        if (!skeleton) {
            throw new Error('Expected the Sheet skeleton to exist.');
        }
        const source: ISheetDrawing = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'rotated-drawing',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            transform: {
                left: 120,
                top: 80,
                width: 240,
                height: 120,
                angle: 37,
                flipX: true,
                flipY: false,
                skewX: 4,
                skewY: 2,
            },
            sheetTransform: {
                from: { row: 2, column: 2, rowOffset: 4, columnOffset: 6 },
                to: { row: 8, column: 6, rowOffset: 0, columnOffset: 0 },
                angle: 37,
                flipX: true,
                flipY: false,
                skewX: 4,
                skewY: 2,
            },
            axisAlignSheetTransform: {
                from: { row: 2, column: 2, rowOffset: 4, columnOffset: 6 },
                to: { row: 8, column: 6, rowOffset: 0, columnOffset: 0 },
            },
        };
        const placements: ISheetDrawingPlacement[] = [
            {
                kind: SheetDrawingAnchorType.Position,
                from: { row: 3, column: 3, rowOffset: 8, columnOffset: 8 },
                width: 320,
                height: 180,
            },
            {
                kind: SheetDrawingAnchorType.Both,
                from: { row: 3, column: 3, rowOffset: 8, columnOffset: 8 },
                to: { row: 10, column: 8, rowOffset: 0, columnOffset: 0 },
            },
            {
                kind: SheetDrawingAnchorType.None,
                left: 640,
                top: 96,
                width: 320,
                height: 180,
            },
        ];

        for (const placement of placements) {
            const result = applySheetDrawingPlacement(
                source,
                placement,
                placement.kind === SheetDrawingAnchorType.None ? undefined : skeleton
            );
            expect(result.transform).toEqual(expect.objectContaining({
                angle: 37,
                flipX: true,
                flipY: false,
                skewX: 4,
                skewY: 2,
            }));
            expect(result.sheetTransform).toBeUndefined();
            expect(result.axisAlignSheetTransform.angle).toBeUndefined();
        }
    });

    it.each([
        ['remove row', RemoveRowCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 },
        }],
        ['insert column', InsertColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            direction: Direction.RIGHT,
            range: { startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 },
        }],
        ['remove column', RemoveColCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 },
        }],
        ['insert cells down', InsertRangeMoveDownCommand.id, {
            range: { startRow: 2, endRow: 2, startColumn: 1, endColumn: 3 },
        }],
        ['insert cells right', InsertRangeMoveRightCommand.id, {
            range: { startRow: 1, endRow: 4, startColumn: 2, endColumn: 2 },
        }],
        ['delete cells up', DeleteRangeMoveUpCommand.id, {
            range: { startRow: 2, endRow: 2, startColumn: 1, endColumn: 3 },
        }],
        ['delete cells left', DeleteRangeMoveLeftCommand.id, {
            range: { startRow: 1, endRow: 4, startColumn: 2, endColumn: 2 },
        }],
        ['set column width', SetColWidthCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            value: 120,
            ranges: [{ startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 }],
        }],
        ['hide row', SetRowHiddenCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 19 }],
        }],
        ['hide column', SetColHiddenCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{ startRow: 0, endRow: 19, startColumn: 2, endColumn: 2 }],
        }],
        ['move rows', MoveRowsCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 1, endRow: 4, startColumn: 0, endColumn: 19, rangeType: RANGE_TYPE.ROW },
            fromRange: { startRow: 1, endRow: 4, startColumn: 0, endColumn: 19 },
            toRange: { startRow: 8, endRow: 11, startColumn: 0, endColumn: 19 },
        }],
        ['move columns', MoveColsCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 3, rangeType: RANGE_TYPE.COLUMN },
            fromRange: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 3 },
            toRange: { startRow: 0, endRow: 19, startColumn: 7, endColumn: 9 },
        }],
        ['move range', MoveRangeCommand.id, {
            fromUnitId: 'test',
            fromSubUnitId: 'sheet1',
            toUnitId: 'test',
            toSubUnitId: 'sheet1',
            fromRange: { startRow: 1, endRow: 4, startColumn: 1, endColumn: 3 },
            toRange: { startRow: 8, endRow: 11, startColumn: 7, endColumn: 9 },
        }],
    ])('%s changes drawing geometry and round-trips exactly', async (_name, commandId, params) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));

        expect(await testBed.commandService.executeCommand(commandId, params)).toBe(true);
        const after = structuredClone(getDrawing(service));
        expect(after).not.toEqual(before);

        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(getDrawing(service)).toEqual(after);
    });

    it.each([
        [true, SheetDrawingAnchorType.Position],
        [false, SheetDrawingAnchorType.Position],
        [true, undefined],
        [false, undefined],
        [true, SheetDrawingAnchorType.Both],
        [false, SheetDrawingAnchorType.Both],
        [true, SheetDrawingAnchorType.None],
        [false, SheetDrawingAnchorType.None],
    ])('restores row visibility=%s and anchor=%s across commands and saved resources', async (rows, anchorType) => {
        const service = await insertDrawing(anchorType);
        const skeleton = testBed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
        const positioned = applySheetDrawingPlacement(getDrawing(service), {
            kind: SheetDrawingAnchorType.Position,
            from: { row: 1, column: 1, rowOffset: 6, columnOffset: 12 },
            width: 180,
            height: 120,
        }, skeleton);
        expect(await testBed.commandService.executeCommand(InsertSheetDrawingCommand.id, {
            unitId: 'test',
            drawings: [{ ...positioned, drawingId: 'offset-image', anchorType }],
        })).toBe(true);
        const readDrawing = (drawingService = service) => Tools.deepClone(drawingService.getDrawingByParam({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'offset-image',
        })!);
        const before = readDrawing();
        const cell = skeleton.getNoMergeCellWithCoordByIndex(1, 1);
        const params = {
            unitId: 'test',
            subUnitId: 'sheet1',
            ranges: [{
                startRow: rows ? 1 : 0,
                endRow: rows ? 1 : 19,
                startColumn: rows ? 0 : 1,
                endColumn: rows ? 19 : 1,
            }],
        };
        const hideId = rows ? SetRowHiddenCommand.id : SetColHiddenCommand.id;
        const showId = rows ? SetSpecificRowsVisibleCommand.id : SetSpecificColsVisibleCommand.id;
        expect(await testBed.commandService.executeCommand(hideId, params)).toBe(true);
        const hidden = readDrawing();
        if (anchorType === SheetDrawingAnchorType.None) {
            expect(hidden.transform).toEqual(before.transform);
        } else {
            expect(hidden.axisAlignSheetTransform.from).toEqual(before.axisAlignSheetTransform.from);
            expect(hidden.transform?.[rows ? 'top' : 'left']).toBe(rows ? cell.startY : cell.startX);
            if (anchorType === SheetDrawingAnchorType.Both) {
                expect(hidden.axisAlignSheetTransform.to).toEqual(before.axisAlignSheetTransform.to);
                expect(hidden.transform?.[rows ? 'height' : 'width'])
                    .toBeLessThan(before.transform?.[rows ? 'height' : 'width'] ?? 0);
            } else {
                expect(hidden.transform).toMatchObject({ width: 180, height: 120 });
                expect(hidden.axisAlignSheetTransform.to).not.toEqual(before.axisAlignSheetTransform.to);
            }
        }
        expect(await testBed.commandService.executeCommand(UndoCommandId)).toBe(true);
        expect(readDrawing()).toEqual(before);
        expect(await testBed.commandService.executeCommand(RedoCommandId)).toBe(true);
        expect(readDrawing()).toEqual(hidden);

        const snapshot = testBed.get(IResourceLoaderService).saveUnit<IWorkbookData>('test')!;
        const restored = createSheetsDrawingTestBed(snapshot);
        try {
            const restoredService = restored.get(ISheetDrawingService);
            expect(readDrawing(restoredService)).toEqual(hidden);
            expect(await restored.commandService.executeCommand(showId, params)).toBe(true);
            expect(readDrawing(restoredService)).toEqual(before);
            expect(await restored.commandService.executeCommand(UndoCommandId)).toBe(true);
            expect(readDrawing(restoredService)).toEqual(hidden);
            expect(await restored.commandService.executeCommand(RedoCommandId)).toBe(true);
            expect(readDrawing(restoredService)).toEqual(before);
        } finally {
            restored.univer.dispose();
        }
    });

    it.each([
        [SheetDrawingAnchorType.Position, false, undefined],
        [undefined, false, undefined],
        [SheetDrawingAnchorType.Both, false, undefined],
        [SheetDrawingAnchorType.Position, true, undefined],
        [SheetDrawingAnchorType.Position, false, 'from'],
        [SheetDrawingAnchorType.Position, false, 'to'],
        [SheetDrawingAnchorType.Both, false, 'from'],
        [SheetDrawingAnchorType.Both, false, 'to'],
        [SheetDrawingAnchorType.Both, false, 'sheetTransform'],
    ] as const)('isolates invalid snapshot placement with anchor=%s, legacy markers=%s and missing=%s during replay', async (anchorType, legacyMarkers, missing) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const healthy = Tools.deepClone(getDrawing(service));
        const from = legacyMarkers
            ? { column: 3, columnOffset: 0, row: 198, rowOffset: -4460 }
            : { ...healthy.axisAlignSheetTransform.from, row: anchorType === SheetDrawingAnchorType.Both ? -1 : 1 };
        const to = legacyMarkers
            ? { column: 4, columnOffset: 60.3, row: -2, rowOffset: 0 }
            : healthy.axisAlignSheetTransform.to;
        const invalid: ISheetDrawing = {
            ...healthy,
            drawingId: 'invalid-image',
            anchorType,
            transform: { ...healthy.transform, top: -4243, width: 180.3, height: -4243 },
            sheetTransform: { from, to },
            axisAlignSheetTransform: { from, to },
        };
        if (missing === 'sheetTransform') {
            Reflect.deleteProperty(invalid, missing);
        } else if (missing) {
            Reflect.deleteProperty(invalid.sheetTransform!, missing);
        }
        const snapshot = testBed.get(IResourceLoaderService).saveUnit<IWorkbookData>('test')!;
        snapshot.sheets.sheet1.rowCount = 300;
        snapshot.resources!.find(({ name }) => name === SHEET_DRAWING_PLUGIN)!.data = JSON.stringify({
            sheet1: {
                data: { [invalid.drawingId]: invalid, [healthy.drawingId]: healthy },
                order: [invalid.drawingId, healthy.drawingId],
            },
        });
        const restored = createSheetsDrawingTestBed(snapshot);
        const warn = vi.spyOn(DesktopLogService.prototype, 'warn');
        try {
            const restoredService = restored.get(ISheetDrawingService);
            const drawingManager = restored.get(IDrawingManagerService);
            const worksheet = restored.workbook.getSheetBySheetId('sheet1')!;
            const originalHeight = worksheet.getRowHeight(2);

            expect(restoredService.getDrawingByParam(invalid)).toEqual(invalid);
            expect(restored.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                rowsAutoHeightInfo: [{ row: 2, autoHeight: originalHeight + 30 }],
            })).toBe(true);
            await Promise.resolve();

            const afterAutoHeight = Tools.deepClone(getDrawing(restoredService));
            expect(afterAutoHeight.transform?.height).toBeCloseTo((healthy.transform?.height ?? 0) + 30);
            expect(drawingManager.getDrawingByParam(healthy)).toEqual(afterAutoHeight);
            expect(restoredService.getDrawingByParam(invalid)).toEqual(invalid);
            expect(drawingManager.getDrawingByParam(invalid)).toEqual(invalid);
            expect(warn).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.objectContaining({
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: invalid.drawingId,
                commandId: SetWorksheetRowAutoHeightMutation.id,
                failure: expect.objectContaining({ ok: false, reason: expect.any(String) }),
            }));

            const originalWidth = worksheet.getColumnWidth(2);
            expect(await restored.commandService.executeCommand(SetColWidthCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [{ startRow: 0, endRow: 299, startColumn: 2, endColumn: 2 }],
                value: originalWidth + 50,
            })).toBe(true);
            const afterColumnWidth = Tools.deepClone(getDrawing(restoredService));
            expect(afterColumnWidth.transform?.width).toBeCloseTo((afterAutoHeight.transform?.width ?? 0) + 50);
            expect(await restored.commandService.executeCommand(UndoCommandId)).toBe(true);
            expect(getDrawing(restoredService)).toEqual(afterAutoHeight);
            expect(await restored.commandService.executeCommand(RedoCommandId)).toBe(true);
            expect(getDrawing(restoredService)).toEqual(afterColumnWidth);
            expect(drawingManager.getDrawingByParam(healthy)).toEqual(afterColumnWidth);
            expect(restoredService.getDrawingByParam(invalid)).toEqual(invalid);
            expect(drawingManager.getDrawingByParam(invalid)).toEqual(invalid);
        } finally {
            restored.univer.dispose();
            warn.mockRestore();
        }
    });

    it('contains a refresh extension failure and refreshes again after the extension recovers', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = Tools.deepClone(getDrawing(service));
        const error = new Error('Drawing extension failed');
        const extension = testBed.get(SheetDrawingTransformPlanService).register({
            transform: () => { throw error; },
        });
        const log = vi.spyOn(DesktopLogService.prototype, 'error');
        try {
            expect(testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                rowsAutoHeightInfo: [{ row: 2, autoHeight: 60 }],
            })).toBe(true);
            await Promise.resolve();

            expect(getDrawing(service)).toEqual(before);
            expect(testBed.get(IDrawingManagerService).getDrawingByParam(before)).toEqual(before);
            expect(log).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.objectContaining({
                commandId: SetWorksheetRowAutoHeightMutation.id,
                error,
            }));

            extension.dispose();
            expect(testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                rowsAutoHeightInfo: [{ row: 2, autoHeight: 80 }],
            })).toBe(true);
            await Promise.resolve();
            expect(getDrawing(service).transform?.height).toBeGreaterThan(before.transform?.height ?? 0);
        } finally {
            extension.dispose();
            log.mockRestore();
        }
    });

    it.each(['controller', 'unit'] as const)('stops drawing refresh after the %s is disposed', async (owner) => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = Tools.deepClone(getDrawing(service));
        const plans: string[] = [];
        const extension = testBed.get(SheetDrawingTransformPlanService).register({
            transform: (plan) => { plans.push(plan.mode); },
        });
        try {
            if (owner === 'controller') {
                testBed.get(SheetDrawingTransformAffectedController).dispose();
            } else {
                testBed.get(IUniverInstanceService).disposeUnit('test');
            }
            if (owner === 'controller') {
                expect(testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    rowsAutoHeightInfo: [{ row: 2, autoHeight: 60 }],
                })).toBe(true);
            }
            await Promise.resolve();
            expect(plans).toEqual([]);
            if (owner === 'controller') {
                expect(getDrawing(service)).toEqual(before);
            } else {
                expect(service.getDrawingByParam(before)).toBeUndefined();
            }
        } finally {
            extension.dispose();
        }
    });

    it('refreshes direct auto-height mutations and their inverse without UI', async () => {
        const service = await insertDrawing(SheetDrawingAnchorType.Both);
        const before = structuredClone(getDrawing(service));
        const worksheet = testBed.workbook.getSheetBySheetId('sheet1')!;
        const originalHeight = worksheet.getRowHeight(2);

        expect(testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rowsAutoHeightInfo: [{ row: 2, autoHeight: originalHeight + 30 }],
        })).toBe(true);
        await Promise.resolve();
        expect(getDrawing(service).transform?.height).toBeGreaterThan(before.transform?.height ?? 0);

        expect(testBed.commandService.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rowsAutoHeightInfo: [{ row: 2, autoHeight: originalHeight }],
        })).toBe(true);
        await Promise.resolve();
        expect(getDrawing(service)).toEqual(before);
    });
});
