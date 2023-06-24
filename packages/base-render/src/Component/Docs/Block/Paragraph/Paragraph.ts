import {
    ColumnSeparatorType,
    IBullet,
    IDrawing,
    IDrawings,
    Nullable,
    PositionedObjectLayoutType,
    ContextBase,
    DataStreamTreeNode,
    GridType,
    NamedStyleType,
    HorizontalAlign,
    SpacingRule,
    BooleanNumber,
    DataStreamTreeTokenType,
} from '@univerjs/core';
import { dealWidthBullet } from './Bullet';
import { dealWidthInlineDrawing } from './InlineDrawing';

import { getCharSpaceApply, getLastNotFullColumnInfo, getSpanGroupWidth, lineIterator } from '../../Common/Tools';
import { createSkeletonPage } from '../../Common/Page';
import { setColumnFullState } from '../../Common/Section';

import { calculateParagraphLayout } from './Layout.Ruler';

import { composeCharForLanguage } from './Language.Ruler';

import {
    BreakType,
    IDocumentSkeletonBullet,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    ISkeletonResourceReference,
} from '../../../../Basics/IDocumentSkeletonCached';
import { IParagraphConfig, ISectionBreakConfig } from '../../../../Basics/Interfaces';
import { getFontStyleString } from '../../../../Basics/Tools';
import { createSkeletonTabSpan, createSkeletonWordSpan } from '../../Common/Span';

