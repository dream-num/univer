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

import type { IDrawingParam } from '@univerjs/core';
import type { IDocFloatDom } from '@univerjs/docs-drawing';
import type { IDocPrintContext } from '@univerjs/docs-ui';
import type { IImageData } from '@univerjs/drawing';
import { Disposable, DOC_DRAWING_PRINTING_COMPONENT_KEY, DrawingTypeEnum, Inject, Injector } from '@univerjs/core';
import { collectDocDrawings } from '@univerjs/docs-drawing';
import { DocPrintInterceptorService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager } from '@univerjs/ui';
import { mountDocPrintingFloatDom } from '../views/DocPrintingFloatDom';
import { DocDrawingTransformUpdateController } from './render-controllers/doc-drawing-transform-update.controller';

export class DocDrawingPrintingController extends Disposable {
    private readonly _projectedDrawings = new WeakMap<NonNullable<IDocPrintContext['pageOrigin']>, readonly IDrawingParam[]>();

    constructor(
        @Inject(DocPrintInterceptorService) private readonly _docPrintInterceptorService: DocPrintInterceptorService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(ComponentManager) private readonly _componetManager: ComponentManager,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this.disposeWithMe(this._docPrintInterceptorService.registerPrintPageDrawingResolver((context) => this._projectDrawings(context)));
        this._initPrinting();
        this._initPrintingDom();
    }

    private _projectDrawings({ unitId, skeleton, pageIndex, pageOrigin }: IDocPrintContext): readonly IDrawingParam[] | undefined {
        if (pageIndex == null || !pageOrigin) {
            return undefined;
        }
        const cached = this._projectedDrawings.get(pageOrigin);
        if (cached) {
            return cached;
        }
        const render = this._renderManagerService.getRenderUnitById(unitId);
        const controller = render?.with(DocDrawingTransformUpdateController);
        if (!controller) {
            return undefined;
        }

        const positions = controller.getPrintPageDrawingPositions(unitId, skeleton, pageIndex, pageOrigin);
        const { drawings, drawingsOrder } = collectDocDrawings(skeleton.getViewModel().getSnapshot());
        const runtime = this._drawingManagerService.getDrawingDataForUnit(unitId)?.[unitId]?.data;
        const result = drawingsOrder.filter((id) => positions[id] != null).map((id) => {
            const drawing = { ...drawings[id], ...runtime?.[id], ...positions[id] };
            return this._docPrintInterceptorService.getDrawingForPrint(skeleton, drawing);
        });
        this._projectedDrawings.set(pageOrigin, result);
        return result;
    }

    private _getDrawings(context: IDocPrintContext): readonly IDrawingParam[] {
        const projected = this._docPrintInterceptorService.getPrintPageDrawings(context);
        if (projected) {
            return projected;
        }
        const { skeleton, unitId, pageIndex } = context;
        const data = this._drawingManagerService.getDrawingDataForUnit(unitId)?.[unitId];
        const visible = this._docPrintInterceptorService.getPageDrawingIds(skeleton, pageIndex);
        return data?.order.filter((id) => !visible || visible.has(id))
            .map((id) => this._docPrintInterceptorService.getDrawingForPrint(skeleton, data.data[id])) ?? [];
    }

    private _initPrinting() {
        this.disposeWithMe(
            this._docPrintInterceptorService.interceptor.intercept(
                this._docPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT,
                {
                    handler: (_param, pos, next) => {
                        const { scene } = pos;
                        for (const drawing of this._getDrawings(pos)) {
                            if (drawing.drawingType !== DrawingTypeEnum.DRAWING_CHART && drawing.drawingType !== DrawingTypeEnum.DRAWING_DOM) {
                                const resource = this._drawingRenderService.renderImages(drawing as IImageData, scene, { interactive: false });
                                pos.waitForResource?.(resource);
                            }
                        }

                        return next();
                    },
                }
            )
        );
    }

    private _initPrintingDom() {
        this.disposeWithMe(
            this._docPrintInterceptorService.interceptor.intercept(
                this._docPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT,
                {
                    handler: (disposableCollection, pos, next) => {
                        const { unitId } = pos;
                        const floatDomInfos = this._getDrawings(pos).map((item) => {
                            const drawing = item as IDocFloatDom;
                            if (drawing.drawingType === DrawingTypeEnum.DRAWING_CHART) {
                                return {
                                    ...drawing,
                                    componentKey: this._componetManager.get(DOC_DRAWING_PRINTING_COMPONENT_KEY) as any,
                                };
                            }

                            if (drawing.drawingType === DrawingTypeEnum.DRAWING_DOM) {
                                const printingComponentKey = this._docPrintInterceptorService.getPrintComponent(drawing.componentKey);
                                return {
                                    ...drawing,
                                    componentKey: this._componetManager.get(printingComponentKey || drawing.componentKey) as any,
                                };
                            }
                            return null;
                        }).filter(Boolean) as IDocFloatDom[];
                        if (floatDomInfos.length > 0) {
                            const unmountPrintingFloatDom = mountDocPrintingFloatDom(
                                {
                                    unitId,
                                    floatDomInfos,
                                    scene: pos.scene,
                                    skeleton: pos.skeleton,
                                    offset: pos.offset,
                                    bound: pos.bound,
                                },
                                pos.root,
                                this._injector
                            );
                            disposableCollection?.add(() => {
                                unmountPrintingFloatDom();
                            });
                        }
                        return next(disposableCollection);
                    },
                }
            )
        );
    }
}
