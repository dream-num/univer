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

import type { ICustomRange, IDocumentBody } from '@univerjs/core';
import { CustomRangeType, NamedStyleType, TabStopAlignment, TabStopLeader } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { buildPageNumberOnlyTableOfContentsBody, buildTableOfContentsBody, buildTableOfContentsInstruction, countTableOfContentsHeadings, findTableOfContentsAtOffset } from '../table-of-contents.command';

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

describe('table of contents body builder', () => {
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
                properties: { bookmarkId: '_Toc1' },
            }),
            expect.objectContaining({
                rangeType: CustomRangeType.HYPERLINK,
                properties: { headingId: 'heading-2' },
            }),
            expect.objectContaining({
                rangeType: CustomRangeType.FIELD,
                properties: expect.objectContaining({ fieldType: 'PAGEREF', cachedResult: '12' }),
            }),
        ]));
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
        }]);
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

        expect(result.dataStream).toBe('\u001FContents\rHeading One\r\u001E');
        expect(result.paragraphs?.[0]).toEqual(expect.objectContaining({ styleId: 'TOCHeading' }));
        expect(result.customRanges?.some((range) => range.properties?.fieldType === 'PAGEREF')).toBe(false);
        expect(result.customRanges?.find((range) => range.rangeId === 'new-toc')?.properties?.cachedResult).toBe('Contents\rHeading One\r');
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

        expect(result.dataStream).toBe('\u001FHeading One \u001F4\u001E\r\u001E');
        expect(result.paragraphs?.[0].paragraphStyle?.tabStops).toBeUndefined();
    });

    it('updates only nested page numbers and preserves manually edited entry text', () => {
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
            properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3" \\h' },
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
                properties: { fieldType: 'PAGEREF', instruction: 'PAGEREF _Toc1 \\h', cachedResult: '6' },
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

        const result = buildPageNumberOnlyTableOfContentsBody(body, toc, () => 42)!;

        expect(result.dataStream).toBe('\u001FManual title\t\u001F42\u001E\r\u001E');
        expect(result.customRanges?.find((range) => range.rangeId === 'page')).toEqual(expect.objectContaining({
            endIndex: pageEnd + 1,
            properties: expect.objectContaining({ cachedResult: '42' }),
        }));
        expect(result.customRanges?.find((range) => range.rangeId === 'link')?.endIndex).toBe(pageEnd + 1);
        expect(findTableOfContentsAtOffset(body, 5)?.rangeId).toBe('toc');
    });
});
