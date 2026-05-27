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

import { describe, expect, it } from 'vitest';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('linebreaking', () => {
    it('lays out short text on a single page', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hi');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBe(1);
        expect(result[0].sections.length).toBeGreaterThan(0);
    });

    it('lays out longer text that may span multiple lines', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('This is a longer text that should still fit within a reasonable page width for testing purposes');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles bullet list paragraphs', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('List item', {
            body: {
                dataStream: 'List item\r\n',
                textRuns: [{ st: 0, ed: 11, ts: {} }],
                paragraphs: [{
                    startIndex: 9,
                    bullet: {
                        listId: 'list-1',
                        listType: 'test-list',
                        nestingLevel: 0,
                    },
                }],
                sectionBreaks: [{ startIndex: 10 }],
            },
            lists: {
                'test-list': {
                    listType: 'test-list',
                    nestingLevel: [{
                        bulletAlignment: 1,
                        glyphFormat: '%1.',
                        startNumber: 1,
                        glyphType: 0,
                    }],
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles empty shaped text list', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');

        const result = lineBreaking(ctx, viewModel, [], curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBe(1);
    });
});
