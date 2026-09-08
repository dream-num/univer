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

import type { IDocumentData, IDocumentNote, IFootnoteProperties } from '@univerjs/core';
import { CustomRangeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { formatNoteNumber, resolveNoteReferences } from '../note-numbering';

function createSnapshot(restart: IFootnoteProperties['restart']): Pick<IDocumentData, 'body' | 'notes' | 'noteSettings'> {
    const notes: Record<string, IDocumentNote> = {};
    for (let index = 0; index < 5; index++) {
        const noteId = `note-${index}`;
        notes[noteId] = { type: 'footnote' as const, noteId, body: { dataStream: 'Explanation\r\n' } };
    }
    notes['note-1'].customMark = '†';
    return {
        body: {
            dataStream: '\uFFFC\uFFFC\uFFFC\r\n\uFFFC\uFFFC\r\n',
            customRanges: [0, 1, 2, 5, 6].map((offset, index) => ({
                rangeId: `reference-${index}`,
                rangeType: CustomRangeType.FOOTNOTE,
                startIndex: offset,
                endIndex: offset,
                wholeEntity: true,
                properties: { noteId: `note-${index}` },
            })),
            sectionBreaks: [
                { sectionId: 'section-1', startIndex: 4 },
                { sectionId: 'section-2', startIndex: 8 },
            ],
        },
        notes,
        noteSettings: { footnote: { restart, startNumber: 3, numberFormat: 'lowerRoman' } },
    };
}

describe('footnote numbering', () => {
    it('keeps custom marks out of the automatic sequence without changing persisted text', () => {
        const snapshot = createSnapshot('continuous');
        const original = JSON.stringify(snapshot);
        const references = resolveNoteReferences(snapshot);
        expect([...references.values()].map((reference) => reference.label)).toEqual(['iii', '†', 'iv', 'v', 'vi']);
        expect(JSON.stringify(snapshot)).toBe(original);
    });

    it('restarts at section boundaries and inherits the document number format', () => {
        const snapshot = createSnapshot('eachSect');
        snapshot.body!.sectionBreaks![1].noteProperties = { footnote: { startNumber: 9 } };
        expect([...resolveNoteReferences(snapshot).values()].map((reference) => reference.label))
            .toEqual(['iii', '†', 'iv', 'ix', 'x']);
    });

    it('renumbers after a reference moves to a new physical page without rewriting the reference', () => {
        const snapshot = createSnapshot('eachPage');
        const pages = new Map([['note-0', 0], ['note-1', 1], ['note-2', 1], ['note-3', 2], ['note-4', 2]]);
        expect([...resolveNoteReferences(snapshot, pages).values()].map((reference) => reference.label))
            .toEqual(['iii', '†', 'iii', 'iii', 'iv']);
        pages.set('note-4', 3);
        const references = resolveNoteReferences(snapshot, pages);
        expect(references.get(6)).toMatchObject({ noteId: 'note-4', label: 'iii' });
        expect(snapshot.body!.customRanges![4].startIndex).toBe(6);
    });

    it('extends the symbol cycle and supports enclosed and full-width numbers', () => {
        expect([1, 6, 7, 13].map((number) => formatNoteNumber(number, 'chicago'))).toEqual(['*', '¶', '**', '***']);
        expect([1, 20, 21, 35, 36, 50].map((number) => formatNoteNumber(number, 'decimalEnclosedCircle')))
            .toEqual(['①', '⑳', '㉑', '㉟', '㊱', '㊿']);
        expect(formatNoteNumber(108, 'decimalFullWidth')).toBe('１０８');
    });
});
