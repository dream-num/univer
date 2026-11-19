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

import { Injector } from '@univerjs/core';
import { filter, firstValueFrom, take, toArray } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ISheetNote } from '../sheets-note.model';
import { SheetsNoteModel } from '../sheets-note.model';

describe('SheetsNoteModel', () => {
    let injector: Injector;
    let model: SheetsNoteModel;

    const unitId = 'unit-1';
    const subUnitId = 'sheet-1';

    beforeEach(() => {
        injector = new Injector([
            [SheetsNoteModel],
        ]);
        model = injector.get(SheetsNoteModel);
    });

    afterEach(() => {
        injector.dispose();
    });

    it('updates a note and emits change events', async () => {
        const noteInput: ISheetNote = {
            id: 'note-1',
            row: 0,
            col: 0,
            width: 160,
            height: 72,
            note: 'hello',
            show: false,
        };

        const firstChangePromise = firstValueFrom(model.change$.pipe(take(1)));
        model.updateNote(unitId, subUnitId, 0, 0, noteInput);
        const firstChange = await firstChangePromise;

        expect(firstChange.type).toBe('update');
        expect(firstChange.oldNote == null).toBe(true);
        expect(firstChange.newNote?.note).toBe('hello');

        const secondChangePromise = firstValueFrom(model.change$.pipe(take(1)));
        model.updateNote(unitId, subUnitId, 0, 0, { ...noteInput, note: 'updated' });
        const secondChange = await secondChangePromise;

        expect(secondChange.type).toBe('update');
        expect(secondChange.oldNote?.note).toBe('hello');
        expect(secondChange.newNote?.note).toBe('updated');

        const stored = model.getNote(unitId, subUnitId, { row: 0, col: 0 });
        expect(stored?.note).toBe('updated');
    });

    it('toggles note popup state and exposes show notes stream', async () => {
        const noteInput: ISheetNote = {
            id: 'note-2',
            row: 2,
            col: 3,
            width: 160,
            height: 72,
            note: 'note',
            show: false,
        };

        model.updateNote(unitId, subUnitId, 2, 3, noteInput);

        const showNotesPromise = firstValueFrom(
            model.getSheetShowNotes$(unitId, subUnitId).pipe(
                take(2),
                toArray()
            )
        );

        model.toggleNotePopup(unitId, subUnitId, { row: 2, col: 3 });
        model.toggleNotePopup(unitId, subUnitId, { row: 2, col: 3 });

        const [afterShow, afterHide] = await showNotesPromise;
        expect(afterShow).toHaveLength(1);
        expect(afterShow[0].note.show).toBe(true);
        expect(afterShow[0].loc.row).toBe(2);
        expect(afterShow[0].loc.col).toBe(3);

        expect(afterHide).toHaveLength(0);
    });

    it('updates note position and emits ref change', async () => {
        const noteInput: ISheetNote = {
            id: 'note-3',
            row: 1,
            col: 1,
            width: 160,
            height: 72,
            note: 'note',
        };

        model.updateNote(unitId, subUnitId, 1, 1, noteInput);

        const refChangePromise = firstValueFrom(
            model.change$.pipe(
                filter((c) => c.type === 'ref'),
                take(1)
            )
        );

        model.updateNotePosition(unitId, subUnitId, { row: 1, col: 1, newRow: 4, newCol: 5 });
        const refChange = await refChangePromise;

        expect(refChange.oldNote?.row).toBe(1);
        expect(refChange.oldNote?.col).toBe(1);
        expect(refChange.newNote.row).toBe(4);
        expect(refChange.newNote.col).toBe(5);

        expect(model.getNote(unitId, subUnitId, { row: 1, col: 1 })).toBeUndefined();
        expect(model.getNote(unitId, subUnitId, { row: 4, col: 5 })?.id).toBe('note-3');
    });

    it('removes notes and does nothing if note is missing', async () => {
        const noteInput: ISheetNote = {
            id: 'note-4',
            row: 6,
            col: 7,
            width: 160,
            height: 72,
            note: 'note',
        };
        model.updateNote(unitId, subUnitId, 6, 7, noteInput);

        const removeChangePromise = firstValueFrom(model.change$.pipe(take(1)));
        model.removeNote(unitId, subUnitId, { row: 6, col: 7 });
        const removeChange = await removeChangePromise;

        expect(removeChange.type).toBe('update');
        expect(removeChange.oldNote?.id).toBe('note-4');
        expect(removeChange.newNote).toBeNull();
        expect(model.getNote(unitId, subUnitId, { row: 6, col: 7 })).toBeUndefined();

        let emitted = false;
        const subscription = model.change$.subscribe(() => {
            emitted = true;
        });

        model.removeNote(unitId, subUnitId, { row: 99, col: 99 });
        expect(emitted).toBe(false);
        subscription.unsubscribe();
    });

    it('does not rescan unrelated notes on repeated position reads', () => {
        let rowReads = 0;
        for (let row = 0; row < 1000; row++) {
            model.updateNote(unitId, subUnitId, row, 2, { id: `note-${row}`, note: `note ${row}` });
            const note = model.getNote(unitId, subUnitId, { noteId: `note-${row}` })!;
            Object.defineProperty(note, 'row', {
                enumerable: true,
                get: () => {
                    rowReads++;
                    return row;
                },
            });
        }

        expect(model.getNote(unitId, subUnitId, { row: 999, col: 2 })?.id).toBe('note-999');
        rowReads = 0;
        for (let row = 1000; row < 1020; row++) {
            expect(model.getNote(unitId, subUnitId, { row, col: 2 })).toBeUndefined();
        }
        expect(model.getNote(unitId, subUnitId, { row: 999, col: 2 })?.id).toBe('note-999');
        expect(rowReads).toBeLessThanOrEqual(1);
    });

    it('refreshes indexed notes before synchronous change subscribers run', () => {
        model.updateNote(unitId, subUnitId, 0, 0, { id: 'first', note: 'before', show: false });
        expect(model.getNote(unitId, subUnitId, { row: 0, col: 0 })?.note).toBe('before');
        const seen: string[] = [];
        const subscription = model.change$.subscribe(({ newNote }) => {
            if (newNote) {
                expect(model.getNote(unitId, subUnitId, { row: newNote.row, col: newNote.col })).toBe(newNote);
                seen.push(newNote.note);
            } else {
                expect(model.getNote(unitId, subUnitId, { row: 1, col: 2 })).toBeUndefined();
                seen.push('removed');
            }
        });

        model.updateNote(unitId, subUnitId, 0, 0, { id: 'first', note: 'after', show: false });
        model.toggleNotePopup(unitId, subUnitId, { row: 0, col: 0 });
        expect(model.getNote(unitId, subUnitId, { row: 0, col: 0 })?.show).toBe(true);
        model.updateNotePosition(unitId, subUnitId, { noteId: 'first', newRow: 1, newCol: 2 });
        expect(model.getNote(unitId, subUnitId, { row: 0, col: 0 })).toBeUndefined();
        model.removeNote(unitId, subUnitId, { row: 1, col: 2 });
        expect(seen).toEqual(['after', 'after', 'after', 'removed']);
        subscription.unsubscribe();
    });

    it('preserves first inserted note precedence when positions collide', () => {
        model.updateNote(unitId, subUnitId, 0, 0, { id: 'first', note: 'first' });
        model.updateNote(unitId, subUnitId, 1, 1, { id: 'second', note: 'second' });
        expect(model.getNote(unitId, subUnitId, { row: 0, col: 0 })?.id).toBe('first');

        model.updateNotePosition(unitId, subUnitId, { noteId: 'second', newRow: 0, newCol: 0 });
        expect(model.getNote(unitId, subUnitId, { row: 0, col: 0 })?.id).toBe('first');
        model.updateNotePosition(unitId, subUnitId, { noteId: 'first', newRow: 2, newCol: 2 });
        expect(model.getNote(unitId, subUnitId, { row: 0, col: 0 })?.id).toBe('second');
        model.updateNote(unitId, subUnitId, 0, 0, { id: 'first', note: 'first replaced' });
        expect(model.getNote(unitId, subUnitId, { row: 2, col: 2 })).toBeUndefined();
        expect(model.getNote(unitId, subUnitId, { row: 0, col: 0 })?.id).toBe('first');
        model.removeNote(unitId, subUnitId, { noteId: 'first' });
        expect(model.getNote(unitId, subUnitId, { row: 0, col: 0 })?.id).toBe('second');
    });

    it('matches insertion-order lookup throughout interleaved note mutations', () => {
        for (let step = 0; step < 120; step++) {
            const row = step % 5;
            const col = Math.floor(step / 5) % 4;
            const noteId = `note-${step % 13}`;
            switch (step % 6) {
                case 0:
                    model.updateNote(unitId, subUnitId, row, col, { id: noteId, note: `note ${step}` });
                    break;
                case 1:
                    model.updateNote(unitId, subUnitId, row, col, { note: `new ${step}` });
                    break;
                case 2:
                    model.updateNotePosition(unitId, subUnitId, { noteId, newRow: row, newCol: col });
                    break;
                case 3:
                    model.toggleNotePopup(unitId, subUnitId, { row, col });
                    break;
                case 4:
                    model.removeNote(unitId, subUnitId, { noteId });
                    break;
                case 5:
                    model.removeNote(unitId, subUnitId, { row, col });
                    break;
            }

            const notes = Array.from(model.getSheetNotes(unitId, subUnitId)?.values() ?? []);
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 4; c++) {
                    expect(model.getNote(unitId, subUnitId, { row: r, col: c })).toBe(
                        notes.find((note) => note.row === r && note.col === c)
                    );
                }
            }
        }
    });

    it('isolates indexes across sheets and releases unit notes before reloading', () => {
        for (const [unit, sheet, id] of [[unitId, subUnitId, 'first'], [unitId, 'other-sheet', 'second'], ['other-unit', subUnitId, 'third']]) {
            model.updateNote(unit, sheet, 1, 2, { id, note: id });
            expect(model.getNote(unit, sheet, { row: 1, col: 2 })?.id).toBe(id);
        }
        model.deleteUnitNotes(unitId);
        expect(model.getUnitNotes(unitId)).toBeUndefined();
        expect(model.getNote(unitId, subUnitId, { row: 1, col: 2 })).toBeUndefined();
        expect(model.getNote(unitId, 'other-sheet', { row: 1, col: 2 })).toBeUndefined();
        expect(model.getNote('other-unit', subUnitId, { row: 1, col: 2 })?.id).toBe('third');
        model.updateNote(unitId, subUnitId, 1, 2, { id: 'reloaded', note: 'new' });
        expect(model.getNote(unitId, subUnitId, { row: 1, col: 2 })?.id).toBe('reloaded');
    });

    it('clears note references and completes change streams on disposal', () => {
        model.updateNote(unitId, subUnitId, 1, 2, { id: 'note', note: 'note' });
        expect(model.getNote(unitId, subUnitId, { row: 1, col: 2 })?.id).toBe('note');
        let completed = false;
        const subscription = model.change$.subscribe({
            complete: () => {
                completed = true;
            },
        });

        model.dispose();
        expect(model.getNotes().size).toBe(0);
        expect(model.getUnitNotes(unitId)).toBeUndefined();
        expect(completed).toBe(true);
        expect(subscription.closed).toBe(true);
        model.dispose();
    });
});
