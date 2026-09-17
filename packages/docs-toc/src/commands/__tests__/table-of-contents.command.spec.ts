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
    getBodySlice,
    ICommandService,
    NamedStyleType,
    SliceBodyType,
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

describe('table of contents body builder', () => {
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
