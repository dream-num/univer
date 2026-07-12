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

import type { DocumentFlavor, IDocumentRenderConfig, IScale, ITableCell, ITableCellBorder, Nullable } from '@univerjs/core';
import type {
    IDocumentSkeletonColumnGroup,
    IDocumentSkeletonColumnGroupColumn,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonTable,
} from '../../basics/i-document-skeleton-cached';
import type { Transform } from '../../basics/transform';
import type { IBoundRectNoAngle, IViewportInfo } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import type { Scene } from '../../scene';
import type { ComponentExtension, IDrawInfo, IExtensionConfig } from '../extension';
import type { IDocumentsConfig, IPageMarginLayout } from './doc-component';
import type { DocumentSkeleton } from './layout/doc-skeleton';
import type { IDocsTableRenderViewport } from './table-render-viewport';
import { CellValueType, DashStyleType, HorizontalAlign, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { Subject } from 'rxjs';
import { BORDER_TYPE as BORDER_LTRB, drawLineByBorderType } from '../../basics';
import { calculateRectRotate, getRotateOffsetAndFarthestHypotenuse } from '../../basics/draw';
import { LineType } from '../../basics/i-document-skeleton-cached';
import { VERTICAL_ROTATE_ANGLE } from '../../basics/text-rotation';
import { degToRad, fixLineWidthByScale } from '../../basics/tools';
import { Vector2 } from '../../basics/vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../extension';
import { DocComponent } from './doc-component';
import { DOCS_EXTENSION_TYPE } from './doc-extension';
import { getDocumentCompatibilityPolicy, shouldAllowImportedTableMarginOverflow } from './document-compatibility';
import { collectBackgroundGlyphRuns } from './extensions/background-runs';
import { getTableIdAndSliceIndex } from './layout/block/table';
import { Liquid } from './liquid';
import { getDocsTableRenderViewport, hasDocsTableHorizontalViewport } from './table-render-viewport';
import './extensions';

const DEFAULT_BORDER_COLOR: ITableCellBorder = {
    color: {
        rgb: '#c7c9cc',
    },
};
const TABLE_VIEWPORT_BORDER_CLIP_PADDING = 2;

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
                skeColumnGroups = new Map(),
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
            const isVertical = vertexAngleDeg === VERTICAL_ROTATE_ANGLE && centerAngleDeg === VERTICAL_ROTATE_ANGLE;
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

                    let rotatedHeightStore = 0;

                    if (vertexAngle !== 0) {
                        const {
                            rotateTranslateXList,
                            rotatedHeight,
                            rotatedWidth,
                            fixOffsetX,
                            fixOffsetY,
                            rotateTranslateY,
                        } = getRotateOffsetAndFarthestHypotenuse(lines, columnWidth, vertexAngle);

                        rotatedHeightStore = rotatedHeight;

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
                        if (rotatedHeight > this.height && !isVertical) {
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
                            this._drawLineBackground(ctx, page, line);

                            const divideLength = divides.length;

                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { glyphGroup } = divide;

                                this._drawLiquid.translateSave();
                                this._drawLiquid.translateDivide(divide, isVertical && wrapStrategy === WrapStrategy.WRAP, verticalAlign, rotatedHeightStore);

                                this._drawGlyphGroupBackgrounds(
                                    ctx,
                                    parentScale,
                                    glyphGroup,
                                    lineHeight,
                                    alignOffset,
                                    centerAngle,
                                    vertexAngle,
                                    backgroundExtension
                                );

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

            if (skeColumnGroups.size > 0) {
                this._drawColumnGroups(
                    ctx,
                    page,
                    skeColumnGroups,
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
        const drawLiquid = this._drawLiquid;
        if (drawLiquid == null) {
            return;
        }

        const renderUnitId = this._getRenderUnitId();

        for (const [tableId, tableSkeleton] of skeTables) {
            const { top: tableTop, left: tableLeft, rows } = tableSkeleton;
            const sourceTableId = getTableIdAndSliceIndex(tableId).tableId;
            const viewport = this._getTableViewport(page, tableSkeleton, renderUnitId, sourceTableId);
            drawLiquid.translateSave();
            drawLiquid.translate(tableLeft, tableTop);

            if (hasDocsTableHorizontalViewport(viewport)) {
                const { x, y } = drawLiquid;
                const clipLeft = x + page.marginLeft - (viewport.leadingInsetLeft ?? 0);
                ctx.save();
                ctx.beginPath();
                ctx.rectByPrecision(
                    clipLeft - TABLE_VIEWPORT_BORDER_CLIP_PADDING,
                    y + page.marginTop - TABLE_VIEWPORT_BORDER_CLIP_PADDING,
                    viewport.viewportWidth + TABLE_VIEWPORT_BORDER_CLIP_PADDING * 2,
                    tableSkeleton.height + TABLE_VIEWPORT_BORDER_CLIP_PADDING * 2
                );
                ctx.closePath();
                ctx.clip();
                drawLiquid.translate(-viewport.scrollLeft, 0);
            }

            this._drawTableCellBackgrounds(ctx, page, tableSkeleton);

            for (const row of rows) {
                const { top: rowTop, cells } = row;
                drawLiquid.translateSave();
                drawLiquid.translate(0, rowTop);

                for (const cell of cells) {
                    if ((cell as IDocumentSkeletonPage & { isMergedCellCovered?: boolean }).isMergedCellCovered) {
                        continue;
                    }

                    const { left: cellLeft } = cell;
                    drawLiquid.translateSave();
                    drawLiquid.translate(cellLeft, 0);

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

                    drawLiquid.translateRestore();
                }

                drawLiquid.translateRestore();
            }

            if (hasDocsTableHorizontalViewport(viewport)) {
                ctx.restore();
            }

            drawLiquid.translateRestore();
        }
    }

    private _drawColumnGroups(
        ctx: UniverRenderingContext,
        page: IDocumentSkeletonPage,
        skeColumnGroups: Map<string, IDocumentSkeletonColumnGroup>,
        extensions: ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>[],
        backgroundExtension: Nullable<ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>>,
        glyphExtensionsExcludeBackground: ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>[],
        alignOffsetNoAngle: Vector2,
        centerAngle: number,
        vertexAngle: number,
        renderConfig: IDocumentRenderConfig,
        parentScale: IScale
    ) {
        const drawLiquid = this._drawLiquid;
        if (drawLiquid == null) {
            return;
        }

        for (const columnGroup of skeColumnGroups.values()) {
            drawLiquid.translateSave();
            drawLiquid.translate(columnGroup.left, columnGroup.top);

            for (const column of columnGroup.columns) {
                drawLiquid.translateSave();
                drawLiquid.translate(column.left, column.top);
                this._drawNestedPageContent(
                    ctx,
                    page,
                    column.page,
                    extensions,
                    backgroundExtension,
                    glyphExtensionsExcludeBackground,
                    alignOffsetNoAngle,
                    centerAngle,
                    vertexAngle,
                    renderConfig,
                    parentScale
                );
                drawLiquid.translateRestore();
            }

            drawLiquid.translateRestore();
        }
    }

    private _drawTableCellBackgrounds(
        ctx: UniverRenderingContext,
        page: IDocumentSkeletonPage,
        tableSkeleton: IDocumentSkeletonTable
    ) {
        if (this._drawLiquid == null) {
            return;
        }

        const backgrounds = new Map<string, Array<{ x: number; y: number; width: number; height: number }>>();
        const tableX = this._drawLiquid.x + page.marginLeft;
        const tableY = this._drawLiquid.y + page.marginTop;

        for (const row of tableSkeleton.rows) {
            row.cells.forEach((cell, index) => {
                if ((cell as IDocumentSkeletonPage & { isMergedCellCovered?: boolean }).isMergedCellCovered) {
                    return;
                }

                const cellSource = row.rowSource.tableCells[index];
                if (!cellSource || cellSource.rowSpan === 0 || cellSource.columnSpan === 0) {
                    return;
                }

                const color = cellSource.backgroundColor?.rgb;
                if (!color) {
                    return;
                }

                const rects = backgrounds.get(color) ?? [];
                rects.push({
                    x: tableX + cell.left,
                    y: tableY + row.top,
                    width: cell.pageWidth,
                    height: cell.pageHeight,
                });
                backgrounds.set(color, rects);
            });
        }

        backgrounds.forEach((rects, color) => {
            ctx.save();
            ctx.fillStyle = color;
            ctx.beginPath();
            rects.forEach(({ x, y, width, height }) => {
                rectByPrecisionBounds(ctx, x, y, width, height);
            });
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        });
    }

    private _getTableViewport(
        page: IDocumentSkeletonPage,
        tableSkeleton: IDocumentSkeletonTable,
        unitId: string,
        tableId: string
    ): IDocsTableRenderViewport | null {
        const viewport = getDocsTableRenderViewport(unitId, tableId);
        if (viewport) {
            return viewport;
        }

        const { pageWidth, marginLeft = 0, marginRight = 0 } = page;
        if (!Number.isFinite(pageWidth)) {
            return null;
        }

        const compatibilityPolicy = this._getDocumentCompatibilityPolicy();
        const viewportWidth = shouldAllowImportedTableMarginOverflow(compatibilityPolicy, tableSkeleton.tableSource)
            ? Math.max(0, pageWidth - Math.max(0, marginLeft + tableSkeleton.left))
            : Math.max(0, pageWidth - marginLeft - marginRight - tableSkeleton.left);
        if (viewportWidth <= 0 || tableSkeleton.width <= viewportWidth) {
            return null;
        }

        return {
            contentWidth: tableSkeleton.width,
            scrollLeft: 0,
            viewportWidth,
        };
    }

    private _getRenderUnitId(): string {
        const skeleton = this.getSkeleton() as {
            getViewModel?: () => {
                getDataModel?: () => {
                    getUnitId?: () => string;
                };
            };
        } | undefined;
        const viewModel = skeleton?.getViewModel?.();
        const dataModel = viewModel?.getDataModel?.();

        return dataModel?.getUnitId?.() ?? this.oKey;
    }

    private _getDocumentCompatibilityPolicy() {
        const skeleton = this.getSkeleton() as {
            getViewModel?: () => {
                getSnapshot?: () => {
                    documentStyle?: {
                        documentFlavor?: DocumentFlavor;
                    };
                };
            };
        } | undefined;
        const documentFlavor = skeleton?.getViewModel?.()?.getSnapshot?.()?.documentStyle?.documentFlavor;

        return getDocumentCompatibilityPolicy(documentFlavor);
    }

    private _drawLineBackground(
        ctx: UniverRenderingContext,
        page: IDocumentSkeletonPage,
        line: IDocumentSkeletonLine,
        left = 0,
        top = 0
    ) {
        const color = line.backgroundColor?.rgb;
        if (!color || this._drawLiquid == null) {
            return;
        }

        let { x, y } = this._drawLiquid;
        const { pageWidth, marginLeft, marginRight, marginTop } = page;

        x += marginLeft + (left ?? 0);
        y -= line.marginTop;
        y -= line.paddingTop;
        y += marginTop + top;

        ctx.save();
        ctx.fillStyle = color;
        fillRectByPrecisionBounds(
            ctx,
            x,
            y,
            pageWidth - marginLeft - marginRight,
            line.lineHeight
        );
        ctx.restore();
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
        const border = line.borderBottom;
        ctx.setLineWidthByPrecision(Math.max(0, border?.width ?? 1));
        ctx.strokeStyle = border?.color.rgb ?? '#CDD0D8';
        setDocsBorderDash(ctx, border?.dashStyle);
        drawLineByBorderType(ctx, BORDER_LTRB.BOTTOM, 0, {
            startX: x,
            startY: y,
            endX: x + pageWidth - marginLeft - marginRight,
            endY: y,
        });
        ctx.restore();
    }

    private _drawGlyphGroupBackgrounds(
        ctx: UniverRenderingContext,
        parentScale: IScale,
        glyphGroup: IDocumentSkeletonGlyph[],
        lineHeight: number,
        alignOffset: Vector2,
        centerAngle: number,
        vertexAngle: number,
        backgroundExtension: Nullable<ComponentExtension<IDocumentSkeletonGlyph | IDocumentSkeletonLine, DOCS_EXTENSION_TYPE, IBoundRectNoAngle[]>>
    ) {
        if (!backgroundExtension || this._drawLiquid == null) {
            return;
        }

        const backgroundRuns = collectBackgroundGlyphRuns(glyphGroup);

        for (const backgroundRun of backgroundRuns) {
            const { glyph, left: spanLeft, width: spanWidth } = backgroundRun;
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

            backgroundExtension.extensionOffset = {
                spanStartPoint,
            };
            backgroundExtension.draw(ctx, parentScale, glyph);
        }
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
        this._drawTableCellBordersAndBg(ctx, page, cell, false);

        this._drawNestedPageContent(
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
    }

    private _drawNestedPageContent(
        ctx: UniverRenderingContext,
        parentPage: IDocumentSkeletonPage,
        nestedPage: IDocumentSkeletonPage,
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
        const { sections, marginLeft, marginTop, skeTables } = nestedPage;
        const alignOffset = Vector2.create(alignOffsetNoAngle.x + marginLeft, alignOffsetNoAngle.y + marginTop);

        ctx.save();
        const { x, y } = this._drawLiquid;
        const { pageWidth, pageHeight } = nestedPage;
        const clipOrigin = getNestedPageClipOrigin(parentPage, nestedPage, { x, y }, alignOffset);
        ctx.beginPath();
        ctx.rectByPrecision(clipOrigin.x, clipOrigin.y, pageWidth, pageHeight);
        ctx.closePath();
        ctx.clip();

        if (skeTables.size > 0) {
            if (isColumnGroupNestedPage(nestedPage)) {
                this._drawLiquid.translateSave();
                this._drawLiquid.translate(alignOffset.x, alignOffset.y);
                this._drawTable(
                    ctx,
                    {
                        ...nestedPage,
                        marginLeft: 0,
                        marginTop: 0,
                    },
                    skeTables,
                    extensions,
                    backgroundExtension,
                    glyphExtensionsExcludeBackground,
                    Vector2.create(0, 0),
                    centerAngle,
                    vertexAngle,
                    renderConfig,
                    parentScale
                );
                this._drawLiquid.translateRestore();
            } else {
                this._drawTable(
                    ctx,
                    nestedPage,
                    skeTables,
                    extensions,
                    backgroundExtension,
                    glyphExtensionsExcludeBackground,
                    alignOffset,
                    centerAngle,
                    vertexAngle,
                    renderConfig,
                    parentScale
                );
            }
        }

        for (const section of sections) {
            const { columns } = section;

            this._drawLiquid.translateSave();
            this._drawLiquid.translateSection(section);

            for (const column of columns) {
                const { lines } = column;

                this._drawLiquid.translateSave();
                this._drawLiquid.translateColumn(column);

                const linesCount = lines.length;

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
                        this._drawLineBackground(ctx, nestedPage, line);

                        const divideLength = divides.length;

                        for (let i = 0; i < divideLength; i++) {
                            const divide = divides[i];
                            const { glyphGroup } = divide;

                            this._drawLiquid.translateSave();
                            this._drawLiquid.translateDivide(divide);

                            this._drawGlyphGroupBackgrounds(
                                ctx,
                                parentScale,
                                glyphGroup,
                                lineHeight,
                                alignOffset,
                                centerAngle,
                                vertexAngle,
                                backgroundExtension
                            );

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
                            this._drawBorderBottom(ctx, nestedPage, line, parentPage.marginLeft, parentPage.marginTop);
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
        cell: IDocumentSkeletonPage,
        drawBackground = true
    ) {
        const { marginLeft, marginTop } = page;
        const { pageWidth, pageHeight } = cell;
        const rowSke = cell.parent as IDocumentSkeletonRow;
        const index = rowSke.cells.indexOf(cell);

        if (index < 0) {
            return;
        }

        const cellSource = rowSke.rowSource.tableCells[index];
        const tableSke = rowSke.parent as IDocumentSkeletonTable | undefined;
        const rowIndexInTable = tableSke?.rows.indexOf(rowSke);
        const rowIndex = rowIndexInTable == null || rowIndexInTable < 0 ? rowSke.index ?? 0 : rowIndexInTable;

        if (!cellSource || cellSource.rowSpan === 0 || cellSource.columnSpan === 0) {
            return;
        }

        if (this._drawLiquid == null) {
            return;
        }
        let { x, y } = this._drawLiquid;

        x += marginLeft;
        y += marginTop;

        // Draw cell bg.
        if (drawBackground && cellSource.backgroundColor?.rgb) {
            ctx.save();
            ctx.fillStyle = cellSource.backgroundColor.rgb;
            fillRectByPrecisionBounds(ctx, x, y, pageWidth, pageHeight);
            ctx.restore();
        }

        const position = {
            startX: x,
            startY: y,
            endX: x + pageWidth,
            endY: y + pageHeight,
        };

        const rightCellSource = this._getTableCellSource(rowSke, index + 1);
        const bottomCellSource = tableSke ? this._getTableCellSource(tableSke.rows[rowIndex + 1], index) : undefined;
        this._drawTableCellBorder(ctx, this._resolveTableCellBorder(cellSource.borderRight, rightCellSource?.borderLeft), BORDER_LTRB.RIGHT, position);
        this._drawTableCellBorder(ctx, this._resolveTableCellBorder(cellSource.borderBottom, bottomCellSource?.borderTop), BORDER_LTRB.BOTTOM, position);

        if (rowIndex <= 0) {
            this._drawTableCellBorder(ctx, this._resolveTableCellBorder(cellSource.borderTop), BORDER_LTRB.TOP, position);
        }

        if (index <= 0) {
            this._drawTableCellBorder(ctx, this._resolveTableCellBorder(cellSource.borderLeft), BORDER_LTRB.LEFT, position);
        }
    }

    private _getTableCellSource(row: Nullable<IDocumentSkeletonRow>, column: number): Nullable<ITableCell> {
        return row?.rowSource.tableCells[column] ?? null;
    }

    private _resolveTableCellBorder(primary?: ITableCellBorder, secondary?: ITableCellBorder): Nullable<ITableCellBorder> {
        if (this._isDrawableTableCellBorder(primary)) {
            return primary!;
        }

        if (this._isDrawableTableCellBorder(secondary)) {
            return secondary!;
        }

        if (primary || secondary) {
            return null;
        }

        return DEFAULT_BORDER_COLOR;
    }

    private _isDrawableTableCellBorder(border?: ITableCellBorder): boolean {
        if (!border) {
            return false;
        }

        const lineWidth = border.width?.v ?? 1;
        const color = border.color?.rgb ?? DEFAULT_BORDER_COLOR.color.rgb!;
        return lineWidth > 0 && color !== 'transparent';
    }

    private _drawTableCellBorder(
        ctx: UniverRenderingContext,
        border: Nullable<ITableCellBorder>,
        type: BORDER_LTRB,
        position: { startX: number; startY: number; endX: number; endY: number }
    ) {
        if (!border) {
            return;
        }

        const lineWidth = border.width?.v ?? 1;
        const color = border.color?.rgb ?? DEFAULT_BORDER_COLOR.color.rgb!;
        if (lineWidth <= 0 || color === 'transparent') {
            return;
        }

        ctx.save();
        ctx.setLineWidthByPrecision(lineWidth);
        setDocsBorderDash(ctx, border.dashStyle);
        ctx.strokeStyle = color;
        drawLineByBorderType(ctx, type, 0, position);
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
        const { sections, skeTables } = page;
        const { y: originY } = this._drawLiquid;

        if (skeTables.size > 0) {
            const tablePage = {
                ...page,
                marginLeft: parentPage.marginLeft,
                marginRight: parentPage.marginRight,
                marginTop: isHeader ? page.marginTop : page.marginTop + alignOffsetNoAngle.y,
            };

            this._drawTable(
                ctx,
                tablePage,
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

                        if (!isHeader) {
                            if ((y - originY + alignOffset.y + lineHeight) < (parentPage.pageHeight - 100) / 2 + 100) {
                                this._drawLiquid.translateRestore();
                                continue;
                            }
                        }
                        this._drawLineBackground(ctx, page, line, parentPage.marginLeft);

                        const divideLength = divides.length;

                        for (let i = 0; i < divideLength; i++) {
                            const divide = divides[i];
                            const { glyphGroup } = divide;

                            this._drawLiquid.translateSave();
                            this._drawLiquid.translateDivide(divide);

                            this._drawGlyphGroupBackgrounds(
                                ctx,
                                parentScale,
                                glyphGroup,
                                lineHeight,
                                alignOffset,
                                centerAngle,
                                vertexAngle,
                                backgroundExtension
                            );

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
        let resolvedHorizontalAlign = horizontalAlign;

        if (resolvedHorizontalAlign === HorizontalAlign.UNSPECIFIED) {
            if (centerAngleDeg === VERTICAL_ROTATE_ANGLE && vertexAngleDeg === VERTICAL_ROTATE_ANGLE) {
                resolvedHorizontalAlign = HorizontalAlign.CENTER;
            } else if ((vertexAngleDeg > 0 && vertexAngleDeg !== VERTICAL_ROTATE_ANGLE) || vertexAngleDeg === -VERTICAL_ROTATE_ANGLE) {
                /**
                 * https://github.com/dream-num/univer-pro/issues/334
                 */
                resolvedHorizontalAlign = HorizontalAlign.RIGHT;
            } else {
                /**
                 * sheet cell type, In a spreadsheet cell, without any alignment settings applied,
                 * text should be left-aligned,
                 * numbers should be right-aligned,
                 * and Boolean values should be center-aligned.
                 */
                if (cellValueType === CellValueType.NUMBER) {
                    resolvedHorizontalAlign = HorizontalAlign.RIGHT;
                } else if (cellValueType === CellValueType.BOOLEAN) {
                    resolvedHorizontalAlign = HorizontalAlign.CENTER;
                } else {
                    resolvedHorizontalAlign = HorizontalAlign.LEFT;
                }
            }
        }

        let offsetLeft = 0;
        if (resolvedHorizontalAlign === HorizontalAlign.CENTER) {
            offsetLeft = (this.width - pageWidth) / 2;
        } else if (resolvedHorizontalAlign === HorizontalAlign.RIGHT) {
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

function setDocsBorderDash(ctx: UniverRenderingContext, dashStyle?: DashStyleType) {
    if (dashStyle === DashStyleType.DOT) {
        ctx.setLineDash([2]);
        return;
    }

    if (dashStyle === DashStyleType.DASH) {
        ctx.setLineDash([6]);
        return;
    }

    ctx.setLineDash([0]);
}

function isColumnGroupNestedPage(page: IDocumentSkeletonPage): boolean {
    const parent = page.parent as IDocumentSkeletonColumnGroupColumn | undefined;

    return parent?.columnId != null && parent.parent?.columnGroupId != null;
}

function getNestedPageClipOrigin(
    parentPage: IDocumentSkeletonPage,
    nestedPage: IDocumentSkeletonPage,
    drawOrigin: { x: number; y: number },
    alignOffset: Vector2
): { x: number; y: number } {
    if (isColumnGroupNestedPage(nestedPage)) {
        return {
            x: drawOrigin.x + alignOffset.x,
            y: drawOrigin.y + alignOffset.y,
        };
    }

    return {
        x: drawOrigin.x + parentPage.marginLeft,
        y: drawOrigin.y + parentPage.marginTop,
    };
}

function fillRectByPrecisionBounds(
    ctx: UniverRenderingContext,
    x: number,
    y: number,
    width: number,
    height: number
) {
    const { scaleX, scaleY } = ctx.getScale();
    const startX = fixLineWidthByScale(x, scaleX);
    const startY = fixLineWidthByScale(y, scaleY);
    const endX = fixLineWidthByScale(x + width, scaleX);
    const endY = fixLineWidthByScale(y + height, scaleY);

    ctx.fillRect(startX, startY, endX - startX, endY - startY);
}

function rectByPrecisionBounds(
    ctx: UniverRenderingContext,
    x: number,
    y: number,
    width: number,
    height: number
) {
    const { scaleX, scaleY } = ctx.getScale();
    const startX = fixLineWidthByScale(x, scaleX);
    const startY = fixLineWidthByScale(y, scaleY);
    const endX = fixLineWidthByScale(x + width, scaleX);
    const endY = fixLineWidthByScale(y + height, scaleY);

    ctx.rect(startX, startY, endX - startX, endY - startY);
}
