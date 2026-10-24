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

import type { IDocumentData } from '@univerjs/core';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    DocumentDataModel,
    DocumentFlavor,
    JSONX,
    LocaleService,
    SectionType,
    TextX,
    validateDocumentStructure,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentViewModel } from '../../../../view-model/document-view-model';
import { DocumentSkeleton } from '../../../doc-skeleton';
import { FontCache } from '../../../shaping-engine/font-cache';
import { clearFontCreateConfigCache } from '../../../tools';

const { BLOCK_START, BLOCK_END, PARAGRAPH, SECTION_BREAK } = DataStreamTreeTokenType;

function quoteSnapshot(contents: string[], flavor: DocumentFlavor, blockType: DocumentBlockRangeType, prefix = '', width = 900, terminal = false): IDocumentData {
    const leading = prefix ? `${prefix}${PARAGRAPH}` : '';
    const quoteText = `${contents.join(PARAGRAPH)}${PARAGRAPH}`;
    const rangeStart = leading.length;
    const rangeEnd = rangeStart + quoteText.length + 1;
    const dataStream = `${leading}${BLOCK_START}${quoteText}${BLOCK_END}${terminal ? '' : `After${PARAGRAPH}`}${SECTION_BREAK}`;
    const paragraphs = [...dataStream.matchAll(/\r/g)].map((match, index) => ({
        startIndex: match.index!,
        paragraphId: `quote-paragraph-${index}`,
        paragraphStyle: match.index! > rangeStart && match.index! < rangeEnd
            ? { indentStart: { v: 22 }, keepLines: BooleanNumber.TRUE, widowControl: BooleanNumber.TRUE }
            : {},
    }));
    return {
        id: 'quote-block-layout',
        body: {
            dataStream,
            paragraphs,
            textRuns: [],
            sectionBreaks: [{ sectionId: 'quote-section', startIndex: dataStream.length - 1 }],
            blockRanges: [{
                blockId: 'quote',
                blockType,
                startIndex: rangeStart,
                endIndex: rangeEnd,
            }],
        },
        documentStyle: {
            documentFlavor: flavor,
            textStyle: { ff: 'Quote marker regression', fs: 14 },
            pageSize: { width, height: 1000 },
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            autoHyphenation: BooleanNumber.FALSE,
            ...(flavor === DocumentFlavor.MODERN
                ? { defaultParagraphStyle: { lineSpacing: 1.5, spaceAbove: { v: 0 }, spaceBelow: { v: 12 } } }
                : {}),
        },
    };
}

function layout(snapshot: IDocumentData) {
    expect(validateDocumentStructure(snapshot)).toEqual([]);
    const model = new DocumentDataModel(snapshot);
    const viewModel = new DocumentViewModel(model);
    const skeleton = DocumentSkeleton.create(viewModel, new LocaleService());
    const initial = structuredClone(model.getSnapshot());
    skeleton.calculate();
    return { model, viewModel, skeleton, initial };
}

function lines(skeleton: DocumentSkeleton) {
    return skeleton.getSkeletonData()!.pages.flatMap((page) =>
        page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines))
    );
}

function quoteLines(model: DocumentDataModel, skeleton: DocumentSkeleton) {
    const range = model.getBody()!.blockRanges![0];
    return lines(skeleton).filter((line) => line.paragraphIndex > range.startIndex && line.paragraphIndex < range.endIndex);
}

function expectLogicalOffsets(model: DocumentDataModel, skeleton: DocumentSkeleton) {
    const body = model.getBody()!;
    const glyphs = lines(skeleton).flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup));
    expect(glyphs.map((glyph) => glyph.raw).join('')).toBe(body.dataStream);
    expect(glyphs.reduce((count, glyph) => count + glyph.count, 0)).toBe(body.dataStream.length);
    for (const offset of [body.dataStream.indexOf('First'), body.dataStream.indexOf('After')].filter((offset) => offset >= 0)) {
        const position = skeleton.findNodePositionByCharIndex(offset)!;
        expect(position).toBeDefined();
        expect(skeleton.findCharIndexByPosition(position)).toBe(offset);
    }
}

