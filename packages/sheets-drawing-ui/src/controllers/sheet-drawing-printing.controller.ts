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

import type { IRange } from '@univerjs/core';
import { Disposable, DrawingTypeEnum, Inject, Tools } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetPrintInterceptorService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export class SheetDrawingPrintingController extends Disposable {
    constructor(
        @Inject(SheetPrintInterceptorService) private readonly _sheetPrintInterceptorService: SheetPrintInterceptorService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initPrinting();
    }

    private _initPrinting() {
        this.disposeWithMe(
            this._sheetPrintInterceptorService.interceptor.intercept(
                this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT,
                {
                    handler: (_param, pos, next) => {
                        const { unitId, scene, subUnitId } = pos;
                        const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
                        const subUnitData = unitData?.[subUnitId];
                        if (subUnitData) {
                            subUnitData.order.forEach((id) => {
                                this._drawingRenderService.renderDrawing(subUnitData.data[id], scene);
                            });
                        }

                        return next();
                    },
                }
            )
        );

        this.disposeWithMe(
            this._sheetPrintInterceptorService.interceptor.intercept(
                this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_RANGE,
                {
                    handler: (range, pos, next) => {
                        const { unitId, subUnitId } = pos;
                        const renderer = this._renderManagerService.getRenderById(unitId);
                        if (!renderer) {
                            return next(range);
                        }

                        const skeleton = renderer.with(SheetSkeletonManagerService).getWorksheetSkeleton(subUnitId);
                        if (!skeleton) {
                            return next(range);
                        }
                        const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
                        const subUnitData = unitData?.[pos.subUnitId];
                        if (!subUnitData) {
                            return next(range);
                        }

                        const { scaleX, scaleY } = renderer.scene;
                        const newRange: IRange = range ? { ...range } : { startColumn: 0, endColumn: 0, endRow: 0, startRow: 0 };
                        const data = subUnitData.order.map((key) => subUnitData.data[key]).filter((item) => item.drawingType !== DrawingTypeEnum.DRAWING_DOM);
                        if (data.length) {
                            data.forEach((param) => {
                                if (!param.groupId && param.transform && Tools.isDefine(param.transform.left) && Tools.isDefine(param.transform.top) && Tools.isDefine(param.transform.width) && Tools.isDefine(param.transform.height)) {
                                    const start = skeleton.skeleton.getCellIndexByOffset(param.transform.left, param.transform.top, scaleX, scaleY, { x: 0, y: 0 });
                                    const end = skeleton.skeleton.getCellIndexByOffset(param.transform.left + param.transform.width, param.transform.top + param.transform.height, scaleX, scaleY, { x: 0, y: 0 });
                                    if (start.column < newRange.startColumn) {
                                        newRange.startColumn = start.column;
                                    }

                                    if (start.row < newRange.startRow) {
                                        newRange.startRow = start.row;
                                    }

                                    if (newRange.endRow < end.row) {
                                        newRange.endRow = end.row;
                                    }

                                    if (newRange.endColumn < end.column) {
                                        newRange.endColumn = end.column;
                                    }
                                }
                            });
                            return next(newRange);
                        }

                        return next(range);
                    },
                }
            )
        );
    }
}
