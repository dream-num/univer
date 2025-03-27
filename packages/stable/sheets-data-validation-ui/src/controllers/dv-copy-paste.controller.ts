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

import type { IRange, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import type { IDiscreteRange, IPasteHookValueType } from '@univerjs/sheets-ui';
import { Disposable, Inject, Injector, ObjectMatrix, queryObjectMatrix, Rectangle } from '@univerjs/core';
import { rangeToDiscreteRange } from '@univerjs/sheets';
import { DATA_VALIDATION_PLUGIN_NAME, getDataValidationDiffMutations, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { COPY_TYPE, getRepeatRange, ISheetClipboardService, PREDEFINED_HOOK_NAME, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

export class DataValidationCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        matrix: ObjectMatrix<string>;
        unitId: string;
        subUnitId: string;
    }>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        @Inject(SheetDataValidationModel) private _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(Injector) private _injector: Injector
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

        const discreteRange = this._injector.invoke((accessor) => {
            return rangeToDiscreteRange(range, accessor, unitId, subUnitId);
        });
        if (!discreteRange) {
            return;
        }
        const { rows, cols } = discreteRange;
        rows.forEach((row, rowIndex) => {
            cols.forEach((col, colIndex) => {
                const ruleId = this._sheetDataValidationModel.getRuleIdByLocation(unitId, subUnitId, row, col);
                matrix.setValue(rowIndex, colIndex, ruleId ?? '');
            });
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _generateMutations(
        pastedRange: IDiscreteRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IDiscreteRange;
            pasteType: IPasteHookValueType;
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

        const specialPastes: IPasteHookValueType[] = [
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA,
        ];

        if (specialPastes.includes(copyInfo.pasteType)) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId } = this._copyInfo;

        if (copyInfo.unitId !== unitId || subUnitId !== copyInfo.subUnitId) {
            const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(copyInfo.unitId, copyInfo.subUnitId).clone();
            const additionMatrix = new ObjectMatrix();
            const addRules = new Set<string>();

            const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyInfo.copyRange, pastedRange]);

            const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);
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
                    const oldRule = this._sheetDataValidationModel.getRuleById(unitId, subUnitId, ruleId);

                    if (!this._sheetDataValidationModel.getRuleById(copyInfo.unitId, copyInfo.subUnitId, transformedRuleId) && oldRule) {
                        additionRules.set(transformedRuleId, { ...oldRule, uid: transformedRuleId });
                    }

                    const { row: startRow, col: startColumn } = mapFunc(range.startRow, range.startColumn);
                    addRules.add(transformedRuleId);
                    additionMatrix.setValue(startRow, startColumn, transformedRuleId);
                });
            });

            const additions = Array.from(addRules).map((id) => ({ id, ranges: queryObjectMatrix(additionMatrix, (value) => value === id) }));
            ruleMatrix.addRangeRules(additions);

            const { redoMutations, undoMutations } = getDataValidationDiffMutations(
                copyInfo.unitId,
                copyInfo.subUnitId,
                ruleMatrix.diffWithAddition(this._sheetDataValidationModel.getRules(copyInfo.unitId, copyInfo.subUnitId), additionRules.values()),
                this._injector,
                'patched',
                false
            );

            return {
                redos: redoMutations,
                undos: undoMutations,
            };
        } else {
            const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();
            const additionMatrix = new ObjectMatrix();
            const additionRules = new Set<string>();

            const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyInfo.copyRange, pastedRange]);

            const repeatRange = getRepeatRange(vCopyRange, vPastedRange, true);

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
                    const { row: startRow, col: startColumn } = mapFunc(range.startRow, range.startColumn);
                    additionMatrix.setValue(startRow, startColumn, ruleId);
                    additionRules.add(ruleId);
                });
            });

            const additions = Array.from(additionRules).map((id) => ({ id, ranges: queryObjectMatrix(additionMatrix, (value) => value === id) }));
            ruleMatrix.addRangeRules(additions);
            const { redoMutations, undoMutations } = getDataValidationDiffMutations(
                unitId,
                subUnitId,
                ruleMatrix.diff(this._sheetDataValidationModel.getRules(unitId, subUnitId)),
                this._injector,
                'patched',
                false
            );

            return {
                redos: redoMutations,
                undos: undoMutations,
            };
        }
    }
}
