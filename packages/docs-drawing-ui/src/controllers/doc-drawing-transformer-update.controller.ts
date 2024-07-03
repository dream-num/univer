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

import type { IDocDrawingBase, IDocDrawingPosition, Nullable } from '@univerjs/core';
import {
    Disposable, ICommandService, IUniverInstanceService, LifecycleStages, ObjectRelativeFromH, ObjectRelativeFromV,
    OnLifecycle, PositionedObjectLayoutType, throttle, toDisposable, Tools,
} from '@univerjs/core';
import { DocSkeletonManagerService, getDocObject } from '@univerjs/docs';
import { IDrawingManagerService } from '@univerjs/drawing';
import type { BaseObject, Documents, IDocumentSkeletonGlyph } from '@univerjs/engine-render';
import { getOneTextSelectionRange, IRenderManagerService, Liquid, NodePositionConvertToCursor } from '@univerjs/engine-render';
import type { IDrawingDocTransform } from '../commands/commands/update-doc-drawing.command';
import { IMoveInlineDrawingCommand, ITransformNonInlineDrawingCommand, UpdateDrawingDocTransformCommand } from '../commands/commands/update-doc-drawing.command';

interface IDrawingCache {
    drawing: IDocDrawingBase;
    top: number;
    left: number;
    width: number;
    height: number;
    angle: number;
}

interface IDrawingAnchor {
    offset: number;
    docTransform: IDocDrawingPosition;
}

// Listen doc drawing transformer change, and update drawing data.

