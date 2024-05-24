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

import './extensions';

import type { Nullable, Observer } from '@univerjs/core';
import { CellValueType, HorizontalAlign, Observable, VerticalAlign, WrapStrategy } from '@univerjs/core';

import { calculateRectRotate, getRotateOffsetAndFarthestHypotenuse } from '../../basics/draw';
import type { IDocumentSkeletonCached, IDocumentSkeletonPage } from '../../basics/i-document-skeleton-cached';
import { LineType } from '../../basics/i-document-skeleton-cached';
import { degToRad } from '../../basics/tools';
import type { Transform } from '../../basics/transform';
import type { IViewportInfo } from '../../basics/vector2';
import { Vector2 } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import type { Scene } from '../../scene';
import type { IExtensionConfig } from '../extension';
import { DocumentsSpanAndLineExtensionRegistry } from '../extension';
import { VERTICAL_ROTATE_ANGLE } from '../../basics/text-rotation';
import { Liquid } from './liquid';
import type { IDocumentsConfig, IPageMarginLayout } from './doc-component';
import { DocComponent } from './doc-component';
import { DOCS_EXTENSION_TYPE } from './doc-extension';
import type { DocumentSkeleton } from './layout/doc-skeleton';

export interface IPageRenderConfig {
    page: IDocumentSkeletonPage;
    pageLeft: number;
    pageTop: number;
    ctx: UniverRenderingContext;
}

export interface IDocumentOffsetConfig extends IPageMarginLayout {
    docsLeft: number;
    docsTop: number;
    documentTransform: Transform;
}

export class Documents extends DocComponent {
    onPageRenderObservable = new Observable<IPageRenderConfig>();

    docsLeft: number = 0;

    docsTop: number = 0;

    private _drawLiquid: Liquid;

    private _findLiquid: Liquid;

    // private _hasEditor = false;

    // private _editor: Nullable<DocsEditor>;

    private _skeletonObserver: Nullable<Observer<IDocumentSkeletonCached>>;

    // private _textAngleRotateOffset: number = 0;

    constructor(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        super(oKey, documentSkeleton, config);

        this._drawLiquid = new Liquid();

        this._findLiquid = new Liquid();

        this._initialDefaultExtension();

        // this._addSkeletonChangeObserver(documentSkeleton);

        this.makeDirty(true);
    }

    static create(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        return new Documents(oKey, documentSkeleton, config);
    }

    override dispose() {
        super.dispose();

        this._skeletonObserver?.dispose();
        this._skeletonObserver = null;
        this.onPageRenderObservable.clear();
        this._drawLiquid = null as unknown as Liquid;
        this._findLiquid = null as unknown as Liquid;
    }

    getOffsetConfig(): IDocumentOffsetConfig {
        const {
            transform: documentTransform,
            pageLayoutType,
            pageMarginLeft,
            pageMarginTop,
            left: docsLeft,
            top: docsTop,
        } = this;

        return {
            documentTransform,
            pageLayoutType,
            pageMarginLeft,
            pageMarginTop,
            docsLeft,
            docsTop,
        };
    }

    // calculatePagePosition() {
    //     const scene = this.getScene() as Scene;

    //     const parent = scene?.getParent();
    //     const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = this;
    //     if (parent == null || docsWidth === Infinity || docsHeight === Infinity) {
    //         return this;
    //     }
    //     const { width: engineWidth, height: engineHeight } = parent;
    //     let docsLeft = 0;
    //     let docsTop = 0;

    //     let sceneWidth = 0;

    //     let sceneHeight = 0;

    //     if (engineWidth > docsWidth) {
    //         docsLeft = engineWidth / 2 - docsWidth / 2;
    //         sceneWidth = engineWidth - 30;
    //     } else {
    //         docsLeft = pageMarginLeft;
    //         sceneWidth = docsWidth + pageMarginLeft * 2;
    //     }

    //     if (engineHeight > docsHeight) {
    //         docsTop = engineHeight / 2 - docsHeight / 2;
    //         sceneHeight = engineHeight - 30;
    //     } else {
    //         docsTop = pageMarginTop;
    //         sceneHeight = docsHeight + pageMarginTop * 2;
    //     }

    //     this.docsLeft = docsLeft;

    //     this.docsTop = docsTop;

    //     scene.resize(sceneWidth, sceneHeight + 200);

    //     this.translate(docsLeft, docsTop);

    //     return this;
    // }

    override getEngine() {
        return (this.getScene() as Scene).getEngine();
    }

    override draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        const skeletonData = this.getSkeleton()?.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        this._drawLiquid.reset();

        const { pages } = skeletonData;
        const parentScale = this.getParentScale();
        // const scale = getScale(parentScale);
        const extensions = this.getExtensionsByOrder();

        for (const extension of extensions) {
            extension.clearCache();
        }

