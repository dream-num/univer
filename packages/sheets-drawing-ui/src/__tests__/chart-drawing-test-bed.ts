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

import type { Dependency, IWorkbookData } from '@univerjs/core';
import type { ISheetFloatDom } from '@univerjs/sheets-drawing';
import {
    DrawingTypeEnum,
    IResourceLoaderService,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    SheetTypes,
    UniverInstanceType,
} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingUpdateController } from '@univerjs/drawing-ui/controllers/drawing-update.controller.ts';
import { CanvasColorService, ICanvasColorService, IRenderManagerService } from '@univerjs/engine-render';
import { SetWorksheetActiveOperation, SheetSkeletonService } from '@univerjs/sheets';
import {
    applySheetDrawingPlacement,
    InsertSheetDrawingCommand,
    ISheetDrawingService,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';
import {
    HeaderFreezeRenderController,
    ISheetSelectionRenderService,
    SheetRenderController,
    SheetScrollManagerService,
    SheetSelectionRenderService,
    SheetSkeletonManagerService,
    SheetsRenderService,
} from '@univerjs/sheets-ui';
import {
    SheetSkeletonRenderController,
} from '@univerjs/sheets-ui/controllers/render-controllers/skeleton.render-controller.ts';
import {
    SheetsZoomRenderController,
} from '@univerjs/sheets-ui/controllers/render-controllers/zoom.render-controller.ts';
import {
    CanvasFloatDomService,
    DesktopLocalFileService,
    DesktopMessageService,
    ILocalFileService,
    IMessageService,
    IPlatformService,
    IShortcutService,
    IUIPartsService,
    IUIRuntimeScopeService,
    PlatformService,
    ShortcutService,
    UIPartsService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { onTestFinished, vi } from 'vitest';
import { MoveDrawingsCommand } from '../commands/commands/move-drawings.command';
import { SheetsDrawingRenderController } from '../controllers/render-controllers/sheet-drawing.render-controller';
import { SheetDrawingActiveRenderController } from '../controllers/sheet-drawing-active-render.controller';
import { SheetDrawingUpdateController } from '../controllers/sheet-drawing-update.controller';
import { SheetCanvasFloatDomManagerService } from '../services/canvas-float-dom-manager.service';
import { createSheetsDrawingUiTestBed } from './create-sheets-drawing-ui-test-bed';

export function createAbsoluteChart(drawingId = 'child', subUnitId = 'chart'): ISheetFloatDom {
    const marker = { row: 0, column: 0, rowOffset: 0, columnOffset: 0 };
    return applySheetDrawingPlacement({
        unitId: 'test',
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_CHART,
        componentKey: 'chart-test',
        data: { modelId: drawingId, custom: 'retained' },
        transform: { angle: 0, flipX: true, flipY: false, skewX: 3, skewY: 2 },
        sheetTransform: { from: marker, to: marker },
        axisAlignSheetTransform: { from: marker, to: marker },
    }, { kind: SheetDrawingAnchorType.None, left: 150, top: 120, width: 200, height: 140 });
}

export function createChartDrawingTestBed(snapshot?: IWorkbookData, initial?: ISheetFloatDom) {
    vi.useFakeTimers();
    onTestFinished(() => {
        vi.useRealTimers();
    });
    // Happy DOM provides no canvas backend; document, render, selection and drawing providers stay real.
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        return new Proxy({
            canvas: this,
            getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
            webkitBackingStorePixelRatio: 1,
            mozBackingStorePixelRatio: 1,
            msBackingStorePixelRatio: 1,
            oBackingStorePixelRatio: 1,
            backingStorePixelRatio: 1,
            measureText: (text: string) => ({ width: text.length * 7, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 3 }),
        }, { get: (target, key) => Reflect.get(target, key) ?? (() => {}) }) as unknown as CanvasRenderingContext2D;
    });
    onTestFinished(() => canvas.mockRestore());
    const dependencies: Dependency[] = [
        [ICanvasColorService, { useClass: CanvasColorService }],
        [IPlatformService, { useClass: PlatformService }],
        [IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }],
        [IShortcutService, { useClass: ShortcutService }],
        [ILocalFileService, { useClass: DesktopLocalFileService }],
        [IUIPartsService, { useClass: UIPartsService }],
        [IMessageService, { useClass: DesktopMessageService }],
        [SheetsRenderService],
        [CanvasFloatDomService],
        [SheetCanvasFloatDomManagerService],
        [DrawingUpdateController],
    ];
    const bed = createSheetsDrawingUiTestBed(snapshot ?? {
        id: 'test',
        name: 'Chart drawing',
        appVersion: 'test',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['chart', 'grid'],
        sheets: {
            chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, rowCount: 0, columnCount: 0 },
            grid: { id: 'grid', name: 'Grid', rowCount: 50, columnCount: 20, zoomRatio: 1.25, freeze: { startRow: 4, startColumn: 4, xSplit: 2, ySplit: 2 } },
        },
    }, dependencies, { skipAutoRender: true });
    onTestFinished(() => bed.univer.dispose());
    const manager = bed.get(SheetCanvasFloatDomManagerService);
    bed.get(DrawingUpdateController);
    if (initial) {
        bed.commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [initial] });
    }
    bed.commandService.registerCommand(MoveDrawingsCommand);
    const renders = bed.get(IRenderManagerService);
    const modules: Dependency[] = [
        [SheetSkeletonManagerService],
        [SheetRenderController],
        [SheetScrollManagerService],
        [SheetSkeletonRenderController],
        [HeaderFreezeRenderController],
        [SheetsZoomRenderController],
        [ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }],
        [SheetDrawingUpdateController],
        [SheetDrawingActiveRenderController],
        [SheetsDrawingRenderController],
    ];
    modules.forEach((dependency) => renders.registerRenderModule(UniverInstanceType.UNIVER_SHEET, dependency));
    const render = renders.createRender('test');
    render.engine.resizeBySize(800, 600);
    bed.get(LifecycleService).stage = LifecycleStages.Rendered;
    const skeletons = bed.get(SheetSkeletonService);
    const activate = (sheetId: string) => {
        const result = bed.commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: sheetId });
        if (!result) {
            throw new Error('Test sheet activation failed');
        }
        render.with(SheetSkeletonManagerService).setCurrent({ sheetId, commandId: SetWorksheetActiveOperation.id });
        vi.advanceTimersByTime(1);
    };
    return { ...bed, manager, render, renders, skeletons, activate, drawingManager: bed.get(IDrawingManagerService), drawings: bed.get(ISheetDrawingService), save: () => JSON.parse(JSON.stringify(bed.get(IResourceLoaderService).saveUnit<IWorkbookData>('test')!)) as IWorkbookData };
}
