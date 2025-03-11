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

import type { ColumnSeparatorType, ISectionColumnProperties, LocaleService, Nullable } from '@univerjs/core';
import type {
    IDocumentSkeletonCached,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonPage,
    ISkeletonResourceReference,
} from '../../../basics/i-document-skeleton-cached';
import type { IDocsConfig, INodeInfo, INodePosition, INodeSearch } from '../../../basics/interfaces';
import type { IViewportInfo, Vector2 } from '../../../basics/vector2';
import type { DocumentViewModel } from '../view-model/document-view-model';
import type { ILayoutContext } from './tools';
import { PRESET_LIST_TYPE, SectionType, Skeleton } from '@univerjs/core';
import { Subject } from 'rxjs';
import { DocumentSkeletonPageType, GlyphType, LineType, PageLayoutType } from '../../../basics/i-document-skeleton-cached';
import { Liquid } from '../liquid';
import { DocumentEditArea } from '../view-model/document-view-model';
import { dealWithSection } from './block/section';
import { Hyphen } from './hyphenation/hyphen';
import { LanguageDetector } from './hyphenation/language-detector';
import { createSkeletonPage } from './model/page';
import { createSkeletonSection } from './model/section';
import { getLastPage, getNullSkeleton, getPageFromPath, prepareSectionBreakConfig, resetContext, setPageParent, updateBlockIndex, updateInlineDrawingCoordsAndBorder } from './tools';

export enum DocumentSkeletonState {
    PENDING = 'pending',
    CALCULATING = 'calculating',
    READY = 'ready',
    INVALID = 'invalid',
}

function removeDupPages(ctx: ILayoutContext) {
    const hash = new Set();

    ctx.skeleton.pages = ctx.skeleton.pages.filter((page) => {
        const hasPage = hash.has(page);
        hash.add(page);

        return !hasPage;
    });
}

interface IDistance {
    coordInPage: boolean;
    distance: number;
    nestLevel: number;
}

interface INearestCache {
    nearestNodeList: INodeInfo[];
    nearestNodeDistanceList: IDistance[];
}

export interface IFindNodeRestrictions {
    strict: boolean;
    segmentId: string;
    segmentPage: number;
}

function getPagePath(page: IDocumentSkeletonPage) {
    const path: (string | number)[] = [];

    // eslint-disable-next-line ts/no-explicit-any
    let skeNode: any = page;
    // eslint-disable-next-line ts/no-explicit-any
    let parent: any = skeNode.parent;
    while (parent) {
        if (parent.pages) {
            const index = parent.pages.indexOf(skeNode);

            if (index !== -1) {
                path.unshift('pages', index);
            }
        } else if (parent.cells) {
            const index = parent.cells.indexOf(skeNode);

            if (index !== -1) {
                path.unshift('cells', index);
            }
        } else if (parent.rows) {
            const index = parent.rows.indexOf(skeNode);

            if (index !== -1) {
                path.unshift('rows', index);
            }
        } else if (parent.skeTables && parent.skeTables.has(skeNode.tableId)) {
            path.unshift('skeTables', skeNode.tableId);
        }

        skeNode = parent;
        parent = parent?.parent;
    }

    return path;
}

export class DocumentSkeleton extends Skeleton {
    private _dirty$ = new Subject<boolean>();
    readonly dirty$ = this._dirty$.asObservable();

    private _skeletonData: Nullable<IDocumentSkeletonCached>;

    private _findLiquid: Liquid = new Liquid();

    // Use for hyphenation.
    private _hyphen = Hyphen.getInstance();

    private _languageDetector = LanguageDetector.getInstance();

    private _iteratorCount = 0;

    constructor(
        private _docViewModel: DocumentViewModel,
        localeService: LocaleService
    ) {
        super(localeService);
    }

    static create(docViewModel: DocumentViewModel, localeService: LocaleService) {
        return new DocumentSkeleton(docViewModel, localeService);
    }

    override dispose(): void {
        super.dispose();
        this._skeletonData = null;
        this._findLiquid = null as unknown as Liquid;
        this._docViewModel.dispose();
    }

    getViewModel() {
        return this._docViewModel;
    }

    /**
     * Layout the document.
     * PS: This method has significant impact on performance.
     */
    calculate(bounds?: IViewportInfo) {
        if (!this.dirty) {
            return;
        }

        const ctx = this._prepareLayoutContext();

        // const start = +new Date();
        this._skeletonData = this._createSkeleton(ctx, bounds);
        // console.log('skeleton calculate cost', +new Date() - start);
        this._dirty$.next(true);
    }

