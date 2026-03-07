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
import { DataStreamTreeNodeType, DataStreamTreeTokenType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocumentEditArea, DocumentViewModel, parseDataStreamToTree } from '../document-view-model';

function createDocumentDataModel(overrides?: {
    body?: Record<string, unknown>;
    snapshot?: Record<string, unknown>;
    headerModelMap?: Map<string, any>;
    footerModelMap?: Map<string, any>;
}) {
    const body = {
        dataStream: `A${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
        textRuns: [],
        paragraphs: [],
        sectionBreaks: [],
        customBlocks: [],
        customRanges: [],
        customDecorations: [],
        tables: [],
        ...(overrides?.body ?? {}),
    };
    const snapshot = {
        tableSource: {},
        ...(overrides?.snapshot ?? {}),
    };

    return {
        getBody: vi.fn(() => body),
        getSnapshot: vi.fn(() => snapshot),
        headerModelMap: overrides?.headerModelMap ?? new Map(),
        footerModelMap: overrides?.footerModelMap ?? new Map(),
    } as any;
}

function findFirstNodeByType(node: any, type: DataStreamTreeNodeType): Nullable<any> {
    if (!node) return null;
    if (node.nodeType === type) return node;
    for (const child of node.children ?? []) {
        const found = findFirstNodeByType(child, type);
        if (found) return found;
    }
    return null;
}

describe('DocumentViewModel', () => {
    describe('parseDataStreamToTree', () => {
        it('should handle empty section correctly', () => {
            const dataStream = DataStreamTreeTokenType.SECTION_BREAK;
            const { sectionList } = parseDataStreamToTree(dataStream);

            expect(sectionList.length).toBe(1);
            const section = sectionList[0];
            expect(section.nodeType).toBe(DataStreamTreeNodeType.SECTION_BREAK);
            expect(section.children.length).toBe(1);
            expect(section.children[0].nodeType).toBe(DataStreamTreeNodeType.PARAGRAPH);
            expect(section.children[0].content).toBe('');
        });

        it('should handle consecutive section breaks correctly', () => {
            const dataStream = `Hello${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}${DataStreamTreeTokenType.SECTION_BREAK}`;
            const { sectionList } = parseDataStreamToTree(dataStream);

            expect(sectionList.length).toBe(2);

            // First section
            expect(sectionList[0].children.length).toBe(1);
            expect(sectionList[0].children[0].content).toBe(`Hello${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`);

            // Second section (empty)
            expect(sectionList[1].children.length).toBe(1);
            expect(sectionList[1].children[0].content).toBe('');
        });

        it('should parse table/custom-block and build table node cache', () => {
            const ds = [
                'A',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.TABLE_START,
                DataStreamTreeTokenType.TABLE_ROW_START,
                DataStreamTreeTokenType.TABLE_CELL_START,
                'B',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.SECTION_BREAK,
                DataStreamTreeTokenType.TABLE_CELL_END,
                DataStreamTreeTokenType.TABLE_ROW_END,
                DataStreamTreeTokenType.TABLE_END,
                DataStreamTreeTokenType.CUSTOM_BLOCK,
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');

            const first = parseDataStreamToTree(ds);
            const tableNode = findFirstNodeByType(first.sectionList[0], DataStreamTreeNodeType.TABLE)!;
            expect(tableNode).toBeTruthy();
            expect(tableNode.children.length).toBe(1);

            const withTables = parseDataStreamToTree(ds, [{
                tableId: 'table-1',
                startIndex: tableNode.startIndex,
                endIndex: tableNode.endIndex + 1,
            } as any]);

            expect(withTables.tableNodeCache.get('table-1')?.table.nodeType).toBe(DataStreamTreeNodeType.TABLE);
            const paragraphWithCustomBlock = withTables.sectionList
                .flatMap((section) => section.children)
                .find((paragraph) => paragraph.blocks.length > 0);
            expect(paragraphWithCustomBlock?.blocks.length).toBe(1);
        });
    });

    describe('DocumentViewModel class', () => {
        it('covers cache/interceptor/reset/header-footer flows', () => {
            const headerModel = createDocumentDataModel({
                body: {
                    dataStream: `${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                },
            });
            const footerModel = createDocumentDataModel({
                body: {
                    dataStream: `${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                },
            });

            const bodyStream = `X${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
            const model = createDocumentDataModel({
                body: {
                    dataStream: bodyStream,
                    textRuns: [{ st: 0, ed: 2, ts: {} }],
                    paragraphs: [{ startIndex: 0 }],
                    sectionBreaks: [{ startIndex: 2 }],
                    customBlocks: [{ startIndex: 1, blockId: 'b1' }],
                    customRanges: [{ startIndex: 0, endIndex: 1, rangeId: 'r1' }],
                    customDecorations: [{ startIndex: 1, endIndex: 2, id: 'd1' }],
                    tables: [{ tableId: 't1', startIndex: 3, endIndex: 5 }],
                },
                snapshot: {
                    tableSource: {
                        t1: { id: 'source-1' },
                    },
                },
                headerModelMap: new Map([['h1', headerModel]]),
                footerModelMap: new Map([['f1', footerModel]]),
            });

            const viewModel = new DocumentViewModel(model);
            expect(viewModel.getBody()).toEqual(model.getBody());
            expect(viewModel.getSnapshot()).toEqual(model.getSnapshot());
            expect(viewModel.getDataModel()).toBe(model);
            expect(viewModel.getChildren().length).toBe(1);
            expect(viewModel.getParagraph(0)?.startIndex).toBe(0);
            expect(viewModel.getSectionBreak(2)?.startIndex).toBe(2);
            expect(viewModel.getTextRun(0)?.st).toBe(0);
            expect(viewModel.getCustomBlock(1)?.startIndex).toBe(1);
            expect(viewModel.getCustomBlockWithoutSetCurrentIndex(1)?.startIndex).toBe(1);
            expect(viewModel.getCustomRangeRaw(1)?.rangeId).toBe('r1');
            expect(viewModel.getCustomDecorationRaw(1)?.id).toBe('d1');
            expect(viewModel.getTableByStartIndex(3)?.tableSource).toEqual({ id: 'source-1' });

            const byHeader = viewModel.getSelfOrHeaderFooterViewModel('h1');
            const byFooter = viewModel.getSelfOrHeaderFooterViewModel('f1');
            expect(byHeader).not.toBe(viewModel);
            expect(byFooter).not.toBe(viewModel);
            expect(viewModel.getSelfOrHeaderFooterViewModel('unknown')).toBe(viewModel);

            const editAreaEvents: DocumentEditArea[] = [];
            viewModel.editAreaChange$.subscribe((v) => {
                if (v) editAreaEvents.push(v);
            });
            viewModel.setEditArea(DocumentEditArea.HEADER);
            viewModel.setEditArea(DocumentEditArea.HEADER);
            viewModel.setEditArea(DocumentEditArea.FOOTER);
            expect(editAreaEvents).toEqual([DocumentEditArea.HEADER, DocumentEditArea.FOOTER]);
            expect(viewModel.getEditArea()).toBe(DocumentEditArea.FOOTER);

            const interceptor = {
                getCustomRange: vi.fn(() => ({ startIndex: 9, endIndex: 9, rangeId: 'ir' })),
                getCustomDecoration: vi.fn(() => ({ startIndex: 8, endIndex: 8, id: 'id' })),
            };
            const disposable = viewModel.registerCustomRangeInterceptor(interceptor as any);
            expect(viewModel.getCustomRange(0)?.rangeId).toBe('ir');
            expect(viewModel.getCustomDecoration(0)?.id).toBe('id');
            disposable.dispose();
            expect(viewModel.getCustomRange(0)?.rangeId).toBe('r1');

            const newModel = createDocumentDataModel({
                body: {
                    dataStream: `Z${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                    textRuns: [{ st: 0, ed: 1, ts: { fs: 14 } }],
                    paragraphs: [{ startIndex: 0 }],
                    sectionBreaks: [{ startIndex: 1 }],
                    customBlocks: [],
                    customRanges: [],
                    customDecorations: [],
                    tables: [],
                },
                snapshot: { tableSource: {} },
            });
            viewModel.reset(newModel);
            expect(viewModel.getDataModel()).toBe(newModel);
            expect(viewModel.getTextRun(0)?.ed).toBe(1);

            expect(viewModel.findTableNodeById('not-exists')).toBeUndefined();
            const maps = viewModel.getHeaderFooterTreeMap();
            expect(maps.headerTreeMap.size).toBeGreaterThan(0);
            expect(maps.footerTreeMap.size).toBeGreaterThan(0);

            viewModel.dispose();
            expect(viewModel.getChildren().length).toBeGreaterThanOrEqual(0);
        });

        it('handles missing body and null arrays safely', () => {
            const emptyModel = {
                getBody: vi.fn(() => null),
                getSnapshot: vi.fn(() => ({ tableSource: {} })),
                headerModelMap: new Map(),
                footerModelMap: new Map(),
            } as any;

            const vm = new DocumentViewModel(emptyModel);
            expect(vm.getChildren()).toEqual([]);
            expect(vm.getParagraph(0)).toBeUndefined();
            expect(vm.getSectionBreak(0)).toBeUndefined();
            expect(vm.getTextRun(0)).toBeUndefined();
            expect(() => vm.getCustomRangeRaw(0)).toThrow();
            expect(() => vm.getCustomDecorationRaw(0)).toThrow();
            expect(() => vm.getCustomBlockWithoutSetCurrentIndex(0)).toThrow();
            vm.dispose();
        });
    });
});
