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

import type { ISectionBreakConfig } from '../../../../../../basics/interfaces';
import { DocumentDataModel } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocumentViewModel } from '../../../../view-model/document-view-model';
import { ArabicHandler, emojiHandler, otherHandler, ThaiHandler, TibetanHandler } from '../language-ruler';

function createViewModel(content: string) {
    const dataStream = `${content}\r\n`;
    const documentData = {
        id: 'test-doc',
        body: {
            dataStream,
            textRuns: [{ st: 0, ed: dataStream.length, ts: {} }],
            paragraphs: [{ startIndex: content.length, paragraphId: 'para_language_ruler_test' }],
            sectionBreaks: [{ sectionId: 'section_fixture_311', startIndex: content.length + 1 }],
        },
        documentStyle: {},
        drawings: {},
        drawingsOrder: [],
    };
    const dataModel = new DocumentDataModel(documentData);
    const viewModel = new DocumentViewModel(dataModel);
    return { viewModel, dataModel };
}

function getParagraphNode(viewModel: DocumentViewModel) {
    const sectionNode = viewModel.getChildren()[0];
    return sectionNode.children[0];
}

function getParagraph(viewModel: DocumentViewModel) {
    const paragraphNode = getParagraphNode(viewModel);
    return viewModel.getParagraph(paragraphNode.endIndex)!;
}

function createSectionBreakConfig(): ISectionBreakConfig {
    return {
        gridType: 0,
        charSpace: 0,
        defaultTabStop: 10.5,
        documentTextStyle: {},
        pageSize: { width: 500, height: 500 },
        marginLeft: 0,
        marginRight: 0,
        renderConfig: {},
        localeService: {} as unknown as NonNullable<ISectionBreakConfig['localeService']>,
        headerTreeMap: new Map(),
        footerTreeMap: new Map(),
    } as ISectionBreakConfig;
}

describe('language-ruler', () => {
    describe('otherHandler', () => {
        it('processes English characters and stops at space', () => {
            const { viewModel } = createViewModel('Hello world');
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = otherHandler(0, 'Hello world', viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(5);
            expect(result.glyphGroup.length).toBe(5);
            expect(result.glyphGroup[0].content).toBe('H');
        });

        it('processes numbers and punctuation', () => {
            const { viewModel } = createViewModel('123-456');
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = otherHandler(0, '123-456', viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(7);
            expect(result.glyphGroup.length).toBe(7);
        });

        it('stops at emoji', () => {
            const { viewModel } = createViewModel('Hi\uD83D\uDE00');
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = otherHandler(0, 'Hi\uD83D\uDE00', viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(2);
            expect(result.glyphGroup.length).toBe(2);
        });

        it('uses runtime custom range width for placeholder glyphs', () => {
            const { viewModel } = createViewModel('i');
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();
            vi.spyOn(viewModel, 'getCustomRange').mockReturnValue({
                endIndex: 0,
                glyphWidthEm: 3,
                rangeId: 'formula-1',
                startIndex: 0,
            } as never);

            const result = otherHandler(0, 'i', viewModel, paragraphNode, sectionBreakConfig, paragraph);
            const glyph = result.glyphGroup[0];

            expect(glyph.width).toBeCloseTo(glyph.fontStyle!.originFontSize * 3);
        });
    });

    describe('ArabicHandler', () => {
        it('combines Arabic characters into one glyph in logical order', () => {
            const arabicText = '\u0645\u0631\u062D\u0628\u0627'; // 'مرحبا'
            const { viewModel } = createViewModel(arabicText);
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = ArabicHandler(0, arabicText, viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(5);
            expect(result.glyphGroup.length).toBe(1);
            expect(result.glyphGroup[0].content).toBe(arabicText);
        });

        it('stops at non-Arabic characters', () => {
            const arabicText = '\u0645\u0631\u062D\u0628\u0627'; // 'مرحبا'
            const { viewModel } = createViewModel(`${arabicText}X`);
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = ArabicHandler(0, `${arabicText}X`, viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(5);
            expect(result.glyphGroup.length).toBe(1);
        });
    });

    describe('emojiHandler', () => {
        it('extracts the first grapheme from emoji string', () => {
            const emojiText = '\uD83D\uDE00\uD83D\uDC4B'; // '😀👋'
            const { viewModel } = createViewModel(emojiText);
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = emojiHandler(0, emojiText, viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.glyphGroup.length).toBe(1);
            expect(result.glyphGroup[0].content).toBe('\uD83D\uDE00'); // '😀'
        });

        it('handles single emoji', () => {
            const { viewModel } = createViewModel('\uD83C\uDF89'); // '🎉'
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = emojiHandler(0, '\uD83C\uDF89', viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.glyphGroup.length).toBe(1);
            expect(result.glyphGroup[0].content).toBe('\uD83C\uDF89');
        });
    });

    describe('TibetanHandler', () => {
        it('combines Tibetan characters into one word glyph', () => {
            const tibetanText = '\u0180\u0190'; // Extended Latin characters (current hasTibetan range)
            const { viewModel } = createViewModel(tibetanText);
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = TibetanHandler(0, tibetanText, viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(2);
            expect(result.glyphGroup.length).toBe(1);
            expect(result.glyphGroup[0].content).toBe(tibetanText);
        });

        it('stops at non-Tibetan characters', () => {
            const tibetanText = '\u0180\u0190'; // Extended Latin characters
            const { viewModel } = createViewModel(`${tibetanText}A`);
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = TibetanHandler(0, `${tibetanText}A`, viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(2);
            expect(result.glyphGroup.length).toBe(1);
        });
    });

    describe('ThaiHandler', () => {
        it('combines Thai characters into one word glyph', () => {
            const thaiText = '\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35'; // 'สวัสดี'
            const { viewModel } = createViewModel(thaiText);
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = ThaiHandler(0, thaiText, viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(thaiText.length);
            expect(result.glyphGroup.length).toBe(1);
            expect(result.glyphGroup[0].content).toBe(thaiText);
        });

        it('stops at non-Thai characters', () => {
            const thaiText = '\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35'; // 'สวัสดี'
            const { viewModel } = createViewModel(`${thaiText}X`);
            const paragraphNode = getParagraphNode(viewModel);
            const paragraph = getParagraph(viewModel);
            const sectionBreakConfig = createSectionBreakConfig();

            const result = ThaiHandler(0, `${thaiText}X`, viewModel, paragraphNode, sectionBreakConfig, paragraph);
            expect(result.step).toBe(thaiText.length);
            expect(result.glyphGroup.length).toBe(1);
        });
    });
});
