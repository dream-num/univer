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

import type { Nullable } from '@univerjs/core';
import type { ISheetLocationBase } from '@univerjs/sheets';
import { Disposable, generateRandomId } from '@univerjs/core';
import { filter, map, Subject } from 'rxjs';

export interface ISheetNote {
    id: string;
    row: number;
    col: number;
    width: number;
    height: number;
    note: string;
    show?: boolean;
}

export type ISheetNoteChange = {
    unitId: string;
    subUnitId: string;
    oldNote: Nullable<ISheetNote>;
    silent?: boolean;
} & ({
    type: 'update';
    newNote: Nullable<ISheetNote>;
} | {
    type: 'ref';
    newNote: ISheetNote;
});

export class SheetsNoteModel extends Disposable {
    private _notesMap: Map<string, Map<string, Map<string, ISheetNote>>> = new Map();
    private readonly _change$ = new Subject<ISheetNoteChange>();
    readonly change$ = this._change$.asObservable();

    private _ensureNotesMap(unitId: string, subUnitId: string): Map<string, ISheetNote> {
        let unitMap = this._notesMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._notesMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    private _getNoteByPosition(unitId: string, subUnitId: string, row: number, col: number): Nullable<ISheetNote> {
        const subUnitMap = this._ensureNotesMap(unitId, subUnitId);

        for (const [_, note] of subUnitMap) {
            if (note.row === row && note.col === col) {
                return note;
            }
        }
    }

    private _getNoteById(unitId: string, subUnitId: string, id: string): Nullable<ISheetNote> {
        const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
        return subUnitMap.get(id);
    }

    private _getNoteByParams(unitId: string, subUnitId: string, params: { noteId?: string; row?: number; col?: number }): Nullable<ISheetNote> {
        const { noteId, row, col } = params;

        if (noteId) {
            return this._getNoteById(unitId, subUnitId, noteId);
        }

        if (row !== undefined && col !== undefined) {
            return this._getNoteByPosition(unitId, subUnitId, row, col);
        }

        return null;
    }

    getSheetShowNotes$(unitId: string, subUnitId: string) {
        return this._change$.pipe(
            filter(({ unitId: u, subUnitId: s }) => u === unitId && s === subUnitId),
            map(() => {
                const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
                const notes: { loc: ISheetLocationBase; note: ISheetNote }[] = [];

                for (const [_, note] of subUnitMap) {
                    if (note.show) {
                        notes.push({ loc: { row: note.row, col: note.col, unitId, subUnitId }, note });
                    }
                }

                return notes;
            })
        );
    }

    getCellNoteChange$(unitId: string, subUnitId: string, row: number, col: number) {
        return this._change$.pipe(
            filter(({ unitId: u, subUnitId: s, oldNote }) => {
                if (u !== unitId || s !== subUnitId || !oldNote) {
                    return false;
                }
                return oldNote.row === row && oldNote.col === col;
            }),
            map((newNote) => newNote)
        );
    }

    updateNote(unitId: string, subUnitId: string, row: number, col: number, note: Partial<ISheetNote>, silent?: boolean): void {
        const oldNote = this._getNoteByParams(unitId, subUnitId, { noteId: note?.id, row, col });
        const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
        const newNote = {
            ...note,
            id: oldNote?.id || note.id || generateRandomId(6),
            row,
            col,
        } as ISheetNote;
        subUnitMap.set(newNote.id, newNote);

        this._change$.next({ unitId, subUnitId, oldNote, type: 'update', newNote, silent });
    }

    removeNote(unitId: string, subUnitId: string, params: { noteId?: string; row?: number; col?: number; silent?: boolean }): void {
        const { noteId, row, col, silent } = params;
        const oldNote = this._getNoteByParams(unitId, subUnitId, { noteId, row, col });

        if (!oldNote) {
            return;
        }

        const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
        subUnitMap.delete(oldNote.id);

        this._change$.next({ unitId, subUnitId, oldNote, type: 'update', newNote: null, silent });
    }

    toggleNotePopup(unitId: string, subUnitId: string, params: { noteId?: string; row?: number; col?: number; silent?: boolean }): void {
        const { noteId, row, col, silent } = params;
        const oldNote = this._getNoteByParams(unitId, subUnitId, { noteId, row, col });

        if (!oldNote) {
            return;
        }

        const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
        const newNote = { ...oldNote, show: !oldNote.show };
        subUnitMap.set(newNote.id, newNote);

        this._change$.next({ unitId, subUnitId, oldNote, type: 'update', newNote, silent });
    }

    updateNotePosition(unitId: string, subUnitId: string, params: { noteId?: string; row?: number; col?: number; newRow: number; newCol: number; silent?: boolean }): void {
        const { noteId, row, col, newRow, newCol, silent } = params;
        const oldNote = this._getNoteByParams(unitId, subUnitId, { noteId, row, col });

        if (!oldNote) {
            return;
        }

        const subUnitMap = this._ensureNotesMap(unitId, subUnitId);
        const newNote = { ...oldNote, row: newRow, col: newCol };
        subUnitMap.set(newNote.id, newNote);

        this._change$.next({ unitId, subUnitId, oldNote, type: 'ref', newNote, silent });
    }

    getNote(unitId: string, subUnitId: string, params: { noteId?: string; row?: number; col?: number }): Nullable<ISheetNote> {
        return this._getNoteByParams(unitId, subUnitId, params);
    }

    getNotes() {
        return this._notesMap;
    }

    getUnitNotes(unitId: string): Map<string, Map<string, ISheetNote>> | undefined {
        return this._notesMap.get(unitId);
    }

    getSheetNotes(unitId: string, subUnitId: string): Map<string, ISheetNote> | undefined {
        const unitMap = this._notesMap.get(unitId);
        if (!unitMap) {
            return undefined;
        }
        return unitMap.get(subUnitId);
    }

    deleteUnitNotes(unitId: string): void {
        this._notesMap.delete(unitId);
    }
}
