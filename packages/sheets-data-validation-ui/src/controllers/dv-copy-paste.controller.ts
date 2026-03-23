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
import type { ICopyPastePayload, IPasteHookValueType, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import { Disposable, Inject, Injector, IUniverInstanceService, ObjectMatrix, queryObjectMatrix, Rectangle } from '@univerjs/core';
import { getSheetCommandTarget, rangeToDiscreteRange } from '@univerjs/sheets';
import { DATA_VALIDATION_PLUGIN_NAME, getDataValidationDiffMutations, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { COPY_TYPE, getRepeatRange, ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

interface ICopyInfoType {
    matrix: ObjectMatrix<string>;
    unitId: string;
    subUnitId: string;
}

const specialPastes: IPasteHookValueType[] = [
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA,
];

export class DataValidationCopyPasteController extends Disposable {
    private _copyInfo: Nullable<ICopyInfoType>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        @Inject(SheetDataValidationModel) private _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initCopyPaste();
    }

    private _initCopyPaste() {
        this._sheetClipboardService.addClipboardHook({
            id: DATA_VALIDATION_PLUGIN_NAME,
            onBeforeCopy: (unitId, subUnitId, range) => this._collect(unitId, subUnitId, range),
            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                if (!pasteFrom || !this._copyInfo || specialPastes.includes(payload.pasteType)) {
                    return { redos: [], undos: [] };
                }
                return this._generateMutations(pasteFrom, pasteTo, payload);
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
    private _generateMutations(pasteFrom: ISheetDiscreteRangeLocation, pasteTo: ISheetDiscreteRangeLocation, payload: ICopyPastePayload) {
        const { unitId: copyUnitId, subUnitId: copySubUnitId, range: copyRange } = pasteFrom;
        const { unitId: pastedUnitId, subUnitId: pastedSubUnitId, range: pastedRange } = pasteTo;
        const { copyType = COPY_TYPE.COPY } = payload;

        const target = getSheetCommandTarget(this._univerInstanceService, { unitId: pastedUnitId, subUnitId: pastedSubUnitId });
        if (!target) {
            return { redos: [], undos: [] };
        }

        // If it is cut and paste in the same worksheet, do not need to handle the data validation rules, because the move range had handle the ref range of data validation rules, to see dv-formula-ref-range.controller.ts.
        if (copyType === COPY_TYPE.CUT && pastedUnitId === copyUnitId && pastedSubUnitId === copySubUnitId) {
            this._copyInfo = null;
            return { redos: [], undos: [] };
        }

        if (pastedUnitId !== copyUnitId || pastedSubUnitId !== copySubUnitId) {
            const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(pastedUnitId, pastedSubUnitId).clone();
            const additionMatrix = new ObjectMatrix();
            const addRules = new Set<string>();

            const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pastedRange]);

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
                    const transformedRuleId = `${copySubUnitId}-${ruleId}`;
                    const oldRule = this._sheetDataValidationModel.getRuleById(copyUnitId, copySubUnitId, ruleId);

                    if (!this._sheetDataValidationModel.getRuleById(pastedUnitId, pastedSubUnitId, transformedRuleId) && oldRule) {
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
                pastedUnitId,
                pastedSubUnitId,
                ruleMatrix.diffWithAddition(this._sheetDataValidationModel.getRules(pastedUnitId, pastedSubUnitId), additionRules.values()),
                this._injector,
                'patched',
                false
            );

            if (copyType === COPY_TYPE.CUT) {
                // Delete rules in copy range
                const copySheetRuleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(copyUnitId, copySubUnitId).clone();
                const deleteRangeStartCell = mapFunc(vCopyRange.startRow, vCopyRange.startColumn);
                const deleteRangeEndCell = mapFunc(vCopyRange.endRow, vCopyRange.endColumn);
                copySheetRuleMatrix.addRangeRules([
                    {
                        id: '',
                        ranges: [{
                            startRow: deleteRangeStartCell.row,
                            endRow: deleteRangeEndCell.row,
                            startColumn: deleteRangeStartCell.col,
                            endColumn: deleteRangeEndCell.col,
                        }],
                    },
                ]);
                const { redoMutations: cutRedos, undoMutations: cutUndos } = getDataValidationDiffMutations(
                    copyUnitId,
                    copySubUnitId,
                    copySheetRuleMatrix.diff(this._sheetDataValidationModel.getRules(copyUnitId, copySubUnitId)),
                    this._injector,
                    'patched',
                    false
                );
                redoMutations.push(...cutRedos);
                undoMutations.push(...cutUndos);
            }

            return {
                redos: redoMutations,
                undos: undoMutations,
            };
        } else {
            const ruleMatrix = this._sheetDataValidationModel.getRuleObjectMatrix(copyUnitId, copySubUnitId).clone();
            const additionMatrix = new ObjectMatrix();
            const additionRules = new Set<string>();

            const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pastedRange]);

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
                pastedUnitId,
                pastedSubUnitId,
                ruleMatrix.diff(this._sheetDataValidationModel.getRules(copyUnitId, copySubUnitId)),
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
