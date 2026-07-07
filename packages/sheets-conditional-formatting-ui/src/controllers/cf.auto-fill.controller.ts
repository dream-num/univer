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
import type { IDiscreteRange, ISheetAutoFillHook } from '@univerjs/sheets';
import type { IDeleteConditionalRuleMutationParams, ISetConditionalRuleMutationParams } from '@univerjs/sheets-conditional-formatting';
import { Disposable, Inject, Injector, IUniverInstanceService, Range, Rectangle, UniverInstanceType } from '@univerjs/core';
import { AUTO_FILL_APPLY_TYPE, AutoFillTools, IAutoFillService } from '@univerjs/sheets';
import {
    ConditionalFormattingRangeTransformService,
    ConditionalFormattingRuleModel,
    ConditionalFormattingViewModel,
    DeleteConditionalRuleMutation,
    DeleteConditionalRuleMutationUndoFactory,
    SetConditionalRuleMutation,
    setConditionalRuleMutationUndoFactory,
    SHEET_CONDITIONAL_FORMATTING_PLUGIN,
} from '@univerjs/sheets-conditional-formatting';
import { virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

interface IRangeDelta {
    add: IRange[];
    remove: IRange[];
}

export class ConditionalFormattingAutoFillController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IAutoFillService) private _autoFillService: IAutoFillService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel,
        @Inject(ConditionalFormattingRangeTransformService) private _conditionalFormattingRangeTransformService: ConditionalFormattingRangeTransformService
    ) {
        super();

        this._initAutoFill();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });

        const loopFunc = (
            sourceStartCell: { row: number; col: number },
            targetStartCell: { row: number; col: number },
            relativeRange: IRange,
            rangeMap: Map<string, IRange[]>,
            rangeDeltaMap: Map<string, IRangeDelta>,
            mapFunc: (row: number, col: number) => ({ row: number; col: number })
        ) => {
            const unitId = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
            const subUnitId = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
            if (!unitId || !subUnitId) {
                return;
            }

            const getRangeDelta = (cfId: string) => {
                let rangeDelta = rangeDeltaMap.get(cfId);
                if (!rangeDelta) {
                    rangeDelta = { add: [], remove: [] };
                    rangeDeltaMap.set(cfId, rangeDelta);
                }
                return rangeDelta;
            };
            const ensureRuleRanges = (cfId: string) => {
                if (rangeMap.has(cfId)) {
                    return true;
                }

                const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
                if (!rule) {
                    return false;
                }

                rangeMap.set(cfId, rule.ranges);
                return true;
            };
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
                        if (!ensureRuleRanges(cf.cfId)) {
                            return;
                        }
                        getRangeDelta(cf.cfId).remove.push({
                            startRow: targetRow,
                            endRow: targetRow,
                            startColumn: targetCol,
                            endColumn: targetCol,
                        });
                    });
                }

                if (sourceCellCf) {
                    sourceCellCf.forEach((cf) => {
                        if (!ensureRuleRanges(cf.cfId)) {
                            return;
                        }
                        getRangeDelta(cf.cfId).add.push({
                            startRow: targetRow,
                            endRow: targetRow,
                            startColumn: targetCol,
                            endColumn: targetCol,
                        });
                    });
                }
            });
        };

        const generalApplyFunc = (sourceRange: IDiscreteRange, targetRange: IDiscreteRange) => {
            const unitId = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
            const subUnitId = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet()?.getSheetId();
            const rangeMap: Map<string, IRange[]> = new Map();
            const rangeDeltaMap: Map<string, IRangeDelta> = new Map();

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

            const repeats = AutoFillTools.getAutoFillRepeatRange(vSourceRange, vTargetRange);
            repeats.forEach((repeat) => {
                loopFunc(sourceStartCell, repeat.repeatStartCell, repeat.relativeRange, rangeMap, rangeDeltaMap, mapFunc);
            });
            rangeDeltaMap.forEach((rangeDelta, cfId) => {
                const ranges = rangeMap.get(cfId);
                if (!ranges) {
                    return;
                }

                rangeMap.set(cfId, this._conditionalFormattingRangeTransformService.applyRangeDelta(
                    ranges,
                    rangeDelta.remove,
                    rangeDelta.add
                ));
            });
            rangeMap.forEach((ranges, cfId) => {
                const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
                if (!rule) {
                    return;
                }
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
                if (applyType === AUTO_FILL_APPLY_TYPE.COPY || applyType === AUTO_FILL_APPLY_TYPE.ONLY_FORMAT || applyType === AUTO_FILL_APPLY_TYPE.SERIES) {
                    const { source, target } = location;
                    return generalApplyFunc(source, target);
                }

                return noopReturnFunc();
            },
        };

        this.disposeWithMe(this._autoFillService.addHook(hook));
    }
}