        const backgroundExtension = extensions.find((e) => e.uKey === 'DefaultDocsBackgroundExtension');
        const glyphExtensionsExcludeBackground = extensions.filter((e) => e.type === DOCS_EXTENSION_TYPE.SPAN && e.uKey !== 'DefaultDocsBackgroundExtension');

        // broadcasting the pageTop and pageLeft for each page in the document with multiple pages.
        let pageTop = 0;
        let pageLeft = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            const {
                sections,
                marginTop: pagePaddingTop = 0,
                marginBottom: pagePaddingBottom = 0,
                marginLeft: pagePaddingLeft = 0,
                marginRight: pagePaddingRight = 0,
                width: actualWidth,
                height: actualHeight,
                renderConfig = {},
            } = page;
            const {
                verticalAlign = VerticalAlign.TOP, // Do not make changes, otherwise the document will not render.
                horizontalAlign = HorizontalAlign.LEFT, // Do not make changes, otherwise the document will not render.
                centerAngle: centerAngleDeg = 0,
                vertexAngle: vertexAngleDeg = 0,
                wrapStrategy = WrapStrategy.UNSPECIFIED,
                cellValueType,
                // isRotateNonEastAsian = BooleanNumber.FALSE,
            } = renderConfig;

            const horizontalOffsetNoAngle = this._horizontalHandler(
                actualWidth,
                pagePaddingLeft,
                pagePaddingRight,
                horizontalAlign,
                vertexAngleDeg,
                centerAngleDeg,
                cellValueType
            );

            const verticalOffsetNoAngle = this._verticalHandler(
                actualHeight,
                pagePaddingTop,
                pagePaddingBottom,
                verticalAlign
            );

            const alignOffsetNoAngle = Vector2.create(horizontalOffsetNoAngle, verticalOffsetNoAngle);

            const centerAngle = degToRad(centerAngleDeg);

            const vertexAngle = degToRad(vertexAngleDeg);

            const finalAngle = vertexAngle - centerAngle;

            if (this.isSkipByDiffBounds(page, pageTop, pageLeft, bounds)) {
                const { x, y } = this._drawLiquid.translatePage(
                    page,
                    this.pageLayoutType,
                    this.pageMarginLeft,
                    this.pageMarginTop
                );
                pageLeft += x;
                pageTop += y;
                continue;
            }

            this.onPageRenderObservable.notifyObservers({
                page,
                pageLeft,
                pageTop,
                ctx,
            });

            this._startRotation(ctx, finalAngle);

