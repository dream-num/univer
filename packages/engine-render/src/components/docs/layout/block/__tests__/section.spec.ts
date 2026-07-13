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
import { BooleanNumber, ColumnLayoutType, ColumnResponsiveType, DashStyleType, DataStreamTreeNodeType, DataStreamTreeTokenType, DocumentBlockRangeType, TableAlignmentType, TableRowHeightRule, TableSizeType, TableTextWrapType, VerticalAlignmentType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import { updateBlockIndex } from '../../tools';
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

        it('lays out column group blocks into page skeleton columns', () => {
            const dataStream = [
                DataStreamTreeTokenType.COLUMN_GROUP_START,
                DataStreamTreeTokenType.COLUMN_START,
                'Left',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_START,
                'Right',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_GROUP_END,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['unused'], {
                    body: {
                        dataStream,
                        paragraphs: [
                            {
                                startIndex: 6,
                                paragraphId: 'left',
                                paragraphStyle: {
                                    borderBottom: {
                                        color: { rgb: '#336699' },
                                        dashStyle: DashStyleType.SOLID,
                                        padding: 4,
                                        width: 2,
                                    },
                                },
                            },
                            { startIndex: 14, paragraphId: 'right' },
                        ],
                        sectionBreaks: [{ sectionId: 'section_fixture_1014', startIndex: dataStream.length - 1 }],
                        columnGroups: [{
                            startIndex: 0,
                            endIndex: dataStream.length - 1,
                            columnGroupId: 'cg-1',
                            gap: { v: 12 },
                            layout: ColumnLayoutType.FIXED,
                            responsive: ColumnResponsiveType.SHRINK,
                            columns: [
                                { columnId: 'left-col', widthRatio: 1, minWidth: { v: 40 } },
                                { columnId: 'right-col', widthRatio: 1, minWidth: { v: 40 } },
                            ],
                        }],
                    },
                });

            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);
            const page = result.pages[0];
            const columnGroup = page.skeColumnGroups.get('cg-1');

            expect(columnGroup).toBeTruthy();
            if (columnGroup == null) {
                throw new Error('Expected column group skeleton to be created');
            }

            expect(columnGroup).toMatchObject({
                columnGroupId: 'cg-1',
                left: 0,
                width: 266.66666666666663,
                columns: [
                    { columnId: 'left-col', left: 0, width: 127.33333333333331 },
                    { columnId: 'right-col', left: 139.33333333333331, width: 127.33333333333331 },
                ],
            });
            expect(columnGroup.height).toBeGreaterThan(0);
            expect(columnGroup.columns[0].page.sections[0].columns[0].lines.length).toBeGreaterThan(0);
            expect(columnGroup.columns[0].page.sections[0].columns[0].lines[0].borderBottom).toMatchObject({
                color: { rgb: '#336699' },
                padding: 4,
                width: 2,
            });
            expect(page.sections[0].columns[0].lines.at(-1)).toMatchObject({
                paragraphIndex: columnGroup.ed,
                lineHeight: columnGroup.height,
            });
        });

        it('reserves visible height for empty column group blocks', () => {
            const dataStream = [
                DataStreamTreeTokenType.COLUMN_GROUP_START,
                DataStreamTreeTokenType.COLUMN_START,
                ' ',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_START,
                ' ',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_GROUP_END,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['unused'], {
                    body: {
                        dataStream,
                        paragraphs: [
                            { startIndex: 3, paragraphId: 'left' },
                            { startIndex: 7, paragraphId: 'right' },
                        ],
                        sectionBreaks: [{ sectionId: 'section_fixture_1015', startIndex: dataStream.length - 1 }],
                        columnGroups: [{
                            startIndex: 0,
                            endIndex: dataStream.length - 1,
                            columnGroupId: 'cg-empty',
                            gap: { v: 12 },
                            layout: ColumnLayoutType.FIXED,
                            responsive: ColumnResponsiveType.SHRINK,
                            columns: [
                                { columnId: 'left-col', widthRatio: 1, minWidth: { v: 40 } },
                                { columnId: 'right-col', widthRatio: 1, minWidth: { v: 40 } },
                            ],
                        }],
                    },
                });

            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);
            const page = result.pages[0];
            const columnGroup = page.skeColumnGroups.get('cg-empty');

            expect(columnGroup?.height).toBe(72);
            expect(columnGroup?.columns.map((column) => column.height)).toEqual([72, 72]);
            expect(columnGroup?.columns.map((column) => column.page.sections[0].columns[0].lines.length)).toEqual([1, 1]);
            expect(columnGroup?.columns.map((column) =>
                column.page.sections[0].columns[0].lines[0].divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.content))
            )).toEqual([[' ', DataStreamTreeTokenType.PARAGRAPH], [' ', DataStreamTreeTokenType.PARAGRAPH]]);
            expect(page.sections[0].columns[0].lines.at(-1)).toMatchObject({
                lineHeight: 72,
                paragraphIndex: columnGroup?.ed,
            });
        });

        it('pushes following paragraph lines below an empty column group block', () => {
            const dataStream = [
                DataStreamTreeTokenType.COLUMN_GROUP_START,
                DataStreamTreeTokenType.COLUMN_START,
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_START,
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_GROUP_END,
                'After',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['unused'], {
                    body: {
                        dataStream,
                        paragraphs: [
                            { startIndex: 2, paragraphId: 'left' },
                            { startIndex: 5, paragraphId: 'right' },
                            { startIndex: 13, paragraphId: 'after' },
                        ],
                        sectionBreaks: [{ sectionId: 'section_fixture_1016', startIndex: dataStream.length - 1 }],
                        columnGroups: [{
                            startIndex: 0,
                            endIndex: 7,
                            columnGroupId: 'cg-empty-flow',
                            gap: { v: 12 },
                            layout: ColumnLayoutType.FIXED,
                            responsive: ColumnResponsiveType.SHRINK,
                            columns: [
                                { columnId: 'left-col', widthRatio: 1, minWidth: { v: 40 } },
                                { columnId: 'right-col', widthRatio: 1, minWidth: { v: 40 } },
                            ],
                        }],
                    },
                });

            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);
            updateBlockIndex(result.pages);
            const page = result.pages[0];
            const columnGroup = page.skeColumnGroups.get('cg-empty-flow');
            const lines = page.sections[0].columns[0].lines;
            const columnGroupLine = lines.find((line) => line.paragraphIndex === columnGroup?.ed);
            const followingParagraphLine = lines.find((line) => line.paragraphIndex === 13);

            expect(columnGroup?.height).toBe(72);
            expect(columnGroupLine).toMatchObject({
                top: columnGroup?.top,
                lineHeight: 72,
                st: 0,
                ed: 7,
            });
            expect(followingParagraphLine).toMatchObject({
                st: 8,
                ed: 14,
            });
            expect(followingParagraphLine?.top).toBeGreaterThanOrEqual(columnGroupLine!.top + columnGroupLine!.lineHeight);
        });

        it('lays out tables inside column content pages', () => {
            const T = DataStreamTreeTokenType;
            const dataStream = [
                T.COLUMN_GROUP_START,
                T.COLUMN_START,
                T.TABLE_START,
                T.TABLE_ROW_START,
                T.TABLE_CELL_START,
                'H',
                T.PARAGRAPH,
                T.SECTION_BREAK,
                T.TABLE_CELL_END,
                T.TABLE_ROW_END,
                T.TABLE_END,
                T.PARAGRAPH,
                T.COLUMN_END,
                T.COLUMN_START,
                T.PARAGRAPH,
                T.COLUMN_END,
                T.COLUMN_GROUP_END,
                T.SECTION_BREAK,
            ].join('');
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['unused'], {
                    body: {
                        dataStream,
                        paragraphs: [
                            { startIndex: 6, paragraphId: 'table-cell-para' },
                            { startIndex: 11, paragraphId: 'after-table-para' },
                            { startIndex: 14, paragraphId: 'right-column-para' },
                        ],
                        sectionBreaks: [
                            { sectionId: 'section_fixture_1017', startIndex: 7 },
                            { sectionId: 'section_fixture_1018', startIndex: dataStream.length - 1 },
                        ],
                        tables: [{ startIndex: 2, endIndex: 11, tableId: 'table-in-column' }],
                        columnGroups: [{
                            startIndex: 0,
                            endIndex: 16,
                            columnGroupId: 'cg-table',
                            gap: { v: 12 },
                            layout: ColumnLayoutType.FIXED,
                            responsive: ColumnResponsiveType.SHRINK,
                            columns: [
                                { columnId: 'left-col', widthRatio: 1, minWidth: { v: 40 } },
                                { columnId: 'right-col', widthRatio: 1, minWidth: { v: 40 } },
                            ],
                        }],
                    },
                    tableSource: {
                        'table-in-column': {
                            tableId: 'table-in-column',
                            align: TableAlignmentType.START,
                            indent: { v: 0 },
                            textWrap: TableTextWrapType.NONE,
                            position: {} as never,
                            dist: {} as never,
                            size: { type: TableSizeType.SPECIFIED, width: { v: 120 } },
                            tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 120 } } }],
                            tableRows: [{
                                repeatHeaderRow: BooleanNumber.FALSE,
                                trHeight: {
                                    hRule: TableRowHeightRule.AT_LEAST,
                                    val: { v: 30 },
                                },
                                tableCells: [{ vAlign: VerticalAlignmentType.TOP }],
                            }],
                        },
                    },
                });

            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);
            const columnGroup = result.pages[0].skeColumnGroups.get('cg-table');
            const table = columnGroup?.columns[0].page.skeTables.get('table-in-column');

            expect(columnGroup).toBeTruthy();
            expect(table).toBeTruthy();
            expect(table?.rows).toHaveLength(1);
            expect(table?.left).toBe(0);
            expect(columnGroup?.height).toBeGreaterThanOrEqual(table?.height ?? 0);
        });

        it('adds trailing block range spacing to the column page when the block range is the last column element', () => {
            const dataStream = [
                DataStreamTreeTokenType.COLUMN_GROUP_START,
                DataStreamTreeTokenType.COLUMN_START,
                'Column block range line one',
                DataStreamTreeTokenType.PARAGRAPH,
                'Column block range line two',
                DataStreamTreeTokenType.PARAGRAPH,
                'Column block range line three',
                DataStreamTreeTokenType.PARAGRAPH,
                'Column block range line four',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_GROUP_END,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');
            const { ctx, viewModel, sectionNode, curPage, sectionBreakConfig } =
                createSectionLayoutTestBed(['unused'], {
                    body: {
                        dataStream,
                        paragraphs: [
                            { startIndex: 30, paragraphId: 'column-block-1' },
                            { startIndex: 58, paragraphId: 'column-block-2' },
                            { startIndex: 88, paragraphId: 'column-block-3' },
                            { startIndex: 117, paragraphId: 'column-block-4' },
                        ],
                        sectionBreaks: [{ sectionId: 'section_fixture_1019', startIndex: dataStream.length - 1 }],
                        blockRanges: [{
                            blockId: 'callout-column-1',
                            blockType: DocumentBlockRangeType.CALLOUT,
                            startIndex: 1,
                            endIndex: dataStream.length - 3,
                        }],
                        columnGroups: [{
                            startIndex: 0,
                            endIndex: dataStream.length - 1,
                            columnGroupId: 'cg-block-range',
                            gap: { v: 12 },
                            layout: ColumnLayoutType.FIXED,
                            responsive: ColumnResponsiveType.SHRINK,
                            columns: [
                                { columnId: 'left-col', widthRatio: 1, minWidth: { v: 40 } },
                            ],
                        }],
                    },
                });

            const result = dealWithSection(ctx, viewModel, sectionNode, curPage, sectionBreakConfig, null);
            const columnPage = result.pages[0].skeColumnGroups.get('cg-block-range')?.columns[0].page;
            const lastLine = columnPage?.sections[0].columns[0].lines.at(-1);

            expect(lastLine?.paragraphIndex).toBeGreaterThan(1);
            expect(lastLine?.paragraphIndex).toBeLessThan(dataStream.length - 3);
            expect(columnPage?.height).toBeGreaterThan((lastLine?.top ?? 0) + (lastLine?.lineHeight ?? 0));
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
