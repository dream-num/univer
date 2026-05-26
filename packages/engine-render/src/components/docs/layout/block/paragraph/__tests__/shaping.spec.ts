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
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('shaping', () => {
    it('shapes plain English text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello world');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].text).toBeDefined();
        expect(result[0].glyphs.length).toBeGreaterThan(0);
    });

    it('shapes text with spaces', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello world test');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes text with tab characters', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello\tworld');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        const tabGlyph = allGlyphs.find((g) => g.content === '\t');
        expect(tabGlyph).toBeDefined();
    });

    it('shapes CJK text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('你好世界');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes mixed CJK and Latin text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello你好');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes text with emoji', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello \uD83D\uDE00');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        const emojiGlyph = allGlyphs.find((g) => g.content === '\uD83D\uDE00');
        expect(emojiGlyph).toBeDefined();
    });

    it('shapes text with Arabic characters', () => {
        const arabicText = '\u0645\u0631\u062D\u0628\u0627'; // 'مرحبا'
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(arabicText);

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('returns breakPointType for each shaped text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello world');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        for (const shapedText of result) {
            expect(shapedText.breakPointType).toBeDefined();
        }
    });
});
