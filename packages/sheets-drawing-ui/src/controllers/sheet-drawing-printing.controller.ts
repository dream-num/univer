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

import type { DisposableCollection, IRange, Worksheet } from '@univerjs/core';
import type { Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { IFloatDomData } from '@univerjs/sheets-drawing';
import type { SheetPrintingResourceCollector } from '@univerjs/sheets-ui';
import { Disposable, DrawingTypeEnum, Inject, Injector, Tools } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetPrintInterceptorService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ComponentManager } from '@univerjs/ui';
import { mountPrintingFloatDom } from '../views/PrintingFloatDom';

export class SheetDrawingPrintingController extends Disposable {
    constructor(
        @Inject(SheetPrintInterceptorService) private readonly _sheetPrintInterceptorService: SheetPrintInterceptorService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(ComponentManager) private readonly _componetManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initPrinting();
        this._initPrintingDom();
    }

    private _initPrinting() {
        const points = this._sheetPrintInterceptorService.interceptor.getInterceptPoints();
        this.disposeWithMe(this._sheetPrintInterceptorService.interceptor.intercept(points.PRINTING_COMPONENT_COLLECT, {
            handler: (_param, pos, next) => {
                this._addCanvasDrawings(pos);
                return next();
            },
        }));
        this.disposeWithMe(this._sheetPrintInterceptorService.interceptor.intercept(points.PRINTING_CHART_COMPONENT_COLLECT, {
            handler: (_param, pos, next) => {
                this._addCanvasDrawings(pos, true);
                return next();
            },
        }));

        this.disposeWithMe(
            this._sheetPrintInterceptorService.interceptor.intercept(
                this._sheetPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_RANGE,
                {
                    handler: (range, pos, next) => {
                        const { unitId, subUnitId } = pos;
                        const renderer = this._renderManagerService.getRenderUnitById(unitId);
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
                                if (!param.hidden && !param.groupId && param.transform && Tools.isDefine(param.transform.left) && Tools.isDefine(param.transform.top) && Tools.isDefine(param.transform.width) && Tools.isDefine(param.transform.height)) {
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

    private _addCanvasDrawings(context: {
        unitId: string;
        subUnitId: string;
        scene: Scene;
        resourceCollector: SheetPrintingResourceCollector;
    }, requireRenderedImage = false): void {
        const { unitId, subUnitId, scene, resourceCollector } = context;
        const subUnitData = this._drawingManagerService.getDrawingDataForUnit(unitId)?.[subUnitId];
        subUnitData?.order.forEach((id) => {
            const drawing = subUnitData.data[id];
            if (drawing.hidden || drawing.drawingType === DrawingTypeEnum.DRAWING_CHART ||
                drawing.drawingType === DrawingTypeEnum.DRAWING_DOM ||
                drawing.drawingType === DrawingTypeEnum.DRAWING_BLOCK) {
                return;
            }
            const resource = this._drawingRenderService.renderDrawing(drawing, scene, requireRenderedImage
                ? { allowInactiveSheet: true, requireRenderedImage: true, whenPageClosed: resourceCollector.whenClosed }
                : { allowInactiveSheet: true });
            if (resource) {
                if (requireRenderedImage) {
                    resourceCollector.add(Promise.resolve(resource), { required: true });
                } else {
                    resourceCollector.add(Promise.resolve(resource));
                }
            }
        });
    }

    private _initPrintingDom(): void {
        const points = this._sheetPrintInterceptorService.interceptor.getInterceptPoints();
        this.disposeWithMe(this._sheetPrintInterceptorService.interceptor.intercept(points.PRINTING_CHART_DOM_COLLECT, {
            handler: (collection, context, next) => {
                if (collection) {
                    this._addPrintingDom(collection, context);
                }
                return next(collection);
            },
        }));
        this.disposeWithMe(this._sheetPrintInterceptorService.interceptor.intercept(points.PRINTING_DOM_COLLECT, {
            handler: (collection, context, next) => {
                if (collection) {
                    this._addPrintingDom(collection, context);
                }
                return next(collection);
            },
        }));
    }

    private _addPrintingDom(collection: DisposableCollection, context: {
        unitId: string;
        subUnitId: string;
        scene: Scene;
        root: HTMLElement;
        worksheet: Worksheet;
        skeleton?: SpreadsheetSkeleton;
        resourceCollector: SheetPrintingResourceCollector;
    }): void {
        const data = this._drawingManagerService.getDrawingDataForUnit(context.unitId)?.[context.subUnitId];
        if (!data) {
            return;
        }
        const floatDomInfos = data.order.map((id) => {
            const drawing = data.data[id] as IFloatDomData;
            if (drawing.hidden || (drawing.drawingType !== DrawingTypeEnum.DRAWING_DOM
                && drawing.drawingType !== DrawingTypeEnum.DRAWING_BLOCK)) {
                return null;
            }
            const componentKey = this._sheetPrintInterceptorService.getPrintComponent(drawing.componentKey) || drawing.componentKey;
            if (!this._componetManager.get(componentKey)) {
                context.resourceCollector.add(Promise.reject(new Error(componentKey)), { required: !context.skeleton });
                return null;
            }
            return { ...drawing, componentKey };
        }).filter((drawing): drawing is IFloatDomData => drawing !== null);
        if (!floatDomInfos.length) {
            return;
        }
        // A separate container keeps delayed unmount from removing a newer preparation's DOM.
        const printingRoot = document.createElement('div');
        printingRoot.style.position = 'absolute';
        printingRoot.style.inset = '0';
        context.root.appendChild(printingRoot);
        let onRendered!: () => void;
        const rendered = new Promise<void>((resolve) => {
            onRendered = resolve;
        });
        let unmountPrintingFloatDom: (() => void) | undefined;
        collection.add(() => {
            printingRoot.remove();
            onRendered();
            if (unmountPrintingFloatDom) {
                queueMicrotask(unmountPrintingFloatDom);
            }
        });
        unmountPrintingFloatDom = mountPrintingFloatDom({
            floatDomInfos,
            scene: context.scene,
            skeleton: context.skeleton,
            worksheet: context.worksheet,
            onRendered,
        }, printingRoot, this._injector);
        context.resourceCollector.add(Promise.race([rendered, context.resourceCollector.whenClosed]), { required: true });
    }
}
