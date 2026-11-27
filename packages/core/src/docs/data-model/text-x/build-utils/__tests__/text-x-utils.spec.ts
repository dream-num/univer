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
import type { IDocumentBody } from '../../../../../types/interfaces/i-document-data';
import { CustomRangeType, DocumentFlavor } from '../../../../../types/interfaces/i-document-data';
import { DocumentDataModel } from '../../../document-data-model';
import { DataStreamTreeTokenType } from '../../../types';
import { TextX } from '../../text-x';
import { deleteSelectionTextX, replaceSelectionTextRuns, replaceSelectionTextX } from '../text-x-utils';

describe('deleteSelectionTextX structural expansion', () => {
    it.each([0, 3])('preserves an unrelated blank bookmark when deleting character %i', (startOffset) => {
        const body: IDocumentBody = {
            dataStream: 'A\r\rB\r\n',
            paragraphs: [1, 2, 4].map((startIndex) => ({ startIndex, paragraphId: `p-${startIndex}` })),
            sectionBreaks: [{ startIndex: 5, sectionId: 'body' }],
            customRanges: [{ startIndex: 2, endIndex: 2, rangeId: 'blank-bookmark', rangeType: CustomRangeType.BOOKMARK }],
        };
        const expected = body.dataStream.slice(0, startOffset) + body.dataStream.slice(startOffset + 1);
        const actions = deleteSelectionTextX([{ startOffset, endOffset: startOffset + 1, collapsed: false }], body);
        TextX.apply(body, actions);
        expect(body.dataStream).toBe(expected);
        expect(body.paragraphs?.map((paragraph) => paragraph.paragraphId)).toEqual(['p-1', 'p-2', 'p-4']);
        expect(body.customRanges?.map((range) => range.rangeId)).toEqual(['blank-bookmark']);
    });

    it('still deletes an explicitly selected blank bookmark paragraph', () => {
        const body: IDocumentBody = {
            dataStream: 'A\r\rB\r\n',
            paragraphs: [1, 2, 4].map((startIndex) => ({ startIndex, paragraphId: `p-${startIndex}` })),
            sectionBreaks: [{ startIndex: 5, sectionId: 'body' }],
            customRanges: [{ startIndex: 2, endIndex: 2, rangeId: 'blank-bookmark', rangeType: CustomRangeType.BOOKMARK }],
        };
        TextX.apply(body, deleteSelectionTextX([{ startOffset: 2, endOffset: 3, collapsed: false }], body));
        expect(body.dataStream).toBe('A\rB\r\n');
        expect(body.customRanges).toHaveLength(0);
    });
});

