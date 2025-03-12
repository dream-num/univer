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

import type { IDrawingSearch, Nullable } from '@univerjs/core';
import type { IDocFloatDom } from '@univerjs/docs-drawing';
import type { BaseObject, IRender, Rect } from '@univerjs/engine-render';
import { Disposable, DrawingTypeEnum, Inject, toDisposable } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';

function calcDocFloatDomPosition(
    object: BaseObject,
    renderUnit: IRender
) {}

export class DocFloatDomController extends Disposable {
    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(DrawingRenderService) private readonly _drawingRenderService: DrawingRenderService
    ) {
        super();

        this._initialize();
    }

    override dispose(): void {
        super.dispose();
    }

    private _initialize() {
        this._drawingAddListener();
        this._imageUpdateListener();
    }

    private _getSceneAndTransformerByDrawingSearch(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const renderObject = this._renderManagerService.getRenderById(unitId);

        const scene = renderObject?.scene;

        if (scene == null) {
            return null;
        }

        const transformer = scene.getTransformerByCreate();

        return { scene, transformer };
    }

    private _drawingAddListener() {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((params) => {
                this._insertRects(params);
            })
        );
    }

    private _insertRects(params: IDrawingSearch[]) {
        (params).forEach(async (param) => {
            const { unitId } = param;
            const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

            if (renderObject == null) {
                return;
            }

            const imageParam = this._drawingManagerService.getDrawingByParam(param) as IDocFloatDom;
            if (imageParam == null) {
                return;
            }

            const images = await this._drawingRenderService.renderFloatDom(imageParam, renderObject.scene);

            if (images == null || images.length === 0) {
                return;
            }

            for (const image of images) {
                this._addHoverForRect(image);
            }
        });
    }

    private _imageUpdateListener() {
        this.disposeWithMe(
            this._drawingManagerService.update$.subscribe((params) => {
                (params).forEach((param) => {
                    const { unitId, subUnitId, drawingId } = param;

                    const drawingParam = this._drawingManagerService.getDrawingByParam(param) as IDocFloatDom;

                    if (drawingParam == null) {
                        return;
                    }

                    const { transform, drawingType } = drawingParam;

                    if (drawingType !== DrawingTypeEnum.DRAWING_IMAGE) {
                        return;
                    }

                    const renderObject = this._getSceneAndTransformerByDrawingSearch(unitId);

                    if (renderObject == null) {
                        return;
                    }
                    const { scene } = renderObject;

                    if (transform == null) {
                        return true;
                    }

                    const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId });

                    const imageShape = scene.getObject(drawingShapeKey) as Rect;

                    if (imageShape == null) {
                        return true;
                    }
                });
            })
        );
    }

    private _addHoverForRect(o: Rect) {
        this.disposeWithMe(
            toDisposable(
                o.onPointerEnter$.subscribeEvent(() => {
                    o.cursor = CURSOR_TYPE.GRAB;
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                o.onPointerLeave$.subscribeEvent(() => {
                    o.cursor = CURSOR_TYPE.DEFAULT;
                })
            )
        );
    }
}
