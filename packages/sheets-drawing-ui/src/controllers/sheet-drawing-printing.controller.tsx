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

import type { IRange } from '@univerjs/core';
import type { IFloatDomData } from '@univerjs/sheets-drawing';
import type { IPrintingFloatDomProps } from '../views/printing-float-dom';
import { Disposable, DrawingTypeEnum, Inject, Injector, PRINT_CHART_COMPONENT_KEY, Tools } from '@univerjs/core';
import { render, unmount } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetPrintInterceptorService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ComponentManager, connectInjector } from '@univerjs/ui';
import { SheetCanvasFloatDomManagerService } from '../services/canvas-float-dom-manager.service';
import { PrintingFloatDom } from '../views/printing-float-dom';

export class SheetDrawingPrintingController extends Disposable {
    constructor(
        @Inject(SheetPrintInterceptorService) private readonly _sheetPrintInterceptorService: SheetPrintInterceptorService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetCanvasFloatDomManagerService) private readonly _canvasFloatDomManagerService: SheetCanvasFloatDomManagerService,
        @Inject(ComponentManager) private readonly _componetManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initPrinting();
        this._initPrintingDom();
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
                                const drawing = subUnitData.data[id];
                                if (drawing.drawingType !== DrawingTypeEnum.DRAWING_CHART && drawing.drawingType !== DrawingTypeEnum.DRAWING_DOM) {
                                    this._drawingRenderService.renderDrawing(drawing, scene);
                                }
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

                        const skeleton = renderer.with(SheetSkeletonManagerService).getSkeletonParam(subUnitId);
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
                        const data = subUnitData.order.map((key) => subUnitData.data[key]);
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

    private _initPrintingDom() {
        this.disposeWithMe(
            this._sheetPrintInterceptorService.interceptor.intercept(
                this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT,
                {
                    handler: (disposableCollection, pos, next) => {
                        const { unitId, subUnitId } = pos;
                        const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
                        const subUnitData = unitData?.[subUnitId];
                        if (subUnitData) {
                            const floatDomInfos = subUnitData.order.map((id) => {
                                const drawing = subUnitData.data[id] as IFloatDomData;
                                if (drawing.drawingType === DrawingTypeEnum.DRAWING_CHART) {
                                    return {
                                        ...drawing,
                                        componentKey: this._componetManager.get(PRINT_CHART_COMPONENT_KEY) as any,
                                    };
                                }

                                if (drawing.drawingType === DrawingTypeEnum.DRAWING_DOM) {
                                    const printingComponentKey = this._sheetPrintInterceptorService.getPrintComponent(drawing.componentKey);
                                    return {
                                        ...drawing,
                                        componentKey: this._componetManager.get(printingComponentKey || drawing.componentKey) as any,
                                    };
                                }

                                return null;
                            }).filter(Boolean) as IFloatDomData[];
                            const PrintingFloatDomInjector = connectInjector(PrintingFloatDom, this._injector) as React.ComponentType<IPrintingFloatDomProps>;

                            render(
                                <PrintingFloatDomInjector floatDomInfos={floatDomInfos} scene={pos.scene} skeleton={pos.skeleton} worksheet={pos.worksheet} />,
                                pos.root
                            );

                            disposableCollection?.add(() => {
                                unmount(pos.root);
                            });

                            return next(disposableCollection);
                        }
                    },
                }
            )
        );
    }
}
