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

import type { IParagraphConfig } from '../../../../../../basics/interfaces';
import { describe, expect, it } from 'vitest';
import { layoutParagraph } from '../layout-ruler';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('layout-ruler', () => {
    it('lays out first shaped text with bullet skeleton', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Item');
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);
        const bulletSkeleton = {
            listId: 'list-1',
            symbol: '\u25CF',
            ts: { ff: 'Arial', fs: 9 },
            startIndexItem: 1,
            paragraphProperties: {
                indentFirstLine: { v: 0 },
                hanging: { v: 21 },
                indentStart: { v: 0 },
            },
        };

        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {},
            bulletSkeleton,
        } as unknown as IParagraphConfig;

        const result = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );

        expect(result.length).toBe(1);
        expect(result[0].sections.length).toBeGreaterThan(0);
    });

    it('lays out first shaped text without bullet', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);

        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {},
        } as unknown as IParagraphConfig;

        const result = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );

        expect(result.length).toBe(1);
    });

    it('lays out non-first shaped text into existing page', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world this is a test');
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);

        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {},
        } as unknown as IParagraphConfig;

        // First layout
        let result = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );

        // Subsequent layout with isParagraphFirstShapedText=false
        if (shapedTextList.length > 1) {
            result = layoutParagraph(
                ctx,
                shapedTextList[1].glyphs,
                result,
                sectionBreakConfig,
                paragraphConfig,
                false
            );
        }

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('end-to-end: shapes and lays out text through lineBreaking', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBeGreaterThanOrEqual(1);
        const lastPage = result[result.length - 1];
        expect(lastPage.sections.length).toBeGreaterThan(0);
    });
});
