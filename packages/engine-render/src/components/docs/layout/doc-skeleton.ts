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

import type { ColumnSeparatorType, ISectionColumnProperties, LocaleService, Nullable } from '@univerjs/core';
import { GridType, PRESET_LIST_TYPE, SectionType } from '@univerjs/core';
import type {
    IDocumentSkeletonCached,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonPage,
    ISkeletonResourceReference,
} from '../../../basics/i-document-skeleton-cached';
import { GlyphType, LineType, PageLayoutType } from '../../../basics/i-document-skeleton-cached';
import type { IDocsConfig, INodeInfo, INodePosition, INodeSearch } from '../../../basics/interfaces';
import type { IViewportInfo, Vector2 } from '../../../basics/vector2';
import { Skeleton } from '../../skeleton';
import { Liquid } from '../liquid';
import type { DocumentViewModel } from '../view-model/document-view-model';
import { DocumentEditArea } from '../view-model/document-view-model';
import type { ILayoutContext } from './tools';
import { getLastPage, getNullSkeleton, prepareSectionBreakConfig, setPageParent, updateBlockIndex, updateInlineDrawingCoords } from './tools';
import { createSkeletonSection } from './model/section';
import { dealWithSection } from './block/section';
import { createSkeletonPage } from './model/page';
import { Hyphen } from './hyphenation/hyphen';
import { LanguageDetector } from './hyphenation/language-detector';

export enum DocumentSkeletonState {
    PENDING = 'pending',
    CALCULATING = 'calculating',
    READY = 'ready',
    INVALID = 'invalid',
}

function resetContext(ctx: ILayoutContext) {
    ctx.isDirty = false;
    ctx.skeleton.drawingAnchor?.clear();
}

function removeDupPages(ctx: ILayoutContext) {
    const hash = new Set();

    ctx.skeleton.pages = ctx.skeleton.pages.filter((page) => {
        const hasPage = hash.has(page);
        hash.add(page);

        return !hasPage;
    });
}

export class DocumentSkeleton extends Skeleton {
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

