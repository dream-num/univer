import {
    ColumnSeparatorType,
    ContextBase,
    DocumentModelOrSimple,
    GridType,
    HorizontalAlign,
    ISectionBreak,
    ISectionColumnProperties,
    Observable,
    PageOrientType,
    SectionType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { getLastPage, updateBlockIndex } from './Common/Tools';

import { createSkeletonPage } from './Common/Page';

import { createSkeletonSection } from './Common/Section';

import { dealWithSections } from './Block/Section';

import { IDocumentSkeletonCached, IDocumentSkeletonPage, ISkeletonResourceReference } from '../../Basics/IDocumentSkeletonCached';
import { IDocsConfig, ISectionBreakConfig } from '../../Basics/Interfaces';
import { Skeleton } from '../Skeleton';
import { IBoundRect } from '../../Basics/Vector2';

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

    private _docModel: DocumentModelOrSimple;

    private _skeletonData: IDocumentSkeletonCached;

    private _renderedBlockIdMap = new Map<string, boolean>();

    constructor(docModel: DocumentModelOrSimple, context: ContextBase) {
        super(context);
        this._docModel = docModel;
    }

    static create(docModel: DocumentModelOrSimple, context: ContextBase) {
        return new DocumentSkeleton(docModel, context);
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
     * \v COLUMN_BREAK 换列
     * \f PAGE_BREAK 换页
     * \0 DOCS_END 文档结尾
     * \t TAB 制表符
     *
     * Needs to be changed：
     * \r PARAGRAPH 段落
     * \n SECTION_BREAK 章节
     *
     * \b customBlock 图片 mention等不参与文档流的场景
     *
     * 表格
     * \x1A table start 表格开始
     * \x1B table row start 表格开始
     * \x1C table cell start 表格开始
     * \x1D table cell end 表格开始
     * \x1E table row end 表格开始
     * \x1F table end 表格结束
     *
     * 文档流内的特殊范围：超链接，field，structured document tags， bookmark，comment
     * \x1F customRange start 自定义范围开始
     * \x1E customRange end 自定义范围结束
     *
     * 按照SectionBreak分割文档，进行布局计算
     * @returns view model: skeleton
     */
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
            const sectionTypeNext = bodyModel.getSectionBreak(sectionNodeNext.endIndex)?.sectionType;

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
                curSkeletonPage = createSkeletonPage(sectionBreakConfig, skeletonResourceReference, curSkeletonPage?.pageNumber);
            }
            // 计算页内布局，block结构
            const context = this.getContext();
            const blockInfo = dealWithSections(sectionNode, curSkeletonPage, sectionBreakConfig, skeletonResourceReference, this._renderedBlockIdMap, context);

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

        return skeleton;
    }

    // 一页存在多个section的情况，仅在SectionType.CONTINUOUS的情况下出现
    private __addNewSectionByContinuous(curSkeletonPage: IDocumentSkeletonPage, columnProperties: ISectionColumnProperties[], columnSeparatorType: ColumnSeparatorType) {
        const sections = curSkeletonPage.sections;
        const lastSection = sections[sections.length - 1];
        const { pageWidth, pageHeight, marginTop: curPageMT, marginBottom: curPageMB, marginLeft: curPageML, marginRight: curPageMR } = curSkeletonPage;
        const pageContentWidth = pageWidth - curPageML - curPageMR;
        const pageContentHeight = pageHeight - curPageMT - curPageMB;
        const lastSectionBottom = (lastSection?.top || 0) + (lastSection?.height || 0);
        const newSection = createSkeletonSection(columnProperties, columnSeparatorType, lastSectionBottom, 0, pageContentWidth, pageContentHeight - lastSectionBottom);
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
}