    getSkeletonData() {
        return this._skeletonData;
    }

    getActualSize() {
        const skeletonData = this.getSkeletonData();

        let actualWidth = Number.NEGATIVE_INFINITY;
        let actualHeight = 0;

        skeletonData?.pages.forEach((page) => {
            const { width, height } = page;
            actualWidth = Math.max(actualWidth, width);

            actualHeight += height;
        });

        return {
            actualWidth,
            actualHeight,
        };
    }

    private _getPageActualWidth(page: IDocumentSkeletonPage) {
        let maxWidth = Number.NEGATIVE_INFINITY;
        for (const section of page.sections) {
            for (const column of section.columns) {
                for (const line of column.lines) {
                    let lineWidth = 0;
                    for (const divide of line.divides) {
                        for (const glyph of divide.glyphGroup) {
                            lineWidth += glyph.width;
                        }
                    }
                    maxWidth = Math.max(maxWidth, lineWidth);
                }
            }
        }

        return maxWidth;
    }

    getPageSize() {
        return this.getViewModel().getDataModel().documentStyle.pageSize;
    }

    findPositionByGlyph(glyph: IDocumentSkeletonGlyph, segmentPage: number): Nullable<INodeSearch> {
        const divide = glyph.parent;
        const line = divide?.parent;
        const column = line?.parent;
        const section = column?.parent;
        const page = section?.parent;
        const skeletonData = this.getSkeletonData();

        if (!divide || !column || !section || !page || !skeletonData) {
            return;
        }

        const pageType = page.type;

        const glyphIndex = divide.glyphGroup.indexOf(glyph);

        const divideIndex = line.divides.indexOf(divide);

        const lineIndex = column.lines.indexOf(line);

        const columnIndex = section.columns.indexOf(column);

        const sectionIndex = page.sections.indexOf(section);

        let pageIndex = -1;

        const path = getPagePath(page);

        switch (pageType) {
            case DocumentSkeletonPageType.HEADER:
            case DocumentSkeletonPageType.FOOTER: {
                pageIndex = 0;
                break;
            }

            case DocumentSkeletonPageType.BODY: {
                pageIndex = skeletonData.pages.indexOf(page);
                break;
            }

            case DocumentSkeletonPageType.CELL: {
                pageIndex = path[1] as number;
                break;
            }

            default: {
                throw new Error('Invalid page type');
            }
        }

        return {
            glyph: glyphIndex,
            divide: divideIndex,
            line: lineIndex,
            column: columnIndex,
            section: sectionIndex,
            page: pageIndex,
            segmentPage,
            pageType,
            path,
        };
    }

    findCharIndexByPosition(position: INodePosition): Nullable<number> {
        const glyph = this.findGlyphByPosition(position);
        const divide = glyph?.parent;

        if (divide == null) {
            return;
        }

        const { st, glyphGroup } = divide;

        let index = st;

        for (const g of glyphGroup) {
            if (g === glyph) {
                break;
            }

            index += g.count;
        }

        return position.isBack ? index : (index + glyph!.count);
    }

    findNodePositionByCharIndex(charIndex: number, isBack: boolean = true, segmentId = '', segmentPIndex = -1): Nullable<INodePosition> {
        const nodes = this._findNodeByIndex(charIndex, segmentId, segmentPIndex);

        if (nodes == null) {
            return;
        }

        const skeletonData = this.getSkeletonData();

        if (!skeletonData) {
            return;
        }

        const pages = skeletonData.pages;

        const { glyph, divide, line, column, section, page, segmentPageIndex, pageType } = nodes;

        const path = getPagePath(page);

        let pageIndex = -1;

        switch (pageType) {
            case DocumentSkeletonPageType.HEADER:
            case DocumentSkeletonPageType.FOOTER: {
                pageIndex = 0;
                break;
            }

            case DocumentSkeletonPageType.BODY: {
                pageIndex = pages.indexOf(page);
                break;
            }

            case DocumentSkeletonPageType.CELL: {
                pageIndex = path[1] as number;
                break;
            }

            default: {
                throw new Error('Invalid page type');
            }
        }

        return {
            glyph: divide.glyphGroup.indexOf(glyph),
            divide: line.divides.indexOf(divide),
            line: column.lines.indexOf(line),
            column: section.columns.indexOf(column),
            section: page.sections.indexOf(section),
            page: pageIndex,
            pageType,
            segmentPage: segmentPageIndex,
            isBack,
            path,
        };
    }

