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

import type { IDocFloatDom } from '@univerjs/docs-drawing';
import { Disposable, DOC_DRAWING_PRINTING_COMPONENT_KEY, DrawingTypeEnum, Inject, Injector } from '@univerjs/core';
import { DocPrintInterceptorService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { ComponentManager } from '@univerjs/ui';
import { mountDocPrintingFloatDom } from '../views/DocPrintingFloatDom';

export class DocDrawingPrintingController extends Disposable {
    constructor(
        @Inject(DocPrintInterceptorService) private readonly _docPrintInterceptorService: DocPrintInterceptorService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(ComponentManager) private readonly _componetManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initPrinting();
        this._initPrintingDom();
    }

    private _initPrinting() {
        this.disposeWithMe(
            this._docPrintInterceptorService.interceptor.intercept(
                this._docPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT,
                {
                    handler: (_param, pos, next) => {
                        const { unitId, scene } = pos;
                        const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
                        const subUnitData = unitData?.[unitId];
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
    }

    private _initPrintingDom() {
        this.disposeWithMe(
            this._docPrintInterceptorService.interceptor.intercept(
                this._docPrintInterceptorService.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT,
                {
                    handler: (disposableCollection, pos, next) => {
                        const { unitId } = pos;
                        const unitData = this._drawingManagerService.getDrawingDataForUnit(unitId);
                        const subUnitData = unitData?.[unitId];
                        if (subUnitData) {
                            const floatDomInfos = subUnitData.order.map((id) => {
                                const drawing = subUnitData.data[id] as IDocFloatDom;
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

                            return next(disposableCollection);
                        }
                    },
                }
            )
        );
    }
}