export function dealWidthParagraph(
    paragraphNode: DataStreamTreeNode,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    context?: ContextBase
): IDocumentSkeletonPage[] {
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        documentTextStyle = {},
        defaultTabStop = 10.5,

        pageNumberStart,
        pageSize = {
            width: Infinity,
            height: Infinity,
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

    const { endIndex, startIndex, content = '' } = paragraphNode;

    const bodyModel = paragraphNode.bodyModel;

    const paragraph = bodyModel.getParagraph(endIndex) || { startIndex: 0 };

    const { paragraphStyle = {}, bullet } = paragraph;

    // const paragraphAffectSkeDrawings = _changeDrawingToSkeletonFormat(drawingIds, drawings);

    // curPage.skeDrawings = paragraphAffectSkeDrawings;

    const { skeHeaders, skeFooters, skeListLevel, drawingAnchor } = skeletonResourceReference;

    // const pageWidth = pageSize.w || Infinity;
    // const pageHeight = pageSize.h || Infinity;

    // const headerAndFooterAffectSkeDrawings = new Map([
    //     ...(skeHeaders?.get(curPage.headerId)?.get(pageWidth)?.skeDrawings || []),
    //     ...(skeFooters?.get(curPage.footerId)?.get(pageWidth)?.skeDrawings || []),
    // ]);

    // curPage.skeDrawings = affectSkeDrawings; // 加入本段落的对象

    const paragraphConfig: IParagraphConfig = {
        paragraphIndex: endIndex,
        paragraphStyle,
        // paragraphAffectSkeDrawings,
        skeHeaders,
        skeFooters,
        drawingAnchor,
    };

    // const pages = [curPage];
    // let lastPage = curPage;

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
    // paragraphConfig.bulletSkeleton = bulletSkeleton;

    const {
        namedStyleType = NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED,
        horizontalAlign = HorizontalAlign.UNSPECIFIED,
        lineSpacing = 1,
        spacingRule = SpacingRule.AUTO,
        snapToGrid = BooleanNumber.TRUE,
        direction,
        spaceAbove = 0,
        spaceBelow = 0,
        borderBetween,
        borderTop,
        borderBottom,
        borderLeft,
        borderRight,
        indentFirstLine = 0,
        hanging = 0,
        indentStart = 0,
        indentEnd = 0,
        tabStops = [],
        keepLines = BooleanNumber.FALSE,
        keepNext = BooleanNumber.FALSE,
        wordWrap = BooleanNumber.FALSE,
        widowControl = BooleanNumber.FALSE,
        shading,
    } = paragraphStyle;

    let allPages: IDocumentSkeletonPage[] = [curPage];
    const pageWidth = pageSize.width || Infinity - marginLeft - marginRight;

    for (let i = 0, len = content.length; i < len; i++) {
        const charIndex = i + startIndex;
        const char = content[i];

        const textRun = bodyModel.getTextRun(charIndex) || { ts: {} };
        const { ts: textStyle = {} } = textRun;
        const fontStyle = getFontStyleString(textStyle, fontLocale);

        const mixTextStyle = {
            ...documentTextStyle,
            ...textStyle,
        };

        const fontCreateConfig = {
            fontStyle,
            textStyle: mixTextStyle,
            charSpace,
            gridType,
            snapToGrid,
            pageWidth,
        };

        if (char === DataStreamTreeTokenType.TAB) {
            const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
            const tabSpan = createSkeletonTabSpan(fontCreateConfig, charSpaceApply); // measureText收敛到create中执行
            allPages = calculateParagraphLayout([tabSpan], allPages, sectionBreakConfig, paragraphConfig, true);
        } else if (char === DataStreamTreeTokenType.CUSTOM_BLOCK) {
            const customBlock = bodyModel.getCustomBlock(charIndex);
            if (customBlock == null) {
                continue;
            }
            const blockId = customBlock.blockId;
            const drawingOrigin = drawings[blockId];
            if (drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE) {
                allPages = dealWidthInlineDrawing(drawingOrigin, sectionBreakConfig, allPages, paragraphConfig, fontLocale);
            } else {
                paragraphAffectSkeDrawings.set(blockId, _getDrawingSkeletonFormat(drawingOrigin));
            }
        } else if (char === DataStreamTreeTokenType.PAGE_BREAK) {
            allPages.push(createSkeletonPage(sectionBreakConfig, skeletonResourceReference, _getNextPageNumber(allPages[allPages.length - 1]), BreakType.PAGE));
            paragraphAffectSkeDrawings.clear();
        } else if (char === DataStreamTreeTokenType.COLUMN_BREAK) {
            // 换列标识，还在同一个节内
            const lastPage = allPages[allPages.length - 1];
            const columnInfo = getLastNotFullColumnInfo(lastPage);

            if (columnInfo && !columnInfo.isLast) {
                setColumnFullState(columnInfo.column, true);
            } else {
                allPages.push(createSkeletonPage(sectionBreakConfig, skeletonResourceReference, _getNextPageNumber(lastPage), BreakType.COLUMN));
            }
        } else {
            const paragraphStart = i === 0;
            const languageHandlerResult = composeCharForLanguage(char, i, content, fontCreateConfig); // Handling special languages such as Tibetan, Arabic
            let newSpanGroup = [];
            if (languageHandlerResult) {
                const { charIndex: newCharIndex, spanGroup } = languageHandlerResult;
                i = newCharIndex;
                newSpanGroup = spanGroup;
            } else {
                const span = createSkeletonWordSpan(char, fontCreateConfig); // measureText收敛到create中执行
                newSpanGroup.push(span);
            }

            allPages = calculateParagraphLayout(newSpanGroup, allPages, sectionBreakConfig, paragraphConfig, paragraphStart);
        }
    }

    lineIterator(allPages, (line: IDocumentSkeletonLine) => {
        horizontalAlignHandler(line, horizontalAlign);
    });

    return allPages;
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

function horizontalAlignHandler(line: IDocumentSkeletonLine, horizontalAlign: HorizontalAlign) {
    if (horizontalAlign === HorizontalAlign.UNSPECIFIED || horizontalAlign === HorizontalAlign.LEFT) {
        return;
    }

    const { divides } = line;
    const divideLength = divides.length;
    for (let i = 0; i < divideLength; i++) {
        const divide = divides[i];
        const { width, spanGroup } = divide;
        const spanGroupWidth = getSpanGroupWidth(divide);
        // console.log(spanGroup, spanGroupWidth, width);
        if (width === Infinity) {
            continue;
        }
        if (horizontalAlign === HorizontalAlign.CENTER) {
            divide.paddingLeft = (width - spanGroupWidth) / 2;
        } else if (horizontalAlign === HorizontalAlign.RIGHT) {
            divide.paddingLeft = width - spanGroupWidth;
        } else if (horizontalAlign === HorizontalAlign.JUSTIFIED) {
            /**todo */
        }
    }
}
