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
    const { content = '', children } = paragraphNode;
    // Pre Steps: Layout table in paragraph if have.
    let tablePages: IDocumentSkeletonPage[] = [curPage];

    // Paragraph will only have one table at start.
    if (children.length === 1 && children[0].nodeType === DataStreamTreeNodeType.TABLE) {
        tablePages = dealWithTable(ctx, viewModel, children[0], curPage, sectionBreakConfig);
    }

    // Step 1: Text Shaping.
    const shapedTextList = shaping(
        ctx,
        content,
        viewModel,
        paragraphNode,
        sectionBreakConfig
    );

    // Step 2: Line Breaking.
    const lastPage = tablePages.pop()!;
    const contentPages = lineBreaking(
        ctx,
        viewModel,
        shapedTextList,
        lastPage,
        paragraphNode,
        sectionBreakConfig
    );

    // Step 3: Line Adjustment.
    // Handle line adjustment(stretch and shrink) and punctuation adjustment.
    lineAdjustment(
        contentPages,
        viewModel,
        paragraphNode,
        sectionBreakConfig
    );

    return [...tablePages, ...contentPages];
}

function dealWithTable(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    tableNode: DataStreamTreeNode,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig
): IDocumentSkeletonPage[] {
    return [];
}
