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

import type { IDisposable, IRange, Nullable } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import type { ISheetNote } from '../models/sheets-note.model';
import { Disposable, ICommandService, Inject, sequenceExecuteAsync } from '@univerjs/core';
import { handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests, RefRangeService, SheetsSelectionsService } from '@univerjs/sheets';
import { RemoveNoteMutation, UpdateNoteMutation, UpdateNotePositionMutation } from '../commands/mutations/note.mutation';
import { SheetsNoteModel } from '../models/sheets-note.model';

export class SheetsNoteRefRangeController extends Disposable {
    private _disposableMap = new Map<string, IDisposable>();
    private _watcherMap = new Map<string, IDisposable>();

    constructor(
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(SheetsNoteModel) private readonly _sheetsNoteModel: SheetsNoteModel,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initData();
        this._initRefRange();
    }

    private _getIdWithUnitId(unitId: string, subUnitId: string, row: number, col: number) {
        return `${unitId}-${subUnitId}-${row}-${col}`;
    }

    private _handleRangeChange = (unitId: string, subUnitId: string, note: ISheetNote, row: number, col: number, resultRange: Nullable<IRange>, silent?: boolean) => {
        if (!resultRange) {
            return {
                redos: [{
                    id: RemoveNoteMutation.id,
                    params: {
                        unitId,
                        sheetId: subUnitId,
                        row,
                        col,
                    },
                }],
                undos: [{
                    id: UpdateNoteMutation.id,
                    params: {
                        unitId,
                        sheetId: subUnitId,
                        row,
                        col,
                        note,
                    },
                }],
            };
        }

        return {
            redos: [{
                id: UpdateNotePositionMutation.id,
                params: {
                    unitId,
                    sheetId: subUnitId,
                    row,
                    col,
                    newPosition: {
                        row: resultRange.startRow,
                        col: resultRange.startColumn,
                    },
                    silent,
                },
            }],
            undos: [{
                id: UpdateNotePositionMutation.id,
                params: {
                    unitId,
                    sheetId: subUnitId,
                    row: resultRange.startRow,
                    col: resultRange.startColumn,
                    newPosition: {
                        row,
                        col,
                    },
                    note,
                    silent,
                },
            }],
        };
    };

    private _register(unitId: string, subUnitId: string, note: ISheetNote, row: number, col: number) {
        const oldRange: IRange = {
            startColumn: col,
            endColumn: col,
            startRow: row,
            endRow: row,
        };

        this._disposableMap.set(
            this._getIdWithUnitId(unitId, subUnitId, row, col),
            this._refRangeService.registerRefRange(oldRange, (commandInfo: EffectRefRangeParams) => {
                const resultRanges = handleCommonRangeChangeWithEffectRefCommandsSkipNoInterests(oldRange, commandInfo, { selectionManagerService: this._selectionManagerService });
                const resultRange = Array.isArray(resultRanges) ? resultRanges[0] : resultRanges;
                if (resultRange && resultRange.startColumn === oldRange.startColumn && resultRange.startRow === oldRange.startRow) {
                    return {
                        undos: [],
                        redos: [],
                    };
                }
                const res = this._handleRangeChange(unitId, subUnitId, note, row, col, resultRange, false);
                return res;
            }, unitId, subUnitId)
        );
    }

    private _watch(unitId: string, subUnitId: string, note: ISheetNote, row: number, col: number) {
        const oldRange: IRange = {
            startColumn: col,
            endColumn: col,
            startRow: row,
            endRow: row,
        };

        this._watcherMap.set(
            this._getIdWithUnitId(unitId, subUnitId, row, col),
            this._refRangeService.watchRange(unitId, subUnitId, oldRange, (before, after) => {
                const { redos } = this._handleRangeChange(unitId, subUnitId, note, before.startRow, before.startColumn, after, true);
                sequenceExecuteAsync(redos, this._commandService, { onlyLocal: true });
            }, true)
        );
    }

    private _unwatch(unitId: string, subUnitId: string, row: number, col: number) {
        const id = this._getIdWithUnitId(unitId, subUnitId, row, col);
        this._watcherMap.get(id)?.dispose();
        this._watcherMap.delete(id);
    }

    private _unregister(unitId: string, subUnitId: string, row: number, col: number) {
        const id = this._getIdWithUnitId(unitId, subUnitId, row, col);
        this._disposableMap.get(id)?.dispose();
        this._disposableMap.delete(id);
    }

    private _initData() {
        const unitNotes = this._sheetsNoteModel.getNotes();
        for (const [unitId, unitNote] of unitNotes) {
            for (const [sheetId, matrix] of unitNote) {
                matrix.forValue((row: number, col: number, value: ISheetNote) => {
                    if (value) {
                        this._register(unitId, sheetId, value, row, col);
                        this._watch(unitId, sheetId, value, row, col);
                    }
                    return true;
                });
            }
        }
    }

    private _initRefRange() {
        this.disposeWithMe(
            this._sheetsNoteModel.change$.subscribe((option) => {
                switch (option.type) {
                    case 'update': {
                        const { unitId, sheetId, row, col, note } = option;
                        const id = this._getIdWithUnitId(unitId, sheetId, row, col);
                        if (note) {
                            if (!this._disposableMap.has(id)) {
                                this._register(unitId, sheetId, note, row, col);
                                this._watch(unitId, sheetId, note, row, col);
                            }
                        } else {
                            this._unregister(unitId, sheetId, row, col);
                            this._unwatch(unitId, sheetId, row, col);
                        }
                        break;
                    }
                    case 'ref': {
                        const { unitId, sheetId, row, col, newPosition, note, silent } = option;
                        this._unregister(unitId, sheetId, row, col);

                        if (!silent) {
                            this._unwatch(unitId, sheetId, row, col);
                            this._watch(unitId, sheetId, note, newPosition.row, newPosition.col);
                        }

                        this._register(unitId, sheetId, note, newPosition.row, newPosition.col);
                        break;
                    }
                }
            })
        );
    }
}
