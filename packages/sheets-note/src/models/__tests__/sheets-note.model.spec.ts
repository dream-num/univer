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

import type { ISheetNote } from '../sheets-note.model';
import { Injector } from '@univerjs/core';
import { filter, firstValueFrom, take, toArray } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
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
});
