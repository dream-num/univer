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

import type { IDisposable, Nullable, Workbook } from '@univerjs/core';
import type { ISheetLocationBase } from '@univerjs/sheets';
import type { ISheetNote } from '@univerjs/sheets-note';
import { Disposable, Inject, IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { SheetsNoteModel } from '@univerjs/sheets-note';
import { CellPopupManagerService } from '@univerjs/sheets-ui';
import { of, switchMap } from 'rxjs';
import { SheetsNotePopupService } from '../services/sheets-note-popup.service';
import { SHEET_NOTE_COMPONENT } from '../views/config';

export class SheetsNoteAttachmentController extends Disposable {
    private _noteMatrix = new ObjectMatrix<IDisposable>();

    constructor(
        @Inject(SheetsNoteModel) private readonly _sheetsNoteModel: SheetsNoteModel,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(CellPopupManagerService) private readonly _cellPopupManagerService: CellPopupManagerService,
        @Inject(SheetsNotePopupService) private readonly _sheetsNotePopupService: SheetsNotePopupService
    ) {
        super();

        this._initNoteChangeListener();
    }

    private _showPopup(unitId: string, sheetId: string, row: number, col: number) {
        this._sheetsNotePopupService.hidePopup(true);

        return this._cellPopupManagerService.showPopup(
            {
                unitId,
                subUnitId: sheetId,
                row,
                col,
            },
            {
                componentKey: SHEET_NOTE_COMPONENT,
                direction: 'horizontal',
                extraProps: {
                    location: {
                        unitId,
                        subUnitId: sheetId,
                        row,
                        col,
                    } as ISheetLocationBase,
                },
                priority: 3,
            }
        );
    }

    private _initSheet(targetUnitId: string, targetSheetId: string) {
        const oldMatrix = this._noteMatrix;
        oldMatrix.forValue((_, __, disposable) => {
            disposable.dispose();
        });

        this._noteMatrix = new ObjectMatrix();
        const handleNote = (unitId: string, sheetId: string, row: number, col: number, note: Nullable<ISheetNote>) => {
            const matrix = this._noteMatrix;
            const disposable = matrix.getValue(row, col);
            if (note?.show) {
                if (!disposable) {
                    const newDisposable = this._showPopup(unitId, sheetId, row, col);
                    if (newDisposable) {
                        matrix.setValue(row, col, newDisposable);
                    }
                }
            } else {
                if (disposable) {
                    disposable.dispose();
                    matrix.realDeleteValue(row, col);
                }
            }
        };

        this._sheetsNoteModel.getSheetNotes(targetUnitId, targetSheetId)?.forValue((row, col, note) => {
            handleNote(targetUnitId, targetSheetId, row, col, note);
        });

        return this._sheetsNoteModel.change$.subscribe((change) => {
            if (change.unitId !== targetUnitId || change.sheetId !== targetSheetId) {
                return;
            }
            switch (change.type) {
                case 'ref': {
                    const { unitId, sheetId, row, col, newPosition, note } = change;
                    const matrix = this._noteMatrix;
                    if (!note.show) return;

                    const disposable = matrix.getValue(row, col);
                    if (disposable) {
                        disposable.dispose();
                        matrix.realDeleteValue(row, col);
                    }
                    const newDisposable = this._showPopup(unitId, sheetId, newPosition.row, newPosition.col);
                    if (newDisposable) {
                        matrix.setValue(newPosition.row, newPosition.col, newDisposable);
                    }
                    break;
                }

                case 'update': {
                    const { unitId, sheetId, row, col, note } = change;
                    handleNote(unitId, sheetId, row, col, note);
                    break;
                }
                default:
                    break;
            }
        });
    }

    private _initNoteChangeListener() {
        this.disposeWithMe(
            this._univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(
                switchMap((workbook) => workbook?.activeSheet$ ?? of(null))
            ).subscribe((sheet) => {
                if (sheet) {
                    const disposable = this._initSheet(sheet.getUnitId(), sheet.getSheetId());
                    return () => {
                        disposable.unsubscribe();
                    };
                } else {
                    this._noteMatrix.forValue((_, __, disposable) => {
                        disposable.dispose();
                    });
                    this._noteMatrix = new ObjectMatrix();
                }
            })
        );
    }
}
