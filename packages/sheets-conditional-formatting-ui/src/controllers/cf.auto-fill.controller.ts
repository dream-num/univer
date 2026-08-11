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
import { Disposable, getIntersectRange, Inject, Injector, IUniverInstanceService, Rectangle, UniverInstanceType } from '@univerjs/core';
import { AUTO_FILL_APPLY_TYPE, AutoFillTools, IAutoFillService } from '@univerjs/sheets';
import {
    ConditionalFormattingRangeTransformService,
    ConditionalFormattingRuleModel,
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
        @Inject(ConditionalFormattingRangeTransformService) private _conditionalFormattingRangeTransformService: ConditionalFormattingRangeTransformService
    ) {
        super();

        this._initAutoFill();
    }

    // eslint-disable-next-line max-lines-per-function
    private _initAutoFill() {
        const noopReturnFunc = () => ({ redos: [], undos: [] });

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

            const virtualization = virtualizeDiscreteRanges([sourceRange, targetRange]);
            const [vSourceRange, vTargetRange] = virtualization.ranges;
            const repeats = AutoFillTools.getAutoFillRepeatRange(vSourceRange, vTargetRange);
            const targetRanges = repeats.flatMap((repeat) => virtualization.mapRange(Rectangle.getPositionRange(repeat.relativeRange, {
                startRow: repeat.repeatStartCell.row,
                endRow: repeat.repeatStartCell.row,
                startColumn: repeat.repeatStartCell.col,
                endColumn: repeat.repeatStartCell.col,
            })));
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
                    return intersected ? [Rectangle.getRelativeRange(intersected, vSourceRange)] : [];
                });
                const additions = repeats.flatMap((repeat) => sourceRanges.flatMap((range) => {
                    const copiedRange = getIntersectRange(range, repeat.relativeRange);
                    return copiedRange
                        ? virtualization.mapRange(Rectangle.getPositionRange(copiedRange, {
                            startRow: repeat.repeatStartCell.row,
                            endRow: repeat.repeatStartCell.row,
                            startColumn: repeat.repeatStartCell.col,
                            endColumn: repeat.repeatStartCell.col,
                        }))
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