    findNodeByCharIndex(charIndex: number, segmentId = '', segmentPageIndex = -1): Nullable<IDocumentSkeletonGlyph> {
        const nodes = this._findNodeByIndex(charIndex, segmentId, segmentPageIndex);

        return nodes?.glyph;
    }

    findGlyphByPosition(position: Nullable<INodePosition>) {
        if (position == null) {
            return;
        }

        const skeletonData = this.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages, skeFooters, skeHeaders } = skeletonData;

        const { divide, line, column, section, segmentPage, pageType, path, isBack } = position;

        let { glyph } = position;

        let skePage: Nullable<IDocumentSkeletonPage> = null;

        if (pageType === DocumentSkeletonPageType.HEADER || pageType === DocumentSkeletonPageType.FOOTER) {
            skePage = pages[segmentPage];
            const { headerId, footerId, pageWidth } = skePage;

            if (pageType === DocumentSkeletonPageType.HEADER) {
                const skeHeader = skeHeaders.get(headerId)?.get(pageWidth);
                if (skeHeader == null) {
                    return;
                } else {
                    skePage = skeHeader;
                }
            } else if (pageType === DocumentSkeletonPageType.FOOTER) {
                const skeFooter = skeFooters.get(footerId)?.get(pageWidth);
                if (skeFooter == null) {
                    return;
                } else {
                    skePage = skeFooter;
                }
            }
        } else {
            skePage = getPageFromPath(skeletonData, path);
        }

        if (skePage == null) {
            return;
        }

        const glyphGroup =
            skePage.sections[section].columns[column].lines[line].divides[divide].glyphGroup;

        glyph = Math.min(glyph, glyphGroup.length - 1);

        if (glyphGroup[glyph].glyphType === GlyphType.LIST) {
            glyph += 1;
        }

