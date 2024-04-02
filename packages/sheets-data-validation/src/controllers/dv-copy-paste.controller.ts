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

import type { IRange, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import { Disposable, LifecycleStages, ObjectMatrix, OnLifecycle, Range, Rectangle } from '@univerjs/core';
import { COPY_TYPE, getRepeatRange, ISheetClipboardService, PREDEFINED_HOOK_NAME } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { DataValidationModel } from '@univerjs/data-validation';
import { SPECIAL_PASTE_FORMULA } from '@univerjs/sheets-formula';
import type { SheetDataValidationManager } from '../models/sheet-data-validation-manager';
import { DATA_VALIDATION_PLUGIN_NAME } from '../common/const';
import { getDataValidationDiffMutations } from '../commands/commands/data-validation.command';

@OnLifecycle(LifecycleStages.Ready, DataValidationCopyPasteController)
export class DataValidationCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        matrix: ObjectMatrix<string>;
        unitId: string;
        subUnitId: string;
    }>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        @Inject(DataValidationModel) private _dataValidationModel: DataValidationModel
    ) {
        super();
        this._initCopyPaste();
    }

    private _initCopyPaste() {
        this._sheetClipboardService.addClipboardHook({
            id: DATA_VALIDATION_PLUGIN_NAME,
            onBeforeCopy: (unitId, subUnitId, range) => this._collect(unitId, subUnitId, range),
            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                const { range: copyRange } = pasteFrom || {};
                const { range: pastedRange, unitId, subUnitId } = pasteTo;
                return this._generateMutations(pastedRange, { copyType, pasteType, copyRange, unitId, subUnitId });
            },
        });
    }

    private _collect(unitId: string, subUnitId: string, range: IRange) {
        const matrix = new ObjectMatrix<string>();
        this._copyInfo = {
            unitId,
            subUnitId,
            matrix,
        };

        const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;

        Range.foreach(range, (row, col) => {
            const ruleId = manager.getRuleIdByLocation(row, col);

            const relativeRange = Rectangle.getRelativeRange(
                {
                    startRow: row,
                    endRow: row,
                    startColumn: col,
                    endColumn: col,
                },
                range
            );
            matrix.setValue(relativeRange.startRow, relativeRange.startColumn, ruleId ?? '');
        });
    }

    private _generateMutations(
        pastedRange: IRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IRange;
            pasteType: string;
            unitId: string;
            subUnitId: string;
        }
    ) {
        if (!this._copyInfo) {
            return { redos: [], undos: [] };
        }
        if (copyInfo.copyType === COPY_TYPE.CUT) {
            this._copyInfo = null;
            return { redos: [], undos: [] };
        }
        if (!this._copyInfo || !this._copyInfo.matrix.getSizeOf() || !copyInfo.copyRange) {
            return { redos: [], undos: [] };
        }

        if (
            [
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
                SPECIAL_PASTE_FORMULA,
            ].includes(
                copyInfo.pasteType
            )
        ) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId } = this._copyInfo;

        if (copyInfo.unitId !== unitId || subUnitId !== copyInfo.subUnitId) {
            const originManager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
            const manager = this._dataValidationModel.ensureManager(copyInfo.unitId, copyInfo.subUnitId) as SheetDataValidationManager;
            const ruleMatrix = manager.getRuleObjectMatrix().clone();
            const repeatRange = getRepeatRange(copyInfo.copyRange, pastedRange, true);
            const additionRules: Map<string, ISheetDataValidationRule> = new Map();

            repeatRange.forEach(({ startRange }) => {
                this._copyInfo?.matrix.forValue((row, col, ruleId) => {
                    const range = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            endRow: row,
                            startColumn: col,
                            endColumn: col,
                        },
                        startRange
                    );
                    const transformedRuleId = `${subUnitId}-${ruleId}`;
                    const oldRule = originManager.getRuleById(ruleId);

                    if (!manager.getRuleById(transformedRuleId) && oldRule) {
                        additionRules.set(transformedRuleId, { ...oldRule, uid: transformedRuleId });
                    }

                    ruleMatrix.setValue(range.startRow, range.startColumn, transformedRuleId);
                });
            });

            const { redoMutations, undoMutations } = getDataValidationDiffMutations(
                copyInfo.unitId,
                copyInfo.subUnitId,
                ruleMatrix.diffWithAddition(manager.getDataValidations(), additionRules.values())
            );

            return {
                redos: redoMutations,
                undos: undoMutations,
            };
        } else {
            const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
            const ruleMatrix = manager.getRuleObjectMatrix().clone();
            const repeatRange = getRepeatRange(copyInfo.copyRange, pastedRange, true);

            repeatRange.forEach(({ startRange }) => {
                this._copyInfo?.matrix.forValue((row, col, ruleId) => {
                    const range = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            endRow: row,
                            startColumn: col,
                            endColumn: col,
                        },
                        startRange
                    );
                    ruleMatrix.setValue(range.startRow, range.startColumn, ruleId);
                });
            });

            const { redoMutations, undoMutations } = getDataValidationDiffMutations(
                unitId,
                subUnitId,
                ruleMatrix.diff(manager.getDataValidations())
            );

            return {
                redos: redoMutations,
                undos: undoMutations,
            };
        }
    }
}
