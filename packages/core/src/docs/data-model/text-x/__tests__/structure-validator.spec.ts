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

import type { IDocumentBody, IDocumentNote } from '../../../../types/interfaces/i-document-data';
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

describe('validateDocumentStructure notes', () => {
    it.each(['footnote', 'endnote'] as const)('rejects independent page setup in a %s while accepting a normal rich note body', (type) => {
        const note: IDocumentNote = { type, noteId: 'note', body: noteBody('Explanation') };
        note.body.textRuns = [{ st: 0, ed: 3, ts: { bl: 1 } }];
        expect(validateDocumentStructure({ notes: { note } })).toEqual([]);
        note.body.sectionBreaks![0].marginTop = 50;
        expect(validateDocumentStructure({ notes: { note } }).map((issue) => issue.code)).toEqual(['invalid-note-body']);
        note.body = {
            dataStream: 'A\r\nB\r\n',
            paragraphs: [{ paragraphId: 'a', startIndex: 1 }, { paragraphId: 'b', startIndex: 4 }],
            sectionBreaks: [{ sectionId: 'a', startIndex: 2 }, { sectionId: 'b', startIndex: 5 }],
        };
        expect(validateDocumentStructure({ notes: { note } }).map((issue) => issue.code)).toContain('invalid-note-body');
    });

    it('rejects duplicate references and mismatched segment identities', () => {
        const body = noteBody('\uFFFC\uFFFC');
        body.customRanges = [0, 1].map((index) => ({
            rangeType: CustomRangeType.FOOTNOTE,
            rangeId: `reference-${index}`,
            startIndex: index,
            endIndex: index,
            wholeEntity: true,
            properties: { noteId: 'note' },
        }));
        const notes = { note: { type: 'footnote' as const, noteId: 'note', body: noteBody('Explanation') } };
        expect(validateDocumentStructure({ body, notes }).map((issue) => issue.code)).toEqual(['duplicate-note-reference']);
        notes.note.noteId = 'other';
        expect(validateDocumentStructure({ notes }).map((issue) => issue.code)).toEqual(['invalid-note-id']);
    });

    it('rejects nested references even when the referenced note exists', () => {
        const body = noteBody('\uFFFC');
        body.customRanges = [{ rangeType: CustomRangeType.FOOTNOTE, rangeId: 'nested', startIndex: 0, endIndex: 0, wholeEntity: true, properties: { noteId: 'second' } }];
        expect(validateDocumentStructure({ notes: {
            first: { type: 'footnote' as const, noteId: 'first', body },
            second: { type: 'footnote' as const, noteId: 'second', body: noteBody('Second') },
        } }).map((issue) => issue.code)).toEqual(['nested-note']);
    });

    it.each(['headers', 'footers'] as const)('rejects references in %s and ambiguous note segment identities', (kind) => {
        const body = noteBody('\uFFFC');
        body.customRanges = [{ rangeType: CustomRangeType.FOOTNOTE, rangeId: 'reference', startIndex: 0, endIndex: 0, wholeEntity: true, properties: { noteId: 'note' } }];
        const notes = { note: { type: 'footnote' as const, noteId: 'note', body: noteBody('Explanation') } };
        const running = { headerId: 'running', footerId: 'running', body };
        expect(validateDocumentStructure({ [kind]: { running }, notes })).toEqual([
            expect.objectContaining({ code: 'invalid-note-reference', segmentId: 'running', index: 0 }),
        ]);
        const colliding = { headerId: 'note', footerId: 'note', body: noteBody('Running text') };
        expect(validateDocumentStructure({ [kind]: { note: colliding }, notes })).toEqual([
            expect.objectContaining({ code: 'invalid-note-id', segmentType: 'note', segmentId: 'note' }),
        ]);
    });
});
