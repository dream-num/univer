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

import type { IDocumentSkeletonPage } from '../../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../../basics/interfaces';
import type { ILayoutContext } from '../../tools';
import { clearFontCreateConfigCache } from '../../tools';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import { shaping } from './shaping';
import { lineBreaking } from './linebreaking';
import { lineAdjustment } from './line-adjustment';

export function dealWidthParagraph(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig
): IDocumentSkeletonPage[] {
    clearFontCreateConfigCache();

    // Step 1: Text Shaping.
    const { content = '' } = paragraphNode;
    const shapedTextList = shaping(
        ctx,
        content,
        viewModel,
        paragraphNode,
        sectionBreakConfig
    );

    // Step 2: Line Breaking.
    const allPages = lineBreaking(
        ctx,
        viewModel,
        shapedTextList,
        curPage,
        paragraphNode,
        sectionBreakConfig
    );

    // Step 3: Line Adjustment.
    // Handle line adjustment(stretch and shrink) and punctuation adjustment.
    lineAdjustment(
        allPages,
        viewModel,
        paragraphNode,
        sectionBreakConfig
    );

    return allPages;
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
