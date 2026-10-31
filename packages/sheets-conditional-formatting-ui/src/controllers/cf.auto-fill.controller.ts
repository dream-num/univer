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

import type { IMutationInfo, IRange } from '@univerjs/core';
import type { IAutoFillLocation, ISheetAutoFillHook } from '@univerjs/sheets';
import type {
    IAddConditionalRuleMutationParams,
    IDeleteConditionalRuleMutationParams,
    ISetConditionalRuleMutationParams,
} from '@univerjs/sheets-conditional-formatting';
import {
    Disposable,
    getIntersectRange,
    Inject,
    Injector,
    Rectangle,
} from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { AUTO_FILL_APPLY_TYPE, AutoFillTools, IAutoFillService } from '@univerjs/sheets';
import {
    AddConditionalRuleMutation,
    AddConditionalRuleMutationUndoFactory,
    CFRuleType,
    CFSubRuleType,
    ConditionalFormattingRangeTransformService,
    ConditionalFormattingRuleModel,
    createCfId,
    DeleteConditionalRuleMutation,
    DeleteConditionalRuleMutationUndoFactory,
    MoveConditionalRuleMutation,
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
        @Inject(IAutoFillService) private _autoFillService: IAutoFillService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(ConditionalFormattingRangeTransformService) private _conditionalFormattingRangeTransformService: ConditionalFormattingRangeTransformService
    ) {
        super();

        this._initAutoFill();
    }

    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });

        const generalApplyFunc = (location: IAutoFillLocation) => {
            const { unitId, subUnitId, source: sourceRange, target: targetRange } = location;
            const rangeMap: Map<string, IRange[]> = new Map();
            const rangeDeltaMap: Map<string, IRangeDelta> = new Map();

            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];
            const virtualization = virtualizeDiscreteRanges([sourceRange, targetRange]);
            const [vSourceRange, vTargetRange] = virtualization.ranges;
            const repeats = AutoFillTools.getAutoFillRepeatRange(vSourceRange, vTargetRange);
            const targetRanges = repeats.flatMap((repeat) => virtualization.mapRange(Rectangle.moveOffset(
                repeat.relativeRange,
                repeat.repeatStartCell.col,
                repeat.repeatStartCell.row
            )));
            const getRangeDelta = (cfId: string) => {
                let rangeDelta = rangeDeltaMap.get(cfId);
                if (!rangeDelta) {
                    rangeDelta = { add: [], remove: [] };
                    rangeDeltaMap.set(cfId, rangeDelta);
                }
                return rangeDelta;
            };
            const rules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId) ?? [];

            rules.forEach((rule) => {
                if (Rectangle.doAnyRangesIntersect(rule.ranges, targetRanges)) {
                    rangeMap.set(rule.cfId, rule.ranges);
                    getRangeDelta(rule.cfId).remove.push(...targetRanges);
                }

                const sourceRanges = rule.ranges.flatMap((range) => {
                    const projected = virtualization.projectRange(range);
                    const intersected = projected && getIntersectRange(projected, vSourceRange);
                    return intersected ? [Rectangle.moveOffset(intersected, -vSourceRange.startColumn, -vSourceRange.startRow)] : [];
                });
                const additions = repeats.flatMap((repeat) => sourceRanges.flatMap((range) => {
                    const copiedRange = getIntersectRange(range, repeat.relativeRange);
                    return copiedRange
                        ? virtualization.mapRange(Rectangle.moveOffset(
                            copiedRange,
                            repeat.repeatStartCell.col,
                            repeat.repeatStartCell.row
                        ))
                        : [];
                }));
                if (additions.length) {
                    rangeMap.set(rule.cfId, rule.ranges);
                    getRangeDelta(rule.cfId).add.push(...additions);
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
                const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
                if (!rule) {
                    return;
                }
                if (ranges.length) {
                    const nextRule = { ...rule, ranges };
                    if (rule.rule.type === CFRuleType.highlightCell && rule.rule.subType === CFSubRuleType.formula) {
                        const topLeft = (items: IRange[]) => items.reduce((first, item) =>
                            item.startRow < first.startRow || (item.startRow === first.startRow && item.startColumn < first.startColumn) ? item : first);
                        const previous = topLeft(rule.ranges);
                        const current = topLeft(ranges);
                        const rowOffset = current.startRow - previous.startRow;
                        const columnOffset = current.startColumn - previous.startColumn;
                        if (rowOffset || columnOffset) {
                            const value = this._injector.get(LexerTreeBuilder).moveFormulaRefOffset(rule.rule.value, columnOffset, rowOffset);
                            const delta = rangeDeltaMap.get(cfId);
                            if (value.includes('#REF!') && delta?.add.length) {
                                const retainedRanges = this._conditionalFormattingRangeTransformService.subtractRanges(rule.ranges, delta.remove);
                                if (retainedRanges.length) {
                                    const retainedParams: ISetConditionalRuleMutationParams = {
                                        unitId,
                                        subUnitId,
                                        rule: { ...rule, ranges: retainedRanges },
                                    };
                                    redos.push({ id: SetConditionalRuleMutation.id, params: retainedParams });
                                    const clonedParams: IAddConditionalRuleMutationParams = {
                                        unitId,
                                        subUnitId,
                                        rule: {
                                            ...rule,
                                            cfId: createCfId(),
                                            ranges: Rectangle.mergeRanges(delta.add),
                                            rule: { ...rule.rule, value },
                                        },
                                    };
                                    redos.push({ id: AddConditionalRuleMutation.id, params: clonedParams });
                                    redos.push({
                                        id: MoveConditionalRuleMutation.id,
                                        params: {
                                            unitId,
                                            subUnitId,
                                            start: { id: clonedParams.rule.cfId, type: 'self' },
                                            end: { id: rule.cfId, type: 'after' },
                                        },
                                    });
                                    undos.push(AddConditionalRuleMutationUndoFactory(this._injector, clonedParams));
                                    undos.push(...setConditionalRuleMutationUndoFactory(this._injector, retainedParams));
                                    return;
                                }
                            }
                            nextRule.rule = {
                                ...rule.rule,
                                value,
                            };
                        }
                    }
                    const params: ISetConditionalRuleMutationParams = {
                        unitId,
                        subUnitId,
                        rule: nextRule,
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
                    return generalApplyFunc(location);
                }

                return noopReturnFunc();
            },
        };

        this.disposeWithMe(this._autoFillService.addHook(hook));
    }
}
