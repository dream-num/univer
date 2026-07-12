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

import type { IDocumentBody } from '../../../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { BuildTextUtils } from '..';
import { DocumentDataModel } from '../../../document-data-model';
import { DataStreamTreeTokenType } from '../../../types';
import { TextX } from '../../text-x';
import { replaceSelectionTextRuns, replaceSelectionTextX } from '../text-x-utils';

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

        const actions = BuildTextUtils.selection.delete(
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

        const actions = BuildTextUtils.selection.delete(
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

        const actions = BuildTextUtils.selection.delete(
            [{ startOffset: 0, endOffset: 6, collapsed: false }],
            body
        );

        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`Body${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([4]);
        expect(body.paragraphs).toHaveLength(1);
    });
});