        return glyphGroup[glyph];
    }

    findEditAreaByCoord(
        coord: Vector2,
        pageLayoutType: PageLayoutType,
        pageMarginLeft: number,
        pageMarginTop: number
    ): {
            editArea: DocumentEditArea;
            pageNumber: number;
            page: Nullable<IDocumentSkeletonPage>;
        } {
        const { x, y } = coord;
        let editArea = DocumentEditArea.BODY;
        let pageNumber = -1;
        let pageSkeleton = null;
        const skeletonData = this.getSkeletonData();

        if (skeletonData == null) {
            return {
                editArea,
                page: pageSkeleton,
                pageNumber,
            };
        }

        this._findLiquid.reset();

        const { pages } = skeletonData;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];

            const { marginTop, marginBottom, pageWidth, pageHeight } = page;

            if (
                x > this._findLiquid.x && x < this._findLiquid.x + pageWidth &&
                y > this._findLiquid.y && y < this._findLiquid.y + marginTop
            ) {
                editArea = DocumentEditArea.HEADER;
                pageSkeleton = page;
                pageNumber = i;
                break;
            }

            if (
                x > this._findLiquid.x && x < this._findLiquid.x + pageWidth &&
                y > this._findLiquid.y + marginTop && y < this._findLiquid.y + pageHeight - marginBottom
            ) {
                editArea = DocumentEditArea.BODY;
                pageSkeleton = page;
                pageNumber = i;
                break;
            }

            if (
                x > this._findLiquid.x && x < this._findLiquid.x + pageWidth &&
                y > this._findLiquid.y + pageHeight - marginBottom && y < this._findLiquid.y + pageHeight
            ) {
                editArea = DocumentEditArea.FOOTER;
                pageSkeleton = page;
                pageNumber = i;
                break;
            }

            this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        return {
            editArea,
            page: pageSkeleton,
            pageNumber,
        };
    }

    findNodeByCoord(
        coord: Vector2,
        pageLayoutType: PageLayoutType,
        pageMarginLeft: number,
        pageMarginTop: number,
        restrictions?: IFindNodeRestrictions
    ): Nullable<INodeInfo> {
        const { x, y } = coord;

        const skeletonData = this.getSkeletonData();
        if (skeletonData == null) {
            return;
        }

        const cache: INearestCache = {
            nearestNodeList: [],
            nearestNodeDistanceList: [],
        };

        const { pages, skeHeaders, skeFooters } = skeletonData;
        const editArea = this.findEditAreaByCoord(coord, pageLayoutType, pageMarginLeft, pageMarginTop).editArea;
        const pageLength = pages.length;

        this._findLiquid.reset();
        if (restrictions == null) {
            for (let pi = 0; pi < pageLength; pi++) {
                const page = pages[pi];
                const { headerId, footerId, pageWidth } = page;

                let exactMatch = null;

                if (editArea === DocumentEditArea.HEADER || editArea === DocumentEditArea.FOOTER) {
                    const headerSke = skeHeaders.get(headerId)?.get(pageWidth) as IDocumentSkeletonPage;

                    if (headerSke) {
                        exactMatch = this._collectNearestNode(
                            headerSke,
                            DocumentSkeletonPageType.HEADER,
                            page,
                            headerId,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength
                        );
                    }

                    const footerSke = skeFooters.get(footerId)?.get(pageWidth) as IDocumentSkeletonPage;

                    if (footerSke) {
                        exactMatch = exactMatch ?? this._collectNearestNode(
                            footerSke,
                            DocumentSkeletonPageType.FOOTER,
                            page,
                            footerId,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength
                        );
                    }
                } else {
                    const BODY_SEGMENT_ID = '';
                    exactMatch = this._collectNearestNode(
                        page,
                        DocumentSkeletonPageType.BODY,
                        page,
                        BODY_SEGMENT_ID,
                        pi,
                        cache,
                        x,
                        y,
                        pageLength
                    );
                }

                if (exactMatch) {
                    return exactMatch;
                }

                this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
            }
        } else {
            const { segmentId, segmentPage, strict } = restrictions;
            let exactMatch = null;

            if (strict === false) {
                for (let pi = 0; pi < pageLength; pi++) {
                    const page = pages[pi];
                    const { headerId, footerId, pageWidth } = page;

                    if (segmentId !== '') {
                        const headerSke = skeHeaders.get(headerId)?.get(pageWidth) as IDocumentSkeletonPage;

                        if (headerSke) {
                            exactMatch = this._collectNearestNode(
                                headerSke,
                                DocumentSkeletonPageType.HEADER,
                                page,
                                headerId,
                                pi,
                                cache,
                                x,
                                y,
                                pageLength
                            );
                        }

                        const footerSke = skeFooters.get(footerId)?.get(pageWidth) as IDocumentSkeletonPage;

                        if (footerSke) {
                            exactMatch = exactMatch ?? this._collectNearestNode(
                                footerSke,
                                DocumentSkeletonPageType.FOOTER,
                                page,
                                footerId,
                                pi,
                                cache,
                                x,
                                y,
                                pageLength
                            );
                        }
                    } else {
                        const BODY_SEGMENT_ID = '';
                        exactMatch = this._collectNearestNode(
                            page,
                            DocumentSkeletonPageType.BODY,
                            page,
                            BODY_SEGMENT_ID,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength
                        );
                    }

                    if (exactMatch) {
                        return exactMatch;
                    }

                    this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                }
            } else {
                for (let pi = 0; pi < pageLength; pi++) {
                    const page = pages[pi];

                    if (segmentId) {
                        if (segmentPage !== pi) {
                            this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                            continue;
                        }

                        const { headerId, pageWidth } = page;

                        const segmentSke = segmentId === headerId ? skeHeaders.get(segmentId)?.get(pageWidth) : skeFooters.get(segmentId)?.get(pageWidth);
                        if (segmentSke) {
                            exactMatch = this._collectNearestNode(
                                segmentSke,
                                segmentId === headerId ? DocumentSkeletonPageType.HEADER : DocumentSkeletonPageType.FOOTER,
                                page,
                                segmentId,
                                segmentPage,
                                cache,
                                x,
                                y,
                                pageLength
                            );
                        }
                    } else {
                        const BODY_SEGMENT_ID = '';
                        exactMatch = this._collectNearestNode(
                            page,
                            DocumentSkeletonPageType.BODY,
                            page,
                            BODY_SEGMENT_ID,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength
                        );
                    }

                    if (exactMatch) {
                        return exactMatch;
                    }

                    this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                }
            }
        }

        return this._getNearestNode(cache.nearestNodeList, cache.nearestNodeDistanceList);
    }

    private _collectNearestNode(
        segmentPage: IDocumentSkeletonPage,
        pageType: DocumentSkeletonPageType,
        page: IDocumentSkeletonPage,
        segmentId: string,
        pi: number,
        cache: INearestCache,
        x: number,
        y: number,
        pageLength: number,
        nestLevel: number = 0
        // eslint-disable-next-line ts/no-explicit-any
    ): any {
        const { sections, skeTables } = segmentPage;
        this._findLiquid.translateSave();

        const pageLeft = this._findLiquid.x;
        const pageRight = pageLeft + page.pageWidth; // Use page.pageWidth instead of segmentPage.pageWidth, because the segmentPage not include the margin left and right.
        const pageTop = this._findLiquid.y + (pageType === DocumentSkeletonPageType.FOOTER ? page.pageHeight - segmentPage.pageHeight : 0);
        const pageBottom = pageTop + segmentPage.pageHeight;

        let pointInPage = x >= pageLeft
            && x <= pageRight
            && y >= pageTop
            && y <= pageBottom;

        // Handle the outmost page.
        if (nestLevel === 0 && pageType === DocumentSkeletonPageType.BODY) {
            const isFirstPage = pi === 0;
            const isLastPage = pi === pageLength - 1;
            // TODO: Use page margin top as page gap now, need to consider the page gap in the future.
            const halfMarginTop = page.originMarginTop / 2;

            // It's the only page, point always in page.
            if (isFirstPage && isLastPage) {
                pointInPage = true;
            } else if (isFirstPage) {
                pointInPage = y <= pageBottom + halfMarginTop;
            } else if (isLastPage) {
                pointInPage = y >= pageTop - halfMarginTop;
            } else {
                pointInPage = y >= pageTop - halfMarginTop && y <= pageBottom + halfMarginTop;
            }
        }

        switch (pageType) {
            case DocumentSkeletonPageType.HEADER: {
                this._findLiquid.translatePagePadding({
                    ...segmentPage,
                    marginLeft: page.marginLeft, // Because header or footer margin Left is 0.
                });
                break;
            }

            case DocumentSkeletonPageType.FOOTER: {
                const footerTop = page.pageHeight - segmentPage.height - segmentPage.marginBottom;
                this._findLiquid.translate(page.marginLeft, footerTop);
                break;
            }

            default: {
                this._findLiquid.translatePagePadding(page);
                break;
            }
        }

        if (pointInPage) {
            let nearestNodeDistanceY = Number.POSITIVE_INFINITY;

            for (const section of sections) {
                const { columns } = section;

                this._findLiquid.translateSave();
                this._findLiquid.translateSection(section);

                for (const column of columns) {
                    const { lines } = column;

                    this._findLiquid.translateSave();
                    this._findLiquid.translateColumn(column);

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const { divides, type, lineHeight = 0 } = line;

                        if (type === LineType.BLOCK) {
                            continue;
                        } else {
                            this._findLiquid.translateSave();
                            this._findLiquid.translateLine(line);

                            const { y: startY } = this._findLiquid;

                            const startY_fin = startY;

                            const endY_fin = startY + lineHeight;

                            const distanceY = Math.abs(y - endY_fin);

                            const divideLength = divides.length;
                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { glyphGroup } = divide;

                                this._findLiquid.translateSave();
                                this._findLiquid.translateDivide(divide);

                                const { x: startX } = this._findLiquid;

                                for (const glyph of glyphGroup) {
                                    if (!glyph.content || glyph.content.length === 0) {
                                        continue;
                                    }

                                    const { width: glyphWidth, left: glyphLeft } = glyph;
                                    const startX_fin = startX + glyphLeft;
                                    const endX_fin = startX + glyphLeft + glyphWidth;
                                    const distanceX = Math.abs(x - endX_fin);

                                    // Handle pointer in the same line.
                                    if (y >= startY_fin && y <= endY_fin) {
                                        // Exact match glyph.
                                        if (x >= startX_fin && x <= endX_fin) {
                                            return {
                                                node: glyph,
                                                segmentPage: pageType === DocumentSkeletonPageType.BODY ? -1 : pi,
                                                segmentId,
                                                ratioX: x / (startX_fin + endX_fin),
                                                ratioY: y / (startY_fin + endY_fin),
                                            };
                                        }

                                        if (nearestNodeDistanceY !== Number.NEGATIVE_INFINITY) {
                                            cache.nearestNodeList = [];
                                            cache.nearestNodeDistanceList = [];
                                        }
                                        cache.nearestNodeList.push({
                                            node: glyph,
                                            segmentPage: pageType === DocumentSkeletonPageType.BODY ? -1 : pi,
                                            segmentId,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        cache.nearestNodeDistanceList.push({
                                            coordInPage: pointInPage,
                                            distance: distanceX,
                                            nestLevel,
                                        });

                                        nearestNodeDistanceY = Number.NEGATIVE_INFINITY;
                                        continue;
                                    }

                                    if (distanceY < nearestNodeDistanceY) {
                                        nearestNodeDistanceY = distanceY;
                                        cache.nearestNodeList = [];
                                        cache.nearestNodeDistanceList = [];
                                    }

                                    if (distanceY === nearestNodeDistanceY) {
                                        cache.nearestNodeList.push({
                                            node: glyph,
                                            segmentPage: pageType === DocumentSkeletonPageType.BODY ? -1 : pi,
                                            segmentId,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        cache.nearestNodeDistanceList.push({
                                            coordInPage: pointInPage,
                                            distance: distanceX,
                                            nestLevel,
                                        });
                                    }
                                }
                                this._findLiquid.translateRestore();
                            }
                            this._findLiquid.translateRestore();
                        }
                    }
                    this._findLiquid.translateRestore();
                }

                this._findLiquid.translateRestore();
            }
        }

        let exactMatch = null;
        if (skeTables.size > 0) {
            for (const table of skeTables.values()) {
                const { top: tableTop, left: tableLeft, rows } = table;

                this._findLiquid?.translateSave();
                this._findLiquid?.translate(tableLeft, tableTop);

                for (const row of rows) {
                    const { top: rowTop, cells, isRepeatRow } = row;

                    // Cursor should not in repeat row.
                    if (isRepeatRow) {
                        continue;
                    }

                    this._findLiquid?.translateSave();
                    this._findLiquid?.translate(0, rowTop);

                    for (const cell of cells) {
                        const { left: cellLeft } = cell;

                        this._findLiquid?.translateSave();
                        this._findLiquid?.translate(cellLeft, 0);

                        exactMatch = exactMatch ?? this._collectNearestNode(
                            cell,
                            DocumentSkeletonPageType.CELL,
                            cell,
                            segmentId,
                            pi,
                            cache,
                            x,
                            y,
                            pageLength,
                            nestLevel + 1
                        );

                        this._findLiquid?.translateRestore();
                    }

                    this._findLiquid?.translateRestore();
                }

                this._findLiquid?.translateRestore();
            }
        }

        if (exactMatch) {
            this._findLiquid.translateRestore();
            return exactMatch;
        }

        this._findLiquid.translateRestore();
    }

    private _getNearestNode(nearestNodeList: INodeInfo[], nearestNodeDistanceList: IDistance[]) {
        if (nearestNodeDistanceList.length === 0) {
            return;
        }

        if (nearestNodeDistanceList.length === 1) {
            return nearestNodeList[0];
        }

        let miniValue = nearestNodeDistanceList[0];

        for (let i = 1; i < nearestNodeDistanceList.length; i++) {
            const { distance, nestLevel, coordInPage } = nearestNodeDistanceList[i];

            if (nestLevel > miniValue.nestLevel) {
                miniValue = nearestNodeDistanceList[i];
                continue;
            }

            if (nestLevel === miniValue.nestLevel) {
                if (coordInPage === miniValue.coordInPage) {
                    if (distance < miniValue.distance) {
                        miniValue = nearestNodeDistanceList[i];
                        continue;
                    }
                } else {
                    if (coordInPage) {
                        miniValue = nearestNodeDistanceList[i];
                        continue;
                    }
                }
            }
        }

        const miniValueIndex = nearestNodeDistanceList.indexOf(miniValue);

        return nearestNodeList[miniValueIndex];
    }

    private _getPageBoundingBox(page: IDocumentSkeletonPage, pageLayoutType: PageLayoutType) {
        const { pageWidth, pageHeight } = page;
        const { x: startX, y: startY } = this._findLiquid;

        let endX = -1;
        let endY = -1;
        if (pageLayoutType === PageLayoutType.VERTICAL) {
            endX = pageWidth;
            endY = startY + pageHeight;
        } else if (pageLayoutType === PageLayoutType.HORIZONTAL) {
            endX = startX + pageWidth;
            endY = pageHeight;
        }

        return {
            startX,
            startY,
            endX,
            endY,
        };
    }

    private _translatePage(
        page: IDocumentSkeletonPage,
        pageLayoutType: PageLayoutType,
        pageMarginLeft: number,
        pageMarginTop: number
    ) {
        this._findLiquid.translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
    }

    private _prepareLayoutContext(): ILayoutContext {
        const viewModel = this.getViewModel();
        const dataModel = viewModel.getDataModel();
        const { headerTreeMap, footerTreeMap } = viewModel.getHeaderFooterTreeMap();
        const { documentStyle, drawings, lists: customLists = {} } = dataModel;
        const lists = {
            ...PRESET_LIST_TYPE,
            ...customLists,
        };
        const {
            paragraphLineGapDefault = 0,
            defaultTabStop = 10.5,
            textStyle = {},
        } = documentStyle;

        const docsConfig: IDocsConfig = {
            headerTreeMap,
            footerTreeMap,
            lists,
            drawings,

            localeService: this._localeService,
            paragraphLineGapDefault,
            defaultTabStop,
            documentTextStyle: textStyle,
        };

        const skeleton = getNullSkeleton();

        const { skeHeaders, skeFooters, skeListLevel, drawingAnchor } = skeleton;

        const skeletonResourceReference: ISkeletonResourceReference = {
            skeHeaders,
            skeFooters,
            skeListLevel,
            drawingAnchor,
        };

        return {
            viewModel,
            dataModel,
            skeleton,
            skeletonResourceReference,
            docsConfig,
            layoutStartPointer: {
                '': null, // '' is the main document.
            },
            isDirty: false,
            floatObjectsCache: new Map(),
            paragraphConfigCache: new Map(),
            sectionBreakConfigCache: new Map(),
            paragraphsOpenNewPage: new Set(),
            hyphen: this._hyphen,
            languageDetector: this._languageDetector,
        };
    }

    /**
     * \v COLUMN_BREAK
     * \f PAGE_BREAK
     * \0 DOCS_END
     * \t TAB
     *
     * Needs to be changed：
     * \r PARAGRAPH
     * \n SECTION_BREAK
     *
     * \b customBlock: Scenarios where customBlock, images, mentions, etc. do not participate in the document flow.
     *
     * Table
     * \x1A table start
     * \x1B table row start
     * \x1C table cell start
     * \x1D table cell end
     * \x1E table row end
     * \x1F table end
     *
     * Special ranges within the document flow:：hyperlinks，field，structured document tags， bookmark，comment
     * \x1F customRange start
     * \x1E customRange end
     *
     * Split the document according to SectionBreak and perform layout calculations.
     * @returns view model: skeleton
     */

    private _createSkeleton(ctx: ILayoutContext, _bounds?: IViewportInfo): IDocumentSkeletonCached {
        // console.log('createSkeleton: iterate ', this._iteratorCount, 'times');
        const { viewModel, skeleton, skeletonResourceReference } = ctx;

        const allSkeletonPages = skeleton.pages;

        let startSectionIndex = 0;

        const layoutAnchor = ctx.layoutStartPointer[''];

        // Reset layoutStartPointer.
        ctx.layoutStartPointer[''] = null;

        if (layoutAnchor != null) {
            for (let sectionIndex = 0; sectionIndex < viewModel.getChildren().length; sectionIndex++) {
                const sectionNode = viewModel.getChildren()[sectionIndex];
                const { endIndex, startIndex } = sectionNode;
                if (layoutAnchor >= startIndex && layoutAnchor <= endIndex) {
                    startSectionIndex = sectionIndex;
                    break;
                }
            }
        }

        // Loop the sections with the start section index.
        for (let i = startSectionIndex, len = viewModel.getChildren().length; i < len; i++) {
            const sectionNode = viewModel.getChildren()[i];
            const sectionBreakConfig = prepareSectionBreakConfig(ctx, i);
            const { sectionType, columnProperties, columnSeparatorType, sectionTypeNext, pageNumberStart = 1 } = sectionBreakConfig;

            let curSkeletonPage = getLastPage(allSkeletonPages);
            let isContinuous = false;

            ctx.sectionBreakConfigCache.set(sectionNode.endIndex, sectionBreakConfig);

            if (sectionType === SectionType.CONTINUOUS) {
                updateBlockIndex(allSkeletonPages);
                this._addNewSectionByContinuous(curSkeletonPage, columnProperties!, columnSeparatorType!);
                isContinuous = true;
            } else if (layoutAnchor == null || curSkeletonPage == null) {
                curSkeletonPage = createSkeletonPage(
                    ctx,
                    sectionBreakConfig,
                    skeletonResourceReference,
                    curSkeletonPage?.pageNumber ?? pageNumberStart
                );
            }

            // 计算页内布局，block 结构
            const { pages } = dealWithSection(
                ctx,
                viewModel,
                sectionNode,
                curSkeletonPage,
                sectionBreakConfig,
                layoutAnchor
            );

            // todo: 当本节有多个列，且下一节为连续节类型的时候，需要按照列数分割，重新计算 lines
            if (sectionTypeNext === SectionType.CONTINUOUS && columnProperties!.length > 0) {
                // TODO
            }

            if (isContinuous) {
                pages.splice(0, 1);
            }

            allSkeletonPages.push(...pages);

            // The page needs to be reflowed due to floating objects.
            if (ctx.isDirty) {
                break;
            }
        }

        // TODO: 10 is too small?
        if (ctx.isDirty && this._iteratorCount < 10) {
            this._iteratorCount++;

            resetContext(ctx);
            return this._createSkeleton(ctx, _bounds);
        } else {
            // 计算页和节的位置信息
            this._iteratorCount = 0;
            removeDupPages(ctx);
            updateBlockIndex(skeleton.pages);
            // Calculate inline drawing position and update.
            updateInlineDrawingCoordsAndBorder(ctx, skeleton.pages);
            for (const hSkeMap of skeleton.skeHeaders.values()) {
                for (const page of hSkeMap.values()) {
                    updateInlineDrawingCoordsAndBorder(ctx, [page]);
                }
            }
            for (const fSkeMap of skeleton.skeFooters.values()) {
                for (const page of fSkeMap.values()) {
                    updateInlineDrawingCoordsAndBorder(ctx, [page]);
                }
            }
            setPageParent(skeleton.pages, skeleton);

            return skeleton;
        }
    }

    // 一页存在多个 section 的情况，仅在 SectionType.CONTINUOUS 的情况下出现
    private _addNewSectionByContinuous(
        curSkeletonPage: IDocumentSkeletonPage,
        columnProperties: ISectionColumnProperties[],
        columnSeparatorType: ColumnSeparatorType
    ) {
        const sections = curSkeletonPage.sections;
        const lastSection = sections[sections.length - 1];
        const {
            pageWidth,
            pageHeight,
            marginTop: curPageMT,
            marginBottom: curPageMB,
            marginLeft: curPageML,
            marginRight: curPageMR,
        } = curSkeletonPage;
        const pageContentWidth = pageWidth - curPageML - curPageMR;
        const pageContentHeight = pageHeight - curPageMT - curPageMB;
        const lastSectionBottom = (lastSection?.top || 0) + (lastSection?.height || 0);
        const newSection = createSkeletonSection(
            columnProperties,
            columnSeparatorType,
            lastSectionBottom,
            0,
            pageContentWidth,
            pageContentHeight - lastSectionBottom
        );
        newSection.parent = curSkeletonPage;
        sections.push(newSection);
    }

    private _findNodeByIndex(charIndex: number, segmentId = '', segmentPageIndex = -1) {
        const skeletonData = this.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages, skeFooters, skeHeaders } = skeletonData;

        for (const page of pages) {
            const curPageIndex = pages.indexOf(page);
            if (segmentId && curPageIndex !== segmentPageIndex) {
                continue;
            }

            const { pageWidth, skeTables } = page;
            let segmentPage = page;

            if (segmentId) {
                const maybeHeaderSke = skeHeaders.get(segmentId)?.get(pageWidth);
                const maybeFooterSke = skeFooters.get(segmentId)?.get(pageWidth);
                if (maybeHeaderSke) {
                    segmentPage = maybeHeaderSke;
                } else if (maybeFooterSke) {
                    segmentPage = maybeFooterSke;
                } else {
                    continue;
                }
            }

            // Find node from tables.
            if (segmentId === '') {
                let foundCell = false;
                for (const table of skeTables.values()) {
                    const { rows } = table;

                    for (const row of rows) {
                        const { cells } = row;

                        for (const cell of cells) {
                            const { st, ed } = cell;

                            if (charIndex >= st && charIndex <= ed) {
                                segmentPage = cell;
                                foundCell = true;
                                break;
                            }
                        }

                        if (foundCell) {
                            break;
                        }
                    }

                    if (foundCell) {
                        break;
                    }
                }
            }

            const { sections, st, ed } = segmentPage;

            if (charIndex < st || charIndex > ed) {
                continue;
            }

            for (const section of sections) {
                const { columns, st, ed } = section;

                if (charIndex < st || charIndex > ed) {
                    continue;
                }

                for (const column of columns) {
                    const { lines, st, ed } = column;

                    if (charIndex < st || charIndex > ed) {
                        continue;
                    }

                    for (const line of lines) {
                        const { divides, st, ed } = line;
                        const divideLength = divides.length;

                        if (charIndex < st || charIndex > ed) {
                            continue;
                        }

                        for (let i = 0; i < divideLength; i++) {
                            const divide = divides[i];
                            const { glyphGroup, st, ed } = divide;

                            if (charIndex < st || charIndex > ed) {
                                continue;
                            }

                            // Some glyph.content's length maybe great than 1, so the charIndex is not equal to glyphIndex.
                            let delta = charIndex - st;

                            for (const glyph of glyphGroup) {
                                delta -= glyph.count;

                                if (delta < 0) {
                                    return {
                                        page: segmentPage,
                                        pageType: segmentPage.type,
                                        section,
                                        column,
                                        line,
                                        divide,
                                        glyph,
                                        segmentPageIndex,
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
