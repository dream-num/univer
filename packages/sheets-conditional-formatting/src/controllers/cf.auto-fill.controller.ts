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

import type { IMutationInfo, IRange } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle, Range, Rectangle } from '@univerjs/core';
import { createTopMatrixFromMatrix, findAllRectangle } from '@univerjs/sheets';

import type { ISheetAutoFillHook } from '@univerjs/sheets-ui';
import { APPLY_TYPE, getAutoFillRepeatRange, IAutoFillService } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';
import { SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory } from '../commands/mutations/set-conditional-rule.mutation';
import type { ISetConditionalRuleMutationParams } from '../commands/mutations/set-conditional-rule.mutation';
import { ConditionalFormattingViewModel } from '../models/conditional-formatting-view-model';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';

import { SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '../base/const';

@OnLifecycle(LifecycleStages.Rendered, ConditionalFormattingAutoFillController)
export class ConditionalFormattingAutoFillController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IAutoFillService) private _autoFillService: IAutoFillService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,

        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel

    ) {
        super();

        this._initAutoFill();
    }

    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });
        const loopFunc = (
            sourceStartCell: { row: number; col: number },
            targetStartCell: { row: number; col: number },
            relativeRange: IRange,
            matrixMap: Map<string, ObjectMatrix<1>>
        ) => {
            const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
            const subUnitId = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
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
                const targetPositionRange = Rectangle.getPositionRange(
                    {
                        startRow: row,
                        startColumn: col,
                        endColumn: col,
                        endRow: row,
                    },
                    targetRange
                );
                const sourceCellCf = this._conditionalFormattingViewModel.getCellCf(
                    unitId,
                    subUnitId,
                    sourcePositionRange.startRow,
                    sourcePositionRange.startColumn
                );

                const targetCellCf = this._conditionalFormattingViewModel.getCellCf(
                    unitId,
                    subUnitId,
                    targetPositionRange.startRow,
                    targetPositionRange.startColumn
                );
                if (targetCellCf) {
                    targetCellCf.cfList.forEach((cf) => {
                        let matrix = matrixMap.get(cf.cfId);
                        if (!matrixMap.get(cf.cfId)) {
                            const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cf.cfId);
                            if (!rule) {
                                return;
                            }
                            matrix = new ObjectMatrix();
                            rule.ranges.forEach((range) => {
                                Range.foreach(range, (row, col) => {
                                    matrix!.setValue(row, col, 1);
                                });
                            });
                            matrixMap.set(cf.cfId, matrix);
                        }
                        matrix!.realDeleteValue(targetPositionRange.startRow, targetPositionRange.startColumn);
                    });
                }

                if (sourceCellCf) {
                    sourceCellCf.cfList.forEach((cf) => {
                        let matrix = matrixMap.get(cf.cfId);
                        if (!matrixMap.get(cf.cfId)) {
                            const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cf.cfId);
                            if (!rule) {
                                return;
                            }
                            matrix = new ObjectMatrix();
                            rule.ranges.forEach((range) => {
                                Range.foreach(range, (row, col) => {
                                    matrix!.setValue(row, col, 1);
                                });
                            });
                            matrixMap.set(cf.cfId, matrix);
                        }
                        matrix!.setValue(targetPositionRange.startRow, targetPositionRange.startColumn, 1);
                    });
                }
            });
        };
        const generalApplyFunc = (sourceRange: IRange, targetRange: IRange) => {
            const unitId = this._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
            const subUnitId = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
            const matrixMap: Map<string, ObjectMatrix<1>> = new Map();

            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];

            const sourceStartCell = {
                row: sourceRange.startRow,
                col: sourceRange.startColumn,
            };
            const repeats = getAutoFillRepeatRange(sourceRange, targetRange);
            repeats.forEach((repeat) => {
                loopFunc(sourceStartCell, repeat.repeatStartCell, repeat.relativeRange, matrixMap);
            });
            matrixMap.forEach((item, cfId) => {
                const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
                if (!rule) {
                    return;
                }
                const ranges = findAllRectangle(createTopMatrixFromMatrix(item));
                const params: ISetConditionalRuleMutationParams = {
                    unitId, subUnitId, rule: { ...rule, ranges },
                };
                redos.push({ id: SetConditionalRuleMutation.id, params });
                undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
            });
            return {
                undos,
                redos,
            };
        };
        const hook: ISheetAutoFillHook = {
            id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
            onFillData: (location, direction, applyType) => {
                if (
                    applyType === APPLY_TYPE.COPY ||
                    applyType === APPLY_TYPE.ONLY_FORMAT ||
                    applyType === APPLY_TYPE.SERIES
                ) {
                    const { source, target } = location;
                    return generalApplyFunc(source, target);
                }
                return noopReturnFunc();
            },
        };
        this.disposeWithMe(this._autoFillService.addHook(hook));
    }
}
