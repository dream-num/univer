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

import type { DocumentDataModel, ICustomRange, IDocumentBody, IDocumentData } from '@univerjs/core';
import {
    BooleanNumber,
    CustomRangeType,
    DocStyleType,
    getBodySlice,
    ICommandService,
    NamedStyleType,
    SliceBodyType,
    SpecialCharacterKind,
    TabStopAlignment,
    TabStopLeader,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { describe, expect, it } from 'vitest';
import {
    buildPageNumberOnlyTableOfContentsBody,
    buildTableOfContentsBody,
    buildTableOfContentsInstruction,
    countTableOfContentsHeadings,
    findTableOfContentsAtOffset,
    UpdateTableOfContentsCommand,
} from '../table-of-contents.command';

function createBody(): { body: IDocumentBody; toc: ICustomRange } {
    const dataStream = '\u001FOld\t\u001F1\u001E\r\u001EHeading One\rSubheading\r\n';
    const tocEnd = dataStream.indexOf('\u001E', dataStream.indexOf('\u001E') + 1);
    const firstHeadingStart = tocEnd + 1;
    const firstHeadingEnd = dataStream.indexOf('\r', firstHeadingStart);
    const secondHeadingStart = firstHeadingEnd + 1;
    const secondHeadingEnd = dataStream.indexOf('\r', secondHeadingStart);
    const toc: ICustomRange = {
        startIndex: 0,
        endIndex: tocEnd,
        rangeId: 'toc',
        rangeType: CustomRangeType.FIELD,
        wholeEntity: false,
        properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-2" \\h \\z \\u' },
    };
    return {
        toc,
        body: {
            dataStream,
            paragraphs: [{
                startIndex: dataStream.indexOf('\r'),
                paragraphId: 'toc-1',
                styleId: 'TOC1',
            }, {
                startIndex: firstHeadingEnd,
                paragraphId: 'heading-1-paragraph',
                paragraphStyle: {
                    headingId: 'heading-1',
                    namedStyleType: NamedStyleType.HEADING_1,
                    outlineLevel: 0,
                },
            }, {
                startIndex: secondHeadingEnd,
                paragraphId: 'heading-2-paragraph',
                paragraphStyle: {
                    headingId: 'heading-2',
                    namedStyleType: NamedStyleType.HEADING_2,
                    outlineLevel: 1,
                },
            }],
            customRanges: [toc, {
                startIndex: firstHeadingStart,
                endIndex: firstHeadingEnd - 1,
                rangeId: 'bookmark-1',
                rangeType: CustomRangeType.BOOKMARK,
                properties: { bookmarkId: '_Toc1' },
            }],
        },
    };
}

describe('canonical directory style selection', () => {
    it.each([
        { name: 'toc 1', canonical: 'TOC1', entryStyleName: undefined },
        { name: 'Table of Figures', canonical: 'TableOfFigures', entryStyleName: 'tableoffigures' },
    ].flatMap((entry) => [false, true].map((matchingName) => ({ ...entry, matchingName }))))('uses the matching canonical identity before duplicate names ($name/$matchingName)', ({ name, canonical, entryStyleName, matchingName }) => {
        const { body, toc } = createBody();
        body.paragraphs![0].styleId = 'Normal';
        const styles = {
            Alias: { name, type: DocStyleType.paragraph, textStyle: { bl: BooleanNumber.FALSE } },
            [canonical]: { name: matchingName ? name : 'Other paragraph style', type: DocStyleType.paragraph, textStyle: { bl: BooleanNumber.TRUE } },
        };
        const result = buildTableOfContentsBody(body, toc, () => 1, () => 'generated', { styles, entryStyleName, resetEntryParagraphFormatting: true })!;
        expect(result.paragraphs![0].styleId).toBe(matchingName ? canonical : 'Alias');
    });
});

describe('table of contents body builder', () => {
    it.each([
        { kind: SpecialCharacterKind.NON_BREAKING_HYPHEN, character: '\u2011', marked: true },
        { kind: SpecialCharacterKind.NON_BREAKING_HYPHEN, character: '\u2011', marked: false },
        { kind: SpecialCharacterKind.OPTIONAL_HYPHEN, character: '\u00AD', marked: true },
        { kind: SpecialCharacterKind.OPTIONAL_HYPHEN, character: '\u00AD', marked: false },
    ])('preserves literal characters and Word $kind objects when marked=$marked', ({ kind, character, marked }) => {
        const dataStream = `\u001FOld\u001E\r  A😀${character}B  \r\n`;
        const index = dataStream.indexOf(character);
        const toc: ICustomRange = { rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 4, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3" \\n' } };
        const body: IDocumentBody = {
            dataStream,
            paragraphs: [
                { paragraphId: 'toc-row', startIndex: 5 },
                { paragraphId: 'heading', startIndex: dataStream.lastIndexOf('\r'), paragraphStyle: { headingId: 'heading', outlineLevel: 0 } },
            ],
            customRanges: [toc, ...(marked ? [{ rangeId: 'character', rangeType: CustomRangeType.CUSTOM, startIndex: index, endIndex: index, wholeEntity: true, properties: { kind } }] : [])],
        };
        const before = structuredClone(body);
        const result = buildTableOfContentsBody(body, toc, () => undefined, () => 'entry', { showPageNumbers: false })!;
        const omitted = marked && kind === SpecialCharacterKind.OPTIONAL_HYPHEN;
        expect(result.customRanges!.find((range) => range.rangeId === 'toc')!.properties!.cachedResult).toBe(`A😀${omitted ? '' : character}B\r`);
        const characters = result.customRanges!.filter((range) => range.rangeType === CustomRangeType.CUSTOM);
        expect(characters).toHaveLength(marked && !omitted ? 1 : 0);
        if (characters.length) {
            expect(characters[0]).toMatchObject({ startIndex: 4, endIndex: 4, wholeEntity: true, properties: { kind } });
            expect(result.dataStream[characters[0].startIndex]).toBe(character);
        }
        expect(body).toEqual(before);
    });

    it('selects imported directory templates by style name without replacing their ids', () => {
        const dataStream = '\u001FAlpha\rBeta\rGamma\r\u001E';
        const toc: ICustomRange = { rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: dataStream.length - 1, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3" \\n' } };
        const body: IDocumentBody = {
            dataStream,
            customRanges: [toc],
            paragraphs: [
                { startIndex: dataStream.indexOf('\r'), paragraphId: 'para_alpha', styleId: '12', paragraphStyle: { textStyle: { caps: true } } },
                { startIndex: dataStream.indexOf('\r', dataStream.indexOf('\r') + 1), paragraphId: 'para_beta', styleId: '22', paragraphStyle: { textStyle: { smallCaps: true } } },
                { startIndex: dataStream.lastIndexOf('\r'), paragraphId: 'para_gamma', styleId: '32', paragraphStyle: { textStyle: { fs: 10 } } },
            ],
        };
        const before = structuredClone(body);
        let identity = 0;
        const result = buildTableOfContentsBody(body, toc, () => undefined, () => `entry-${identity++}`, {
            showPageNumbers: false,
            styles: {
                12: { name: 'toc 1', type: DocStyleType.paragraph },
                22: { name: 'toc 2', type: DocStyleType.paragraph },
                32: { name: 'toc 3', type: DocStyleType.paragraph },
            },
            entries: [1, 1, 2, 3].map((level, index) => ({
                text: `Heading ${index}`,
                level,
                headingId: `h${index}`,
                startOffset: 100 + index,
                paragraph: { paragraphId: `para_heading_${index}`, startIndex: 100 + index },
            })),
        })!;
        expect(result.paragraphs!.map((paragraph) => paragraph.styleId)).toEqual(['12', '12', '22', '32']);
        expect(result.paragraphs!.map((paragraph) => paragraph.paragraphStyle?.textStyle)).toEqual([{ caps: true }, { caps: true }, { smallCaps: true }, { fs: 10 }]);
        expect(body).toEqual(before);
    });

    it('applies the authored TOC style when replacing a Normal placeholder paragraph', () => {
        const dataStream = '\u001FOLD\r\u001E';
        const toc: ICustomRange = { rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: dataStream.length - 1, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-1" \\n' } };
        const body: IDocumentBody = {
            dataStream,
            customRanges: [toc],
            paragraphs: [{ startIndex: dataStream.indexOf('\r'), paragraphId: 'old', styleId: 'Normal', paragraphStyle: { spaceBelow: { v: 3 } } }],
        };
        const before = structuredClone(body);
        const result = buildTableOfContentsBody(body, toc, () => undefined, () => 'entry', {
            showPageNumbers: false,
            styles: {
                Normal: { name: 'Normal', type: DocStyleType.paragraph },
                authored: { name: 'toc 1', type: DocStyleType.paragraph, textStyle: { caps: true } },
            },
            entries: [{ text: 'Mixed case', level: 1, headingId: 'heading', startOffset: 100, paragraph: { paragraphId: 'heading', startIndex: 110 } }],
        })!;
        expect(result.paragraphs![0].styleId).toBe('authored');
        expect(result.paragraphs![0].paragraphStyle?.spaceBelow).toEqual({ v: 3 });
        expect(body).toEqual(before);
    });

    it('preserves distinct tab stops of numbered and unnumbered entries at the same level', () => {
        const dataStream = '\u001FIntroduction\t\u001F1\u001E\r1.\tChapter\t\u001F2\u001E\rConclusion\t\u001F3\u001E\r\u001E';
        const toc: ICustomRange = { rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: dataStream.length - 1, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-1"' } };
        const pageTab = { offset: 414, alignment: TabStopAlignment.END, leader: TabStopLeader.DOT };
        const body: IDocumentBody = {
            dataStream,
            customRanges: [toc],
            paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({
                startIndex: match.index,
                paragraphId: `para_entry_${index}`,
                styleId: 'TOC1',
                paragraphStyle: { tabStops: index === 1 ? [{ offset: 22, alignment: TabStopAlignment.START }, pageTab] : [pageTab] },
            })),
        };
        const before = structuredClone(body);
        const build = (source: IDocumentBody): IDocumentBody => {
            let identity = 0;
            return buildTableOfContentsBody(source, source.customRanges!.find((range) => range.rangeId === 'toc')!, () => 4, () => `entry-${identity++}`, {
                entries: ['Introduction', '1.\tChapter', 'Conclusion'].map((text, index) => ({
                    text,
                    level: 1,
                    headingId: `heading-${index}`,
                    startOffset: 100 + index,
                    paragraph: { paragraphId: `para_heading_${index}`, startIndex: 100 + index },
                })),
            })!;
        };
        const first = build(body);
        expect(first.paragraphs!.map((paragraph) => paragraph.paragraphStyle?.tabStops)).toEqual(body.paragraphs!.map((paragraph) => paragraph.paragraphStyle?.tabStops));
        expect(build(first)).toEqual(first);
        expect(body).toEqual(before);
    });

    it.each([
        { namedLeader: TabStopLeader.HYPHEN, override: undefined, expected: TabStopLeader.HYPHEN },
        { namedLeader: TabStopLeader.UNDERSCORE, override: undefined, expected: TabStopLeader.UNDERSCORE },
        { namedLeader: TabStopLeader.HYPHEN, override: 'none', expected: TabStopLeader.NONE },
    ] as const)('uses the named page-tab leader unless explicitly overridden ($namedLeader/$override)', ({ namedLeader, override, expected }) => {
        const dataStream = '\u001FSTALE\u001E\r\n';
        const toc: ICustomRange = { rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 6, properties: { instruction: 'TOC \\o "1-1"', ...(override == null ? {} : { tabLeader: override }) } };
        const leftTab = { offset: 22, alignment: TabStopAlignment.START };
        const body: IDocumentBody = {
            dataStream,
            customRanges: [toc],
            paragraphs: [{ startIndex: 7, paragraphId: 'cached', styleId: 'authored', paragraphStyle: { tabStops: [leftTab, { offset: 600, alignment: TabStopAlignment.END, leader: TabStopLeader.NONE }] } }],
        };
        const before = structuredClone(body);
        const build = (source: IDocumentBody): IDocumentBody => {
            let identity = 0;
            return buildTableOfContentsBody(source, source.customRanges!.find((range) => range.rangeId === 'toc')!, () => 1, () => `entry-${identity++}`, {
                tabStopOffset: 553,
                styles: { authored: { name: 'toc 1', type: DocStyleType.paragraph, paragraphStyle: { tabStops: [{ offset: 600, alignment: TabStopAlignment.END, leader: namedLeader }] } } },
                entries: [{ text: 'Heading', level: 1, headingId: 'heading', startOffset: 100, paragraph: { paragraphId: 'heading', startIndex: 100 } }],
            })!;
        };
        const first = build(body);
        expect(first.paragraphs![0].paragraphStyle?.tabStops).toEqual([leftTab, { offset: 600, alignment: TabStopAlignment.END, leader: expected }]);
        expect(build(first)).toEqual(first);
        expect(body).toEqual(before);
    });

    it.each([true, false])('keeps an object-only heading link valid when page labels are enabled: %s', (showPageNumbers) => {
        const dataStream = '\u001FSTALE\u001E\r\n';
        const body: IDocumentBody = { dataStream, customRanges: [{ rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 6, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-1"' } }] };
        let identity = 0;
        const result = buildTableOfContentsBody(body, body.customRanges![0], () => 7, () => `entry-${identity++}`, {
            showPageNumbers,
            entries: [{ text: '', startOffset: 100, headingId: 'image-heading', level: 1, paragraph: { paragraphId: 'image-heading', startIndex: 101 } }],
        })!;
        expect(result.dataStream).toBe(showPageNumbers ? '\u001F\t\u001F7\u001E\r\u001E' : '\u001F\r\u001E');
        const links = result.customRanges!.filter((range) => range.rangeType === CustomRangeType.HYPERLINK);
        expect(links).toHaveLength(showPageNumbers ? 1 : 0);
        expect(result.customRanges!.every((range) => range.startIndex <= range.endIndex)).toBe(true);
    });

    it('separates an authored host paragraph when the cached directory has no leading break', () => {
        const dataStream = 'Page\u001FSTALE\u001E\rHeading\r\n';
        const body: IDocumentBody = {
            dataStream,
            customRanges: [{ rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 4, endIndex: 10, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-1"' } }],
            paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index, paragraphId: `para_${index}` })),
        };
        const before = structuredClone(body);
        const build = (source: IDocumentBody): IDocumentBody => {
            let identity = 0;
            return buildTableOfContentsBody(source, source.customRanges!.find((range) => range.rangeId === 'toc')!, () => 7, () => `entry-${identity++}`, {
                preserveLeadingParagraph: true,
                entries: [{ text: 'Chapter', startOffset: 100, headingId: 'chapter', level: 1, paragraph: { paragraphId: 'chapter', startIndex: 107 } }],
            })!;
        };
        const first = build(body);
        expect(first.dataStream).toBe('\u001F\rChapter\t\u001F7\u001E\r\u001E');
        expect(first.paragraphs).toHaveLength(2);
        expect(build(first)).toEqual(first);
        expect(body).toEqual(before);
    });

    it.each([true, false])('keeps the leading cached paragraph outside entry templates when preserved: %s', (preserveLeadingParagraph) => {
        const dataStream = '\u001F\rAlpha\t\u001F1\u001E\rBeta\t\u001F1\u001E\r\u001E';
        const toc: ICustomRange = { rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: dataStream.length - 1, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-2"' } };
        const body: IDocumentBody = {
            dataStream,
            customRanges: [toc],
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_leading', styleId: 'Normal', paragraphStyle: { lineSpacing: 1.5 } },
                { startIndex: dataStream.indexOf('\r', 2), paragraphId: 'para_alpha', styleId: '16', paragraphStyle: { lineSpacing: 1, textStyle: { caps: false } } },
                { startIndex: dataStream.lastIndexOf('\r'), paragraphId: 'para_beta', styleId: '17', paragraphStyle: { lineSpacing: 1.15, textStyle: { caps: true } } },
            ],
        };
        const before = structuredClone(body);
        const build = (source: IDocumentBody): IDocumentBody => {
            let identity = 0;
            return buildTableOfContentsBody(source, source.customRanges!.find((range) => range.rangeId === 'toc')!, () => 1, () => `entry-${identity++}`, {
                preserveLeadingParagraph,
                entries: [
                    { text: 'Alpha', startOffset: 100, headingId: 'heading-alpha', level: 1, paragraph: { paragraphId: 'para_heading_alpha', startIndex: 100 } },
                    { text: 'Beta', startOffset: 200, headingId: 'heading-beta', level: 2, paragraph: { paragraphId: 'para_heading_beta', startIndex: 200 } },
                ],
            })!;
        };
        const first = build(body);
        expect(first.paragraphs!.map((paragraph) => paragraph.paragraphId)).toEqual(preserveLeadingParagraph ? ['para_leading', 'para_alpha', 'para_beta'] : ['para_alpha', 'para_beta']);
        expect(first.paragraphs!.map((paragraph) => paragraph.paragraphStyle)).toEqual(body.paragraphs!.slice(preserveLeadingParagraph ? 0 : 1).map((paragraph) => paragraph.paragraphStyle));
        expect(build(first)).toEqual(first);
        expect(body).toEqual(before);
    });

    it.each(['TOC1', '12', 'Normal'])('uses an adjacent TOC entry mark as a template without borrowing %s host formatting', (styleId) => {
        const dataStream = '\u001FOld\u001E\rHeading\r\n';
        const toc: ICustomRange = { rangeId: 'toc', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 4, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-1" \\n' } };
        const body: IDocumentBody = {
            dataStream,
            customRanges: [toc],
            paragraphs: [
                { startIndex: 5, paragraphId: 'cached', styleId, paragraphStyle: { textStyle: { caps: true } } },
                { startIndex: 13, paragraphId: 'heading', paragraphStyle: { headingId: 'heading', namedStyleType: NamedStyleType.HEADING_1 } },
            ],
        };
        const before = structuredClone(body);
        const result = buildTableOfContentsBody(body, toc, () => undefined, () => 'link', { styles: { 12: { name: 'toc 1', type: DocStyleType.paragraph } } })!;
        expect(result.dataStream).toBe('\u001FHeading\r\u001E');
        expect(result.paragraphs![0].styleId).toBe(styleId === 'TOC1' ? 'TOC1' : '12');
        expect(result.paragraphs![0].paragraphStyle?.textStyle?.caps).toBe(styleId !== 'Normal' ? true : undefined);
        expect(body).toEqual(before);
    });

    it.each(['TOCHeading', 'af7'])('preserves a leading paragraph break without copying the heading before the field (%s)', (styleId) => {
        const { body, toc } = createBody();
        const prefix = 'Contents';
        body.dataStream = `${prefix}\u001F\rOld\r\u001EHeading One\r\n`;
        toc.startIndex = prefix.length;
        toc.endIndex = body.dataStream.indexOf('\u001E');
        body.paragraphs = [
            { startIndex: prefix.length + 1, paragraphId: 'title', styleId, paragraphStyle: { outlineLevel: 9 } },
            { startIndex: toc.endIndex - 1, paragraphId: 'entry', styleId: 'TOC1' },
            { startIndex: body.dataStream.lastIndexOf('\r'), paragraphId: 'heading', paragraphStyle: { headingId: 'heading', outlineLevel: 0 } },
        ];
        const result = buildTableOfContentsBody(body, toc, () => undefined, () => 'link', { showPageNumbers: false, styles: { af7: { name: 'TOC Heading', type: DocStyleType.paragraph } } })!;
        expect(result.dataStream).toBe('\u001F\rHeading One\r\u001E');
        expect(result.paragraphs![0]).toMatchObject({ startIndex: 1, styleId, paragraphStyle: { outlineLevel: 9 } });
    });

    it('builds supplied caption entries with printed page labels and supports a pageless directory', () => {
        const { body, toc } = createBody();
        toc.properties!.instruction = 'TOC \\c "Figure" \\h';
        const entries = [{ text: 'Figure A.1: Results', textRuns: [{ st: 12, ed: 18, ts: { caps: true } }], startOffset: toc.endIndex + 1, level: 1, bookmarkId: '_Figure1', headingId: '_Figure1', paragraph: body.paragraphs![1] }];
        let next = 0;
        const paged = buildTableOfContentsBody(body, toc, () => 'iv', () => `caption-${next++}`, { entries });
        expect(paged?.dataStream).toContain('Figure A.1: Results\t\u001Fiv\u001E');
        expect(paged?.textRuns).toEqual([{ st: 13, ed: 19, ts: { caps: true } }]);
        const pageless = buildTableOfContentsBody(body, toc, () => undefined, () => `caption-${next++}`, { entries, showPageNumbers: false });
        expect(pageless?.dataStream).toBe('\u001FFigure A.1: Results\r\u001E');
        expect(pageless?.textRuns).toEqual(paged?.textRuns);
    });

    it('rejects a locked update before acquiring the layout renderer or modifying the document', async () => {
        const univer = new Univer();
        try {
            univer.registerPlugin(UniverDocsPlugin);
            const { body, toc } = createBody();
            toc.properties!.locked = BooleanNumber.TRUE;
            const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
                id: 'locked-toc-doc',
                body,
                documentStyle: {},
            });
            const commands = univer.__getInjector().get(ICommandService);
            commands.registerCommand(UpdateTableOfContentsCommand);
            const before = JSON.stringify(doc.getBody());

            expect(await commands.executeCommand(UpdateTableOfContentsCommand.id, {
                unitId: doc.getUnitId(),
                rangeId: toc.rangeId,
                mode: 'entireTable',
            })).toBe(false);
            expect(JSON.stringify(doc.getBody())).toBe(before);
        } finally {
            univer.dispose();
        }
    });

    it('does not recalculate a locked TOC in either update mode', () => {
        const { body, toc } = createBody();
        toc.properties!.locked = BooleanNumber.TRUE;
        const before = JSON.stringify(body);
        const resolvePageNumber = () => {
            throw new Error('Locked fields must not resolve page numbers');
        };

        expect(buildTableOfContentsBody(body, toc, resolvePageNumber)).toBeNull();
        expect(buildPageNumberOnlyTableOfContentsBody(body, toc, resolvePageNumber)).toBeNull();
        expect(JSON.stringify(body)).toBe(before);
    });

    it('encodes page-number options in Word TOC switches for OOXML round trips', () => {
        expect(buildTableOfContentsInstruction()).toBe('TOC \\o "1-3" \\h \\z \\u');
        expect(buildTableOfContentsInstruction({ levels: 5, showPageNumbers: false })).toBe('TOC \\o "1-5" \\h \\z \\u \\n');
        expect(buildTableOfContentsInstruction({ levels: 2, rightAlignPageNumbers: false })).toBe('TOC \\o "1-2" \\h \\z \\u \\p " "');
    });

    it('rebuilds an outline TOC with nested PAGEREF fields and internal links', () => {
        const { body, toc } = createBody();
        let id = 0;
        const result = buildTableOfContentsBody(
            body,
            toc,
            (offset) => offset < body.dataStream.indexOf('Subheading') ? 6 : 12,
            () => `generated-${++id}`
        )!;

        expect(result.dataStream).toBe('\u001FHeading One\t\u001F6\u001E\rSubheading\t\u001F12\u001E\r\u001E');
        expect(result.paragraphs).toEqual([
            expect.objectContaining({ startIndex: 16, styleId: 'TOC1' }),
            expect.objectContaining({ startIndex: 32, styleId: 'TOC1' }),
        ]);
        expect(result.customRanges).toEqual(expect.arrayContaining([
            expect.objectContaining({
                rangeId: 'toc',
                rangeType: CustomRangeType.FIELD,
                startIndex: 0,
                endIndex: 33,
                properties: expect.objectContaining({
                    fieldType: 'TOC',
                    cachedResult: 'Heading One\t6\rSubheading\t12\r',
                }),
            }),
            expect.objectContaining({
                rangeType: CustomRangeType.HYPERLINK,
                properties: { bookmarkId: '_Toc1', textStyleMode: 'text' },
            }),
            expect.objectContaining({
                rangeType: CustomRangeType.HYPERLINK,
                properties: { headingId: 'heading-2', textStyleMode: 'text' },
            }),
            expect.objectContaining({
                rangeType: CustomRangeType.FIELD,
                properties: expect.objectContaining({ fieldType: 'PAGEREF', cachedResult: '12' }),
            }),
        ]));
    });

    it('keeps distinct, stable paragraph identities when entries share a formatting template', () => {
        const { body, toc } = createBody();
        body.paragraphs![0].paragraphId = 'para_toc-entry';
        toc.properties!.title = 'Contents';
        let id = 0;
        const generateId = () => `identity-${++id}`;
        const first = buildTableOfContentsBody(body, toc, () => 1, generateId)!;
        const firstIds = first.paragraphs!.map((paragraph) => paragraph.paragraphId);
        expect(new Set(firstIds).size).toBe(3);
        expect(firstIds[1]).toBe('para_toc-entry');
        expect(firstIds.every((paragraphId) => paragraphId.startsWith('para_'))).toBe(true);

        const delta = first.dataStream.length - toc.endIndex - 1;
        const updatedBody: IDocumentBody = {
            dataStream: first.dataStream + body.dataStream.slice(toc.endIndex + 1),
            paragraphs: [
                ...first.paragraphs!,
                ...body.paragraphs!.filter((paragraph) => paragraph.startIndex > toc.endIndex)
                    .map((paragraph) => ({ ...paragraph, startIndex: paragraph.startIndex + delta })),
            ],
            customRanges: first.customRanges,
        };
        const updatedToc = updatedBody.customRanges!.find((range) => range.rangeId === toc.rangeId)!;
        const second = buildTableOfContentsBody(updatedBody, updatedToc, () => 2, generateId)!;
        expect(second.paragraphs!.map((paragraph) => paragraph.paragraphId)).toEqual(firstIds);
        expect(second.paragraphs!.slice(1).every((paragraph) => paragraph.styleId === 'TOC1')).toBe(true);
    });

    it('leaves caption tables of contents unchanged until SEQ fields are supported', () => {
        const { body, toc } = createBody();
        toc.properties = { fieldType: 'TOC', instruction: 'TOC \\h \\z \\c "图"' };

        expect(buildTableOfContentsBody(body, toc, () => 1)).toBeNull();
    });

    it('creates default TOC indentation and a right-aligned dot leader when inserting', () => {
        const body: IDocumentBody = {
            dataStream: 'Heading One\rSubheading\r\n',
            paragraphs: [{
                startIndex: 11,
                paragraphId: 'heading-1-paragraph',
                paragraphStyle: { headingId: 'heading-1', outlineLevel: 0 },
            }, {
                startIndex: 22,
                paragraphId: 'heading-2-paragraph',
                paragraphStyle: { headingId: 'heading-2', outlineLevel: 1 },
            }],
        };
        const toc: ICustomRange = {
            startIndex: 0,
            endIndex: 0,
            rangeId: 'new-toc',
            rangeType: CustomRangeType.FIELD,
            properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-2" \\h' },
        };

        const result = buildTableOfContentsBody(body, toc, () => 1, () => 'generated', { tabStopOffset: 414 })!;

        expect(result.paragraphs?.map((paragraph) => paragraph.paragraphStyle)).toEqual([{
            indentStart: { v: 0 },
            tabStops: [{ offset: 414, alignment: TabStopAlignment.END, leader: TabStopLeader.DOT }],
        }, {
            indentStart: { v: 18 },
            tabStops: [{ offset: 414, alignment: TabStopAlignment.END, leader: TabStopLeader.DOT }],
        }, { outlineLevel: 9 }]);
    });

    it('does not create an empty field when no matching headings exist', () => {
        const body: IDocumentBody = {
            dataStream: 'Body text\r\n',
            paragraphs: [{ startIndex: 9, paragraphId: 'body' }],
        };
        const toc: ICustomRange = {
            startIndex: 0,
            endIndex: 0,
            rangeId: 'new-toc',
            rangeType: CustomRangeType.FIELD,
            properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3" \\h' },
        };

        expect(countTableOfContentsHeadings(body, 3)).toBe(0);
        expect(buildTableOfContentsBody(body, toc, () => 1)).toBeNull();
    });

    it('reads imported heading styles without rewriting heading IDs and honors outline exclusion', () => {
        const body: IDocumentBody = {
            dataStream: 'Imported heading\rExcluded heading\r\n',
            paragraphs: [
                { startIndex: 16, paragraphId: 'imported-heading', styleId: 'ImportedHeading' },
                { startIndex: 33, paragraphId: 'excluded-heading', styleId: 'ImportedHeading', paragraphStyle: { outlineLevel: 9 } },
            ],
        };
        const styles = { ImportedHeading: { name: 'Imported Heading', type: DocStyleType.paragraph, paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } } };
        const before = JSON.stringify(body);
        const toc: ICustomRange = { startIndex: 0, endIndex: 0, rangeId: 'new-imported-toc', rangeType: CustomRangeType.FIELD, properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3" \\h' } };
        expect(countTableOfContentsHeadings(body, 3, styles)).toBe(1);
        const result = buildTableOfContentsBody(body, toc, () => 4, undefined, { styles })!;
        expect(result.dataStream).toContain('Imported heading');
        expect(result.dataStream).not.toContain('Excluded heading');
        expect(result.customRanges?.find((range) => range.rangeType === CustomRangeType.HYPERLINK)?.properties?.headingId).toBe('imported-heading');
        expect(JSON.stringify(body)).toBe(before);
    });

    it('retains caption directories for their reference provider instead of replacing them with headings', () => {
        const { body, toc } = createBody();
        toc.properties!.instruction = 'TOC \\c "Figure" \\h';
        expect(buildTableOfContentsBody(body, toc, () => 1)).toBeNull();
    });

    it('supports a localized title and a TOC without page numbers', () => {
        const body: IDocumentBody = {
            dataStream: 'Heading One\r\n',
            paragraphs: [{
                startIndex: 11,
                paragraphId: 'heading',
                paragraphStyle: { headingId: 'heading-1', outlineLevel: 0 },
            }],
        };
        const toc: ICustomRange = {
            startIndex: 0,
            endIndex: 0,
            rangeId: 'new-toc',
            rangeType: CustomRangeType.FIELD,
            properties: {
                fieldType: 'TOC',
                instruction: 'TOC \\o "1-3" \\h \\n',
                title: 'Contents',
                showPageNumbers: false,
            },
        };

        const result = buildTableOfContentsBody(body, toc, () => undefined, () => 'generated')!;

        expect(result.dataStream).toBe('Contents\r\u001FHeading One\r\u001E\r');
        expect(result.paragraphs?.[0]).toEqual(expect.objectContaining({ styleId: 'TOCHeading' }));
        expect(result.customRanges?.some((range) => range.properties?.fieldType === 'PAGEREF')).toBe(false);
        const field = result.customRanges!.find((range) => range.rangeId === 'new-toc')!;
        expect(field.properties?.cachedResult).toBe('Heading One\r');
        expect(field.startIndex).toBe('Contents\r'.length);
        expect(result.dataStream.slice(field.endIndex + 1)).toBe('\r');

        const updated = buildTableOfContentsBody(result, field, () => undefined, () => 'regenerated', {
            showPageNumbers: false,
            entries: [{ headingId: 'heading-1', level: 1, startOffset: 0, text: 'Heading One', paragraph: body.paragraphs![0] }],
        })!;
        expect(updated.dataStream).toBe('\u001FHeading One\r\u001E');
        expect(updated.paragraphs?.some((paragraph) => paragraph.styleId === 'TOCHeading')).toBe(false);
    });

    it('preserves an imported TOCHeading title when OOXML has no Univer title property', () => {
        const dataStream = '\u001FContents\rOld\t\u001F1\u001E\r\u001EHeading One\r\n';
        const outerEnd = dataStream.indexOf('\u001E', dataStream.indexOf('\u001E') + 1);
        const headingStart = outerEnd + 1;
        const headingEnd = dataStream.indexOf('\r', headingStart);
        const toc: ICustomRange = {
            startIndex: 0,
            endIndex: outerEnd,
            rangeId: 'toc',
            rangeType: CustomRangeType.FIELD,
            properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3" \\h' },
        };
        const body: IDocumentBody = {
            dataStream,
            paragraphs: [{
                startIndex: 9,
                paragraphId: 'toc-title',
                styleId: 'TOCHeading',
            }, {
                startIndex: outerEnd - 1,
                paragraphId: 'toc-entry',
                styleId: 'TOC1',
            }, {
                startIndex: headingEnd,
                paragraphId: 'heading',
                paragraphStyle: { headingId: 'heading-1', outlineLevel: 0 },
            }],
            customRanges: [toc],
        };

        const result = buildTableOfContentsBody(body, toc, () => 2, () => 'generated')!;

        expect(result.dataStream).toBe('\u001FContents\rHeading One\t\u001F2\u001E\r\u001E');
        expect(result.paragraphs?.[0].styleId).toBe('TOCHeading');
    });

    it.each([
        ['none', TabStopLeader.NONE, 'simple', 12],
        ['dashes', TabStopLeader.HYPHEN, 'classic', 14],
        ['underline', TabStopLeader.UNDERSCORE, 'modern', 20],
    ] as const)('applies the %s leader and %s format', (leader, expectedLeader, format, expectedIndent) => {
        const body: IDocumentBody = {
            dataStream: 'Subheading\r\n',
            paragraphs: [{
                startIndex: 10,
                paragraphId: 'heading',
                paragraphStyle: { headingId: 'heading-2', outlineLevel: 1 },
            }],
        };
        const toc: ICustomRange = {
            startIndex: 0,
            endIndex: 0,
            rangeId: 'new-toc',
            rangeType: CustomRangeType.FIELD,
            properties: {
                fieldType: 'TOC',
                instruction: 'TOC \\o "1-3" \\h',
                tabLeader: leader,
                format,
            },
        };

        const result = buildTableOfContentsBody(body, toc, () => 2, () => 'generated', { tabStopOffset: 414 })!;

        expect(result.paragraphs?.[0].paragraphStyle?.indentStart?.v).toBe(expectedIndent);
        expect(result.paragraphs?.[0].paragraphStyle?.tabStops?.[0].leader).toBe(expectedLeader);
    });

    it('places page numbers next to entry text when right alignment is disabled', () => {
        const body: IDocumentBody = {
            dataStream: 'Heading One\r\n',
            paragraphs: [{
                startIndex: 11,
                paragraphId: 'heading',
                paragraphStyle: { headingId: 'heading-1', outlineLevel: 0 },
            }],
        };
        const toc: ICustomRange = {
            startIndex: 0,
            endIndex: 0,
            rangeId: 'new-toc',
            rangeType: CustomRangeType.FIELD,
            properties: {
                fieldType: 'TOC',
                instruction: 'TOC \\o "1-3" \\h \\p " "',
                rightAlignPageNumbers: false,
            },
        };

        const result = buildTableOfContentsBody(body, toc, () => 4, () => 'generated', { tabStopOffset: 414 })!;

        expect(result.dataStream).toBe('\u001FHeading One \u001F4\u001E\r\u001E\r');
        expect(result.paragraphs?.[0].paragraphStyle?.tabStops).toBeUndefined();
    });

    it.each([undefined, BooleanNumber.FALSE, BooleanNumber.TRUE].flatMap((locked) =>
        [6, 9, 42].map((pageNumber) => ({ locked, pageNumber }))
    ))('preserves manual text and detects unchanged page fields (lock $locked, page $pageNumber)', ({ locked, pageNumber }) => {
        const dataStream = '\u001FManual title\t\u001F6\u001E\r\u001EHeading One\r\n';
        const tocEnd = dataStream.indexOf('\u001E', dataStream.indexOf('\u001E') + 1);
        const pageStart = dataStream.indexOf('\u001F', 1);
        const pageEnd = dataStream.indexOf('\u001E');
        const headingStart = tocEnd + 1;
        const headingEnd = dataStream.indexOf('\r', headingStart);
        const toc: ICustomRange = {
            startIndex: 0,
            endIndex: tocEnd,
            rangeId: 'toc',
            rangeType: CustomRangeType.FIELD,
            properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3" \\h', cachedResult: 'Manual title\t6\r' },
        };
        const body: IDocumentBody = {
            dataStream,
            paragraphs: [
                { startIndex: tocEnd - 1, paragraphId: 'toc-paragraph' },
                { startIndex: headingEnd, paragraphId: 'heading-paragraph', paragraphStyle: { headingId: 'heading-1', outlineLevel: 0 } },
            ],
            customRanges: [toc, {
                startIndex: pageStart,
                endIndex: pageEnd,
                rangeId: 'page',
                rangeType: CustomRangeType.FIELD,
                properties: { fieldType: 'PAGEREF', instruction: 'PAGEREF _Toc1 \\h', cachedResult: '6', locked },
            }, {
                startIndex: 1,
                endIndex: pageEnd,
                rangeId: 'link',
                rangeType: CustomRangeType.HYPERLINK,
                properties: { bookmarkId: '_Toc1' },
            }, {
                startIndex: headingStart,
                endIndex: headingEnd - 1,
                rangeId: 'bookmark',
                rangeType: CustomRangeType.BOOKMARK,
                properties: { bookmarkId: '_Toc1' },
            }],
        };

        const before = JSON.stringify(body);
        const result = buildPageNumberOnlyTableOfContentsBody(body, toc, () => locked === BooleanNumber.TRUE ? undefined : pageNumber)!;
        const expectedPage = locked === BooleanNumber.TRUE ? '6' : String(pageNumber);
        const expectedEnd = pageEnd + expectedPage.length - 1;

        expect(result.dataStream).toBe(`\u001FManual title\t\u001F${expectedPage}\u001E\r\u001E`);
        expect(result.customRanges?.find((range) => range.rangeId === 'page')).toEqual(expect.objectContaining({
            endIndex: expectedEnd,
            properties: expect.objectContaining({ cachedResult: expectedPage, locked }),
        }));
        expect(result.customRanges?.find((range) => range.rangeId === 'link')?.endIndex).toBe(expectedEnd);
        expect(findTableOfContentsAtOffset(body, 5)?.rangeId).toBe('toc');
        const current = getBodySlice(body, toc.startIndex, toc.endIndex + 1, true, SliceBodyType.cut);
        if (expectedPage === '6') {
            expect(result).toEqual(current);
            toc.properties!.cachedResult = 'Stale cache';
            expect(buildPageNumberOnlyTableOfContentsBody(body, toc, () => pageNumber))
                .not
                .toEqual(getBodySlice(body, toc.startIndex, toc.endIndex + 1, true, SliceBodyType.cut));
            toc.properties!.cachedResult = 'Manual title\t6\r';
            if (locked !== BooleanNumber.TRUE) {
                const pageField = body.customRanges!.find((range) => range.rangeId === 'page')!;
                pageField.properties!.cachedResult = 'Stale page cache';
                expect(buildPageNumberOnlyTableOfContentsBody(body, toc, () => pageNumber)).toEqual(result);
                expect(pageField.properties!.cachedResult).toBe('Stale page cache');
                pageField.properties!.cachedResult = '6';
            }
        } else {
            expect(result).not.toEqual(current);
        }
        expect(JSON.stringify(body)).toBe(before);
    });
});
