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

import type { IMutationInfo, IRange, Workbook } from '@univerjs/core';
import type { IDeleteConditionalRuleMutationParams, ISetConditionalRuleMutationParams } from '@univerjs/sheets-conditional-formatting';
import type { IDiscreteRange, ISheetAutoFillHook } from '@univerjs/sheets-ui';
import { Disposable, Inject, Injector, IUniverInstanceService, ObjectMatrix, Range, Rectangle, UniverInstanceType } from '@univerjs/core';
import { createTopMatrixFromMatrix, findAllRectangle } from '@univerjs/sheets';
import { ConditionalFormattingRuleModel, ConditionalFormattingViewModel, DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory, SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory, SHEET_CONDITIONAL_FORMATTING_PLUGIN } from '@univerjs/sheets-conditional-formatting';
import { APPLY_TYPE, getAutoFillRepeatRange, IAutoFillService, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

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

    // eslint-disable-next-line max-lines-per-function
    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });
        // eslint-disable-next-line max-lines-per-function
        const loopFunc = (
            sourceStartCell: { row: number; col: number },
            targetStartCell: { row: number; col: number },
            relativeRange: IRange,
            matrixMap: Map<string, ObjectMatrix<1>>,
            mapFunc: (row: number, col: number) => ({ row: number; col: number })
        ) => {
            const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
            const subUnitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
            if (!unitId || !subUnitId) {
                return;
            }

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
                const { row: sourceRow, col: sourceCol } = mapFunc(sourcePositionRange.startRow, sourcePositionRange.startColumn);
                const sourceCellCf = this._conditionalFormattingViewModel.getCellCfs(
                    unitId,
                    subUnitId,
                    sourceRow,
                    sourceCol
                );
                const { row: targetRow, col: targetCol } = mapFunc(targetPositionRange.startRow, targetPositionRange.startColumn);
                const targetCellCf = this._conditionalFormattingViewModel.getCellCfs(
                    unitId,
                    subUnitId,
                    targetRow,
                    targetCol
                );
                if (targetCellCf) {
                    targetCellCf.forEach((cf) => {
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
                        matrix!.realDeleteValue(targetRow, targetCol);
                    });
                }

                if (sourceCellCf) {
                    sourceCellCf.forEach((cf) => {
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
                        matrix!.setValue(targetRow, targetCol, 1);
                    });
                }
            });
        };

        const generalApplyFunc = (sourceRange: IDiscreteRange, targetRange: IDiscreteRange) => {
            const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
            const subUnitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet()?.getSheetId();
            const matrixMap: Map<string, ObjectMatrix<1>> = new Map();

            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];
            if (!unitId || !subUnitId) {
                return noopReturnFunc();
            }

            const virtualRange = virtualizeDiscreteRanges([sourceRange, targetRange]);
            const [vSourceRange, vTargetRange] = virtualRange.ranges;
            const { mapFunc } = virtualRange;

            const sourceStartCell = {
                row: vSourceRange.startRow,
                col: vSourceRange.startColumn,
            };

            const repeats = getAutoFillRepeatRange(vSourceRange, vTargetRange);
            repeats.forEach((repeat) => {
                loopFunc(sourceStartCell, repeat.repeatStartCell, repeat.relativeRange, matrixMap, mapFunc);
            });
            matrixMap.forEach((item, cfId) => {
                const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
                if (!rule) {
                    return;
                }
                const ranges = findAllRectangle(createTopMatrixFromMatrix(item));
                if (ranges.length) {
                    const params: ISetConditionalRuleMutationParams = {
                        unitId,
                        subUnitId,
                        rule: { ...rule, ranges },
                    };
                    redos.push({ id: SetConditionalRuleMutation.id, params });
                    undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
                } else {
                    const params: IDeleteConditionalRuleMutationParams = {
                        unitId,
                        subUnitId,
                        cfId: rule.cfId,
                    };
                    redos.push({ id: DeleteConditionalRuleMutation.id, params });
                    undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
                }
            });
            return {
                undos,
                redos,
            };
        };

        const hook: ISheetAutoFillHook = {
            id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
            onFillData: (location, direction, applyType) => {
                if (applyType === APPLY_TYPE.COPY || applyType === APPLY_TYPE.ONLY_FORMAT || applyType === APPLY_TYPE.SERIES) {
                    const { source, target } = location;
                    return generalApplyFunc(source, target);
                }

                return noopReturnFunc();
            },
        };

        this.disposeWithMe(this._autoFillService.addHook(hook));
    }
}
