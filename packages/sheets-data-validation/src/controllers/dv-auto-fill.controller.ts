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

import { DataValidationType, Disposable, LifecycleStages, OnLifecycle, Range, Rectangle } from '@univerjs/core';
import type { IAutoFillLocation, ISheetAutoFillHook } from '@univerjs/sheets-ui';
import { APPLY_TYPE, getAutoFillRepeatRange, IAutoFillService, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';
import { Inject } from '@wendellhu/redi';
import { DataValidationModel } from '@univerjs/data-validation';
import { DATA_VALIDATION_PLUGIN_NAME } from '../common/const';
import type { SheetDataValidationManager } from '../models/sheet-data-validation-manager';
import { getDataValidationDiffMutations } from '../commands/commands/data-validation.command';

@OnLifecycle(LifecycleStages.Ready, DataValidationAutoFillController)
export class DataValidationAutoFillController extends Disposable {
    constructor(
        @IAutoFillService private readonly _autoFillService: IAutoFillService,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel
    ) {
        super();
        this._initAutoFill();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });

        const generalApplyFunc = (location: IAutoFillLocation) => {
            const { source: sourceRange, target: targetRange, unitId, subUnitId } = location;
            const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
            const ruleMatrixCopy = manager.getRuleObjectMatrix().clone();

            const virtualRange = virtualizeDiscreteRanges([sourceRange, targetRange]);
            const [vSourceRange, vTargetRange] = virtualRange.ranges;
            const { mapFunc } = virtualRange;
            const sourceStartCell = {
                row: vSourceRange.startRow,
                col: vSourceRange.startColumn,
            };
            const repeats = getAutoFillRepeatRange(vSourceRange, vTargetRange);
            repeats.forEach((repeat) => {
                const targetStartCell = repeat.repeatStartCell;
                const relativeRange = repeat.relativeRange;
                const sourceRange = {
                    startRow: sourceStartCell.row,
                    startColumn: sourceStartCell.col,
                    endColumn: sourceStartCell.col,
                    endRow: sourceStartCell.row,
                };
                const targetRange = {
                    startRow: targetStartCell.row,
                    startColumn: targetStartCell.col,
                    endColumn: targetStartCell.col,
                    endRow: targetStartCell.row,
                };
                Range.foreach(relativeRange, (row, col) => {
                    const sourcePositionRange = Rectangle.getPositionRange(
                        {
                            startRow: row,
                            startColumn: col,
                            endColumn: col,
                            endRow: row,
                        },
                        sourceRange
                    );
                    const { row: sourceRow, col: sourceCol } = mapFunc(sourcePositionRange.startRow, sourcePositionRange.startColumn);
                    const ruleId = manager.getRuleIdByLocation(sourceRow, sourceCol);
                    if (ruleId) {
                        const targetPositionRange = Rectangle.getPositionRange(
                            {
                                startRow: row,
                                startColumn: col,
                                endColumn: col,
                                endRow: row,
                            },
                            targetRange
                        );
                        const { row: targetRow, col: targetCol } = mapFunc(targetPositionRange.startRow, targetPositionRange.startColumn);

                        ruleMatrixCopy.setValue(targetRow, targetCol, ruleId);
                    }
                });
            });

            const diffs = ruleMatrixCopy.diff(manager.getDataValidations());
            const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs);
            return {
                undos: undoMutations,
                redos: redoMutations,
            };
        };
        const disabledDataVallation = [
            DataValidationType.CHECKBOX,
            DataValidationType.LIST,
            DataValidationType.LIST_MULTIPLE,
        ];
        const hook: ISheetAutoFillHook = {
            id: DATA_VALIDATION_PLUGIN_NAME,
            onBeforeFillData: (location) => {
                const { source: sourceRange, unitId, subUnitId } = location;
                const manager = this._dataValidationModel.ensureManager(unitId, subUnitId) as SheetDataValidationManager;
                for (const row of sourceRange.rows) {
                    for (const col of sourceRange.cols) {
                        const dv = manager.getRuleByLocation(row, col);
                        if (dv && disabledDataVallation.indexOf(dv.type) > -1) {
                            this._autoFillService.setDisableApplyType(APPLY_TYPE.SERIES, true);
                            return;
                        }
                    }
                }
            },
            onFillData: (location, direction, applyType) => {
                if (
                    applyType === APPLY_TYPE.COPY ||
                    applyType === APPLY_TYPE.ONLY_FORMAT ||
                    applyType === APPLY_TYPE.SERIES
                ) {
                    return generalApplyFunc(location);
                }

                return noopReturnFunc();
            },
            onAfterFillData: () => {
                this._autoFillService.setDisableApplyType(APPLY_TYPE.SERIES, false);
            },
        };
        this.disposeWithMe(this._autoFillService.addHook(hook));
    }
}
