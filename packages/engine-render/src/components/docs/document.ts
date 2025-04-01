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

import type { IDocumentRenderConfig, IScale, ITableCellBorder, Nullable } from '@univerjs/core';

import type { IDocumentSkeletonGlyph, IDocumentSkeletonLine, IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable } from '../../basics/i-document-skeleton-cached';
import type { Transform } from '../../basics/transform';
import type { IBoundRectNoAngle, IViewportInfo } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import type { Scene } from '../../scene';
import type { ComponentExtension, IDrawInfo, IExtensionConfig } from '../extension';
import type { IDocumentsConfig, IPageMarginLayout } from './doc-component';
import type { DocumentSkeleton } from './layout/doc-skeleton';
import { CellValueType, HorizontalAlign, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { Subject } from 'rxjs';
import { BORDER_TYPE as BORDER_LTRB, drawLineByBorderType } from '../../basics';
import { calculateRectRotate, getRotateOffsetAndFarthestHypotenuse } from '../../basics/draw';
import { LineType } from '../../basics/i-document-skeleton-cached';
import { VERTICAL_ROTATE_ANGLE } from '../../basics/text-rotation';
import { degToRad } from '../../basics/tools';
import { Vector2 } from '../../basics/vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../extension';
import { DocComponent } from './doc-component';
import { DOCS_EXTENSION_TYPE } from './doc-extension';
import { Liquid } from './liquid';
import './extensions';

const DEFAULT_BORDER_COLOR: ITableCellBorder = {
    color: {
        rgb: '#dee0e3',
    },
};

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
    private readonly _pageRender$ = new Subject<IPageRenderConfig>();

    readonly pageRender$ = this._pageRender$.asObservable();

    private _drawLiquid: Nullable<Liquid> = new Liquid();

    constructor(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        super(oKey, documentSkeleton, config);

        this._initialDefaultExtension();

        this.makeDirty(true);
    }

    static create(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        return new Documents(oKey, documentSkeleton, config);
    }

    override dispose() {
        super.dispose();

        this._pageRender$.complete();
        this._drawLiquid = null;
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

    override getEngine() {
        return (this.getScene() as Scene).getEngine();
    }

    changeSkeleton(newSkeleton: DocumentSkeleton) {
        this.setSkeleton(newSkeleton);

        return this;
    }

    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        this.draw(ctx, bounds);
    }

    override draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        const skeletonData = this.getSkeleton()?.getSkeletonData();

        if (skeletonData == null || this._drawLiquid == null) {
            return;
        }

        this._drawLiquid.reset();

        const { pages, skeHeaders, skeFooters } = skeletonData;
        const parentScale = this.getParentScale();
        // const scale = getScale(parentScale);
        const extensions = this.getExtensionsByOrder();

        for (const extension of extensions) {
            extension.clearCache();
        }

        const backgroundExtension = extensions.find((e) => e.uKey === 'DefaultDocsBackgroundExtension');
        const glyphExtensionsExcludeBackground = extensions
            .filter((e) => e.type === DOCS_EXTENSION_TYPE.SPAN && e.uKey !== 'DefaultDocsBackgroundExtension');

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
                pageWidth,
                headerId,
                footerId,
                renderConfig = {},
                skeTables,
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

            if (skeTables.size > 0) {
                this._drawTable(
                    ctx,
                    page,
                    skeTables,
                    extensions,
                    backgroundExtension,
                    glyphExtensionsExcludeBackground,
                    alignOffsetNoAngle,
                    centerAngle,
                    vertexAngle,
                    renderConfig,
                    parentScale
                );
            }

            const headerSkeletonPage = skeHeaders.get(headerId)?.get(pageWidth);

            const headerAlignOffsetNoAngle = Vector2.create(
                horizontalOffsetNoAngle,
                headerSkeletonPage?.marginTop ?? 0
            );

            if (headerSkeletonPage) {
                this._drawHeaderFooter(
                    headerSkeletonPage,
                    ctx,
                    extensions,
                    backgroundExtension,
                    glyphExtensionsExcludeBackground,
                    headerAlignOffsetNoAngle,
                    centerAngle,
                    vertexAngle,
                    renderConfig,
                    parentScale,
                    page,
                    true
                );
            }

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
                    } else if (
                        wrapStrategy === WrapStrategy.WRAP
                        // Use fix: https://github.com/dream-num/univer-pro/issues/734
                        && (horizontalAlign !== HorizontalAlign.UNSPECIFIED || cellValueType !== CellValueType.NUMBER)
                    ) {
                        // @Jocs, Why reset alignOffset.x? When you know the reason, add a description
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
                            // let { x, y } = this._drawLiquid;
                            // x += horizontalOffsetNoAngle;
                            // y += verticalOffsetNoAngle + line.top;
                            // ctx.save();
                            // ctx.strokeStyle = 'rgb(245, 90, 34)';
                            // ctx.moveTo(x, y);
                            // ctx.lineTo(line.width ?? 0 + x, y);
                            // ctx.lineTo(line.width ?? 0 + x, lineHeight + y);
                            // ctx.lineTo(x, lineHeight + y);
                            // ctx.lineTo(x, y);
                            // ctx.stroke();
                            // ctx.restore();

                            this._drawLiquid.translateSave();
                            this._drawLiquid.translateLine(line, true, true);

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
                                        extension.draw(ctx, parentScale, glyph, [], {
                                            viewBound: bounds?.viewBound,
                                        } as IDrawInfo);
                                    }
                                }

                                this._drawLiquid.translateRestore();
                            }

                            if (line.borderBottom) {
                                this._drawBorderBottom(ctx, page, line);
                            }
                            this._drawLiquid.translateRestore();
                        }
                    }

                    this._drawLiquid.translateRestore();
                }
            }

            this._resetRotation(ctx, finalAngle);

            const footerSkeletonPage = skeFooters.get(footerId)?.get(pageWidth);

            if (footerSkeletonPage) {
                const footerAlignOffsetNoAngle = Vector2.create(
                    horizontalOffsetNoAngle,
                    page.pageHeight - footerSkeletonPage?.height - footerSkeletonPage.marginBottom
                );

                this._drawHeaderFooter(
                    footerSkeletonPage,
                    ctx,
                    extensions,
                    backgroundExtension,
                    glyphExtensionsExcludeBackground,
                    footerAlignOffsetNoAngle,
                    centerAngle,
                    vertexAngle,
                    renderConfig,
                    parentScale,
                    page,
                    false
                );
            }

            this._pageRender$.next({
                page,
                pageLeft,
                pageTop,
                ctx,
            });

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

    private _drawTable(
        ctx: UniverRenderingContext,
        page: IDocumentSkeletonPage,
        skeTables: Map<string, IDocumentSkeletonTable>,
        extensions: ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>[],
        backgroundExtension: Nullable<ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>>,
        glyphExtensionsExcludeBackground: ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>[],
        alignOffsetNoAngle: Vector2,
        centerAngle: number,
        vertexAngle: number,
        renderConfig: IDocumentRenderConfig,
        parentScale: IScale
    ) {
        for (const [_tableId, tableSkeleton] of skeTables) {
            const { top: tableTop, left: tableLeft, rows } = tableSkeleton;
            this._drawLiquid?.translateSave();
            this._drawLiquid?.translate(tableLeft, tableTop);

            for (const row of rows) {
                const { top: rowTop, cells } = row;
                this._drawLiquid?.translateSave();
                this._drawLiquid?.translate(0, rowTop);

                for (const cell of cells) {
                    const { left: cellLeft } = cell;
                    this._drawLiquid?.translateSave();
                    this._drawLiquid?.translate(cellLeft, 0);

                    this._drawTableCell(
                        ctx,
                        page,
                        cell,
                        extensions,
                        backgroundExtension,
                        glyphExtensionsExcludeBackground,
                        alignOffsetNoAngle,
                        centerAngle,
                        vertexAngle,
                        renderConfig,
                        parentScale
                    );

                    this._drawLiquid?.translateRestore();
                }

                this._drawLiquid?.translateRestore();
            }

            this._drawLiquid?.translateRestore();
        }
    }

    private _drawBorderBottom(
        ctx: UniverRenderingContext,
        page: IDocumentSkeletonPage,
        line: IDocumentSkeletonLine,
        left = 0,
        top = 0
    ) {
        if (this._drawLiquid == null) {
            return;
        }
        let { x, y } = this._drawLiquid;
        const { pageWidth, marginLeft, marginRight, marginTop } = page;

        x += marginLeft + (left ?? 0);
        y -= line.marginTop;
        y -= line.paddingTop;
        y += marginTop + top + line.lineHeight + (line.borderBottom?.padding ?? 0);

        ctx.save();
        ctx.setLineWidthByPrecision(1);
        ctx.strokeStyle = line.borderBottom?.color.rgb ?? '#CDD0D8';
        drawLineByBorderType(ctx, BORDER_LTRB.BOTTOM, 0, {
            startX: x,
            startY: y,
            endX: x + pageWidth - marginLeft - marginRight,
            endY: y,
        });
        ctx.restore();
    }

    // TODO: @JOCS, DRY!!!
    private _drawTableCell(
        ctx: UniverRenderingContext,
        page: IDocumentSkeletonPage,
        cell: IDocumentSkeletonPage,
        extensions: ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>[],
        backgroundExtension: Nullable<ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>>,
        glyphExtensionsExcludeBackground: ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>[],
        alignOffsetNoAngle: Vector2,
        centerAngle: number,
        vertexAngle: number,
        renderConfig: IDocumentRenderConfig,
        parentScale: IScale
    ) {
        if (this._drawLiquid == null) {
            return;
        }
        this._drawTableCellBordersAndBg(ctx, page, cell);
        const { sections, marginLeft, marginTop } = cell;

        // eslint-disable-next-line no-param-reassign
        alignOffsetNoAngle = Vector2.create(alignOffsetNoAngle.x + marginLeft, alignOffsetNoAngle.y + marginTop);

        ctx.save();
        const { x, y } = this._drawLiquid;
        const { pageWidth, pageHeight } = cell;
        ctx.beginPath();
        ctx.rectByPrecision(x + page.marginLeft, y + page.marginTop, pageWidth, pageHeight);
        ctx.closePath();
        ctx.clip();

        for (const section of sections) {
            const { columns } = section;

            this._drawLiquid.translateSave();
            this._drawLiquid.translateSection(section);

            for (const column of columns) {
                const { lines } = column;

                this._drawLiquid.translateSave();
                this._drawLiquid.translateColumn(column);

                const linesCount = lines.length;

                const alignOffset = alignOffsetNoAngle;

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
                        this._drawLiquid.translateLine(line, true, true);

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

                        if (line.borderBottom) {
                            this._drawBorderBottom(ctx, cell, line, page.marginLeft, page.marginTop);
                        }

                        this._drawLiquid.translateRestore();
                    }
                }

                this._drawLiquid.translateRestore();
            }

            this._drawLiquid.translateRestore();
        }

        ctx.restore();
    }

    private _drawTableCellBordersAndBg(
        ctx: UniverRenderingContext,
        page: IDocumentSkeletonPage,
        cell: IDocumentSkeletonPage
    ) {
        const { marginLeft, marginTop } = page;
        const { pageWidth, pageHeight } = cell;
        const rowSke = cell.parent as IDocumentSkeletonRow;
        const index = rowSke.cells.indexOf(cell);
        const cellSource = rowSke.rowSource.tableCells[index];

        const {
            borderTop = DEFAULT_BORDER_COLOR,
            borderBottom = DEFAULT_BORDER_COLOR,
            borderLeft = DEFAULT_BORDER_COLOR,
            borderRight = DEFAULT_BORDER_COLOR,
            backgroundColor,
        } = cellSource;

        if (this._drawLiquid == null) {
            return;
        }
        let { x, y } = this._drawLiquid;

        x += marginLeft;
        y += marginTop;

        // Draw cell bg.
        if (backgroundColor && backgroundColor.rgb) {
            ctx.save();
            ctx.fillStyle = backgroundColor.rgb;
            ctx.fillRectByPrecision(x, y, pageWidth, pageHeight);
            ctx.restore();
        }

        ctx.save();
        ctx.setLineWidthByPrecision (1);

        ctx.save();
        ctx.strokeStyle = borderLeft.color.rgb ?? DEFAULT_BORDER_COLOR.color.rgb!;
        drawLineByBorderType(ctx, BORDER_LTRB.LEFT, 0, {
            startX: x,
            startY: y,
            endX: x + pageWidth,
            endY: y + pageHeight,
        });
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = borderTop.color.rgb ?? DEFAULT_BORDER_COLOR.color.rgb!;
        drawLineByBorderType(ctx, BORDER_LTRB.TOP, 0, {
            startX: x,
            startY: y,
            endX: x + pageWidth,
            endY: y + pageHeight,
        });
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = borderRight.color.rgb ?? DEFAULT_BORDER_COLOR.color.rgb!;
        drawLineByBorderType(ctx, BORDER_LTRB.RIGHT, 0, {
            startX: x,
            startY: y,
            endX: x + pageWidth,
            endY: y + pageHeight,
        });
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = borderBottom.color.rgb ?? DEFAULT_BORDER_COLOR.color.rgb!;
        drawLineByBorderType(ctx, BORDER_LTRB.BOTTOM, 0, {
            startX: x,
            startY: y,
            endX: x + pageWidth,
            endY: y + pageHeight,
        });
        ctx.restore();

        // restore setLineWidthByPrecision.
        ctx.restore();
    }

    private _drawHeaderFooter(
        page: IDocumentSkeletonPage,
        ctx: UniverRenderingContext,
        extensions: ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>[],
        backgroundExtension: Nullable<ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>>,
        glyphExtensionsExcludeBackground: ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>[],
        alignOffsetNoAngle: Vector2,
        centerAngle: number,
        vertexAngle: number,
        renderConfig: IDocumentRenderConfig,
        parentScale: IScale,
        parentPage: IDocumentSkeletonPage,
        isHeader = true
    ) {
        if (this._drawLiquid == null) {
            return;
        }
        const { sections } = page;
        const { y: originY } = this._drawLiquid;

        for (const section of sections) {
            const { columns } = section;

            this._drawLiquid.translateSave();
            this._drawLiquid.translateSection(section);

            for (const column of columns) {
                const { lines } = column;

                this._drawLiquid.translateSave();
                this._drawLiquid.translateColumn(column);

                const linesCount = lines.length;

                const alignOffset = alignOffsetNoAngle;

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
                        this._drawLiquid.translateLine(line, true, true);
                        const { y } = this._drawLiquid;

                        if (isHeader) {
                            if ((y - originY + alignOffset.y) > (parentPage.pageHeight - 100) / 2) {
                                this._drawLiquid.translateRestore();
                                continue;
                            }
                        } else {
                            if ((y - originY + alignOffset.y + lineHeight) < (parentPage.pageHeight - 100) / 2 + 100) {
                                this._drawLiquid.translateRestore();
                                continue;
                            }
                        }

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

                        if (line.borderBottom) {
                            this._drawBorderBottom(ctx, page, line, parentPage.marginLeft);
                        }

                        this._drawLiquid.translateRestore();
                    }
                }

                this._drawLiquid.translateRestore();
            }

            this._drawLiquid.translateRestore();
        }
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
}