    // Layout the document.
    calculate(bounds?: IViewportInfo) {
        if (!this.dirty) {
            return;
        }

        const ctx = this._prepareLayoutContext();

        // const start = +new Date();
        this._skeletonData = this._createSkeleton(ctx, bounds);
        // console.log(this._skeletonData);
        // console.log('skeleton calculate cost', +new Date() - start);
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
        const viewModel = this.getViewModel();
        const editArea = viewModel.getEditArea();

        if (!divide || !column || !section || !page || !skeletonData) {
            return;
        }

        const glyphIndex = divide.glyphGroup.indexOf(glyph);

        const divideIndex = line.divides.indexOf(divide);

        const lineIndex = column.lines.indexOf(line);

        const columnIndex = section.columns.indexOf(column);

        const sectionIndex = page.sections.indexOf(section);

        const pageIndex = editArea !== DocumentEditArea.BODY
            ? 0 // Because header or footer only has one page.
            : skeletonData.pages.indexOf(page);

        return {
            glyph: glyphIndex,
            divide: divideIndex,
            line: lineIndex,
            column: columnIndex,
            section: sectionIndex,
            page: pageIndex,
            segmentPage,
            isInBody: editArea === DocumentEditArea.BODY,
        };
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
        const editArea = this.getViewModel().getEditArea();

        const { glyph, divide, line, column, section, page, segmentPageIndex } = nodes;

        return {
            glyph: divide.glyphGroup.indexOf(glyph),
            divide: line.divides.indexOf(divide),
            line: column.lines.indexOf(line),
            column: section.columns.indexOf(column),
            section: page.sections.indexOf(section),
            page: editArea === DocumentEditArea.BODY ? pages.indexOf(page) : 0,
            isInBody: editArea === DocumentEditArea.BODY,
            segmentPage: segmentPageIndex,
            isBack,
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

        const editArea = this.getViewModel().getEditArea();
        const { pages, skeFooters, skeHeaders } = skeletonData;

        const { divide, line, column, section, page, isBack, isInBody, segmentPage } = position;

        let { glyph } = position;

        if (isBack === true) {
            glyph -= 1;
        }

        glyph = glyph < 0 ? 0 : glyph;

        let skePage = pages[page];

        if (editArea !== DocumentEditArea.BODY) {
            skePage = pages[segmentPage];
            const { headerId, footerId, pageWidth } = skePage;

            if (editArea === DocumentEditArea.HEADER) {
                const skeHeader = skeHeaders.get(headerId)?.get(pageWidth);
                if (skeHeader == null) {
                    return;
                } else {
                    skePage = skeHeader;
                }
            } else if (editArea === DocumentEditArea.FOOTER) {
                const skeFooter = skeFooters.get(footerId)?.get(pageWidth);
                if (skeFooter == null) {
                    return;
                } else {
                    skePage = skeFooter;
                }
            }
        }

        const glyphGroup =
            skePage.sections[section].columns[column].lines[line].divides[divide].glyphGroup;

        if (glyphGroup[glyph].glyphType === GlyphType.LIST) {
            return glyphGroup[glyph + 1];
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
        pageMarginTop: number
    ): Nullable<INodeInfo> {
        const { x, y } = coord;

        this._findLiquid.reset();

        const skeletonData = this.getSkeletonData();
        if (skeletonData == null) {
            return;
        }

        const editArea = this.getViewModel().getEditArea();

        const { pages, skeHeaders, skeFooters } = skeletonData;

        let nearestNodeList: INodeInfo[] = [];

        let nearestNodeDistanceList: number[] = [];

        let segmentId = '';

        let nearestNodeDistanceY = Number.POSITIVE_INFINITY;

        for (let pi = 0, len = pages.length; pi < len; pi++) {
            let page = pages[pi];
            const { headerId, footerId, pageWidth } = page;

            // const { startX, startY, endX, endY } = this._getPageBoundingBox(page, pageLayoutType);

            // if (!(x >= startX && x <= endX && y >= startY && y <= endY)) {
            //     this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
            //     continue;
            // }

            if (editArea === DocumentEditArea.HEADER) {
                const headerSke = skeHeaders.get(headerId)?.get(pageWidth) as IDocumentSkeletonPage;

                if (headerSke) {
                    page = headerSke;
                    segmentId = headerId;
                }
            } else if (editArea === DocumentEditArea.FOOTER) {
                const footerSke = skeFooters.get(footerId)?.get(pageWidth) as IDocumentSkeletonPage;

                if (footerSke) {
                    page = footerSke;
                    segmentId = footerId;
                }
            }

            const { sections } = page;

            this._findLiquid.translateSave();
            switch (editArea) {
                case DocumentEditArea.HEADER:
                    this._findLiquid.translatePagePadding({
                        ...page,
                        marginLeft: pages[pi].marginLeft, // Because header or footer margin Left is 0.
                    });
                    break;
                case DocumentEditArea.FOOTER: {
                    const footerTop = pages[pi].pageHeight - page.height - page.marginBottom;
                    this._findLiquid.translate(pages[pi].marginLeft, footerTop);
                    break;
                }
                default:
                    this._findLiquid.translatePagePadding(pages[pi]);
                    break;
            }

            for (const section of sections) {
                const { columns } = section;

                this._findLiquid.translateSection(section);

                // const { y: startY } = this._findLiquid;

                // if (!(y >= startY && y <= startY + height)) {
                //     continue;
                // }

                for (const column of columns) {
                    const { lines } = column;

                    this._findLiquid.translateSave();
                    this._findLiquid.translateColumn(column);

                    // const { x: startX } = this._findLiquid;

                    // if (!(x >= startX && x <= startX + columnWidth)) {
                    //     continue;
                    // }

                    const linesCount = lines.length;

                    for (let i = 0; i < linesCount; i++) {
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

                            // if (!(y >= startY_fin && y <= endY_fin)) {
                            //     this._findLiquid.translateRestore();
                            //     continue;
                            // }

                            const divideLength = divides.length;
                            for (let i = 0; i < divideLength; i++) {
                                const divide = divides[i];
                                const { glyphGroup } = divide;

                                this._findLiquid.translateSave();
                                this._findLiquid.translateDivide(divide);

                                const { x: startX } = this._findLiquid;

                                // if (!(x >= startX && x <= startX + divideWidth)) {
                                //     this._findLiquid.translateRestore();
                                //     continue;
                                // }

                                for (const glyph of glyphGroup) {
                                    if (!glyph.content || glyph.content.length === 0) {
                                        continue;
                                    }

                                    const { width: glyphWidth, left: glyphLeft } = glyph;

                                    const startX_fin = startX + glyphLeft;

                                    const endX_fin = startX + glyphLeft + glyphWidth;

                                    const distanceX = Math.abs(x - endX_fin);

                                    if (y >= startY_fin && y <= endY_fin) {
                                        if (x >= startX_fin && x <= endX_fin) {
                                            return {
                                                node: glyph,
                                                segmentPage: editArea === DocumentEditArea.BODY ? -1 : pi,
                                                segmentId,
                                                ratioX: x / (startX_fin + endX_fin),
                                                ratioY: y / (startY_fin + endY_fin),
                                            };
                                        }

                                        if (nearestNodeDistanceY !== Number.NEGATIVE_INFINITY) {
                                            nearestNodeList = [];
                                            nearestNodeDistanceList = [];
                                        }
                                        nearestNodeList.push({
                                            node: glyph,
                                            segmentPage: editArea === DocumentEditArea.BODY ? -1 : pi,
                                            segmentId,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        nearestNodeDistanceList.push(distanceX);

                                        nearestNodeDistanceY = Number.NEGATIVE_INFINITY;
                                        continue;
                                    }

                                    if (distanceY < nearestNodeDistanceY) {
                                        nearestNodeDistanceY = distanceY;
                                        nearestNodeList = [];
                                        nearestNodeDistanceList = [];
                                    }

                                    if (distanceY === nearestNodeDistanceY) {
                                        nearestNodeList.push({
                                            node: glyph,
                                            segmentPage: editArea === DocumentEditArea.BODY ? -1 : pi,
                                            segmentId,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        nearestNodeDistanceList.push(distanceX);
                                    }
                                }
                                this._findLiquid.translateRestore();
                            }
                            this._findLiquid.translateRestore();
                        }
                    }
                    this._findLiquid.translateRestore();
                }
            }
            this._findLiquid.translateRestore();
            this._translatePage(pages[pi], pageLayoutType, pageMarginLeft, pageMarginTop);
        }

        return this._getNearestNode(nearestNodeList, nearestNodeDistanceList);
    }

    private _getNearestNode(nearestNodeList: INodeInfo[], nearestNodeDistanceList: number[]) {
        const miniValue = Math.min(...nearestNodeDistanceList);
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
        const { headerTreeMap, footerTreeMap } = viewModel;
        const { documentStyle, drawings, lists: customLists = {} } = dataModel;
        const lists = {
            ...PRESET_LIST_TYPE,
            ...customLists,
        };
        const {
            charSpace = 0, // charSpace
            linePitch = 15.6, // linePitch pt
            gridType = GridType.LINES, // gridType
            paragraphLineGapDefault = 0,
            defaultTabStop = 10.5,
            textStyle = {},
        } = documentStyle;

        const docsConfig: IDocsConfig = {
            headerTreeMap,
            footerTreeMap,
            lists,
            drawings,

            charSpace,
            linePitch,
            gridType,
            localeService: this._localService,
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
                paragraphIndex: null,
            },
            isDirty: false,
            drawingsCache: new Map(),
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

        viewModel.resetCache();

        let startSectionIndex = 0;

        const layoutAnchor = ctx.layoutStartPointer.paragraphIndex;

        // Reset layoutStartPointer.
        ctx.layoutStartPointer.paragraphIndex = null;

        if (layoutAnchor != null) {
            for (let sectionIndex = 0; sectionIndex < viewModel.children.length; sectionIndex++) {
                const sectionNode = viewModel.children[sectionIndex];
                const { endIndex, startIndex } = sectionNode;
                if (layoutAnchor >= startIndex && layoutAnchor <= endIndex) {
                    startSectionIndex = sectionIndex;
                    break;
                }
            }
        }

        // Loop the sections with the start section index.
        for (let i = startSectionIndex, len = viewModel.children.length; i < len; i++) {
            const sectionNode = viewModel.children[i];
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
            updateInlineDrawingCoords(ctx, skeleton.pages);
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

        const editArea = this.getViewModel().getEditArea();
        const { pages, skeFooters, skeHeaders } = skeletonData;

        for (const page of pages) {
            const curPageIndex = pages.indexOf(page);
            if (editArea !== DocumentEditArea.BODY && curPageIndex !== segmentPageIndex) {
                continue;
            }

            const { pageWidth } = page;
            let segmentPage = page;

            if (editArea === DocumentEditArea.HEADER) {
                const headerSke = skeHeaders.get(segmentId)?.get(pageWidth);
                if (headerSke) {
                    segmentPage = headerSke;
                } else {
                    continue;
                }
            } else if (editArea === DocumentEditArea.FOOTER) {
                const footerSke = skeFooters.get(segmentId)?.get(pageWidth);
                if (footerSke) {
                    segmentPage = footerSke;
                } else {
                    continue;
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
