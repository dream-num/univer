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

    it('applies callout outer spacing as a temporary layout style without mutating the paragraph model', () => {
        const ctx = createContext();
        const paragraphStyle = { indentStart: { v: 60 }, indentEnd: { v: 20 } };
        const paragraph = {
            startIndex: 2,
            paragraphStyle,
        };
        const body = {
            paragraphs: [paragraph],
            blockRanges: [{
                blockId: 'callout-1',
                blockType: 'callout',
                startIndex: 0,
                endIndex: 6,
            }],
        };
        const viewModel = {
            getParagraph: vi.fn(() => paragraph),
            getBody: vi.fn(() => body),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 5,
                startIndex: 2,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(5)?.paragraphStyle).toEqual({
            indentStart: { v: 60 },
            indentEnd: { v: 20 },
            lineSpacing: 1.5,
            spaceAbove: { v: 34 },
            spaceBelow: { v: 34 },
        });
        expect(paragraphStyle).toEqual({ indentStart: { v: 60 }, indentEnd: { v: 20 } });
    });

    it('removes bottom outer spacing between adjacent layout block ranges', () => {
        const ctx = createContext();
        const firstCalloutParagraph = {
            startIndex: 1,
            paragraphStyle: {},
        };
        const secondCalloutParagraph = {
            startIndex: 4,
            paragraphStyle: {},
        };
        const body = {
            paragraphs: [firstCalloutParagraph, secondCalloutParagraph],
            blockRanges: [
                {
                    blockId: 'callout-1',
                    blockType: 'callout',
                    startIndex: 0,
                    endIndex: 2,
                },
                {
                    blockId: 'quote-1',
                    blockType: 'quote',
                    startIndex: 3,
                    endIndex: 5,
                },
            ],
        };
        const viewModel = {
            getParagraph: vi.fn(() => firstCalloutParagraph),
            getBody: vi.fn(() => body),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 1,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(1)?.paragraphStyle).toEqual({
            lineSpacing: 1.5,
            spaceAbove: { v: 34 },
        });
    });

    it('applies quote outer spacing with the same temporary layout rule', () => {
        const ctx = createContext();
        const firstParagraphStyle = { indentStart: { v: 22 } };
        const lastParagraphStyle = { indentStart: { v: 22 } };
        const firstParagraph = {
            startIndex: 2,
            paragraphStyle: firstParagraphStyle,
        };
        const lastParagraph = {
            startIndex: 4,
            paragraphStyle: lastParagraphStyle,
        };
        const body = {
            paragraphs: [firstParagraph, lastParagraph],
            blockRanges: [{
                blockId: 'quote-1',
                blockType: 'quote',
                startIndex: 0,
                endIndex: 6,
            }],
        };
        const viewModel = {
            getParagraph: vi.fn(() => firstParagraph),
            getBody: vi.fn(() => body),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 2,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(2)?.paragraphStyle).toEqual({
            indentStart: { v: 22 },
            lineSpacing: 1.5,
            spaceAbove: { v: 24 },
        });
        expect(firstParagraphStyle).toEqual({ indentStart: { v: 22 } });
    });

    it('applies comfortable default spacing to normal paragraphs as layout-only style', () => {
        const ctx = createContext();
        const paragraphStyle = {};
        const paragraph = {
            startIndex: 3,
            paragraphStyle,
        };
        const viewModel = {
            getParagraph: vi.fn(() => paragraph),
            getBody: vi.fn(() => ({
                paragraphs: [paragraph],
            })),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 3,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.paragraphStyle).toEqual({
            spaceAbove: { v: 0 },
            lineSpacing: 1.5,
            spaceBelow: { v: 8 },
        });
        expect(paragraphStyle).toEqual({});
    });
});
