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
import { dealWidthParagraph } from '../paragraph-layout';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('paragraph-layout', () => {
    it('lays out a normal text paragraph', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result[0].sections.length).toBeGreaterThan(0);
    });

    it('lays out empty paragraph', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('lays out CJK text paragraph', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('你好世界');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('lays out paragraph with multiple words', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('This is a longer paragraph with multiple words to test layout');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('returns pages with line structure', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Line one\rLine two');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
        const lastPage = result[result.length - 1];
        expect(lastPage.sections.length).toBeGreaterThan(0);
    });
});
