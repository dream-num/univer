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

import type { IWorkbookData } from '@univerjs/core';
import {
    DrawingTypeEnum,
    ImageSourceType,
    IResourceLoaderService,
    LocaleType,
    RedoCommand,
    SheetTypes,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { InsertSheetCommand, SheetSkeletonService } from '@univerjs/sheets';
import { expect, it, onTestFinished } from 'vitest';
import { createSheetsDrawingTestBed } from '../../../__tests__/create-sheets-drawing-test-bed';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../../services/sheet-drawing.service';
import { InsertSheetDrawingCommand } from '../insert-sheet-drawing.command';
import { SetSheetDrawingPlacementCommand } from '../set-sheet-drawing-placement.command';

it.each([
    { name: 'default dimensions', dimensions: {} },
    { name: 'explicit zero dimensions', dimensions: { rowCount: 0, columnCount: 0 } },
])('persists absolute Chart Sheet placement with $name through JSON1, undo, redo and complete resource restoration without grid geometry', async ({ dimensions }) => {
    const data: IWorkbookData = {
        id: 'test',
        name: '',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['chart', 'grid'],
        sheets: {
            chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, ...dimensions },
            grid: { id: 'grid', name: 'Grid', rowCount: 20, columnCount: 20 },
        },
    };
    const bed = createSheetsDrawingTestBed(data);
    onTestFinished(() => bed.univer.dispose());
    const chartSheet = bed.workbook.getSheetBySheetId('chart')!;
    if (dimensions.rowCount === undefined) {
        expect(chartSheet.getRowCount()).toBeGreaterThan(0);
        expect(chartSheet.getColumnCount()).toBeGreaterThan(0);
    } else {
        expect(chartSheet.getRowCount()).toBe(0);
        expect(chartSheet.getColumnCount()).toBe(0);
    }
    expect(chartSheet.getConfig().cellData).toEqual({});
    const skeletons = bed.get(SheetSkeletonService);
    const assertNoGrid = () => {
        expect(skeletons.getSkeleton('test', 'chart')).toBeUndefined();
        expect(skeletons.ensureSkeleton('test', 'chart')).toBeUndefined();
        expect(bed.get(IRenderManagerService).getAllRenderersOfType(UniverInstanceType.UNIVER_SHEET)).toHaveLength(0);
    };
    assertNoGrid();
    expect(skeletons.getSkeleton('test', 'grid')).toBeDefined();
    expect(() => skeletons.newSkeleton('test', 'chart', bed.workbook.getSheetBySheetId('chart')!, bed.workbook.getStyles())).toThrow('CHART');
    expect(() => skeletons.newSkeletonParam('test', 'chart', bed.workbook.getSheetBySheetId('chart')!, bed.workbook.getStyles())).toThrow('CHART');
    expect(await bed.commandService.executeCommand(InsertSheetCommand.id, {
        unitId: 'test',
        index: 2,
        sheet: { id: 'inserted', name: 'Inserted', type: SheetTypes.CHART },
    })).toBe(true);
    expect(skeletons.getSkeleton('test', 'inserted')).toBeUndefined();
    const marker = { row: 0, column: 0, rowOffset: 2, columnOffset: 3 };
    const initial = {
        unitId: 'test',
        subUnitId: 'chart',
        drawingId: 'drawing',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: 'https://example.com/image.png',
        anchorType: SheetDrawingAnchorType.None,
        transform: { left: 3, top: 2, width: 30, height: 40, angle: 35, flipX: true, flipY: true },
        sheetTransform: { from: marker, to: marker, angle: 35, flipX: true, flipY: true },
        axisAlignSheetTransform: { from: marker, to: marker },
    };
    expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [initial] })).toBe(true);
    const search = { unitId: 'test', subUnitId: 'chart', drawingId: 'drawing' };
    const drawing = () => bed.get(ISheetDrawingService).getDrawingByParam(search)!;
    expect(await bed.commandService.executeCommand(SetSheetDrawingPlacementCommand.id, {
        unitId: 'test',
        subUnitId: 'chart',
        drawings: [{ drawingId: 'drawing', placement: {
            kind: SheetDrawingAnchorType.None,
            left: 100,
            top: 200,
            width: 300,
            height: 400,
        } }],
    })).toBe(true);
    const expected = {
        anchorType: SheetDrawingAnchorType.None,
        transform: { left: 100, top: 200, width: 300, height: 400, angle: 35, flipX: true, flipY: true },
        sheetTransform: {
            from: { row: 0, column: 0, rowOffset: 200, columnOffset: 100 },
            to: { row: 0, column: 0, rowOffset: 600, columnOffset: 400 },
            angle: 35,
            flipX: true,
            flipY: true,
        },
    };
    expect(drawing()).toMatchObject(expected);
    expect(drawing().axisAlignSheetTransform).toEqual(drawing().sheetTransform);
    assertNoGrid();
    expect(await bed.commandService.executeCommand(UndoCommand.id)).toBe(true);
    expect(drawing().transform).toEqual(initial.transform);
    assertNoGrid();
    expect(await bed.commandService.executeCommand(RedoCommand.id)).toBe(true);
    expect(drawing()).toMatchObject(expected);
    assertNoGrid();
    const saved = bed.get(IResourceLoaderService).saveUnit<IWorkbookData>('test')!;
    expect(saved.resources.length).toBeGreaterThan(0);
    const restored = createSheetsDrawingTestBed(saved);
    onTestFinished(() => restored.univer.dispose());
    expect(restored.get(ISheetDrawingService).getDrawingByParam(search)).toEqual(drawing());
    expect(restored.get(SheetSkeletonService).ensureSkeleton('test', 'chart')).toBeUndefined();
    expect(restored.get(SheetSkeletonService).getSkeleton('test', 'grid')).toBeDefined();
});