            for (const section of sections) {
                const { columns } = section;

                this._drawLiquid.translateSection(section);

                for (const column of columns) {
                    const { lines, width: columnWidth } = column;

                    this._drawLiquid.translateSave();
                    this._drawLiquid.translateColumn(column);

                    const linesCount = lines.length;

                    let alignOffset = alignOffsetNoAngle;
                    let rotateTranslateXListApply = null;

                    if (vertexAngle !== 0) {
                        const {
                            rotateTranslateXList,
                            rotatedHeight,
                            rotatedWidth,
                            fixOffsetX,
                            fixOffsetY,
                            rotateTranslateY,
                        } = getRotateOffsetAndFarthestHypotenuse(lines, columnWidth, vertexAngle);

                        let exceedWidthFix = rotatedWidth;
                        if (rotatedHeight > this.height && wrapStrategy !== WrapStrategy.WRAP) {
                            if (wrapStrategy === WrapStrategy.OVERFLOW || vertexAngle > 0) {
                                exceedWidthFix = this.height / Math.tan(Math.abs(vertexAngle));
                            }
                        }

                        const horizontalOffset = this._horizontalHandler(
                            exceedWidthFix,
                            pagePaddingLeft,
                            pagePaddingRight,
                            horizontalAlign,
                            vertexAngleDeg,
                            centerAngleDeg
                        );

                        const verticalOffset = this._verticalHandler(
                            rotatedHeight,
                            pagePaddingTop,
                            pagePaddingBottom,
                            verticalAlign
                        );

                        let exceedHeightFix = verticalOffset - fixOffsetY;
                        if (rotatedHeight > this.height) {
                            if (vertexAngle < 0) {
                                exceedHeightFix = this.height - (rotatedHeight + fixOffsetY);
                            } else {
                                exceedHeightFix = -fixOffsetY;
                            }
                        }
                        alignOffset = Vector2.create(horizontalOffset + fixOffsetX, exceedHeightFix);

                        this._drawLiquid.translate(0, -rotateTranslateY);

                        rotateTranslateXListApply = rotateTranslateXList;
                    } else if (wrapStrategy === WrapStrategy.WRAP) {
                        alignOffset.x = pagePaddingLeft;
                    }

                    for (let i = 0; i < linesCount; i++) {
                        const line = lines[i];
                        const { divides, asc = 0, type, lineHeight = 0 } = line;

                        const maxLineAsc = asc;

                        const maxLineAscSin = maxLineAsc * Math.sin(centerAngle);
                        const maxLineAscCos = maxLineAsc * Math.cos(centerAngle);

                        if (type === LineType.BLOCK) {
                            for (const extension of extensions) {
                                if (extension.type === DOCS_EXTENSION_TYPE.LINE) {
                                    extension.extensionOffset = {
                                        alignOffset,
                                        renderConfig,
                                    };
                                    extension.draw(ctx, parentScale, line);
                                }
                            }
                        } else {
                            this._drawLiquid.translateSave();

                            this._drawLiquid.translateLine(line, true);
                            rotateTranslateXListApply && this._drawLiquid.translate(rotateTranslateXListApply[i]); // x axis offset

                            const divideLength = divides.length;

                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { glyphGroup } = divide;

                                this._drawLiquid.translateSave();
                                this._drawLiquid.translateDivide(divide);

                                // Draw text background.
                                for (const glyph of glyphGroup) {
                                    if (!glyph.content || glyph.content.length === 0) {
                                        continue;
                                    }

                                    const { width: spanWidth, left: spanLeft } = glyph;

                                    const { x: translateX, y: translateY } = this._drawLiquid;

                                    const originTranslate = Vector2.create(translateX, translateY);

                                    const centerPoint = Vector2.create(spanWidth / 2, lineHeight / 2);

                                    const spanStartPoint = calculateRectRotate(
                                        originTranslate.addByPoint(spanLeft, 0),
                                        centerPoint,
                                        centerAngle,
                                        vertexAngle,
                                        alignOffset
                                    );

                                    const extensionOffset: IExtensionConfig = {
                                        spanStartPoint,
                                    };

                                    if (backgroundExtension) {
                                        backgroundExtension.extensionOffset = extensionOffset;
                                        backgroundExtension.draw(ctx, parentScale, glyph);
                                    }
                                }

                                // Draw text\border\lines etc.
                                for (const glyph of glyphGroup) {
                                    if (!glyph.content || glyph.content.length === 0) {
                                        continue;
                                    }

                                    const { width: spanWidth, left: spanLeft, xOffset } = glyph;

                                    const { x: translateX, y: translateY } = this._drawLiquid;

                                    const originTranslate = Vector2.create(translateX, translateY);

                                    const centerPoint = Vector2.create(spanWidth / 2, lineHeight / 2);

                                    const spanStartPoint = calculateRectRotate(
                                        originTranslate.addByPoint(spanLeft + xOffset, 0),
                                        centerPoint,
                                        centerAngle,
                                        vertexAngle,
                                        alignOffset
                                    );

                                    const spanPointWithFont = calculateRectRotate(
                                        originTranslate.addByPoint(
                                            spanLeft + maxLineAscSin + xOffset,
                                            maxLineAscCos
                                        ),
                                        centerPoint,
                                        centerAngle,
                                        vertexAngle,
                                        alignOffset
                                    );

                                    const extensionOffset: IExtensionConfig = {
                                        originTranslate,
                                        spanStartPoint,
                                        spanPointWithFont,
                                        centerPoint,
                                        alignOffset,
                                        renderConfig,
                                    };

                                    for (const extension of glyphExtensionsExcludeBackground) {
                                        extension.extensionOffset = extensionOffset;
                                        extension.draw(ctx, parentScale, glyph);
                                    }
                                }

                                this._drawLiquid.translateRestore();
                            }
                            this._drawLiquid.translateRestore();
                        }
                    }

                    this._drawLiquid.translateRestore();
                }
            }

            this._resetRotation(ctx, finalAngle);

            const { x, y } = this._drawLiquid.translatePage(
                page,
                this.pageLayoutType,
                this.pageMarginLeft,
                this.pageMarginTop
            );
            pageLeft += x;
            pageTop += y;
        }
    }

    changeSkeleton(newSkeleton: DocumentSkeleton) {
        this.setSkeleton(newSkeleton);

        return this;
    }

    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        this.draw(ctx, bounds);
    }

    private _horizontalHandler(
        pageWidth: number,
        pagePaddingLeft: number,
        pagePaddingRight: number,
        horizontalAlign: HorizontalAlign,
        vertexAngleDeg: number = 0,
        centerAngleDeg: number = 0,
        cellValueType: Nullable<CellValueType>
    ) {
        /**
         * In Excel, if horizontal alignment is not specified,
         * rotated text aligns to the right when rotated downwards and aligns to the left when rotated upwards.
         */
        if (horizontalAlign === HorizontalAlign.UNSPECIFIED) {
            if (centerAngleDeg === VERTICAL_ROTATE_ANGLE && vertexAngleDeg === VERTICAL_ROTATE_ANGLE) {
                horizontalAlign = HorizontalAlign.CENTER;
            } else if ((vertexAngleDeg > 0 && vertexAngleDeg !== VERTICAL_ROTATE_ANGLE) || vertexAngleDeg === -VERTICAL_ROTATE_ANGLE) {
                /**
                 * https://github.com/dream-num/univer-pro/issues/334
                 */
                horizontalAlign = HorizontalAlign.RIGHT;
            } else {
                /**
                 * sheet cell type, In a spreadsheet cell, without any alignment settings applied,
                 * text should be left-aligned,
                 * numbers should be right-aligned,
                 * and Boolean values should be center-aligned.
                 */
                if (cellValueType === CellValueType.NUMBER) {
                    horizontalAlign = HorizontalAlign.RIGHT;
                } else if (cellValueType === CellValueType.BOOLEAN) {
                    horizontalAlign = HorizontalAlign.CENTER;
                } else {
                    horizontalAlign = HorizontalAlign.LEFT;
                }
            }
        }

        let offsetLeft = 0;
        if (horizontalAlign === HorizontalAlign.CENTER) {
            offsetLeft = (this.width - pageWidth) / 2;
        } else if (horizontalAlign === HorizontalAlign.RIGHT) {
            offsetLeft = this.width - pageWidth - pagePaddingRight;
        } else {
            offsetLeft = pagePaddingLeft;
        }

        return offsetLeft;
    }

    private _verticalHandler(
        pageHeight: number,
        pagePaddingTop: number,
        pagePaddingBottom: number,
        verticalAlign: VerticalAlign
    ) {
        let offsetTop = 0;
        if (verticalAlign === VerticalAlign.MIDDLE) {
            offsetTop = (this.height - pageHeight) / 2;
        } else if (verticalAlign === VerticalAlign.TOP) {
            offsetTop = pagePaddingTop;
        } else { // VerticalAlign.UNSPECIFIED follow the same rule as HorizontalAlign.BOTTOM.
            offsetTop = this.height - pageHeight - pagePaddingBottom;
        }

        return offsetTop;
    }

    private _startRotation(ctx: UniverRenderingContext, textAngle: number) {
        ctx.rotate(textAngle || 0);
    }

    private _resetRotation(ctx: UniverRenderingContext, textAngle: number) {
        ctx.rotate(-textAngle || 0);
    }

    private _initialDefaultExtension() {
        DocumentsSpanAndLineExtensionRegistry.getData().forEach((extension) => {
            this.register(extension);
        });
    }

    // private _addSkeletonChangeObserver(skeleton?: DocumentSkeleton) {
    //     if (!skeleton) {
    //         return;
    //     }

    //     this._skeletonObserver = skeleton.onRecalculateChangeObservable.add((data) => {
    //         const pages = data.pages;
    //         let width = 0;
    //         let height = 0;
    //         for (let i = 0, len = pages.length; i < len; i++) {
    //             const page = pages[i];
    //             const { pageWidth, pageHeight } = page;
    //             if (this.pageLayoutType === PageLayoutType.VERTICAL) {
    //                 height += pageHeight;
    //                 if (i !== len - 1) {
    //                     height += this.pageMarginTop;
    //                 }
    //                 width = Math.max(width, pageWidth);
    //             } else if (this.pageLayoutType === PageLayoutType.HORIZONTAL) {
    //                 width += pageWidth;
    //                 if (i !== len - 1) {
    //                     width += this.pageMarginLeft;
    //                 }
    //                 height = Math.max(height, pageHeight);
    //             }
    //         }

    //         this.resize(width, height);
    //         this.calculatePagePosition();
    //     });
    // }

    // private _disposeSkeletonChangeObserver(skeleton?: DocumentSkeleton) {
    //     if (!skeleton) {
    //         return;
    //     }
    //     skeleton.onRecalculateChangeObservable.remove(this._skeletonObserver);
    // }

    // private _getPageBoundingBox(page: IDocumentSkeletonPage) {
    //     const { pageWidth, pageHeight } = page;
    //     const { x: startX, y: startY } = this._findLiquid;

    //     let endX = -1;
    //     let endY = -1;
    //     if (this.pageLayoutType === PageLayoutType.VERTICAL) {
    //         endX = pageWidth;
    //         endY = startY + pageHeight;
    //     } else if (this.pageLayoutType === PageLayoutType.HORIZONTAL) {
    //         endX = startX + pageWidth;
    //         endY = pageHeight;
    //     }

    //     return {
    //         startX,
    //         startY,
    //         endX,
    //         endY,
    //     };
    // }

    // private _translatePage(page: IDocumentSkeletonPage) {
    //     this._findLiquid.translatePage(page, this.pageLayoutType, this.pageMarginLeft, this.pageMarginTop);
    // }
}
