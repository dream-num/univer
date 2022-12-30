import {
    ColumnSeparatorType,
    IBullet,
    IDrawing,
    IDrawings,
    IElementsOrder,
    IParagraph,
    Nullable,
    ParagraphElementType,
    PositionedObjectLayoutType,
    ContextBase,
} from '@univer/core';
import { dealWidthTextRun } from './TextRun';
import { dealWidthBullet } from './Bullet';
import { dealWidthInlineDrawing } from './InlineDrawing';

import { getLastNotFullColumnInfo } from '../../Common/Tools';
import { createSkeletonPage } from '../../Common/Page';
import { setColumnFullState } from '../../Common/Section';

import { BreakType, IDocumentSkeletonBullet, IDocumentSkeletonDrawing, IDocumentSkeletonPage, ISkeletonResourceReference } from '../../../../Basics/IDocumentSkeletonCached';
import { IParagraphConfig, ISectionBreakConfig } from '../../../../Basics/Interfaces';

export function dealWidthParagraph(
    blockId: string,
    paragraph: IParagraph,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    context?: ContextBase
): IDocumentSkeletonPage[] {
    const {
        pageNumberStart,
        pageSize = {
            w: Infinity,
            h: Infinity,
        },

        marginRight = 0,
        marginLeft = 0,

        columnProperties = [],
        columnSeparatorType = ColumnSeparatorType.NONE,
        contentDirection,
        sectionType,
        sectionTypeNext,
        textDirection,
        lists,
        drawings = {},
        fontLocale,
    } = sectionBreakConfig;

    const { elements, elementOrder, paragraphStyle = {}, bullet } = paragraph;

    // const paragraphAffectSkeDrawings = _changeDrawingToSkeletonFormat(drawingIds, drawings);

    // curPage.skeDrawings = paragraphAffectSkeDrawings;

    const { skeHeaders, skeFooters, skeListLevel, blockAnchor } = skeletonResourceReference;

    // const pageWidth = pageSize.w || Infinity;
    // const pageHeight = pageSize.h || Infinity;

    // const headerAndFooterAffectSkeDrawings = new Map([
    //     ...(skeHeaders?.get(curPage.headerId)?.get(pageWidth)?.skeDrawings || []),
    //     ...(skeFooters?.get(curPage.footerId)?.get(pageWidth)?.skeDrawings || []),
    // ]);

    // curPage.skeDrawings = affectSkeDrawings; // 加入本段落的对象

    const paragraphConfig: IParagraphConfig = {
        blockId,
        paragraphStyle,
        // paragraphAffectSkeDrawings,
        skeHeaders,
        skeFooters,
        blockAnchor,
    };

    const pages = [curPage];
    let lastPage = curPage;

    // if (pageSize.h === Infinity) {
    //     // 无需分页的情况，适合表格单元格或者类似notion的block布局
    // }

    // if (curPage.sections.length > 0) {
    //     // 处理接上一页的情况
    //     let columnHeight = _getColumnHeight(curPage);
    //     curPage.skeDrawings;

    //     return [];
    // }

    const paragraphAffectSkeDrawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    const listLevelAncestors = _getListLevelAncestors(bullet, skeListLevel); // 取得列表所有level的缓存
    const bulletSkeleton = dealWidthBullet(bullet, lists, listLevelAncestors, fontLocale, context); // 生成bullet
    _updateListLevelAncestors(bullet, bulletSkeleton, skeListLevel); // 更新最新的level缓存列表
    paragraphConfig.bulletSkeleton = bulletSkeleton;

    elementOrder.forEach((elementOrderItem: IElementsOrder, elementIndex: number) => {
        const { elementId, paragraphElementType } = elementOrderItem;
        let currentPages: IDocumentSkeletonPage[] = [];
        if (paragraphElementType === ParagraphElementType.DRAWING) {
            const drawingOrigin = drawings[elementId];
            if (drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE) {
                currentPages = dealWidthInlineDrawing(drawingOrigin, elementIndex, sectionBreakConfig, lastPage, paragraphConfig, fontLocale);
            } else {
                paragraphAffectSkeDrawings.set(elementId, _getDrawingSkeletonFormat(drawingOrigin));
            }
        }
    });

    // let currentLine = createSkeletonLine({ ...paragraphConfig, bulletSkeleton, affectSkeDrawings: affectAllSkeDrawings });
    // 处理1列的情况
    // 如果下一节是连续的，则按照1列进行计算，计算结果返回后，用来预估列高度，然后在接来下的流程进行二次计算
    elementOrder.forEach((elementOrderItem: IElementsOrder, elementIndex: number) => {
        const { elementId, paragraphElementType } = elementOrderItem;
        let currentPages: IDocumentSkeletonPage[] = [];
        if (paragraphElementType === ParagraphElementType.TEXT_RUN) {
            const element = elements[elementId];
            const { tr: textRun, st, ed } = element;
            if (!textRun) {
                return false;
            }
            currentPages = dealWidthTextRun(textRun, elementIndex, sectionBreakConfig, lastPage, { ...paragraphConfig, paragraphAffectSkeDrawings }, fontLocale);
        } else if (paragraphElementType === ParagraphElementType.PAGE_BREAK) {
            // 换页标识，换页后还在同一个节内
            currentPages = [createSkeletonPage(sectionBreakConfig, skeletonResourceReference, _getNextPageNumber(lastPage), BreakType.PAGE)];
            paragraphAffectSkeDrawings.clear();
        } else if (paragraphElementType === ParagraphElementType.COLUMN_BREAK) {
            // 换列标识，还在同一个节内
            const columnInfo = getLastNotFullColumnInfo(lastPage);

            if (columnInfo && !columnInfo.isLast) {
                setColumnFullState(columnInfo.column, true);
            } else {
                currentPages = [createSkeletonPage(sectionBreakConfig, skeletonResourceReference, _getNextPageNumber(lastPage), BreakType.COLUMN)];
            }
        }

        lastPage = _checkAndPush(pages, currentPages); // The layout engine does not have a page break, so it does not need to be added to the page array
    });
    return pages;
}

