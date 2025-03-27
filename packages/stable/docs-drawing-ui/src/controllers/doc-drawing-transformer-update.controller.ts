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

import type { IDocDrawingBase, IDocDrawingPosition, Nullable } from '@univerjs/core';
import type { BaseObject, Documents, IDocumentSkeletonGlyph, IDocumentSkeletonPage, Image, INodeSearch, IPoint, Viewport } from '@univerjs/engine-render';
import type { IDrawingDocTransform } from '../commands/commands/update-doc-drawing.command';
import {
    BooleanNumber,
    COLORS,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    throttle,
    toDisposable,
    Tools,
} from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DocSelectionRenderService, getAnchorBounding, getDocObject, getOneTextSelectionRange, NodePositionConvertToCursor, TEXT_RANGE_LAYER_INDEX } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DocumentSkeletonPageType, getColor, IRenderManagerService, Liquid, PageLayoutType, Rect, Vector2 } from '@univerjs/engine-render';
import { IMoveInlineDrawingCommand, ITransformNonInlineDrawingCommand, UpdateDrawingDocTransformCommand } from '../commands/commands/update-doc-drawing.command';

const INLINE_DRAWING_ANCHOR_KEY_PREFIX = '__InlineDrawingAnchor__';

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
    segmentId: string;
    segmentPage: number;
    docTransform?: IDocDrawingPosition;
    contentBoxPointGroup?: IPoint[][];
}

function isInTableCell(nodePosition: INodeSearch) {
    const { path } = nodePosition;

    return path.some((p) => p === 'cells');
}

// Listen doc drawing transformer change, and update drawing data.
export class DocDrawingTransformerController extends Disposable {
    private _liquid = new Liquid();
    private _listenerOnImageMap = new Set();
    // Use to cache the drawings is under transforming or scaling.
    private _transformerCache: Map<string, IDrawingCache> = new Map();
    private _anchorShape: Nullable<Rect>;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
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

                        if (drawingData?.layoutType === PositionedObjectLayoutType.INLINE) {
                            try {
                                (object as Image).setOpacity(0.2);
                            } catch (e) {
                            }
                        }

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
                    const { objects, offsetX, offsetY } = state;

