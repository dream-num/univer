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

import type { IRange } from '@univerjs/core';
import type { IAutoFillLocation, ISheetAutoFillHook } from '@univerjs/sheets';
import { DataValidationType, Disposable, getIntersectRange, Inject, Injector, Rectangle } from '@univerjs/core';
import { AUTO_FILL_APPLY_TYPE, AutoFillTools, IAutoFillService } from '@univerjs/sheets';
import { DATA_VALIDATION_PLUGIN_NAME, getDataValidationDiffMutations, SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

// TODO: adjust imports

export class DataValidationAutoFillController extends Disposable {
    constructor(
        @IAutoFillService private readonly _autoFillService: IAutoFillService,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._initAutoFill();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });

        const generalApplyFunc = (location: IAutoFillLocation, applyType: AUTO_FILL_APPLY_TYPE) => {
            const { source: sourceRange, target: targetRange, unitId, subUnitId } = location;
            const ruleMatrixCopy = this._sheetDataValidationModel.getRuleObjectMatrix(unitId, subUnitId).clone();

            const virtualRange = virtualizeDiscreteRanges([sourceRange, targetRange]);
            const [vSourceRange, vTargetRange] = virtualRange.ranges;
            const { mapRange, projectRange } = virtualRange;
            const repeats = AutoFillTools.getAutoFillRepeatRange(vSourceRange, vTargetRange);
            const additionsByRuleId = new Map<string, IRange[]>();
            additionsByRuleId.set('', repeats.flatMap((repeat) => mapRange(Rectangle.getPositionRange(repeat.relativeRange, {
                startRow: repeat.repeatStartCell.row,
                endRow: repeat.repeatStartCell.row,
                startColumn: repeat.repeatStartCell.col,
                endColumn: repeat.repeatStartCell.col,
            }))));

            this._sheetDataValidationModel.getRules(unitId, subUnitId).forEach((rule) => {
                const relativeSourceRanges = rule.ranges.flatMap((range) => {
                    const projected = projectRange(range);
                    const intersected = projected && getIntersectRange(projected, vSourceRange);
                    return intersected
                        ? [Rectangle.getRelativeRange(intersected, vSourceRange)]
                        : [];
                });
                const targetRanges = repeats.flatMap((repeat) => relativeSourceRanges.flatMap((sourceRange) => {
                    const copiedRange = getIntersectRange(sourceRange, repeat.relativeRange);
                    if (!copiedRange) {
                        return [];
                    }
                    return mapRange(Rectangle.getPositionRange(copiedRange, {
                        startRow: repeat.repeatStartCell.row,
                        endRow: repeat.repeatStartCell.row,
                        startColumn: repeat.repeatStartCell.col,
                        endColumn: repeat.repeatStartCell.col,
                    }));
                }));
                if (targetRanges.length) {
                    additionsByRuleId.set(rule.uid, targetRanges);
                }
            });
            const additions = Array.from(additionsByRuleId, ([id, ranges]) => ({
                id,
                ranges: ranges.length > 1 ? Rectangle.mergeRanges(ranges) : ranges,
            }));
            ruleMatrixCopy.addRangeRules(additions);
            const diffs = ruleMatrixCopy.diff(this._sheetDataValidationModel.getRules(unitId, subUnitId));
            const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, diffs, this._injector, 'patched', applyType === AUTO_FILL_APPLY_TYPE.ONLY_FORMAT);
            return {
                undos: undoMutations,
                redos: redoMutations,
            };
        };
        const hook: ISheetAutoFillHook = {
            id: DATA_VALIDATION_PLUGIN_NAME,
            onBeforeFillData: (location) => {
                const { source: sourceRange, unitId, subUnitId } = location;
                const { projectRange } = virtualizeDiscreteRanges([sourceRange]);
                const hasCheckbox = this._sheetDataValidationModel.getRules(unitId, subUnitId).some((rule) => (
                    rule.type === DataValidationType.CHECKBOX && rule.ranges.some((range) => projectRange(range) !== null)
                ));
                if (hasCheckbox) {
                    this._autoFillService.setDisableApplyType(AUTO_FILL_APPLY_TYPE.SERIES, true);
                }
            },
            onFillData: (location, direction, applyType) => {
                if (
                    applyType === AUTO_FILL_APPLY_TYPE.COPY ||
                    applyType === AUTO_FILL_APPLY_TYPE.ONLY_FORMAT ||
                    applyType === AUTO_FILL_APPLY_TYPE.SERIES
                ) {
                    return generalApplyFunc(location, applyType);
                }

                return noopReturnFunc();
            },
            onAfterFillData: () => {
            },
        };
        this.disposeWithMe(this._autoFillService.addHook(hook));
    }
}