it('retains GRID Position and Both command geometry with a real skeleton', async () => {
    const bed = createSheetsDrawingTestBed();
    onTestFinished(() => bed.univer.dispose());
    const marker = { row: 1, column: 1, rowOffset: 2, columnOffset: 3 };
    const drawing = {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId: 'grid-drawing',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: 'https://example.com/grid.png',
        sheetTransform: { from: marker, to: { ...marker, row: 3, column: 3 } },
        axisAlignSheetTransform: { from: marker, to: { ...marker, row: 3, column: 3 } },
    };
    expect(await bed.commandService.executeCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [drawing] })).toBe(true);
    const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');
    expect(skeleton).toBeDefined();
    expect(await bed.commandService.executeCommand(SetSheetDrawingPlacementCommand.id, {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawings: [{ drawingId: 'grid-drawing', placement: {
            kind: SheetDrawingAnchorType.Position,
            from: marker,
            width: 50,
            height: 60,
        } }],
    })).toBe(true);
    const search = { unitId: 'test', subUnitId: 'sheet1', drawingId: 'grid-drawing' };
    expect(bed.get(ISheetDrawingService).getDrawingByParam(search)).toMatchObject({
        anchorType: SheetDrawingAnchorType.Position,
        sheetTransform: { from: marker },
        transform: { width: 50, height: 60 },
    });
    const to = { ...marker, row: 4, column: 5 };
    expect(await bed.commandService.executeCommand(SetSheetDrawingPlacementCommand.id, {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawings: [{ drawingId: 'grid-drawing', placement: {
            kind: SheetDrawingAnchorType.Both,
            from: marker,
            to,
        } }],
    })).toBe(true);
    const updated = bed.get(ISheetDrawingService).getDrawingByParam(search)!;
    expect(updated).toMatchObject({ anchorType: SheetDrawingAnchorType.Both, sheetTransform: { from: marker, to } });
    expect(updated.transform!.width).toBeGreaterThan(50);
    expect(updated.transform!.height).toBeGreaterThan(60);
    expect(bed.get(SheetSkeletonService).getSkeleton('test', 'sheet1')).toBe(skeleton);
});
