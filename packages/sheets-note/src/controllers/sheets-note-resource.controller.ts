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

import type { ISheetNote } from '../models/sheets-note.model';
import { Disposable, Inject, IResourceManagerService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { PLUGIN_NAME } from '../const';
import { SheetsNoteModel } from '../models/sheets-note.model';

interface INoteData {
    [sheetId: string]: {
        [row: number]: {
            [col: number]: ISheetNote;
        };
    };
}

export class SheetsNoteResourceController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsNoteModel) private readonly _sheetsNoteModel: SheetsNoteModel
    ) {
        super();
        this._initSnapshot();
    }

    private _initSnapshot() {
        const toJson = (unitId: string) => {
            const unitMap = this._sheetsNoteModel.getUnitNotes(unitId);
            if (!unitMap) {
                return '';
            }

            const result: INoteData = {};
            unitMap.forEach((matrix, sheetId) => {
                const sheetNotes: INoteData[string] = {};
                matrix.forValue((row, col, note) => {
                    if (!sheetNotes[row]) {
                        sheetNotes[row] = {};
                    }
                    sheetNotes[row][col] = note;
                });
                if (Object.keys(sheetNotes).length > 0) {
                    result[sheetId] = sheetNotes;
                }
            });

            return JSON.stringify(result);
        };

        const parseJson = (json: string): INoteData => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };

        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<INoteData>({
                pluginName: PLUGIN_NAME,
                businesses: [UniverInstanceType.UNIVER_SHEET],
                toJson: (unitId) => toJson(unitId),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    // Clear all notes for this unit
                    this._sheetsNoteModel.deleteUnitNotes(unitId);
                },
                onLoad: (unitId, value) => {
                    // Load notes from the parsed data
                    Object.entries(value).forEach(([sheetId, sheetNotes]) => {
                        Object.entries(sheetNotes).forEach(([row, colNotes]) => {
                            Object.entries(colNotes).forEach(([col, note]) => {
                                this._sheetsNoteModel.updateNote(
                                    unitId,
                                    sheetId,
                                    Number(row),
                                    Number(col),
                                    note
                                );
                            });
                        });
                    });
                },
            })
        );
    }
}
