/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IRange, Nullable } from '@univerjs/core';
import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    Range,
    Rectangle,
} from '@univerjs/core';
import type { FormatType, IRemoveNumfmtMutationParams, ISetCellsNumfmt } from '@univerjs/sheets';
import {
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,
    INumfmtService,
    rangeMerge,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    transformCellsToRange,
} from '@univerjs/sheets';
import { COPY_TYPE, getRepeatRange, ISheetClipboardService, PREDEFINED_HOOK_NAME } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';

import { SHEET_NUMFMT_PLUGIN } from '../base/const/PLUGIN_NAME';
import { mergeNumfmtMutations } from '../utils/mutation';

@OnLifecycle(LifecycleStages.Rendered, NumfmtCopyPasteController)
export class NumfmtCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        matrix: ObjectMatrix<{ pattern: string; type: FormatType }>;
        info: {
            unitId: string;
            subUnitId: string;
        };
    }>;

    constructor(
        @Inject(ISheetClipboardService) private _sheetClipboardService: ISheetClipboardService,
        @Inject(Injector) private _injector: Injector,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initClipboardHook();
    }

    private _initClipboardHook() {
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                id: SHEET_NUMFMT_PLUGIN,
                onBeforeCopy: (unitId, subUnitId, range) => this._collectNumfmt(unitId, subUnitId, range),
                onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                    const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                    const { range: copyRange } = pasteFrom || {};
                    const { range: pastedRange } = pasteTo;
                    return this._generateNumfmtMutations(pastedRange, { copyType, pasteType, copyRange });
                },
            })
        );
    }

    private _collectNumfmt(unitId: string, subUnitId: string, range: IRange) {
        const matrix = new ObjectMatrix<{ pattern: string; type: FormatType }>();
        this._copyInfo = {
            matrix,
            info: {
                unitId,
                subUnitId,
            },
        };
        const model = this._numfmtService.getModel(unitId, subUnitId);
        if (!model) {
            return;
        }
        Range.foreach(range, (row, col) => {
            const numfmtValue = this._numfmtService.getValue(unitId, subUnitId, row, col, model);
            if (!numfmtValue) {
                return;
            }
            const relativeRange = Rectangle.getRelativeRange(
                {
                    startRow: row,
                    endRow: row,
                    startColumn: col,
                    endColumn: col,
                },
                range
            );
            matrix.setValue(relativeRange.startRow, relativeRange.startColumn, {
                pattern: numfmtValue.pattern,
                type: numfmtValue.type,
            });
        });
    }

    private _generateNumfmtMutations(
        pastedRange: IRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IRange;
            pasteType: string;
        }
    ) {
        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        if (copyInfo.copyType === COPY_TYPE.CUT) {
            // This do not need to deal with clipping.
            // move range had handle this case .
            // to see numfmt.ref-range.controller.ts
            this._copyInfo = null;
            return { redos: [], undos: [] };
        }
        if (!this._copyInfo || !this._copyInfo.matrix.getSizeOf() || !copyInfo.copyRange) {
            return { redos: [], undos: [] };
        }

        if (
            [PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH, PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE].includes(
                copyInfo.pasteType
            )
        ) {
            return { redos: [], undos: [] };
        }
        const repeatRange = getRepeatRange(copyInfo.copyRange, pastedRange, true);
        const cells: ISetCellsNumfmt = [];
        const removeRedos: IRemoveNumfmtMutationParams = { unitId, subUnitId, ranges: [] };
        const numfmtModel = this._numfmtService.getModel(unitId, subUnitId);
        // Clears the destination area data format
        Range.foreach(pastedRange, (row, col) => {
            if (this._numfmtService.getValue(unitId, subUnitId, row, col, numfmtModel!)) {
                removeRedos.ranges.push({ startRow: row, startColumn: col, endRow: row, endColumn: col });
            }
        });

        // Set up according to the data collected. This will overlap with the cleanup, but that's okay
        repeatRange.forEach((item) => {
            this._copyInfo &&
                this._copyInfo.matrix.forValue((row, col, value) => {
                    const range = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            endRow: row,
                            startColumn: col,
                            endColumn: col,
                        },
                        item.startRange
                    );
                    cells.push({
                        row: range.startRow,
                        col: range.startColumn,
                        pattern: value.pattern,
                        type: value.type,
                    });
                });
        });
        const setRedos = transformCellsToRange(unitId, subUnitId, cells);

        Object.keys(setRedos.values).forEach((key) => {
            const v = setRedos.values[key];
            v.ranges = rangeMerge(v.ranges);
        });

        removeRedos.ranges = rangeMerge(removeRedos.ranges);
        const undos = [
            ...factorySetNumfmtUndoMutation(this._injector, setRedos),
            ...factoryRemoveNumfmtUndoMutation(this._injector, removeRedos),
        ];

        return {
            redos: [
                { id: RemoveNumfmtMutation.id, params: removeRedos },
                { id: SetNumfmtMutation.id, params: setRedos },
            ],
            undos: mergeNumfmtMutations(undos),
        };
    }
}
