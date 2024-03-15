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

import { DataStreamTreeNodeType } from '@univerjs/core';

import type { IDocumentSkeletonPage, ISkeletonResourceReference } from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import { dealWithBlockError } from './block-error';
import { dealWidthParagraph } from './paragraph/layout';

export function dealWithSections(
    bodyModel: DocumentViewModel,
    sectionNode: DataStreamTreeNode,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    _preRenderedBlockIdMap?: Map<string, boolean>
) {
    const allCurrentSkeletonPages: IDocumentSkeletonPage[] = [];
    const renderedBlockIdMap = new Map<string, boolean>();

    for (const node of sectionNode.children) {
        // const { paragraph, table, tableOfContents, blockType, customBlock, blockId } = block;
        // if (preRenderedBlockIdMap?.get(blockId)) {
        //     continue;
        // }
        let skeletonPages: IDocumentSkeletonPage[] = [];
        let currentPageCache = curPage;
        if (allCurrentSkeletonPages.length > 0) {
            currentPageCache = allCurrentSkeletonPages[allCurrentSkeletonPages.length - 1];
        }
        if (node.nodeType === DataStreamTreeNodeType.PARAGRAPH) {
            // Paragraph 段落
            skeletonPages = dealWidthParagraph(
                bodyModel,
                node,
                currentPageCache,
                sectionBreakConfig,
                skeletonResourceReference
            );
        } else if (node.nodeType === DataStreamTreeNodeType.TABLE) {
            // Table 表格
        }

        if (skeletonPages.length === 0) {
            skeletonPages = dealWithBlockError();
        }

        _pushPage(allCurrentSkeletonPages, skeletonPages);

        // renderedBlockIdMap.set(blockId, true);
    }

    return {
        pages: allCurrentSkeletonPages,
        renderedBlockIdMap,
    };
}

function _pushPage(allCurrentSkeletonPages: IDocumentSkeletonPage[], blockSkeletonPages: IDocumentSkeletonPage[]) {
    const lastIndex = allCurrentSkeletonPages.length - 1;
    const lastOldPage = allCurrentSkeletonPages[lastIndex];
    const firstNewPage = blockSkeletonPages[0];

    if (lastOldPage === firstNewPage) {
        blockSkeletonPages.splice(0, 1);
    }

    allCurrentSkeletonPages.push(...blockSkeletonPages);
}

// 当本节有多个列，且下一节为连续节类型的时候，需要按照列数分割，重新计算lines
export function dealWidthBlocksByMultiColumnAndContinuous() {}
