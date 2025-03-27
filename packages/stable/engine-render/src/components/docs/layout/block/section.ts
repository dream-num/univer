/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { Nullable } from '@univerjs/core';
import type { IDocumentSkeletonPage } from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';
import type { ILayoutContext } from '../tools';
import { DataStreamTreeNodeType } from '@univerjs/core';
import { createSkeletonPage } from '../model/page';
import { dealWithBlockError } from './block-error';
import { dealWidthParagraph } from './paragraph/paragraph-layout';

export function dealWithSection(
    ctx: ILayoutContext,
    viewModel: DocumentViewModel,
    sectionNode: DataStreamTreeNode,
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    layoutAnchor: Nullable<number>
) {
    const allCurrentSkeletonPages: IDocumentSkeletonPage[] = [];
    const renderedBlockIdMap = new Map<string, boolean>();

    let paragraphStartIndex = 0;

    if (layoutAnchor != null) {
        const { startIndex, endIndex } = sectionNode;
        if (layoutAnchor >= startIndex && layoutAnchor <= endIndex) {
            for (let pi = 0; pi < sectionNode.children.length; pi++) {
                const paragraph = sectionNode.children[pi];
                if (paragraph.endIndex === layoutAnchor) {
                    paragraphStartIndex = pi;
                    break;
                }
            }
        }
    }

    for (let i = paragraphStartIndex; i < sectionNode.children.length; i++) {
        const paragraphNode = sectionNode.children[i];
        // const { paragraph, table, tableOfContents, blockType, customBlock, blockId } = block;
        // if (preRenderedBlockIdMap?.get(blockId)) {
        //     continue;
        // }
        let skeletonPages: IDocumentSkeletonPage[] = [];
        let currentPageCache = curPage;
        if (allCurrentSkeletonPages.length > 0) {
            currentPageCache = allCurrentSkeletonPages[allCurrentSkeletonPages.length - 1];
        }

        if (paragraphNode.nodeType === DataStreamTreeNodeType.PARAGRAPH) {
            // Paragraph 段落
            if (ctx.paragraphsOpenNewPage.has(paragraphNode.endIndex)) {
                currentPageCache = createSkeletonPage(
                    ctx,
                    sectionBreakConfig,
                    ctx.skeletonResourceReference,
                    currentPageCache.pageNumber + 1
                );
            }
            skeletonPages = dealWidthParagraph(
                ctx,
                viewModel,
                paragraphNode,
                currentPageCache,
                sectionBreakConfig
            );
        }

        if (skeletonPages.length === 0) {
            skeletonPages = dealWithBlockError();
        }

        _pushPage(allCurrentSkeletonPages, skeletonPages);

        // renderedBlockIdMap.set(blockId, true);
        if (ctx.isDirty) {
            break;
        }
    }

    const { segmentId } = curPage;

    if (ctx.isDirty && ctx.layoutStartPointer[segmentId] != null) {
        // Rollback the skeleton to the layout start point.
        _rollbackPages(ctx.layoutStartPointer[segmentId] as number, allCurrentSkeletonPages);
    }

    return {
        pages: allCurrentSkeletonPages,
        renderedBlockIdMap,
    };
}

// Roll back pages to the state it was in before the dirty paragraph.
function _rollbackPages(paragraphIndex: number, allCurrentSkeletonPages: IDocumentSkeletonPage[]) {
    let findFirstDirtyLine = false;
    for (let pageIndex = 0; pageIndex < allCurrentSkeletonPages.length; pageIndex++) {
        const page = allCurrentSkeletonPages[pageIndex];

        for (let sectionIndex = 0; sectionIndex < page.sections.length; sectionIndex++) {
            const section = page.sections[sectionIndex];

            for (let columnIndex = 0; columnIndex < section.columns.length; columnIndex++) {
                const column = section.columns[columnIndex];

                for (let lineIndex = 0; lineIndex < column.lines.length; lineIndex++) {
                    const line = column.lines[lineIndex];

                    if (line.paragraphIndex === paragraphIndex) {
                        findFirstDirtyLine = true;
                        column.lines.splice(lineIndex);
                        break;
                    }
                }

                if (findFirstDirtyLine) {
                    let columnSplitIndex = column.lines.length ? columnIndex + 1 : columnIndex;
                    columnSplitIndex = Math.max(columnSplitIndex, 1);
                    const preColumnIndex = columnSplitIndex - 1;
                    if (preColumnIndex >= 0) {
                        section.columns[preColumnIndex].isFull = false;
                    }
                    section.columns.splice(columnSplitIndex);
                    break;
                }
            }

            if (findFirstDirtyLine) {
                const sectionSplitIndex = sectionIndex + 1;
                page.sections.splice(sectionSplitIndex);
                break;
            }
        }

        if (findFirstDirtyLine) {
            // Even if all the rows are removed, leave an empty page with an empty section and column.
            // This is because this keeps the image cache(skeDrawings) on the page.
            const pageSplitIndex = pageIndex + 1;
            allCurrentSkeletonPages.splice(Math.max(pageSplitIndex, 1));
            break;
        }
    }
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