                    if (objects.size > 1) {
                        throttleMultipleDrawingUpdate(objects);
                    } else if (objects.size === 1) {
                        const drawingCache: Nullable<IDrawingCache> = this._transformerCache.values().next().value;
                        const object: BaseObject = objects.values().next().value!;
                        const { width, height, top, left, angle } = object;

                        if (
                            drawingCache &&
                            width === drawingCache.width &&
                            height === drawingCache.height &&
                            top === drawingCache.top &&
                            left === drawingCache.left &&
                            angle === drawingCache.angle
                        ) {
                            return;
                        }

                        if (drawingCache && drawingCache.drawing.layoutType !== PositionedObjectLayoutType.INLINE) {
                            // throttleNonInlineMoveUpdate(drawingCache.drawing, object, true);
                        }

                        if (drawingCache && drawingCache.drawing.layoutType === PositionedObjectLayoutType.INLINE && offsetX != null && offsetY != null) {
                            this._updateInlineDrawingAnchor(drawingCache.drawing, offsetX, offsetY);
                        }
                    }
                })
            )
        );

        // Handle transformer mouseup.
        this.disposeWithMe(
            toDisposable(
                // eslint-disable-next-line complexity
                transformer.changeEnd$.subscribe((state) => {
                    const { objects, offsetX, offsetY } = state;

                    // Recovery the opacity of inline drawings.
                    for (const object of objects.values()) {
                        const drawing = this._drawingManagerService.getDrawingOKey(object.oKey);
                        if (drawing == null) {
                            continue;
                        }
                        const drawingCache = this._transformerCache.get(drawing?.drawingId);

                        if (drawingCache?.drawing.layoutType === PositionedObjectLayoutType.INLINE) {
                            try {
                                (object as Image).setOpacity(1);
                            } catch (e) {
                            }
                        }
                    }

                    if (this._anchorShape) {
                        this._anchorShape.hide();
                    }

                    if (objects.size > 1) {
                        this._updateMultipleDrawingDocTransform(objects);
                    } else if (objects.size === 1) {
                        const drawingCache: Nullable<IDrawingCache> = this._transformerCache.values().next().value;
                        const object: BaseObject = objects.values().next().value!;
                        const { width, height, top, left, angle } = object;

                        if (
                            drawingCache &&
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
                            } else if (offsetX != null && offsetY != null) {
                                this._moveInlineDrawing(drawingCache.drawing, offsetX, offsetY);
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
            const { oKey, left, top, angle } = object;
            let { width, height } = object;
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

            const { width: maxWidth, height: maxHeight } = this._getPageContentSize(drawingData);

            // Drawing's width and height should not exceed the page's width and height.
            width = Math.min(width, maxWidth);
            height = Math.min(height, maxHeight);

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

        const drawingCache: IDrawingCache = this._transformerCache.values().next().value!;
        const object = objects.values().next().value!;

        const anchor = this._getDrawingAnchor(drawingCache.drawing, object);
    }

    private _updateInlineDrawingAnchor(drawing: IDocDrawingBase, offsetX: number, offsetY: number) {
        if (this._transformerCache.size !== 1) {
            return;
        }

        const { contentBoxPointGroup } = this._getInlineDrawingAnchor(drawing, offsetX, offsetY) ?? {};

        if (contentBoxPointGroup == null) {
            return;
        }

        this._createOrUpdateInlineAnchor(drawing.unitId, contentBoxPointGroup);
    }

    private _getInlineDrawingAnchor(drawing: IDocDrawingBase, offsetX: number, offsetY: number): Nullable<IDrawingAnchor> {
        const currentRender = this._renderManagerService.getRenderById(drawing.unitId);

        const skeleton = currentRender?.with(DocSkeletonManagerService).getSkeleton();

        if (currentRender == null) {
            return;
        }

        const { mainComponent, scene } = currentRender;
        const documentComponent = mainComponent as Documents;
        const activeViewport = scene.getViewports()[0];
        const {
            pageLayoutType = PageLayoutType.VERTICAL,
            pageMarginLeft,
            pageMarginTop,
        } = documentComponent.getOffsetConfig();
        let glyphAnchor: Nullable<IDocumentSkeletonGlyph> = null;
        let isBack = false;
        let segmentPageIndex = -1;
        let segmentId = '';
        const HALF = 0.5;
        const coord = this._getTransformCoordForDocumentOffset(documentComponent, activeViewport, offsetX, offsetY);
        if (coord == null) {
            return;
        }

        const docSelectionRenderService = this._renderManagerService.getRenderById(drawing.unitId)?.with(DocSelectionRenderService);

        if (docSelectionRenderService == null) {
            return;
        }

        const nodeInfo = skeleton?.findNodeByCoord(coord, pageLayoutType, pageMarginLeft, pageMarginTop, {
            strict: false,
            segmentId: docSelectionRenderService.getSegment(),
            segmentPage: docSelectionRenderService.getSegmentPage(),
        });
        if (nodeInfo) {
            const { node, ratioX, segmentPage, segmentId: nodeSegmentId } = nodeInfo;
            isBack = ratioX < HALF;
            glyphAnchor = node;
            segmentPageIndex = segmentPage;
            segmentId = nodeSegmentId;
        }

        if (glyphAnchor == null) {
            return;
        }

        const nodePosition = skeleton?.findPositionByGlyph(glyphAnchor, segmentPageIndex);
        const docObject = this._getDocObject();

        if (nodePosition == null || skeleton == null || docObject == null) {
            return;
        }

        // TODO: @JOCS, table cell do not support drawings now. so need to disable it.
        if (isInTableCell(nodePosition)) {
            return;
        }

        const positionWithIsBack = {
            ...nodePosition,
            isBack,
        };

        const documentOffsetConfig = docObject.document.getOffsetConfig();
        const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
        const { cursorList, contentBoxPointGroup } = convertor.getRangePointData(positionWithIsBack, positionWithIsBack);
        const { startOffset } = getOneTextSelectionRange(cursorList) ?? {};
        if (startOffset == null) {
            return;
        }

        // Put drawing before the anchor.
        return { offset: startOffset, contentBoxPointGroup, segmentId, segmentPage: segmentPageIndex };
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _getDrawingAnchor(drawing: IDocDrawingBase, object: BaseObject): Nullable<IDrawingAnchor> {
        const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
        const skeleton = currentRender?.with(DocSkeletonManagerService).getSkeleton();

        const skeletonData = skeleton?.getSkeletonData();
        if (skeletonData == null || currentRender == null) {
            return;
        }

        const { pages, skeHeaders, skeFooters } = skeletonData;

        const { mainComponent, scene } = currentRender;
        const documentComponent = mainComponent as Documents;
        const activeViewport = scene.getViewports()[0];
        const { pageLayoutType = PageLayoutType.VERTICAL, pageMarginLeft, pageMarginTop, docsLeft, docsTop } = documentComponent.getOffsetConfig();
        const { left, top, angle } = object;
        let { width, height } = object;
        const { positionV, positionH } = drawing.docTransform;

        const { width: maxWidth, height: maxHeight } = this._getPageContentSize(drawing);

        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);

        let glyphAnchor: Nullable<IDocumentSkeletonGlyph> = null;
        let segmentId = '';
        let segmentPage = -1;
        const isBack = false;
        const docTransform = {
            ...drawing.docTransform,
            size: {
                width,
                height,
            },
            angle,
        };

        const { x, y } = scene.getViewportScrollXY(activeViewport);

        const coord = this._getTransformCoordForDocumentOffset(documentComponent, activeViewport, left - x, top - y);
        if (coord == null) {
            return;
        }

        const docSelectionRenderService = this._renderManagerService.getRenderById(drawing.unitId)?.with(DocSelectionRenderService);

        if (docSelectionRenderService == null) {
            return;
        }

        const nodeInfo = skeleton?.findNodeByCoord(coord, pageLayoutType, pageMarginLeft, pageMarginTop, {
            strict: false,
            segmentId: docSelectionRenderService.getSegment(),
            segmentPage: docSelectionRenderService.getSegmentPage(),
        });
        if (nodeInfo) {
            const { node, segmentPage: segmentPageIndex, segmentId: nodeSegmentId } = nodeInfo;
            glyphAnchor = node;
            segmentPage = segmentPageIndex;
            segmentId = nodeSegmentId;
        }

        if (glyphAnchor == null) {
            return;
        }

        const line = glyphAnchor.parent?.parent;
        const column = line?.parent;
        const paragraphStartLine = column?.lines.find((l) => l.paragraphIndex === line?.paragraphIndex && l.paragraphStart) ?? column?.lines[0];
        const page = column?.parent?.parent;

        if (line == null || column == null || paragraphStartLine == null || page == null) {
            return;
        }

        this._liquid.reset();

        const pageType = page.type;

        for (const p of pages) {
            const { headerId, footerId, pageHeight, pageWidth, marginLeft, marginBottom } = p;
            const pIndex = pages.indexOf(p);

            if (segmentPage > -1 && pIndex === segmentPage) {
                switch (pageType) {
                    case DocumentSkeletonPageType.HEADER: {
                        const headerSke = skeHeaders.get(headerId)?.get(pageWidth);

                        if (headerSke) {
                            this._liquid.translatePagePadding({
                                marginTop: headerSke.marginTop,
                                marginLeft,
                            } as IDocumentSkeletonPage);
                        } else {
                            throw new Error('header skeleton not found');
                        }

                        break;
                    }

                    case DocumentSkeletonPageType.FOOTER: {
                        const footerSke = skeFooters.get(footerId)?.get(pageWidth);

                        if (footerSke) {
                            this._liquid.translatePagePadding({
                                marginTop: pageHeight - marginBottom + footerSke.marginTop,
                                marginLeft,
                            } as IDocumentSkeletonPage);
                        } else {
                            throw new Error('footer skeleton not found');
                        }

                        break;
                    }
                }

                break;
            }

            this._liquid.translatePagePadding(p);
            if (p === page) {
                break;
            }

            this._liquid.restorePagePadding(p);
            this._liquid.translatePage(p, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        if (positionV.relativeFrom === ObjectRelativeFromV.LINE) {
            glyphAnchor = line.divides[0].glyphGroup[0];
        } else {
            glyphAnchor = paragraphStartLine.divides?.[0]?.glyphGroup?.[0] ?? glyphAnchor;
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
                docTransform.positionH.posOffset = left - this._liquid.x - docsLeft - column.left;
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
                docTransform.positionV.posOffset = top - this._liquid.y - docsTop - line.top;
                break;
            }
            case ObjectRelativeFromV.PARAGRAPH: {
                docTransform.positionV.posOffset = top - this._liquid.y - docsTop - paragraphStartLine.top;
                break;
            }
        }

        if (glyphAnchor == null) {
            return;
        }

        const nodePosition = skeleton?.findPositionByGlyph(glyphAnchor, segmentPage);
        const docObject = this._getDocObject();
        if (nodePosition == null || skeleton == null || docObject == null) {
            return;
        }

        // TODO: @JOCS, table cell do not support drawings now. so need to disable it.
        if (isInTableCell(nodePosition)) {
            return;
        }

        const positionWithIsBack = {
            ...nodePosition,
            isBack,
        };

        const documentOffsetConfig = docObject.document.getOffsetConfig();
        const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
        const { cursorList } = convertor.getRangePointData(positionWithIsBack, positionWithIsBack);
        const { startOffset } = getOneTextSelectionRange(cursorList) ?? {};

        if (startOffset == null) {
            return;
        }

        // Put drawing before the anchor.
        return { offset: startOffset, docTransform, segmentId, segmentPage };
    }

    // Update drawing when use transformer to resize it.
    private _updateDrawingSize(drawingCache: IDrawingCache, object: BaseObject) {
        const drawings: IDrawingDocTransform[] = [];
        const { drawing, width: oldWidth, height: oldHeight, angle: oldAngle } = drawingCache;
        const { unitId, subUnitId } = drawing;
        let { width, height, angle } = object;

        const { width: maxWidth, height: maxHeight } = this._getPageContentSize(drawing);

        width = Math.min(maxWidth, width);
        height = Math.min(maxHeight, height);

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
    private _moveInlineDrawing(drawing: IDocDrawingBase, offsetX: number, offsetY: number) {
        const anchor = this._getInlineDrawingAnchor(drawing, offsetX, offsetY);
        const { offset, segmentId, segmentPage } = anchor ?? {};

        return this._commandService.executeCommand(IMoveInlineDrawingCommand.id, {
            unitId: drawing.unitId,
            subUnitId: drawing.unitId,
            drawing,
            offset,
            segmentId,
            segmentPage,
            needRefreshDrawings: offset == null,
        });
    }

    // Limit the drawing to the page area, mainly in the vertical direction,
    // and the upper and lower limits cannot exceed the page margin area.
    private _limitDrawingInPage(drawing: IDocDrawingBase, object: BaseObject) {
        const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
        const { left, top, width, height, angle } = object;
        const skeleton = currentRender?.with(DocSkeletonManagerService).getSkeleton();

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
        const objectPosition = drawing.isMultiTransform === BooleanNumber.TRUE ? object : this._limitDrawingInPage(drawing, object);

        if (isMoving && objectPosition.top !== object.top) {
            return;
        }

        const anchor = this._getDrawingAnchor(drawing, objectPosition as BaseObject);
        const { offset, docTransform, segmentId, segmentPage } = anchor ?? {};
        if (offset == null || docTransform == null) {
            // No need to change the anchor ,when the new anchor is not found. reuse the `_updateMultipleDrawingDocTransform` to modify the transform.
            return this._updateMultipleDrawingDocTransform(new Map([[drawing.drawingId, object]]));
        }

        return this._commandService.executeCommand(ITransformNonInlineDrawingCommand.id, {
            unitId: drawing.unitId,
            subUnitId: drawing.unitId,
            drawing,
            offset,
            docTransform,
            segmentId,
            segmentPage,
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

    private _getTransformCoordForDocumentOffset(document: Documents, viewport: Viewport, evtOffsetX: number, evtOffsetY: number) {
        const { documentTransform } = document.getOffsetConfig();
        const originCoord = viewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        if (!originCoord) {
            return;
        }

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _createOrUpdateInlineAnchor(unitId: string, pointsGroup: IPoint[][]) {
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (currentRender == null) {
            return;
        }
        const { mainComponent, scene } = currentRender;
        const documentComponent = mainComponent as Documents;
        const {
            docsLeft,
            docsTop,
        } = documentComponent.getOffsetConfig();
        const bounding = getAnchorBounding(pointsGroup);
        const { left: boundingLeft, top: boundingTop, height } = bounding;
        const left = boundingLeft + docsLeft;
        const top = boundingTop + docsTop;

        if (this._anchorShape) {
            this._anchorShape.transformByState({ left, top, height });
            this._anchorShape.show();

            return;
        }

        const ID_LENGTH = 6;

        const anchor = new Rect(INLINE_DRAWING_ANCHOR_KEY_PREFIX + Tools.generateRandomId(ID_LENGTH), {
            left,
            top,
            height,
            strokeWidth: 2,
            stroke: getColor(COLORS.darkGray, 1),
            evented: false,
        });

        this._anchorShape = anchor;

        scene.addObject(anchor, TEXT_RANGE_LAYER_INDEX);
    }

    private _getDocObject() {
        return getDocObject(this._univerInstanceService, this._renderManagerService);
    }

    private _getPageContentSize(drawing: IDocDrawingBase) {
        const currentRender = this._renderManagerService.getRenderById(drawing.unitId);
        const skeleton = currentRender?.with(DocSkeletonManagerService).getSkeleton();
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;

        const skeletonData = skeleton?.getSkeletonData();
        if (skeletonData == null || currentRender == null) {
            return {
                width: MAX_WIDTH,
                height: MAX_HEIGHT,
            };
        }

        // TODO: handle header footer image.
        const { pages } = skeletonData;

        let page: Nullable<IDocumentSkeletonPage> = null;

        for (const p of pages) {
            const { skeDrawings } = p;
            if (skeDrawings.has(drawing.drawingId)) {
                page = p;
                break;
            }
        }

        if (page) {
            const { pageWidth, pageHeight, marginLeft, marginBottom, marginRight, marginTop } = page;

            return {
                width: Math.max(MAX_WIDTH, pageWidth - marginLeft - marginRight),
                height: Math.max(MAX_HEIGHT, pageHeight - marginTop - marginBottom),
            };
        } else {
            return {
                width: MAX_WIDTH,
                height: MAX_HEIGHT,
            };
        }
    }
}
