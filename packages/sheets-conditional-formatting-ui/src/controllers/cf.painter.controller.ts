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

import type { IMutationInfo, IRange, Nullable, Workbook } from '@univerjs/core';
import type {
    IAddConditionalRuleMutationParams,
    IConditionFormattingRule,
    IDeleteConditionalRuleMutationParams,
    ISetConditionalRuleMutationParams,
} from '@univerjs/sheets-conditional-formatting';
import type { IFormatPainterHook } from '@univerjs/sheets-ui';
import { Disposable, getIntersectRange, Inject, Injector, IUniverInstanceService, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import {
    AddConditionalRuleMutation,
    AddConditionalRuleMutationUndoFactory,
    ConditionalFormattingRangeTransformService,
    ConditionalFormattingRuleModel,
    DeleteConditionalRuleMutation,
    DeleteConditionalRuleMutationUndoFactory,
    SetConditionalRuleMutation,
    setConditionalRuleMutationUndoFactory,
    SHEET_CONDITIONAL_FORMATTING_PLUGIN,
} from '@univerjs/sheets-conditional-formatting';
import { FormatPainterStatus, IFormatPainterService } from '@univerjs/sheets-ui';

interface IRangeDelta {
    add: IRange[];
    remove: IRange[];
}

const repeatByRange = (sourceRange: IRange, targetRange: IRange) => {
    const getRowLength = (range: IRange) => range.endRow - range.startRow + 1;
    const getColLength = (range: IRange) => range.endColumn - range.startColumn + 1;
    const rowMod = getRowLength(targetRange) % getRowLength(sourceRange);
    const colMod = getColLength(targetRange) % getColLength(sourceRange);
    const repeatRow = Math.floor(getRowLength(targetRange) / getRowLength(sourceRange));
    const repeatCol = Math.floor(getColLength(targetRange) / getColLength(sourceRange));
    const repeatList: Array<{ startRange: IRange; repeatRelativeRange: IRange }> = [];
    const repeatRelativeRange: IRange = {
        startRow: 0,
        endRow: getRowLength(sourceRange) - 1,
        startColumn: 0,
        endColumn: getColLength(sourceRange) - 1,
    };
    // If the target area is a single cell, copy the entire source area.
    if (getRowLength(targetRange) === 1 && getColLength(targetRange) === 1) {
        const startRange: IRange = {
            startRow: targetRange.startRow,
            endRow: targetRange.startRow,
            startColumn: targetRange.startColumn,
            endColumn: targetRange.startColumn,
        };
        repeatList.push({ repeatRelativeRange, startRange });
        return repeatList;
    }

    for (let countRow = 0; countRow < (repeatRow + (rowMod ? 0.1 : 0)); countRow++) {
        for (let countCol = 0; countCol < (repeatCol + (colMod ? 0.1 : 0)); countCol++) {
            const row = getRowLength(sourceRange) * (countRow);
            const col = getColLength(sourceRange) * (countCol);
            const startRange: IRange = {
                startRow: row + targetRange.startRow,
                endRow: row + targetRange.startRow,
                startColumn: col + targetRange.startColumn,
                endColumn: col + targetRange.startColumn,
            };
            let _repeatRelativeRange = repeatRelativeRange;
            if (countRow === repeatRow && rowMod) {
                _repeatRelativeRange = { ..._repeatRelativeRange };
                _repeatRelativeRange.endRow = _repeatRelativeRange.endRow - (getRowLength(sourceRange) - rowMod);
            }
            if (countCol === repeatCol && colMod) {
                _repeatRelativeRange = { ..._repeatRelativeRange };
                _repeatRelativeRange.endColumn = _repeatRelativeRange.endColumn - (getColLength(sourceRange) - colMod);
            }
            repeatList.push({ repeatRelativeRange: _repeatRelativeRange, startRange });
        }
    }
    return repeatList;
};

export class ConditionalFormattingPainterController extends Disposable {
    private _painterConfig: Nullable<{ unitId: string; subUnitId: string; range: IRange }> = null;
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IFormatPainterService) private _formatPainterService: IFormatPainterService,
        @Inject(SheetsSelectionsService) private _sheetsSelectionsService: SheetsSelectionsService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(ConditionalFormattingRangeTransformService) private _conditionalFormattingRangeTransformService: ConditionalFormattingRangeTransformService

    ) {
        super();

        this._initFormattingPainter();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initFormattingPainter() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });

        // eslint-disable-next-line max-lines-per-function
        const generalApplyFunc = (targetUnitId: string, targetSubUnitId: string, targetRange: IRange) => {
            const { range: sourceRange, unitId: sourceUnitId, subUnitId: sourceSubUnitId } = this._painterConfig!;
            const isSkipSheet = targetUnitId !== sourceUnitId || sourceSubUnitId !== targetSubUnitId;
            const rangeMap: Map<string, IRange[]> = new Map();
            const rangeDeltaMap: Map<string, IRangeDelta> = new Map();

            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];
            if (!targetUnitId || !targetSubUnitId || !sourceUnitId || !sourceSubUnitId) {
                return noopReturnFunc();
            }
            const repeats = repeatByRange(sourceRange, targetRange);
            const targetRanges = repeats.map((repeat) => Rectangle.getPositionRange(repeat.repeatRelativeRange, repeat.startRange));
            const getRangeDelta = (cfId: string) => {
                let rangeDelta = rangeDeltaMap.get(cfId);
                if (!rangeDelta) {
                    rangeDelta = { add: [], remove: [] };
                    rangeDeltaMap.set(cfId, rangeDelta);
                }
                return rangeDelta;
            };

            const targetRuleList = this._conditionalFormattingRuleModel.getSubunitRules(targetUnitId, targetSubUnitId) ?? [];
            const waitAddRule = new Map<string, IConditionFormattingRule>();
            targetRuleList.forEach((rule) => {
                if (Rectangle.doAnyRangesIntersect(rule.ranges, targetRanges)) {
                    rangeMap.set(rule.cfId, rule.ranges);
                    getRangeDelta(rule.cfId).remove.push(...targetRanges);
                }
            });

            const sourceRuleList = this._conditionalFormattingRuleModel.getSubunitRules(sourceUnitId, sourceSubUnitId) ?? [];
            const sourceRules = isSkipSheet ? [...sourceRuleList].reverse() : sourceRuleList;
            sourceRules.forEach((rule) => {
                const sourceRanges = rule.ranges.flatMap((range) => {
                    const intersected = getIntersectRange(range, sourceRange);
                    return intersected ? [Rectangle.getRelativeRange(intersected, sourceRange)] : [];
                });
                const additions = repeats.flatMap((repeat) => sourceRanges.flatMap((range) => {
                    const copiedRange = getIntersectRange(range, repeat.repeatRelativeRange);
                    return copiedRange ? [Rectangle.getPositionRange(copiedRange, repeat.startRange)] : [];
                }));
                if (additions.length) {
                    let targetCfId = rule.cfId;
                    if (isSkipSheet) {
                        targetCfId = this._conditionalFormattingRuleModel.createCfId(targetUnitId, targetSubUnitId);
                        waitAddRule.set(targetCfId, {
                            ...Tools.deepClone(rule),
                            cfId: targetCfId,
                            ranges: [],
                        });
                        rangeMap.set(targetCfId, []);
                    }
                    if (!rangeMap.has(targetCfId)) {
                        rangeMap.set(targetCfId, rule.ranges);
                    }
                    getRangeDelta(targetCfId).add.push(...additions);
                }
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
                if (!isSkipSheet) {
                    const rule = this._conditionalFormattingRuleModel.getRule(sourceUnitId, sourceSubUnitId, cfId);
                    if (!rule) {
                        return;
                    }
                    if (ranges.length) {
                        const params: ISetConditionalRuleMutationParams = {
                            unitId: sourceUnitId,
                            subUnitId: sourceSubUnitId,
                            rule: { ...rule, ranges },
                        };
                        redos.push({ id: SetConditionalRuleMutation.id, params });
                        undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
                    } else {
                        const params: IDeleteConditionalRuleMutationParams = {
                            unitId: sourceUnitId,
                            subUnitId: sourceSubUnitId,
                            cfId: rule.cfId,
                        };
                        redos.push({ id: DeleteConditionalRuleMutation.id, params });
                        undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
                    }
                } else {
                    const waitAdd = waitAddRule.get(cfId);
                    if (waitAdd) {
                        if (ranges.length) {
                            const params: IAddConditionalRuleMutationParams = {
                                unitId: targetUnitId,
                                subUnitId: targetSubUnitId,
                                rule: { ...waitAdd, ranges },
                            };
                            redos.push({ id: AddConditionalRuleMutation.id, params });
                            undos.push(AddConditionalRuleMutationUndoFactory(this._injector, params));
                        }
                        return;
                    }
                    const rule = this._conditionalFormattingRuleModel.getRule(targetUnitId, targetSubUnitId, cfId);
                    if (rule) {
                        if (ranges.length) {
                            const params: ISetConditionalRuleMutationParams = {
                                unitId: targetUnitId,
                                subUnitId: targetSubUnitId,
                                rule: { ...rule, ranges },
                            };
                            redos.push({ id: SetConditionalRuleMutation.id, params });
                            undos.push(...setConditionalRuleMutationUndoFactory(this._injector, params));
                        } else {
                            const params: IDeleteConditionalRuleMutationParams = {
                                unitId: targetUnitId,
                                subUnitId: targetSubUnitId,
                                cfId: rule.cfId,
                            };
                            redos.push({ id: DeleteConditionalRuleMutation.id, params });
                            undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, params));
                        }
                    }
                }
            });
            return {
                undos,
                redos,
            };
        };

        const hook: IFormatPainterHook = {
            id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
            onStatusChange: (status) => {
                switch (status) {
                    case FormatPainterStatus.INFINITE:
                    case FormatPainterStatus.ONCE: {
                        const unitId = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
                        const subUnitId = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet()?.getSheetId();
                        const selection = this._sheetsSelectionsService.getCurrentLastSelection();
                        const range = selection?.range;
                        if (unitId && subUnitId && range) {
                            this._painterConfig = { unitId, subUnitId, range };
                        }
                        break;
                    }
                    case FormatPainterStatus.OFF: {
                        this._painterConfig = null;
                        break;
                    }
                }
            },
            onApply: (unitId, subUnitId, targetRange) => {
                if (this._painterConfig) {
                    return generalApplyFunc(unitId, subUnitId, targetRange);
                }
                return {
                    redos: [],
                    undos: [],
                };
            },
        };

        this._formatPainterService.addHook(hook);
    }
}
