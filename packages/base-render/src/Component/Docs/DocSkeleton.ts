import {
    ColumnSeparatorType,
    ContextBase,
    GridType,
    HorizontalAlign,
    IBlockElement,
    IDocumentData,
    ISectionBreak,
    ISectionColumnProperties,
    Observable,
    PageOrientType,
    SectionType,
    VerticalAlign,
    WrapStrategy,
} from '@univer/core';
import { getLastPage } from './Common/Tools';

import { createSkeletonPage } from './Common/Page';

import { createSkeletonSection } from './Common/Section';

import { dealWithBlocks } from './Block/Block';

import { IDocumentSkeletonCached, IDocumentSkeletonPage, ISkeletonResourceReference } from '../../Basics/IDocumentSkeletonCached';
import { IDocsConfig, ISectionBreakConfig } from '../../Basics/Interfaces';
import { Skeleton } from '../Skeleton';
import { IBoundRect } from '../../Basics/Vector2';

interface IDocumentContentMap {
    blockElements: IBlockElement[];
    sectionBreak?: ISectionBreak;
}

export enum DocumentSkeletonState {
    PENDING = 'pending',
    CALCULATING = 'calculating',
    READY = 'ready',
    INVALID = 'invalid',
}

interface IDrawingUpdateConfig {
    left: number;
    top: number;
    height: number;
    width: number;
}

export class DocumentSkeleton extends Skeleton {
    private _documentData: IDocumentData;

    private _skeletonData: IDocumentSkeletonCached;

    private _renderedBlockIdMap = new Map<string, boolean>();

    onRecalculateChangeObservable = new Observable<IDocumentSkeletonCached>();

    constructor(documentData: IDocumentData, context: ContextBase) {
        super(context);
        this._documentData = documentData;
    }

    updateDrawing(id: string, config: IDrawingUpdateConfig) {
        const drawings = this._documentData.drawings;
        if (!drawings) {
            return;
        }

        const drawing = drawings[id];

        const objectProperties = drawing.objectProperties;

        objectProperties.size.width = config.width;
        objectProperties.size.height = config.height;

        objectProperties.positionH.posOffset = config.left;
        objectProperties.positionV.posOffset = config.top;
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
        return this._documentData.documentStyle.pageSize;
    }

    updateDocumentDataPageSize(width?: number, height?: number) {
        const documentStyle = this._documentData.documentStyle;
        if (!documentStyle.pageSize) {
            width = width ?? Infinity;
            height = height ?? Infinity;
            documentStyle.pageSize = {
                width,
                height,
            };
            return;
        }

        if (width !== undefined) {
            documentStyle.pageSize.width = width;
        }

        if (height !== undefined) {
            documentStyle.pageSize.height = height;
        }
    }

    private __getContentMapArr() {
        const { body } = this._documentData;
        if (!body) {
            return [];
        }
        const { blockElements, blockElementOrder } = body;

        if (!blockElements || blockElementOrder.length === 0) {
            return [];
        }

        const documentContentMapArr: IDocumentContentMap[] = [];
        let documentContentMap: IDocumentContentMap = {
            blockElements: [],
            sectionBreak: undefined,
        };
        // sectionBreak会在一个段落的底部，定义之前所有段落的页样式。
        blockElementOrder.forEach((bId: string) => {
            const dcd = blockElements[bId];
            const { sectionBreak: sSectionBreak } = dcd;
            if (sSectionBreak) {
                documentContentMap.sectionBreak = sSectionBreak;
                documentContentMapArr.push(documentContentMap);
                documentContentMap = {
                    blockElements: [],
                    sectionBreak: undefined,
                };
            } else {
                documentContentMap.blockElements.push(dcd);
            }
        });

        if (!documentContentMap.sectionBreak) {
            documentContentMap.sectionBreak = {
                columnProperties: [],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
            };
            documentContentMapArr.push(documentContentMap);
        }
        // console.log('documentContentMapArr', documentContentMapArr, blockElements);
        return documentContentMapArr;
    }

    private _createSkeleton(bounds?: IBoundRect) {
        const documentContentMapArr = this.__getContentMapArr();
        // 每一个布局
        const DEFAULT_PAGE_SIZE = { width: Infinity, height: Infinity };
        const { documentStyle, footers, headers, lists, drawings } = this._documentData;
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
        if (documentContentMapArr.length === 0) {
            return skeleton;
        }

        const fontLocale = this.getFontLocale();

        const docsConfig: IDocsConfig = {
            footers,
            headers,
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

        const { skeHeaders, skeFooters, skeListLevel, blockAnchor } = skeleton;

        const skeletonResourceReference: ISkeletonResourceReference = {
            skeHeaders,
            skeFooters,
            skeListLevel,
            blockAnchor,
        };

        const allSkeletonPages: IDocumentSkeletonPage[] = [];

        skeleton.pages = allSkeletonPages;

        // 按照SectionBreak分割文档，进行布局计算
        for (let i = 0; i < documentContentMapArr.length; i++) {
            const documentContentMap = documentContentMapArr[i];
            if (!documentContentMap.sectionBreak) {
                continue;
            }

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
            } = documentContentMap.sectionBreak;

            const dcmNext = documentContentMapArr[i + 1];
            const sectionTypeNext = dcmNext?.sectionBreak?.sectionType;

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
            if (sectionType === SectionType.CONTINUOUS) {
                this.__addNewSectionByContinuous(curSkeletonPage, columnProperties, columnSeparatorType);
            } else {
                curSkeletonPage = createSkeletonPage(sectionBreakConfig, skeletonResourceReference, curSkeletonPage?.pageNumber);
            }
            // 计算页内布局，block结构
            const context = this.getContext();
            const blockInfo = dealWithBlocks(documentContentMap.blockElements, curSkeletonPage, sectionBreakConfig, skeletonResourceReference, this._renderedBlockIdMap, context);

            // todo: 当本节有多个列，且下一节为连续节类型的时候，需要按照列数分割，重新计算lines
            if (sectionTypeNext === SectionType.CONTINUOUS && columnProperties.length > 0) {
                // TODO
            }

            const { pages, renderedBlockIdMap } = blockInfo;
            // 计算页和节的位置信息
            pages.forEach((page: IDocumentSkeletonPage) => {});

            // renderedBlockIdMap.forEach((value, blockId) => {
            //     this._renderedBlockIdMap.set(blockId, value);
            // });

            allSkeletonPages.push(...pages);
        }

        return skeleton;
    }

    // 一页存在多个section的情况，仅在SectionType.CONTINUOUS的情况下出现
    private __addNewSectionByContinuous(curSkeletonPage: IDocumentSkeletonPage, columnProperties: ISectionColumnProperties[], columnSeparatorType: ColumnSeparatorType) {
        const sections = curSkeletonPage.sections;
        const lastSection = sections[sections.length - 1];
        const { width, height, marginTop: curPageMT, marginBottom: curPageMB, marginLeft: curPageML, marginRight: curPageMR } = curSkeletonPage;
        const pageContentWidth = width - curPageML - curPageMR;
        const pageContentHeight = height - curPageMT - curPageMB;
        const lastSectionBottom = (lastSection?.top || 0) + (lastSection?.height || 0);
        const newSection = createSkeletonSection(columnProperties, columnSeparatorType, lastSectionBottom, pageContentWidth, pageContentHeight - lastSectionBottom);
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
            blockAnchor: new Map(),
        };
    }

    static create(documentData: IDocumentData, context: ContextBase) {
        return new DocumentSkeleton(documentData, context);
    }
}
