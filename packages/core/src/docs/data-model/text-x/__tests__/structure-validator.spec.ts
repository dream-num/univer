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

import type { IDocumentBody, IFootnoteData } from '../../../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import { CustomRangeType } from '../../../../types/interfaces/i-document-data';
import { validateDocumentStructure } from '../structure-validator';

function noteBody(text: string): IDocumentBody {
    return {
        dataStream: `${text}\r\n`,
        paragraphs: [{ paragraphId: 'paragraph', startIndex: text.length }],
        sectionBreaks: [{ sectionId: 'section', startIndex: text.length + 1 }],
    };
}

describe('validateDocumentStructure footnotes', () => {
    it('rejects independent page setup while accepting a normal rich note body', () => {
        const note: IFootnoteData = { footnoteId: 'note', body: noteBody('Explanation') };
        note.body.textRuns = [{ st: 0, ed: 3, ts: { bl: 1 } }];
        expect(validateDocumentStructure({ footnotes: { note } })).toEqual([]);
        note.body.sectionBreaks![0].marginTop = 50;
        expect(validateDocumentStructure({ footnotes: { note } }).map((issue) => issue.code)).toEqual(['invalid-footnote-body']);
        note.body = {
            dataStream: 'A\r\nB\r\n',
            paragraphs: [{ paragraphId: 'a', startIndex: 1 }, { paragraphId: 'b', startIndex: 4 }],
            sectionBreaks: [{ sectionId: 'a', startIndex: 2 }, { sectionId: 'b', startIndex: 5 }],
        };
        expect(validateDocumentStructure({ footnotes: { note } }).map((issue) => issue.code)).toContain('invalid-footnote-body');
    });

    it('rejects duplicate references and mismatched segment identities', () => {
        const body = noteBody('\uFFFC\uFFFC');
        body.customRanges = [0, 1].map((index) => ({
            rangeType: CustomRangeType.FOOTNOTE,
            rangeId: `reference-${index}`,
            startIndex: index,
            endIndex: index,
            wholeEntity: true,
            properties: { footnoteId: 'note' },
        }));
        const footnotes = { note: { footnoteId: 'note', body: noteBody('Explanation') } };
        expect(validateDocumentStructure({ body, footnotes }).map((issue) => issue.code)).toEqual(['duplicate-footnote-reference']);
        footnotes.note.footnoteId = 'other';
        expect(validateDocumentStructure({ footnotes }).map((issue) => issue.code)).toEqual(['invalid-footnote-id']);
    });

    it('rejects nested references even when the referenced note exists', () => {
        const body = noteBody('\uFFFC');
        body.customRanges = [{ rangeType: CustomRangeType.FOOTNOTE, rangeId: 'nested', startIndex: 0, endIndex: 0, wholeEntity: true, properties: { footnoteId: 'second' } }];
        expect(validateDocumentStructure({ footnotes: {
            first: { footnoteId: 'first', body },
            second: { footnoteId: 'second', body: noteBody('Second') },
        } }).map((issue) => issue.code)).toEqual(['nested-footnote']);
    });

    it.each(['headers', 'footers'] as const)('rejects references in %s and ambiguous note segment identities', (kind) => {
        const body = noteBody('\uFFFC');
        body.customRanges = [{ rangeType: CustomRangeType.FOOTNOTE, rangeId: 'reference', startIndex: 0, endIndex: 0, wholeEntity: true, properties: { footnoteId: 'note' } }];
        const footnotes = { note: { footnoteId: 'note', body: noteBody('Explanation') } };
        const running = { headerId: 'running', footerId: 'running', body };
        expect(validateDocumentStructure({ [kind]: { running }, footnotes })).toEqual([
            expect.objectContaining({ code: 'invalid-footnote-reference', segmentId: 'running', index: 0 }),
        ]);
        const colliding = { headerId: 'note', footerId: 'note', body: noteBody('Running text') };
        expect(validateDocumentStructure({ [kind]: { note: colliding }, footnotes })).toEqual([
            expect.objectContaining({ code: 'invalid-footnote-id', segmentType: 'footnote', segmentId: 'note' }),
        ]);
    });
});
