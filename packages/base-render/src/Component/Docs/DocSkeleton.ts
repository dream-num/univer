import {
    ColumnSeparatorType,
    DocumentModelOrSimple,
    fromObservable,
    GridType,
    HorizontalAlign,
    ISectionBreak,
    ISectionColumnProperties,
    LocaleService,
    Nullable,
    Observable,
    PageOrientType,
    SectionType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';

import {
    IDocumentSkeletonCached,
    IDocumentSkeletonPage,
    IDocumentSkeletonSpan,
    ISkeletonResourceReference,
    LineType,
    PageLayoutType,
    SpanType,
} from '../../Basics/IDocumentSkeletonCached';
import { IDocsConfig, INodeInfo, INodePosition, INodeSearch, ISectionBreakConfig } from '../../Basics/Interfaces';
import { IBoundRect, Vector2 } from '../../Basics/Vector2';
import { Skeleton } from '../Skeleton';
import { dealWithSections } from './Block/Section';
import { Liquid } from './Common/Liquid';
import { createSkeletonPage } from './Common/Page';
import { createSkeletonSection } from './Common/Section';
import { getLastPage, updateBlockIndex } from './Common/Tools';

const DEFAULT_SECTION_BREAK: ISectionBreak = {
    columnProperties: [],
    columnSeparatorType: ColumnSeparatorType.NONE,
    sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
    startIndex: 0,
};

export enum DocumentSkeletonState {
    PENDING = 'pending',
    CALCULATING = 'calculating',
    READY = 'ready',
    INVALID = 'invalid',
}

export class DocumentSkeleton extends Skeleton {
    onRecalculateChangeObservable = new Observable<IDocumentSkeletonCached>();

    private _docModel!: DocumentModelOrSimple;

    private _skeletonData: Nullable<IDocumentSkeletonCached>;

    private _renderedBlockIdMap = new Map<string, boolean>();

    private _findLiquid: Liquid = new Liquid();

    constructor(docModel: DocumentModelOrSimple, localeService: LocaleService) {
        super(localeService);

        this._docModel = docModel;
        this.disposeWithMe(
            fromObservable(
                this._docModel.bodyModel?.modelChange$.subscribe(() => {
                    this.calculate();
                })
            )
        );
    }

    static create(docModel: DocumentModelOrSimple, localeService: LocaleService) {
        return new DocumentSkeleton(docModel, localeService);
    }

    getModel() {
        return this._docModel;
    }

    calculate(bounds?: IBoundRect) {
        if (!this.dirty) {
            return;
        }
        this._skeletonData = this._createSkeleton(bounds);

        this.onRecalculateChangeObservable.notifyObservers(this._skeletonData);
    }

    getSkeletonData() {
        return this._skeletonData;
    }

    getPageSize() {
        return this._docModel.documentStyle.pageSize;
    }

    findPositionBySpan(span: IDocumentSkeletonSpan): Nullable<INodeSearch> {
        const divide = span.parent;

        const line = divide?.parent;

        const column = line?.parent;

        const section = column?.parent;

        const page = section?.parent;

        const skeletonData = this.getSkeletonData();

        if (!divide || !column || !section || !page || !skeletonData) {
            return;
        }

        const spanIndex = divide.spanGroup.indexOf(span);

        const divideIndex = line.divides.indexOf(divide);

        const lineIndex = column.lines.indexOf(line);

        const columnIndex = section.columns.indexOf(column);

        const sectionIndex = page.sections.indexOf(section);

        const pageIndex = skeletonData.pages.indexOf(page);

        return {
            span: spanIndex,
            divide: divideIndex,
            line: lineIndex,
            column: columnIndex,
            section: sectionIndex,
            page: pageIndex,
        };
    }

    findNodePositionByCharIndex(charIndex: number, isBack: boolean = false): Nullable<INodePosition> {
        const nodes = this._findNodeIterator(charIndex);

        if (nodes == null) {
            return;
        }

        const skeletonData = this.getSkeletonData();

        if (!skeletonData) {
            return;
        }

        const pages = skeletonData.pages;

        const { span, divide, line, column, section, page } = nodes;

        return {
            span: divide.spanGroup.indexOf(span),
            divide: line.divides.indexOf(divide),
            line: column.lines.indexOf(line),
            column: section.columns.indexOf(column),
            section: page.sections.indexOf(section),
            page: pages.indexOf(page),
            isBack,
        };
    }

    findNodeByCharIndex(charIndex: number): Nullable<IDocumentSkeletonSpan> {
        const nodes = this._findNodeIterator(charIndex);

        return nodes?.span;

        // const skeletonData = this.getSkeletonData();

        // if (!skeletonData) {
        //     return;
        // }

        // const pages = skeletonData.pages;

        // for (const page of pages) {
        //     const { sections, st, ed } = page;

        //     if (charIndex < st || charIndex > ed) {
        //         continue;
        //     }

        //     for (const section of sections) {
        //         const { columns, st, ed } = section;

        //         if (charIndex < st || charIndex > ed) {
        //             continue;
        //         }

        //         for (const column of columns) {
        //             const { lines, st, ed } = column;

        //             if (charIndex < st || charIndex > ed) {
        //                 continue;
        //             }

        //             for (const line of lines) {
        //                 const { divides, lineHeight, st, ed } = line;
        //                 const divideLength = divides.length;

        //                 if (charIndex < st || charIndex > ed) {
        //                     continue;
        //                 }

        //                 for (let i = 0; i < divideLength; i++) {
        //                     const divide = divides[i];
        //                     const { spanGroup, st, ed } = divide;

        //                     if (charIndex < st || charIndex > ed) {
        //                         continue;
        //                     }

        //                     if (spanGroup[0].spanType === SpanType.LIST) {
        //                         charIndex++;
        //                     }

        //                     const span = spanGroup[charIndex - st];

        //                     if (span) {
        //                         return span;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    findSpanByPosition(position: Nullable<INodePosition>) {
        if (position == null) {
            return;
        }

        const skeletonData = this.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { divide, line, column, section, page, isBack } = position;

        let { span } = position;

        if (isBack === true) {
            span -= 1;
        }

        span = span < 0 ? 0 : span;

        const spanGroup =
            skeletonData.pages[page].sections[section].columns[column].lines[line].divides[divide].spanGroup;

        if (spanGroup[span].spanType === SpanType.LIST) {
            return spanGroup[span + 1];
        }

        return spanGroup[span];
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

        const pages = skeletonData.pages;

        let nearestNodeList: INodeInfo[] = [];

        let nearestNodeDistanceList: number[] = [];

        let nearestNodeDistanceY = Infinity;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];

            const { startX, startY, endX, endY } = this._getPageBoundingBox(page, pageLayoutType);

            if (!(x >= startX && x <= endX && y >= startY && y <= endY)) {
                this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
                continue;
            }

            this._findLiquid.translatePagePadding(page);

            const sections = page.sections;

            for (const section of sections) {
                const { columns, height } = section;

                this._findLiquid.translateSection(section);

                const { y: startY } = this._findLiquid;

                // if (!(y >= startY && y <= startY + height)) {
                //     continue;
                // }

                for (const column of columns) {
                    const { lines, width: columnWidth } = column;

                    this._findLiquid.translateColumn(column);

                    const { x: startX } = this._findLiquid;

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
                                const { spanGroup, width: divideWidth } = divide;

                                this._findLiquid.translateSave();
                                this._findLiquid.translateDivide(divide);

                                const { x: startX } = this._findLiquid;

                                // if (!(x >= startX && x <= startX + divideWidth)) {
                                //     this._findLiquid.translateRestore();
                                //     continue;
                                // }

                                for (const span of spanGroup) {
                                    if (!span.content || span.content.length === 0) {
                                        continue;
                                    }

                                    const { width: spanWidth, left: spanLeft } = span;

                                    const startX_fin = startX + spanLeft;

                                    const endX_fin = startX + spanLeft + spanWidth;

                                    const distanceX = Math.abs(x - endX_fin);

                                    if (y >= startY_fin && y <= endY_fin) {
                                        if (x >= startX_fin && x <= endX_fin) {
                                            return {
                                                node: span,
                                                ratioX: x / (startX_fin + endX_fin),
                                                ratioY: y / (startY_fin + endY_fin),
                                            };
                                        }

                                        if (nearestNodeDistanceY !== -Infinity) {
                                            nearestNodeList = [];
                                            nearestNodeDistanceList = [];
                                        }
                                        nearestNodeList.push({
                                            node: span,
                                            ratioX: x / (startX_fin + endX_fin),
                                            ratioY: y / (startY_fin + endY_fin),
                                        });

                                        nearestNodeDistanceList.push(distanceX);

                                        nearestNodeDistanceY = -Infinity;
                                        continue;
                                    }

                                    if (distanceY < nearestNodeDistanceY) {
                                        nearestNodeDistanceY = distanceY;
                                        nearestNodeList = [];
                                        nearestNodeDistanceList = [];
                                    }

                                    if (distanceY === nearestNodeDistanceY) {
                                        nearestNodeList.push({
                                            node: span,
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
                }
            }
            this._findLiquid.restorePagePadding(page);
            this._translatePage(page, pageLayoutType, pageMarginLeft, pageMarginTop);
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

    // updateDocumentDataPageSize(width?: number, height?: number) {
    //     const documentStyle = this._docModel.documentStyle;
    //     if (!documentStyle.pageSize) {
    //         width = width ?? Infinity;
    //         height = height ?? Infinity;
    //         documentStyle.pageSize = {
    //             width,
    //             height,
    //         };
    //         return;
    //     }

    //     if (width !== undefined) {
    //         documentStyle.pageSize.width = width;
    //     }

    //     if (height !== undefined) {
    //         documentStyle.pageSize.height = height;
    //     }
    // }

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
    // eslint-disable-next-line max-lines-per-function
    private _createSkeleton(bounds?: IBoundRect) {
        // 每一个布局
        const DEFAULT_PAGE_SIZE = { width: Infinity, height: Infinity };
        const { documentStyle, headerTreeMap, footerTreeMap, lists, drawings } = this._docModel;
        const {
            pageNumberStart: global_pageNumberStart = 1, // pageNumberStart
            pageSize: global_pageSize = DEFAULT_PAGE_SIZE,
            pageOrient: global_pageOrient = PageOrientType.PORTRAIT,
            defaultHeaderId: global_defaultHeaderId,
            defaultFooterId: global_defaultFooterId,
            evenPageHeaderId: global_evenPageHeaderId,
            evenPageFooterId: global_evenPageFooterId,
            firstPageHeaderId: global_firstPageHeaderId,
            firstPageFooterId: global_firstPageFooterId,
            useFirstPageHeaderFooter: global_useFirstPageHeaderFooter,
            useEvenPageHeaderFooter: global_useEvenPageHeaderFooter,

            marginTop: global_marginTop = 0,
            marginBottom: global_marginBottom = 0,
            marginRight: global_marginRight = 0,
            marginLeft: global_marginLeft = 0,
            marginHeader: global_marginHeader = 0,
            marginFooter: global_marginFooter = 0,

            charSpace = 0, // charSpace
            linePitch = 15.6, // linePitch pt
            gridType = GridType.LINES, // gridType
            paragraphLineGapDefault = 0,
            defaultTabStop = 10.5,
            textStyle = {
                fs: 14,
            },
            renderConfig: global_renderConfig = {
                horizontalAlign: HorizontalAlign.UNSPECIFIED,
                verticalAlign: VerticalAlign.UNSPECIFIED,
                centerAngle: 0,
                vertexAngle: 0,
                wrapStrategy: WrapStrategy.UNSPECIFIED,
            },
        } = documentStyle;
        const skeleton = this.__getNullSke();

        const fontLocale = this.getFontLocale();

        const docsConfig: IDocsConfig = {
            headerTreeMap,
            footerTreeMap,
            lists,
            drawings,

            charSpace,
            linePitch,
            gridType,
            fontLocale,
            paragraphLineGapDefault,
            defaultTabStop,
            documentTextStyle: textStyle,
        };

        const { skeHeaders, skeFooters, skeListLevel, drawingAnchor } = skeleton;

        const skeletonResourceReference: ISkeletonResourceReference = {
            skeHeaders,
            skeFooters,
            skeListLevel,
            drawingAnchor,
        };

        const allSkeletonPages: IDocumentSkeletonPage[] = [];

        skeleton.pages = allSkeletonPages;

        const bodyModel = this._docModel.bodyModel;
        bodyModel.resetCache();
        for (let i = 0, len = bodyModel.children.length; i < len; i++) {
            const sectionNode = bodyModel.children[i];
            const sectionBreak = bodyModel.getSectionBreak(sectionNode.endIndex) || DEFAULT_SECTION_BREAK;
            const {
                pageNumberStart = global_pageNumberStart,
                pageSize = global_pageSize,
                pageOrient = global_pageOrient,
                marginTop = global_marginTop,
                marginBottom = global_marginBottom,
                marginRight = global_marginRight,
                marginLeft = global_marginLeft,
                marginHeader = global_marginHeader,
                marginFooter = global_marginFooter,

                defaultHeaderId = global_defaultHeaderId,
                defaultFooterId = global_defaultFooterId,
                evenPageHeaderId = global_evenPageHeaderId,
                evenPageFooterId = global_evenPageFooterId,
                firstPageHeaderId = global_firstPageHeaderId,
                firstPageFooterId = global_firstPageFooterId,
                useFirstPageHeaderFooter = global_useFirstPageHeaderFooter,
                useEvenPageHeaderFooter = global_useEvenPageHeaderFooter,

                columnProperties = [],
                columnSeparatorType = ColumnSeparatorType.NONE,
                contentDirection,
                sectionType,
                textDirection,
                renderConfig = global_renderConfig,
            } = sectionBreak;

            const sectionNodeNext = bodyModel.children[i + 1];
            const sectionTypeNext = bodyModel.getSectionBreak(sectionNodeNext?.endIndex)?.sectionType;

            const headerIds = { defaultHeaderId, evenPageHeaderId, firstPageHeaderId };
            const footerIds = { defaultFooterId, evenPageFooterId, firstPageFooterId };

            if (pageSize.width === null) {
                pageSize.width = Infinity;
            }

            if (pageSize.height === null) {
                pageSize.height = Infinity;
            }

            const sectionBreakConfig: ISectionBreakConfig = {
                pageNumberStart,
                pageSize,
                pageOrient,
                marginTop,
                marginBottom,
                marginRight,
                marginLeft,
                marginHeader,
                marginFooter,

                headerIds,
                footerIds,

                useFirstPageHeaderFooter,
                useEvenPageHeaderFooter,

                columnProperties,
                columnSeparatorType,
                contentDirection,
                sectionType,
                sectionTypeNext,
                textDirection,
                renderConfig,

                ...docsConfig,
            };

            let curSkeletonPage: IDocumentSkeletonPage = getLastPage(allSkeletonPages);
            let isContinuous = false;
            if (sectionType === SectionType.CONTINUOUS) {
                updateBlockIndex(allSkeletonPages);
                this.__addNewSectionByContinuous(curSkeletonPage, columnProperties, columnSeparatorType);
                isContinuous = true;
            } else {
                curSkeletonPage = createSkeletonPage(
                    sectionBreakConfig,
                    skeletonResourceReference,
                    curSkeletonPage?.pageNumber
                );
            }

            // 计算页内布局，block结构
            const blockInfo = dealWithSections(
                bodyModel,
                sectionNode,
                curSkeletonPage,
                sectionBreakConfig,
                skeletonResourceReference,
                this._renderedBlockIdMap
            );

            // todo: 当本节有多个列，且下一节为连续节类型的时候，需要按照列数分割，重新计算lines
            if (sectionTypeNext === SectionType.CONTINUOUS && columnProperties.length > 0) {
                // TODO
            }

            const { pages, renderedBlockIdMap } = blockInfo;

            // renderedBlockIdMap.forEach((value, blockId) => {
            //     this._renderedBlockIdMap.set(blockId, value);
            // });

            if (isContinuous) {
                pages.splice(0, 1);
            }

            allSkeletonPages.push(...pages);
        }

        // 计算页和节的位置信息
        updateBlockIndex(allSkeletonPages);

        this._setPageParent(allSkeletonPages, skeleton);

        return skeleton;
    }

    private _setPageParent(pages: IDocumentSkeletonPage[], parent: IDocumentSkeletonCached) {
        for (const page of pages) {
            page.parent = parent;
        }
    }

    // 一页存在多个section的情况，仅在SectionType.CONTINUOUS的情况下出现
    private __addNewSectionByContinuous(
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

    private __getNullSke(): IDocumentSkeletonCached {
        return {
            pages: [],
            left: 0,
            top: 0,
            st: 0,
            skeHeaders: new Map(),
            skeFooters: new Map(),
            skeListLevel: new Map(),
            drawingAnchor: new Map(),
        };
    }

    private _findNodeIterator(charIndex: number) {
        const skeletonData = this.getSkeletonData();

        if (!skeletonData) {
            return;
        }

        const pages = skeletonData.pages;

        for (const page of pages) {
            const { sections, st, ed } = page;

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
                        const { divides, lineHeight, st, ed } = line;
                        const divideLength = divides.length;

                        if (charIndex < st || charIndex > ed) {
                            continue;
                        }

                        for (let i = 0; i < divideLength; i++) {
                            const divide = divides[i];
                            const { spanGroup, st, ed } = divide;

                            if (charIndex < st || charIndex > ed) {
                                continue;
                            }

                            if (spanGroup[0].spanType === SpanType.LIST) {
                                charIndex++;
                            }

                            const span = spanGroup[charIndex - st];

                            if (span) {
                                return {
                                    page,
                                    section,
                                    column,
                                    line,
                                    divide,
                                    span,
                                };
                            }
                        }
                    }
                }
            }
        }
    }
}
