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

import type { Workbook } from '@univerjs/core';
import { BooleanNumber, Disposable, IUniverInstanceService, LifecycleService, LifecycleStages, OnLifecycle, PositionedObjectLayoutType, Tools, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IDrawingSearch } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { type DocumentSkeleton, type IRenderContext, IRenderManagerService, type IRenderModule, type Spreadsheet } from '@univerjs/engine-render';
import { filter } from 'rxjs';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';

@OnLifecycle(LifecycleStages.Rendered, SheetCellDrawingUpdateController)
export class SheetCellDrawingUpdateController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(LifecycleService) private _lifecycleService: LifecycleService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._drawingAddListener();
        this._cellRenderListener();
    }

    private _drawingAddListener() {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((params) => {
                this._addDrawingToWorkBook(params);
            })
        );
    }

    private _addDrawingToWorkBook(params: IDrawingSearch[]) {
        const { unitId, subUnitId } = this._getUnitInfo() ?? {};
        if (unitId == null || subUnitId == null) {
            return;
        }

        const data = this._drawingManagerService.getDrawingData(unitId, subUnitId);
        const order = this._drawingManagerService.getDrawingOrder(unitId, subUnitId);
        for (const param of params) {
            const drawing = this._drawingManagerService.getDrawingByParam(param);

            if (drawing == null || drawing.unitId !== '__defaultDocumentZenEditorSpecialUnitId_20231218__') {
                continue;
            }

            if (data[drawing.drawingId] == null) {
                data[drawing.drawingId] = {
                    ...Tools.deepClone(drawing),
                    unitId,
                    subUnitId,
                };
            }

            if (order.indexOf(drawing.drawingId) < 0) {
                order.push(drawing.drawingId);
            }
        }

        this._drawingManagerService.setDrawingData(unitId, subUnitId, data);
        this._drawingManagerService.setDrawingOrder(unitId, subUnitId, order);
    }

    private _cellRenderListener() {
        this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === LifecycleStages.Steady)).subscribe((stage) => {
            const { mainComponent } = this._context;
            const spreadsheet = mainComponent as Spreadsheet;

            spreadsheet.cellRender$.subscribe((params) => {
                const { docSkeleton, cellX, cellY } = params;
                this._refreshDrawing(docSkeleton, cellX, cellY);
            });
        });
    }

    private _refreshDrawing(skeleton: DocumentSkeleton, cellX: number, cellY: number) {
        const skeletonData = skeleton?.getSkeletonData();
        const { unitId, subUnitId } = this._getUnitInfo() ?? {};

        if (!skeletonData || unitId == null || subUnitId == null) {
            return;
        }

        const renderer = this._renderManagerService.getRenderById(unitId);
        const sheetSkeleton = renderer?.with(SheetSkeletonManagerService).getUnitSkeleton(unitId, subUnitId);
        if (sheetSkeleton == null) {
            return;
        }

        const { rowHeaderWidth, columnHeaderHeight } = sheetSkeleton.skeleton;
        const { pages } = skeletonData;
        const updateDrawings: any[] = []; // IFloatingObjectManagerParam

        const page = pages[0];
        const { skeDrawings, marginLeft, marginTop } = page;
            // cumPageLeft + = pageWidth + documents.pageMarginLeft;

        skeDrawings.forEach((drawing) => {
            const { aLeft, aTop, height, width, angle, drawingId, drawingOrigin } = drawing;
            const behindText = drawingOrigin.layoutType === PositionedObjectLayoutType.WRAP_NONE && drawingOrigin.behindDoc === BooleanNumber.TRUE;

            updateDrawings.push({
                unitId,
                subUnitId,
                drawingId,
                behindText,
                transform: {
                    left: aLeft + cellX + rowHeaderWidth + marginLeft,
                    top: aTop + cellY + columnHeaderHeight + marginTop,
                    width,
                    height,
                    angle,
                },
            });
        });

        // console.log(this._drawingManagerService);
        if (updateDrawings.length > 0) {
            this._drawingManagerService.addNotification(updateDrawings);
            this._drawingManagerService.refreshTransform(updateDrawings);
        }
    }

    private _getUnitInfo() {
        const universheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (universheet == null) {
            return;
        }

        const worksheet = universheet.getActiveSheet();
        if (worksheet == null) {
            return;
        }

        const unitId = universheet.getUnitId();
        const subUnitId = worksheet.getSheetId();

        return {
            unitId,
            subUnitId,
        };
    }
}