@OnLifecycle(LifecycleStages.Rendered, DocDrawingTransformerController)
export class DocDrawingTransformerController extends Disposable {
    private _liquid = new Liquid();
    private _listenerOnImageMap = new Set();
    // Use to cache the drawings is under transforming or scaling.
    private _transformerCache: Map<string, IDrawingCache> = new Map();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._listenDrawingFocus();
    }

    private _listenDrawingFocus(): void {
        this.disposeWithMe(
            this._drawingManagerService.add$.subscribe((drawingParams) => {
                if (drawingParams.length === 0) {
                    return;
                }

                for (const drawingParam of drawingParams) {
                    const { unitId } = drawingParam;

                    if (!this._listenerOnImageMap.has(unitId)) {
                        this._listenTransformerChange(unitId);
                        this._listenerOnImageMap.add(unitId);
                    }
                }
            })
        );
    }

    // Only handle one drawing transformer change.

    // eslint-disable-next-line max-lines-per-function
    private _listenTransformerChange(unitId: string): void {
        const transformer = this._getSceneAndTransformerByDrawingSearch(unitId)?.transformer;

        if (transformer == null) {
            return;
        }

        this.disposeWithMe(
            toDisposable(
                transformer.changeStart$.subscribe((state) => {
                    this._transformerCache.clear();
                    const { objects } = state;

                    for (const object of objects.values()) {
                        const { oKey, width, height, left, top, angle } = object;
                        const drawing = this._drawingManagerService.getDrawingOKey(oKey);
                        if (drawing == null) {
                            continue;
                        }

                        const documentDataModel = this._univerInstanceService.getUniverDocInstance(drawing.unitId);
                        const drawingData = documentDataModel?.getSnapshot().drawings?.[drawing.drawingId];

                        if (drawingData != null) {
                            this._transformerCache.set(drawing.drawingId, {
                                drawing: drawingData,
                                top,
                                left,
                                width,
                                height,
                                angle,
                            });
                        }
                    }
                })
            )
        );

        const throttleMultipleDrawingUpdate = throttle(this._updateMultipleDrawingDocTransform.bind(this), 50);
        const throttleNonInlineMoveUpdate = throttle(this._nonInlineDrawingTransform.bind(this), 50);

        this.disposeWithMe(
            toDisposable(
                transformer.changing$.subscribe((state) => {
                    const { objects } = state;

                    if (objects.size > 1) {
                        throttleMultipleDrawingUpdate(objects);
                    } else if (objects.size === 1) {
                        const drawingCache: IDrawingCache = this._transformerCache.values().next().value;
                        const object: BaseObject = objects.values().next().value;
                        const { width, height, top, left, angle } = object;

                        if (
                            width === drawingCache.width &&
                            height === drawingCache.height &&
                            top === drawingCache.top &&
                            left === drawingCache.left &&
                            angle === drawingCache.angle
                        ) {
                            return;
                        }

                        if (drawingCache && drawingCache.drawing.layoutType !== PositionedObjectLayoutType.INLINE) {
                            throttleNonInlineMoveUpdate(drawingCache.drawing, object, true);
                        }
                    }
                })
            )
        );

        // Handle transformer mouseup.
        this.disposeWithMe(
            toDisposable(
                transformer.changeEnd$.subscribe((state) => {
                    const { objects } = state;
                    if (objects.size > 1) {
                        this._updateMultipleDrawingDocTransform(objects);
                    } else if (objects.size === 1) {
                        const drawingCache: IDrawingCache = this._transformerCache.values().next().value;
                        const object: BaseObject = objects.values().next().value;
                        const { width, height, top, left, angle } = object;

                        if (
                            width === drawingCache.width &&
                            height === drawingCache.height &&
                            top === drawingCache.top &&
                            left === drawingCache.left &&
                            angle === drawingCache.angle
                        ) {
                            return;
                        }

                        if (drawingCache && drawingCache.drawing.layoutType === PositionedObjectLayoutType.INLINE) {
                            // Handle inline drawing.

                            if (width !== drawingCache.width || height !== drawingCache.height || angle !== drawingCache.angle) {
                                this._updateDrawingSize(drawingCache, object);
                            } else {
                                this._moveInlineDrawing(drawingCache.drawing, object);
                            }
                        } else if (drawingCache) {
                            // Handle non-inline drawing.
                            this._nonInlineDrawingTransform(drawingCache.drawing, object);
                        }
                    }

                    this._transformerCache.clear();
                })
            )
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _updateMultipleDrawingDocTransform(objects: Map<string, BaseObject>): void {
        if (objects.size < 1) {
            return;
        }

        const drawings: IDrawingDocTransform[] = [];
        let unitId;
        let subUnitId;
        // The new position is calculated based on the offset.
        for (const object of objects.values()) {
            const { oKey, width, height, left, top, angle } = object;
            const drawing = this._drawingManagerService.getDrawingOKey(oKey);
            if (drawing == null) {
                continue;
            }

            if (unitId == null) {
                unitId = drawing.unitId;
            }

            if (subUnitId == null) {
                subUnitId = drawing.subUnitId;
            }

            const drawingCache = this._transformerCache.get(drawing.drawingId);

            if (drawingCache == null) {
                continue;
            }

            const { drawing: drawingData, top: oldTop, left: oldLeft, width: oldWidth, height: oldHeight, angle: oldAngle } = drawingCache;

            if (oldWidth !== width || oldHeight !== height) {
                drawings.push({
                    drawingId: drawing.drawingId,
                    key: 'size',
                    value: {
                        width,
                        height,
                    },
                });
            }

            if (oldAngle !== angle) {
                drawings.push({
                    drawingId: drawing.drawingId,
                    key: 'angle',
                    value: angle,
                });
            }

            if (oldTop !== top || oldLeft !== left) {
                const verticalDelta = top - oldTop;
                const horizontalDelta = left - oldLeft;

                if (verticalDelta !== 0) {
                    drawings.push({
                        drawingId: drawing.drawingId,
                        key: 'positionV',
                        value: {
                            relativeFrom: drawingData.docTransform.positionV.relativeFrom,
                            posOffset: drawingData.docTransform.positionV.posOffset! + verticalDelta,
                        },
                    });
                }

                if (horizontalDelta !== 0) {
                    drawings.push({
                        drawingId: drawing.drawingId,
                        key: 'positionH',
                        value: {
                            relativeFrom: drawingData.docTransform.positionH.relativeFrom,
                            posOffset: drawingData.docTransform.positionH.posOffset! + horizontalDelta,
                        },
                    });
                }
            }
        }

        if (drawings.length > 0 && unitId && subUnitId) {
            this._commandService.executeCommand(UpdateDrawingDocTransformCommand.id, {
                unitId,
                subUnitId,
                drawings,
            });
        }
    }

    // TODO: @JOCS, Use to draw and update the drawing anchor.
    private _updateDrawingAnchor(objects: Map<string, BaseObject>) {
        if (this._transformerCache.size !== 1) {
            return;
        }

        const drawingCache: IDrawingCache = this._transformerCache.values().next().value;
        const object = objects.values().next().value;

        const anchor = this._getDrawingAnchor(drawingCache.drawing, object);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _getDrawingAnchor(drawing: IDocDrawingBase, object: BaseObject, isInline = true): Nullable<IDrawingAnchor> {
        const skeleton = this._renderManagerSrv.getRenderById(drawing.unitId)
            ?.with(DocSkeletonManagerService).getSkeleton();
        const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
        const skeletonData = skeleton?.getSkeletonData();

        if (skeletonData == null || currentRender == null) {
            return;
        }

        const { mainComponent } = currentRender;
        const documentComponent = mainComponent as Documents;
        const { left: docsLeft, top: docsTop, pageLayoutType, pageMarginLeft, pageMarginTop } = documentComponent;

        this._liquid.reset();
        const { pages } = skeletonData;
        const { left, top, width, height, angle } = object;
        const { positionV, positionH } = drawing.docTransform;

        let glyphAnchor: Nullable<IDocumentSkeletonGlyph> = null;
        const docTransform = {
            ...drawing.docTransform,
            size: {
                width,
                height,
            },
            angle,
        };

        for (const page of pages) {
            this._liquid.translatePagePadding(page);
            const { sections } = page;

            for (const section of sections) {
                const { columns } = section;

                for (const column of columns) {
                    const { lines } = column;

                    for (const line of lines) {
                        const { top: lineTop, lineHeight } = line;
                        const { left: columnLeft, width } = column;

                        if (
                            left > columnLeft + this._liquid.x + docsLeft &&
                            left <= columnLeft + this._liquid.x + width + docsLeft &&
                            top > lineTop + this._liquid.y + docsTop &&
                            top <= lineTop + this._liquid.y + lineHeight + docsTop
                        ) {
                            const paragraphStartLine = lines.find((l) => l.paragraphIndex === line.paragraphIndex && l.paragraphStart) ?? lines[0];
                            if (paragraphStartLine == null) {
                                continue;
                            }

                            if (positionV.relativeFrom === ObjectRelativeFromV.LINE) {
                                glyphAnchor = line.divides[0].glyphGroup[0];
                            } else {
                                glyphAnchor = paragraphStartLine.divides[0].glyphGroup[0];
                            }

                            docTransform.positionH = {
                                relativeFrom: positionH.relativeFrom,
                                posOffset: left - this._liquid.x - docsLeft,
                            };

                            switch (positionH.relativeFrom) {
                                case ObjectRelativeFromH.MARGIN: {
                                    docTransform.positionH.posOffset = left - this._liquid.x - docsLeft - page.marginLeft;
                                    break;
                                }
                                case ObjectRelativeFromH.COLUMN: {
                                    docTransform.positionH.posOffset = left - this._liquid.x - docsLeft - columnLeft;
                                    break;
                                }
                            }

                            docTransform.positionV = {
                                relativeFrom: positionV.relativeFrom,
                                posOffset: top - this._liquid.y - docsTop,
                            };

                            switch (positionV.relativeFrom) {
                                case ObjectRelativeFromV.PAGE: {
                                    docTransform.positionV.posOffset = top - this._liquid.y - docsTop - page.marginTop;
                                    break;
                                }
                                case ObjectRelativeFromV.LINE: {
                                    docTransform.positionV.posOffset = top - this._liquid.y - docsTop - lineTop;
                                    break;
                                }
                                case ObjectRelativeFromV.PARAGRAPH: {
                                    docTransform.positionV.posOffset = top - this._liquid.y - docsTop - paragraphStartLine.top;
                                    break;
                                }
                            }
                        }

                        if (isInline) {
                            for (const divide of line.divides) {
                                const { glyphGroup } = divide;

                                for (const glyph of glyphGroup) {
                                    const { left: glyphLeft, width: glyphWidth } = glyph;
                                    if (
                                        left > glyphLeft + this._liquid.x + docsLeft &&
                                        left <= glyphLeft + this._liquid.x + glyphWidth + docsLeft &&
                                        top > lineTop + this._liquid.y + docsTop &&
                                        top <= lineTop + this._liquid.y + lineHeight + docsTop
                                    ) {
                                        glyphAnchor = glyph;
                                        break;
                                    }
                                }

                                if (glyphAnchor) {
                                    break;
                                }
                            }
                        }

                        if (glyphAnchor) {
                            break;
                        }
                    }

                    if (glyphAnchor) {
                        break;
                    }
                }

                if (glyphAnchor) {
                    break;
                }
            }

            this._liquid.restorePagePadding(page);
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        if (glyphAnchor == null) {
            return;
        }

        const nodePosition = skeleton?.findPositionByGlyph(glyphAnchor);

        const docObject = this._getDocObject();

        if (nodePosition == null || skeleton == null || docObject == null) {
            return;
        }

        const positionWithIsBack = {
            ...nodePosition,
            isBack: false,
        };

        const documentOffsetConfig = docObject.document.getOffsetConfig();
        const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
        const { cursorList } = convertor.getRangePointData(positionWithIsBack, positionWithIsBack);

        const { startOffset } = getOneTextSelectionRange(cursorList) ?? {};

        if (startOffset == null) {
            return;
        }

        // Put drawing before the anchor.
        return { offset: startOffset - 1, docTransform };
    }

    // Update drawing when use transformer to resize it.
    private _updateDrawingSize(drawingCache: IDrawingCache, object: BaseObject) {
        const drawings: IDrawingDocTransform[] = [];
        const { drawing, width: oldWidth, height: oldHeight, angle: oldAngle } = drawingCache;
        const { unitId, subUnitId } = drawing;
        const { width, height, angle } = object;

        if (width !== oldWidth || height !== oldHeight) {
            drawings.push({
                drawingId: drawing.drawingId,
                key: 'size',
                value: {
                    width,
                    height,
                },
            });
        }

        if (angle !== oldAngle) {
            drawings.push({
                drawingId: drawing.drawingId,
                key: 'angle',
                value: angle,
            });
        }

        if (drawings.length > 0 && unitId && subUnitId) {
            this._commandService.executeCommand(UpdateDrawingDocTransformCommand.id, {
                unitId,
                subUnitId,
                drawings,
            });
        }
    }

    // Update inline drawing when use transformer to move it.
    private _moveInlineDrawing(drawing: IDocDrawingBase, object: BaseObject) {
        const anchor = this._getDrawingAnchor(drawing, object);
        const { offset } = anchor ?? {};
        if (offset == null) {
            return;
        }

        return this._commandService.executeCommand(IMoveInlineDrawingCommand.id, {
            unitId: drawing.unitId,
            subUnitId: drawing.unitId,
            drawing,
            offset,
        });
    }

    // Limit the drawing to the page area, mainly in the vertical direction,
    // and the upper and lower limits cannot exceed the page margin area.
    private _limitDrawingInPage(drawing: IDocDrawingBase, object: BaseObject) {
        const { left, top, width, height, angle } = object;
        const skeleton = this._renderManagerSrv.getRenderById(drawing.unitId)
            ?.with(DocSkeletonManagerService).getSkeleton();
        const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
        const skeletonData = skeleton?.getSkeletonData();
        const { pages } = skeletonData ?? {};

        if (skeletonData == null || currentRender == null || pages == null) {
            return {
                left,
                top,
                width,
                height,
                angle,
            };
        }

        const { mainComponent } = currentRender;
        const documentComponent = mainComponent as Documents;
        const { top: docsTop, pageLayoutType, pageMarginLeft, pageMarginTop } = documentComponent;
        let newTop = top;
        this._liquid.reset();

        for (const page of pages) {
            // this._liquid.translatePagePadding(page);
            const { marginBottom, pageHeight } = page;
            const index = pages.indexOf(page);
            const nextPage = pages[index + 1];

            if (nextPage == null) {
                continue;
            }

            // Determines whether the image is between two pages, spanning two pages,
            // but does not belong entirely to a page
            const isBetweenPages = Tools.hasIntersectionBetweenTwoRanges(
                top,
                top + height,
                this._liquid.y + docsTop + pageHeight - marginBottom,
                this._liquid.y + docsTop + pageHeight + pageMarginTop + nextPage.marginTop
            );

            if (isBetweenPages) {
                const drawingVMiddle = top + height / 2;
                const pagesMiddle = this._liquid.y + docsTop + pageHeight + pageMarginTop / 2;

                if (drawingVMiddle < pagesMiddle) {
                    newTop = Math.min(top, this._liquid.y + docsTop + pageHeight - marginBottom - height);
                } else {
                    newTop = Math.max(top, this._liquid.y + docsTop + pageHeight + pageMarginTop + nextPage.marginTop);
                }
            }

            // this._liquid.restorePagePadding(page);
            this._liquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        return {
            left,
            top: newTop,
            width,
            height,
            angle,
        };
    }

    private _nonInlineDrawingTransform(drawing: IDocDrawingBase, object: BaseObject, isMoving = false) {
        const objectPosition = this._limitDrawingInPage(drawing, object);

        if (isMoving && objectPosition.top !== object.top) {
            return;
        }

        const anchor = this._getDrawingAnchor(drawing, objectPosition as BaseObject, false);
        const { offset, docTransform } = anchor ?? {};
        if (offset == null || docTransform == null) {
            return;
        }

        return this._commandService.executeCommand(ITransformNonInlineDrawingCommand.id, {
            unitId: drawing.unitId,
            subUnitId: drawing.unitId,
            drawing,
            offset,
            docTransform,
        });
    }

    private _getSceneAndTransformerByDrawingSearch(unitId: Nullable<string>) {
        if (unitId == null) {
            return;
        }

        const renderObject = this._renderManagerService.getRenderById(unitId);

        const scene = renderObject?.scene;

        if (scene == null) {
            return;
        }

        const transformer = scene.getTransformerByCreate();

        return { scene, transformer };
    }

    private _getDocObject() {
        return getDocObject(this._univerInstanceService, this._renderManagerService);
    }
}
