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
import { DataStreamTreeTokenType, PositionedObjectLayoutType } from '@univerjs/core';
import { BreakType } from '../../../../../basics/i-document-skeleton-cached';
import type { IDocumentSkeletonBullet, IDocumentSkeletonDrawing, IDocumentSkeletonPage, ISkeletonResourceReference } from '../../../../../basics/i-document-skeleton-cached';
import { createSkeletonPage } from '../../model/page';
import { setColumnFullState } from '../../model/section';
import { getLastNotFullColumnInfo } from '../../tools';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import type { IParagraphConfig, ISectionBreakConfig } from '../../../../../basics/interfaces';
import { layoutParagraph } from './layout-ruler';
import type { IShapedText } from './shaping';
import { dealWidthInlineDrawing } from './inline-drawing';
import { dealWithBullet } from './bullet';

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

function _getNextPageNumber(lastPage: IDocumentSkeletonPage) {
    return lastPage.pageNumber + 1;
}

export function lineBreaking(
    shapedTextList: IShapedText[],
    curPage: IDocumentSkeletonPage,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference
): IDocumentSkeletonPage[] {
    const {
        lists,
        drawings = {},
        localeService,
    } = sectionBreakConfig;

    const { endIndex, startIndex, blocks = [] } = paragraphNode;

    const paragraph = bodyModel.getParagraph(endIndex) || { startIndex: 0 };

    const { paragraphStyle = {}, bullet } = paragraph;

    const { skeHeaders, skeFooters, skeListLevel, drawingAnchor } = skeletonResourceReference;

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

    let allPages = [curPage];
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
            pushPending();
            continue;
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
            continue;
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
            continue;
        }

        pushPending();
    }

    return allPages;
}