function _getListLevelAncestors(bullet?: IBullet, listLevel?: Map<string, IDocumentSkeletonBullet[]>): Array<Nullable<IDocumentSkeletonBullet>> | undefined {
    if (!bullet || !listLevel) {
        return;
    }

    const { listId, nestingLevel } = bullet;

    const sameList = listLevel?.get(listId);

    let level = nestingLevel;

    if (level < 0) {
        level = 0;
    }

    const listLevelAncestors: Array<Nullable<IDocumentSkeletonBullet>> = [];

    for (let i = level; i >= 0; i--) {
        const bs = sameList?.[i];
        listLevelAncestors[i] = bs || null;
    }

    // console.log('SymbolByBesting', sameList, listLevelAncestors, level, listId, listLevel);

    return listLevelAncestors;
}

function _updateListLevelAncestors(bullet?: IBullet, bulletSkeleton?: IDocumentSkeletonBullet, listLevel?: Map<string, IDocumentSkeletonBullet[]>) {
    if (!bullet || !bulletSkeleton) {
        return;
    }

    const { listId, nestingLevel } = bullet;

    const cacheItem: IDocumentSkeletonBullet[] = [...(listLevel?.get(listId) || [])];

    // [[nestingLevel, bulletSkeleton]];

    cacheItem[nestingLevel] = bulletSkeleton;

    cacheItem.splice(nestingLevel + 1); // 文档自上而下渲染，如果一个level被更新，则它以下的level数据的startIndex就要重置

    listLevel?.set(listId, cacheItem);
}

function _changeDrawingToSkeletonFormat(drawingIds: string[], drawings: IDrawings): Map<string, IDocumentSkeletonDrawing> {
    const skeDrawings: Map<string, IDocumentSkeletonDrawing> = new Map();
    drawingIds.forEach((objectId) => {
        const drawingOrigin = drawings[objectId];
        drawingOrigin && skeDrawings.set(objectId, _getDrawingSkeletonFormat(drawingOrigin));
    });
    return skeDrawings;
}

function _getDrawingSkeletonFormat(drawingOrigin: IDrawing) {
    const objectId = drawingOrigin.objectId;
    return {
        objectId,
        aLeft: 0,
        aTop: 0,
        width: 0,
        height: 0,
        angle: 0,
        initialState: false,
        drawingOrigin,
    };
}

function _checkAndPush(pages: IDocumentSkeletonPage[], currentPages: IDocumentSkeletonPage[]) {
    const curLast = pages.slice(-1)[0];
    const newFirst = currentPages[0];
    if (curLast === newFirst) {
        if (currentPages.length === 1) {
            return curLast;
        }
        currentPages.shift();
    }

    pages.push(...currentPages);

    return pages.slice(-1)[0];
}

// function _getAllSkeDrawings(curPage: IDocumentSkeletonPage, pageWidth: number, skeletonResourceReference: ISkeletonResourceReference, paragraphAffectSkeDrawings: Map<string, IDocumentSkeletonDrawing>) {
//     const { skeHeaders, skeFooters, skeListLevel } = skeletonResourceReference;
//     const affectAllSkeDrawings = new Map([
//         ...(skeHeaders?.get(curPage.headerId)?.get(pageWidth)?.skeDrawings || []),
//         ...(skeFooters?.get(curPage.footerId)?.get(pageWidth)?.skeDrawings || []),
//         ...paragraphAffectSkeDrawings,
//     ]);
// }

function _getNextPageNumber(lastPage: IDocumentSkeletonPage) {
    return lastPage.pageNumber + 1;
}
