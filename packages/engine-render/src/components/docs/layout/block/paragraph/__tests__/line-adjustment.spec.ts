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

import { HorizontalAlign } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { lineAdjustment } from '../line-adjustment';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('line-adjustment', () => {
    it('adjusts lines after layout', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        // lineAdjustment should not throw
        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles CJK punctuation shrinkage', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('\u3002\u3002'); // Two full-width periods
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align CENTER', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello', {
            body: {
                dataStream: 'Hello\r\n',
                textRuns: [{ st: 0, ed: 7, ts: {} }],
                paragraphs: [{
                    startIndex: 5,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.CENTER,
                    },
                }],
                sectionBreaks: [{ startIndex: 6 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align RIGHT', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello', {
            body: {
                dataStream: 'Hello\r\n',
                textRuns: [{ st: 0, ed: 7, ts: {} }],
                paragraphs: [{
                    startIndex: 5,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.RIGHT,
                    },
                }],
                sectionBreaks: [{ startIndex: 6 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align JUSTIFIED', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world test', {
            body: {
                dataStream: 'Hello world test\r\n',
                textRuns: [{ st: 0, ed: 18, ts: {} }],
                paragraphs: [{
                    startIndex: 16,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.JUSTIFIED,
                    },
                }],
                sectionBreaks: [{ startIndex: 17 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles line with only paragraph break', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });
});
