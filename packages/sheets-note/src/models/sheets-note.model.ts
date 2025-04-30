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
import { Disposable, ObjectMatrix } from '@univerjs/core';
import { filter, map, Subject } from 'rxjs';

export interface ISheetNote {
    width: number;
    height: number;
    note: string;
    show?: boolean;
}

export type ISheetNoteChange = {
    unitId: string;
    sheetId: string;
    row: number;
    col: number;
    silent?: boolean;
} & ({
    type: 'update';
    note: Nullable<ISheetNote>;
    oldNote: Nullable<ISheetNote>;
} | {
    type: 'ref';
    newPosition: {
        row: number;
        col: number;
    };
    note: ISheetNote;
});

export class SheetsNoteModel extends Disposable {
    private _noteMatrix = new Map<string, Map<string, ObjectMatrix<ISheetNote>>>();
    private readonly _change$ = new Subject<ISheetNoteChange>();
    readonly change$ = this._change$.asObservable();

    private _ensureNoteMatrix(unitId: string, sheetId: string): ObjectMatrix<ISheetNote> {
        let unitMap = this._noteMatrix.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._noteMatrix.set(unitId, unitMap);
        }

        let matrix = unitMap.get(sheetId);
        if (!matrix) {
            matrix = new ObjectMatrix<ISheetNote>();
            unitMap.set(sheetId, matrix);
        }

        return matrix;
    }

    getSheetShowNotes$(unitId: string, sheetId: string) {
        return this._change$.pipe(
            filter(({ unitId: u, sheetId: s }) => u === unitId && s === sheetId),
            map(() => {
                const matrix = this._ensureNoteMatrix(unitId, sheetId);
                const notes: { loc: ISheetLocationBase; note: ISheetNote }[] = [];

                matrix.forValue((row, col, note) => {
                    if (note.show) {
                        notes.push({ loc: { row, col, unitId, subUnitId: sheetId }, note });
                    }
                });

                return notes;
            })
        );
    }

    getCellNoteChange$(unitId: string, sheetId: string, row: number, col: number) {
        return this._change$.pipe(
            filter(({ unitId: u, sheetId: s, row: r, col: c }) => u === unitId && s === sheetId && r === row && c === col),
            map(({ note }) => note)
        );
    }

    updateNote(unitId: string, sheetId: string, row: number, col: number, note: ISheetNote, silent?: boolean): void {
        const matrix = this._ensureNoteMatrix(unitId, sheetId);
        const oldNote = matrix.getValue(row, col);
        matrix.setValue(row, col, note);
        this._change$.next({ unitId, sheetId, row, col, type: 'update', note, oldNote, silent });
    }

    removeNote(unitId: string, sheetId: string, row: number, col: number, silent?: boolean): void {
        const matrix = this._ensureNoteMatrix(unitId, sheetId);
        const oldNote = matrix.getValue(row, col);
        matrix.realDeleteValue(row, col);
        this._change$.next({ unitId, sheetId, row, col, type: 'update', note: null, oldNote, silent });
    }

    toggleNotePopup(unitId: string, sheetId: string, row: number, col: number, silent?: boolean): void {
        const matrix = this._ensureNoteMatrix(unitId, sheetId);
        const note = matrix.getValue(row, col);
        if (note) {
            note.show = !note.show;
            const newNote = { ...note, show: note.show };
            matrix.setValue(row, col, newNote);
            this._change$.next({
                unitId,
                sheetId,
                row,
                col,
                type: 'update',
                note: newNote,
                oldNote: note,
                silent,
            });
        }
    }

    updateNotePosition(unitId: string, sheetId: string, row: number, col: number, newRow: number, newCol: number, silent?: boolean): void {
        const matrix = this._ensureNoteMatrix(unitId, sheetId);
        const note = matrix.getValue(row, col);
        if (note) {
            matrix.realDeleteValue(row, col);
            matrix.setValue(newRow, newCol, note);
            this._change$.next({
                unitId,
                sheetId,
                row,
                col,
                type: 'ref',
                newPosition: { row: newRow, col: newCol },
                note,
                silent,
            });
        }
    }

    getNote(unitId: string, sheetId: string, row: number, col: number): Nullable<ISheetNote> {
        const matrix = this._ensureNoteMatrix(unitId, sheetId);
        return matrix.getValue(row, col);
    }

    getUnitNotes(unitId: string): Map<string, ObjectMatrix<ISheetNote>> | undefined {
        return this._noteMatrix.get(unitId);
    }

    getSheetNotes(unitId: string, sheetId: string): ObjectMatrix<ISheetNote> | undefined {
        const unitMap = this._noteMatrix.get(unitId);
        if (!unitMap) {
            return undefined;
        }
        return unitMap.get(sheetId);
    }

    getNotes() {
        return this._noteMatrix;
    }

    deleteUnitNotes(unitId: string): void {
        this._noteMatrix.delete(unitId);
    }
}