describe('empty paragraph formatting', () => {
    function createListBody(): IDocumentBody {
        return {
            dataStream: 'R\rGB\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'red' },
                { startIndex: 4, paragraphId: 'green', bullet: { listId: 'list', listType: 'BULLET_LIST', nestingLevel: 0 } },
            ],
            textRuns: [
                { st: 0, ed: 2, ts: { cl: { rgb: '#ff0000' } } },
                { st: 2, ed: 3, ts: { cl: { rgb: '#008000' }, fs: 20 } },
                { st: 3, ed: 4, ts: { cl: { rgb: '#0000ff' }, fs: 16 } },
                { st: 4, ed: 5, ts: { cl: { rgb: '#ff0000' }, bl: 1 } },
            ],
        };
    }

    it.each([false, true])('keeps the first character format on the surviving modern paragraph mark (list: %s)', (isList) => {
        const body = createListBody();
        if (!isList) {
            delete body.paragraphs![1].bullet;
        }
        TextX.apply(body, deleteSelectionTextX([{ startOffset: 2, endOffset: 4, collapsed: false }], body, 0, null, false, DocumentFlavor.MODERN));
        expect(body.dataStream).toBe('R\r\r\n');
        expect(body.textRuns?.find((run) => run.st <= 2 && run.ed > 2)?.ts).toEqual({ cl: { rgb: '#008000' }, fs: 20 });
        expect(body.textRuns?.every((run) => run.ed > run.st)).toBe(true);
        expect(body.paragraphs?.[1].bullet).toEqual(isList ? { listId: 'list', listType: 'BULLET_LIST', nestingLevel: 0 } : undefined);
    });

    it.each(['traditional', 'partial deletion', 'replacement'])('preserves the existing mark for %s', (scenario) => {
        const body = createListBody();
        const endOffset = scenario === 'partial deletion' ? 3 : 4;
        const insertBody = scenario === 'replacement' ? { dataStream: 'X' } : null;
        TextX.apply(body, deleteSelectionTextX(
            [{ startOffset: 2, endOffset, collapsed: false }],
            body,
            0,
            insertBody,
            false,
            scenario === 'traditional' ? DocumentFlavor.TRADITIONAL : DocumentFlavor.MODERN
        ));
        const mark = body.paragraphs![1].startIndex;
        expect(body.textRuns?.find((run) => run.st <= mark && run.ed > mark)?.ts).toEqual({ cl: { rgb: '#ff0000' }, bl: 1 });
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('restores paragraph identity when undoing deletion in %s', (flavor) => {
        const body = createListBody();
        const before = JSON.parse(JSON.stringify(body));
        const actions = TextX.makeInvertible(deleteSelectionTextX([{ startOffset: 2, endOffset: 4, collapsed: false }], body, 0, null, true, flavor), body);
        TextX.apply(body, actions);
        TextX.apply(body, TextX.invert(actions));
        expect(body).toMatchObject(before);
    });

    it('preserves explicit marker and paragraph-mark styles', () => {
        const body = createListBody();
        body.paragraphs![1].bullet!.textStyle = { cl: { rgb: '#0000ff' } };
        body.paragraphs![1].paragraphStyle = { paragraphMarkTextStyle: { cl: { rgb: '#800080' } } };
        TextX.apply(body, deleteSelectionTextX([{ startOffset: 2, endOffset: 4, collapsed: false }], body, 0, null, true, DocumentFlavor.MODERN));
        expect(body.paragraphs![1].bullet?.textStyle).toEqual({ cl: { rgb: '#0000ff' } });
        expect(body.paragraphs![1].paragraphStyle?.paragraphMarkTextStyle).toEqual({ cl: { rgb: '#800080' } });
        expect(body.textRuns?.find((run) => run.st <= 2 && run.ed > 2)?.ts).toEqual({ cl: { rgb: '#ff0000' }, bl: 1 });
    });
});

describe('replaceSelectionTextX', () => {
    it('keeps the document minimum paragraph and section sentinels when replacing all content', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'para_minimum' }],
            sectionBreaks: [{ sectionId: 'section_fixture_60', startIndex: 2 }],
        };
        const doc = new DocumentDataModel({ body });

        const textX = replaceSelectionTextX({
            selection: { startOffset: 0, endOffset: 3, collapsed: false },
            body: { dataStream: 'X' },
            doc,
        });

        expect(textX).toBeTruthy();
        if (textX) {
            TextX.apply(body, textX.serialize());
            expect(body.dataStream).toBe(`X${T.PARAGRAPH}${T.SECTION_BREAK}`);
            expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([1]);
            expect(body.sectionBreaks?.map((sectionBreak) => sectionBreak.startIndex)).toEqual([2]);
        }
    });

    it('keeps the document minimum sentinels when replacing text runs over all content', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'para_minimum' }],
            sectionBreaks: [{ sectionId: 'section_fixture_61', startIndex: 2 }],
        };
        const doc = new DocumentDataModel({ body });

        const textX = replaceSelectionTextRuns({
            selection: { startOffset: 0, endOffset: 3, collapsed: false },
            body: { dataStream: 'X' },
            doc,
            themeService: {} as never,
        });

        expect(textX).toBeTruthy();
        if (textX) {
            TextX.apply(body, textX.serialize());
            expect(body.dataStream).toBe(`X${T.PARAGRAPH}${T.SECTION_BREAK}`);
        }
    });

    it('allows deleting a paragraph sentinel when another root paragraph remains', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}B${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 1, paragraphId: 'first' },
                { startIndex: 3, paragraphId: 'second' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_62', startIndex: 4 }],
        };

        const actions = deleteSelectionTextX(
            [{ startOffset: 2, endOffset: 4, collapsed: false }],
            body
        );

        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`A${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.sectionBreaks?.map((sectionBreak) => sectionBreak.startIndex)).toEqual([2]);
    });

    it('keeps the next paragraph metadata aligned when deleting the first paragraph', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `Title${T.PARAGRAPH}Body${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 5, paragraphId: 'first' },
                { startIndex: 10, paragraphId: 'second' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_63', startIndex: 11 }],
        };

        const actions = deleteSelectionTextX(
            [{ startOffset: 0, endOffset: 6, collapsed: false }],
            body
        );

        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`Body${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([4]);
        expect(body.sectionBreaks?.map((sectionBreak) => sectionBreak.startIndex)).toEqual([5]);
    });

    it('does not duplicate paragraph metadata when deleting a bulleted first paragraph', () => {
        const T = DataStreamTreeTokenType;
        const bullet = { listId: 'list-1', listType: 'bullet', nestingLevel: 0 } as never;
        const body: IDocumentBody = {
            dataStream: `Title${T.PARAGRAPH}Body${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 5, paragraphId: 'first', bullet },
                { startIndex: 10, paragraphId: 'second' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_64', startIndex: 11 }],
        };

        const actions = deleteSelectionTextX(
            [{ startOffset: 0, endOffset: 6, collapsed: false }],
            body
        );

        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`Body${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([4]);
        expect(body.paragraphs).toHaveLength(1);
    });
});

describe('replaceSelectionTextX with a hyperlink', () => {
    it('replaces both the label and link target, preserving the adjacent space', () => {
        const { CUSTOM_RANGE_START, CUSTOM_RANGE_END } = DataStreamTreeTokenType;
        const label = `${CUSTOM_RANGE_START}What is${CUSTOM_RANGE_END}`;
        const replacement = `${CUSTOM_RANGE_START}what are${CUSTOM_RANGE_END}`;
        const tail = ' univer and how to use it?\r\n';
        const link = (text: string, url: string) => ({
            startIndex: 0,
            endIndex: text.length - 1,
            rangeId: '1',
            rangeType: CustomRangeType.HYPERLINK,
            properties: { url },
        });
        const body: IDocumentBody = {
            dataStream: label + tail,
            paragraphs: [{ startIndex: label.length + tail.indexOf('\r'), paragraphId: 'link-paragraph' }],
            customRanges: [link(label, 'https://univer.ai')],
        };
        const nextLink = link(replacement, 'https://univer.ai/haha');
        const textX = replaceSelectionTextX({
            selection: { startOffset: 0, endOffset: label.length, collapsed: false },
            body: { dataStream: replacement, customRanges: [nextLink] },
            doc: new DocumentDataModel({ body }),
        });
        if (!textX) {
            throw new Error('Expected a hyperlink replacement');
        }
        TextX.apply(body, textX.serialize());
        expect(body.dataStream).toBe(replacement + tail);
        expect(body.customRanges).toEqual([nextLink]);
    });
});
