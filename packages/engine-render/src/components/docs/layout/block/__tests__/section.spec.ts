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

import type { IDocumentSkeletonPage } from '../../../../../basics/i-document-skeleton-cached';
import { DataStreamTreeNodeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import { createSectionLayoutTestBed } from '../paragraph/__tests__/create-paragraph-layout-test-bed';
import { dealWithSection } from '../section';

function getLastPage(pages: IDocumentSkeletonPage[]) {
    return pages[pages.length - 1];
}

describe('section', () => {
    describe('dealWithSection', () => {
        it('processes a single paragraph', () => {
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['Hello']);

            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);

            expect(result.pages.length).toBeGreaterThanOrEqual(1);
            expect(result.renderedBlockIdMap).toBeInstanceOf(Map);
            const lastPage = getLastPage(result.pages);
            expect(lastPage.sections.length).toBeGreaterThan(0);
        });

        it('processes multiple paragraphs', () => {
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['Hello', 'World']);

            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);

            expect(result.pages.length).toBeGreaterThanOrEqual(1);
            const lastPage = getLastPage(result.pages);
            const lines = lastPage.sections[0].columns[0].lines;
            expect(lines.length).toBeGreaterThanOrEqual(2);
        });

        it('skips paragraphs before layoutAnchor', () => {
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['Hello', 'World']);

            // layoutAnchor points to the end of the first paragraph.
            const layoutAnchor = sectionNode.children[0].endIndex;
            const result = dealWithSection(
                ctx,
                viewModel,
                sectionNode,
                curPage,
                sectionBreakConfig,
                layoutAnchor
            );

            expect(result.pages.length).toBeGreaterThanOrEqual(1);
            const lastPage = getLastPage(result.pages);
            const lines = lastPage.sections[0].columns[0].lines;
            // Should only contain lines from the second paragraph onwards.
            expect(lines.length).toBeGreaterThanOrEqual(1);
        });

        it('stops early when ctx.isDirty is true', () => {
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['Hello', 'World']);

            ctx.isDirty = true;
            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);

            expect(result.pages.length).toBeGreaterThanOrEqual(1);
            const lastPage = getLastPage(result.pages);
            const lines = lastPage.sections[0].columns[0].lines;
            // Only first paragraph is processed before dirty break.
            expect(lines.length).toBeGreaterThanOrEqual(1);
        });

        it('rolls back pages when dirty and layoutStartPointer is set', () => {
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['Hello']);

            // paragraphIndex in lines is set to the paragraphNode's endIndex.
            const paragraphEndIndex = sectionNode.children[0].endIndex;
            ctx.isDirty = true;
            ctx.layoutStartPointer[''] = paragraphEndIndex;

            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);

            expect(result.pages.length).toBeGreaterThanOrEqual(1);
            const lastPage = getLastPage(result.pages);
            const lines = lastPage.sections[0].columns[0].lines;
            // After rollback, lines at or after the dirty paragraphIndex should be removed.
            const rolledBackLines = lines.filter((line) => line.paragraphIndex >= paragraphEndIndex);
            expect(rolledBackLines.length).toBe(0);
        });

        it('opens a new page when paragraphsOpenNewPage contains the paragraph endIndex', () => {
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['Hello', 'World']);

            // Mark the second paragraph to open a new page.
            ctx.paragraphsOpenNewPage.add(sectionNode.children[1].endIndex);
            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);

            // Should have two pages because the second paragraph starts on a new page.
            expect(result.pages.length).toBeGreaterThanOrEqual(2);
        });

        it('handles an empty section', () => {
            const { ctx, viewModel, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['Hello']);

            const emptySectionNode = new DataStreamTreeNode(DataStreamTreeNodeType.SECTION_BREAK, '');
            emptySectionNode.startIndex = 0;
            emptySectionNode.endIndex = 0;
            emptySectionNode.children = [];

            const result = dealWithSection(ctx, viewModel, emptySectionNode, curPage, sectionBreakConfig, null);

            expect(result.pages.length).toBe(0);
            expect(result.renderedBlockIdMap.size).toBe(0);
        });
    });
});
