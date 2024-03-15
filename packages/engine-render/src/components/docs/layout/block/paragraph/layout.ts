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

import type { IBullet, ICustomBlock, IDrawing, IDrawings, Nullable } from '@univerjs/core';
import {
    DataStreamTreeTokenType,
    HorizontalAlign,
    PositionedObjectLayoutType,
} from '@univerjs/core';

import type {
    IDocumentSkeletonBullet,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    ISkeletonResourceReference,
} from '../../../../../basics/i-document-skeleton-cached';
import { BreakType } from '../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, ISectionBreakConfig } from '../../../../../basics/interfaces';

import { createSkeletonPage } from '../../model/page';
import { setColumnFullState } from '../../model/section';
import {
    clearFontCreateConfigCache,
    getLastNotFullColumnInfo,
    getSpanGroupWidth,
    lineIterator,
} from '../../tools';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import { dealWithBullet } from './bullet';
import { dealWidthInlineDrawing } from './inline-drawing';
import { layoutParagraph } from './layout-ruler';
import { shaping } from './shaping';

export function dealWidthParagraph(
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference
): IDocumentSkeletonPage[] {
    const {
        pageSize: _pageSize = {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },

        marginRight: _marginRight = 0,
        marginLeft: _marginLeft = 0,

        lists,
        drawings = {},
        localeService,
    } = sectionBreakConfig;

    const { endIndex, startIndex, content = '', blocks = [] } = paragraphNode;

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

    const paragraphConfig: IParagraphConfig = {
        paragraphIndex: endIndex,
        paragraphStyle,
        paragraphAffectSkeDrawings,
        skeHeaders,
        skeFooters,
        drawingAnchor,
    };

    const listLevelAncestors = _getListLevelAncestors(bullet, skeListLevel); // 取得列表所有 level 的缓存
    const bulletSkeleton = dealWithBullet(bullet, lists, listLevelAncestors, localeService); // 生成 bullet

    _updateListLevelAncestors(bullet, bulletSkeleton, skeListLevel); // 更新最新的 level 缓存列表

    paragraphConfig.bulletSkeleton = bulletSkeleton;

    const { horizontalAlign = HorizontalAlign.UNSPECIFIED } = paragraphStyle;

    let allPages = [curPage];

    const customBlockCache = new Map<number, Nullable<ICustomBlock>>();

    for (let i = 0, len = blocks.length; i < len; i++) {
        const charIndex = blocks[i];
        const customBlock = bodyModel.getCustomBlock(charIndex);
        if (customBlock == null) {
            continue;
        }

        customBlockCache.set(charIndex, customBlock);
        const blockId = customBlock.blockId;
        const drawingOrigin = drawings[blockId];
        if (drawingOrigin.layoutType !== PositionedObjectLayoutType.INLINE) {
            paragraphAffectSkeDrawings.set(blockId, _getDrawingSkeletonFormat(drawingOrigin));
        }
    }

    clearFontCreateConfigCache();

    // Step 1: Text Shaping.
    const shapedTextList = shaping(
        content,
        bodyModel,
        paragraphNode,
        sectionBreakConfig,
        paragraphStyle
    );

    // Step 2: Line Breaking.
    let paragraphStart = true;
    let charIndex = startIndex;
    for (const { text, glyphs } of shapedTextList) {
        charIndex += text.length;
        const pushPending = () => {
            if (glyphs.length === 0) {
                return;
            }

            allPages = layoutParagraph(
                glyphs,
                allPages,
                sectionBreakConfig,
                paragraphConfig,
                paragraphStart
            );

            paragraphStart = false;
        };

        if (text.endsWith(DataStreamTreeTokenType.CUSTOM_BLOCK)) {
            let customBlock = customBlockCache.get(charIndex);
            if (customBlock == null) {
                customBlock = bodyModel.getCustomBlock(charIndex);
            }
            if (customBlock != null) {
                const blockId = customBlock.blockId;
                const drawingOrigin = drawings[blockId];
                if (drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE) {
                    allPages = dealWidthInlineDrawing(
                        drawingOrigin,
                        sectionBreakConfig,
                        allPages,
                        paragraphConfig,
                        localeService
                    );
                }
            }
        } else if (text.endsWith(DataStreamTreeTokenType.PAGE_BREAK)) {
            pushPending();
            allPages.push(
                createSkeletonPage(
                    sectionBreakConfig,
                    skeletonResourceReference,
                    _getNextPageNumber(allPages[allPages.length - 1]),
                    BreakType.PAGE
                )
            );
            paragraphAffectSkeDrawings.clear();
        } else if (text.endsWith(DataStreamTreeTokenType.COLUMN_BREAK)) {
            pushPending();
            // 换列标识，还在同一个节内
            const lastPage = allPages[allPages.length - 1];
            const columnInfo = getLastNotFullColumnInfo(lastPage);

            if (columnInfo && !columnInfo.isLast) {
                setColumnFullState(columnInfo.column, true);
            } else {
                allPages.push(
                    createSkeletonPage(
                        sectionBreakConfig,
                        skeletonResourceReference,
                        _getNextPageNumber(lastPage),
                        BreakType.COLUMN
                    )
                );
            }
        }

        pushPending();
    }

    // Step 3: Line Adjustment.
    // Handle horizontal align: left\center\right\justified.
    lineIterator(allPages, (line) => {
        horizontalAlignHandler(line, horizontalAlign);
    });

    return allPages;
}

function _getListLevelAncestors(
    bullet?: IBullet,
    listLevel?: Map<string, IDocumentSkeletonBullet[]>
): Array<Nullable<IDocumentSkeletonBullet>> | undefined {
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

    return listLevelAncestors;
}

function _updateListLevelAncestors(
    bullet?: IBullet,
    bulletSkeleton?: IDocumentSkeletonBullet,
    listLevel?: Map<string, IDocumentSkeletonBullet[]>
) {
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

function _changeDrawingToSkeletonFormat(
    drawingIds: string[],
    drawings: IDrawings
): Map<string, IDocumentSkeletonDrawing> {
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

/**
 * todo: @author DR-univer
 * When aligning text horizontally within a document,
 * it may be ineffective if the total line width is not initially calculated.
 * Therefore, multiple calculations are performed, which may impact performance.
 * Needs optimization for efficiency.
 */
function horizontalAlignHandler(line: IDocumentSkeletonLine, horizontalAlign: HorizontalAlign) {
    if (horizontalAlign === HorizontalAlign.UNSPECIFIED || horizontalAlign === HorizontalAlign.LEFT) {
        return;
    }

    const { divides } = line;
    const divideLength = divides.length;
    for (let i = 0; i < divideLength; i++) {
        const divide = divides[i];
        const { width } = divide;
        const spanGroupWidth = getSpanGroupWidth(divide);

        if (width === Number.POSITIVE_INFINITY) {
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