describe.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL].flatMap((flavor) =>
    [DocumentBlockRangeType.QUOTE, DocumentBlockRangeType.CALLOUT, DocumentBlockRangeType.CODE].map((blockType) => ({ flavor, blockType }))))('native $blockType closing-marker layout in flavor $flavor', ({ flavor, blockType }) => {
    const disposables: Array<{ dispose(): void }> = [];
    beforeEach(() => {
        clearFontCreateConfigCache();
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text, font) => {
            const match = font.match(/([\d.]+)(px|pt)/)!;
            const pixels = Number(match[1]) * (match[2] === 'pt' ? 4 / 3 : 1);
            return {
                width: text.length * pixels / 2,
                fontBoundingBoxAscent: pixels * 0.75,
                fontBoundingBoxDescent: pixels * 0.25,
                actualBoundingBoxAscent: pixels * 0.75,
                actualBoundingBoxDescent: pixels * 0.25,
            };
        });
        vi.spyOn(FontCache, 'getNormalLineHeight').mockReturnValue(14);
    });
    afterEach(() => {
        for (const disposable of disposables.splice(0).reverse()) disposable.dispose();
        vi.restoreAllMocks();
        clearFontCreateConfigCache();
    });

    it.each([
        { label: 'single paragraph', contents: ['First sentence.'] },
        { label: 'multiple paragraphs', contents: ['First sentence.', 'Second sentence.'] },
        { label: 'authored blank paragraph', contents: ['First sentence.', '', 'Second sentence.'] },
        { label: 'empty editable quote', contents: [''] },
    ])('does not add a rendered line for the closing marker of $label', ({ contents }) => {
        const snapshot = quoteSnapshot(contents, flavor, blockType);
        const { model, skeleton, initial } = layout(snapshot);
        disposables.push(model, skeleton);
        expect(quoteLines(model, skeleton)).toHaveLength(contents.length);
        expect(lines(skeleton)).toHaveLength(contents.length + 1);
        expect(model.getSnapshot()).toEqual(initial);
        expectLogicalOffsets(model, skeleton);
    });

    it('keeps a block after an existing paragraph to its authored line', () => {
        const { model, skeleton } = layout(quoteSnapshot(['First sentence.'], flavor, blockType, 'Before'));
        disposables.push(model, skeleton);
        expect(quoteLines(model, skeleton)).toHaveLength(1);
        expect(lines(skeleton)).toHaveLength(3);
        expectLogicalOffsets(model, skeleton);
    });

    it('keeps wrapped text and attaches the closing marker to its authored paragraph mark', () => {
        const { model, skeleton } = layout(quoteSnapshot(['First sentence repeats and wraps to multiple lines. '.repeat(4).trimEnd()], flavor, blockType, '', 500));
        disposables.push(model, skeleton);
        const rendered = quoteLines(model, skeleton);
        expect(rendered.length).toBeGreaterThan(1);
        for (const line of rendered) {
            const glyphs = line.divides.flatMap((divide) => divide.glyphGroup);
            expect(glyphs.every((glyph) => glyph.raw === BLOCK_END)).toBe(false);
        }
        const lastGlyphs = rendered[rendered.length - 1].divides.flatMap((divide) => divide.glyphGroup);
        expect(lastGlyphs.map((glyph) => glyph.raw).join('')).toContain(`${PARAGRAPH}${BLOCK_END}`);
        expectLogicalOffsets(model, skeleton);
    });

    it.each([1, 2])('preserves %s authored line breaks before the closing marker', (count) => {
        const { model, skeleton, initial } = layout(quoteSnapshot([
            `First sentence.${DataStreamTreeTokenType.COLUMN_BREAK.repeat(count)}Second sentence.`,
        ], flavor, blockType));
        disposables.push(model, skeleton);
        expect(quoteLines(model, skeleton)).toHaveLength(count + 1);
        expect(lines(skeleton)).toHaveLength(count + 2);
        expect(model.getSnapshot()).toEqual(initial);
        expectLogicalOffsets(model, skeleton);
    });

    it('keeps a terminal block editable without adding a closing-marker line', () => {
        const { model, skeleton, initial } = layout(quoteSnapshot(['First sentence.', ''], flavor, blockType, '', 900, true));
        disposables.push(model, skeleton);
        expect(quoteLines(model, skeleton)).toHaveLength(2);
        expect(lines(skeleton)).toHaveLength(2);
        expect(model.getSnapshot()).toEqual(initial);
        expectLogicalOffsets(model, skeleton);
    });

    it('preserves ordinary body paragraph marks and authored blank paragraphs', () => {
        const snapshot = quoteSnapshot(['First sentence.'], flavor, blockType);
        const dataStream = `First sentence.${PARAGRAPH}${PARAGRAPH}After${PARAGRAPH}${SECTION_BREAK}`;
        snapshot.body = {
            dataStream,
            paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index!, paragraphId: `plain-${index}` })),
            sectionBreaks: [{ sectionId: 'plain-section', startIndex: dataStream.length - 1 }],
        };
        const { model, skeleton, initial } = layout(snapshot);
        disposables.push(model, skeleton);
        expect(lines(skeleton)).toHaveLength(3);
        expect(model.getSnapshot()).toEqual(initial);
        expectLogicalOffsets(model, skeleton);
    });

    it('preserves native pagination of a following NEXT_PAGE section after a terminal block marker', () => {
        const snapshot = quoteSnapshot(['First sentence.'], flavor, blockType);
        const body = snapshot.body!;
        const sectionOffset = body.blockRanges![0].endIndex + 1;
        body.dataStream = `${body.dataStream.slice(0, sectionOffset)}${SECTION_BREAK}${body.dataStream.slice(sectionOffset)}`;
        body.paragraphs = body.paragraphs!.map((paragraph) => paragraph.startIndex >= sectionOffset
            ? { ...paragraph, startIndex: paragraph.startIndex + 1 }
            : paragraph);
        body.sectionBreaks = [
            { sectionId: 'block-section', startIndex: sectionOffset },
            { sectionId: 'following-section', startIndex: body.dataStream.length - 1, sectionType: SectionType.NEXT_PAGE },
        ];
        const { model, skeleton, initial } = layout(snapshot);
        disposables.push(model, skeleton);
        expect(quoteLines(model, skeleton)).toHaveLength(1);
        expect(lines(skeleton)).toHaveLength(2);
        expect(skeleton.getSkeletonData()!.pages).toHaveLength(flavor === DocumentFlavor.TRADITIONAL ? 2 : 1);
        expect(model.getSnapshot()).toEqual(initial);
        expectLogicalOffsets(model, skeleton);
    });

    it('preserves editable model offsets and the closing marker after inserting text', () => {
        const { model, viewModel, skeleton } = layout(quoteSnapshot(['First sentence.'], flavor, blockType));
        disposables.push(model, skeleton);
        const paragraphId = model.getBody()!.paragraphs![0].paragraphId;
        const textX = new TextX().retain(1).insert(7, { dataStream: 'Edited ' });
        model.apply(JSONX.getInstance().editOp(textX.serialize(), ['body']));
        viewModel.reset(model);
        skeleton.makeDirty(true);
        skeleton.calculate();
        expect(model.getBody()!.paragraphs![0].paragraphId).toBe(paragraphId);
        expect(model.getBody()!.dataStream).toContain(`${BLOCK_START}Edited First sentence.${PARAGRAPH}${BLOCK_END}`);
        expect(quoteLines(model, skeleton)).toHaveLength(1);
        expectLogicalOffsets(model, skeleton);
    });
});
