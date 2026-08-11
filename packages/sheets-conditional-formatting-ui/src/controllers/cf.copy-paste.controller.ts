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

import type { IRange, Nullable } from '@univerjs/core';
import type {
    IAddConditionalRuleMutationParams,
    IConditionFormattingRule,
    IDeleteConditionalRuleMutationParams,
    ISetConditionalRuleMutationParams,
} from '@univerjs/sheets-conditional-formatting';
import type { ICopyPastePayload, IPasteHookValueType, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import {
    Disposable,
    Inject,
    Injector,
    IUniverInstanceService,
    Rectangle,
} from '@univerjs/core';
import {
    getSheetCommandTarget,
    rangeToDiscreteRange,
} from '@univerjs/sheets';
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
import { COPY_TYPE, getRepeatRange, ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

interface ICopyInfoType {
    rules: Map<string, IRange[]>;
    info: {
        unitId: string;
        subUnitId: string;
        cfMap: Record<string, Pick<IConditionFormattingRule, 'rule' | 'stopIfTrue'>>;
    };
}

const specialPastes: IPasteHookValueType[] = [
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
    PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
    PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_BESIDES_BORDER,
];

export class ConditionalFormattingCopyPasteController extends Disposable {
    private _copyInfo: Nullable<ICopyInfoType>;

    constructor(
        @Inject(ISheetClipboardService) private _sheetClipboardService: ISheetClipboardService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(ConditionalFormattingRangeTransformService) private _conditionalFormattingRangeTransformService: ConditionalFormattingRangeTransformService
    ) {
        super();
        this._initClipboardHook();
    }

    private _initClipboardHook() {
        this.disposeWithMe(
            this._sheetClipboardService.addClipboardHook({
                id: SHEET_CONDITIONAL_FORMATTING_PLUGIN,
                onBeforeCopy: (unitId, subUnitId, range) => this._collectConditionalRule(unitId, subUnitId, range),
                onPasteCells: (pasteFrom, pasteTo, _data, payload) => {
                    // If pasteFrom or copyInfo is null, it means the copy from outside of Univer, so not need to handle the conditional formatting, just return empty mutations.
                    if (!pasteFrom || !this._copyInfo || !specialPastes.includes(payload.pasteType)) {
                        return { redos: [], undos: [] };
                    }
                    return this._generateConditionalFormattingMutations(pasteFrom, pasteTo, payload);
                },
            })
        );
    }

    private _collectConditionalRule(unitId: string, subUnitId: string, range: IRange) {
        const rules = new Map<string, IRange[]>();
        const cfMap: Record<string, Pick<IConditionFormattingRule, 'rule' | 'stopIfTrue'>> = {};
        this._copyInfo = {
            rules,
            info: {
                unitId,
                subUnitId,
                cfMap,
            },
        };

        const discreteRange = this._injector.invoke((accessor) => {
            return rangeToDiscreteRange(range, accessor, unitId, subUnitId);
        });
        if (!discreteRange) {
            return;
        }
        const { projectRange } = virtualizeDiscreteRanges([discreteRange]);
        this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId)?.forEach((rule) => {
            const projectedRanges = rule.ranges.flatMap((ruleRange) => {
                const projected = projectRange(ruleRange);
                return projected ? [projected] : [];
            });
            if (projectedRanges.length) {
                rules.set(rule.cfId, projectedRanges.length > 1 ? Rectangle.mergeRanges(projectedRanges) : projectedRanges);
                cfMap[rule.cfId] = { rule: rule.rule, stopIfTrue: rule.stopIfTrue };
            }
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _generateConditionalFormattingMutations(pasteFrom: ISheetDiscreteRangeLocation, pasteTo: ISheetDiscreteRangeLocation, payload: ICopyPastePayload) {
        const copyInfo = this._copyInfo;
        if (!copyInfo) {
            return { redos: [], undos: [] };
        }
        const { unitId: copyUnitId, subUnitId: copySubUnitId, range: copyRange } = pasteFrom;
        const { unitId: pastedUnitId, subUnitId: pastedSubUnitId, range: pastedRange } = pasteTo;
        const { copyType = COPY_TYPE.COPY } = payload;

        const target = getSheetCommandTarget(this._univerInstanceService, { unitId: pastedUnitId, subUnitId: pastedSubUnitId });
        if (!target) {
            return { redos: [], undos: [] };
        }

        // If it is cut and paste in the same worksheet, do not need to handle the conditional formatting, because the move range had handle the ref range of conditional formatting, to see cf-formula-ref-range.controller.ts.
        if (copyType === COPY_TYPE.CUT && pastedUnitId === copyUnitId && pastedSubUnitId === copySubUnitId) {
            this._copyInfo = null;
            return { redos: [], undos: [] };
        }

        const sourceVirtualization = virtualizeDiscreteRanges([copyRange]);
        const sourceVirtualRange = sourceVirtualization.ranges[0];
        const targetVirtualization = virtualizeDiscreteRanges([pastedRange]);
        const targetVirtualRange = targetVirtualization.ranges[0];
        const repeatRange = getRepeatRange(sourceVirtualRange, targetVirtualRange, true);
        const targetRanges = targetVirtualization.mapRange(targetVirtualRange);
        const isSameSheet = pastedUnitId === copyUnitId && pastedSubUnitId === copySubUnitId;
        const effectedConditionalFormattingRuleRanges = new Map<string, {
            cfId: string;
            unitId: string;
            subUnitId: string;
            ranges: IRange[];
            add: IRange[];
            remove: IRange[];
        }>();
        const getEffectKey = (unitId: string, subUnitId: string, cfId: string) => JSON.stringify([unitId, subUnitId, cfId]);

        // 1. delete the conditional formatting rules in the pasted range.
        this._conditionalFormattingRuleModel.getSubunitRules(pastedUnitId, pastedSubUnitId)?.forEach((rule) => {
            if (!Rectangle.doAnyRangesIntersect(rule.ranges, targetRanges)) {
                return;
            }
            effectedConditionalFormattingRuleRanges.set(getEffectKey(pastedUnitId, pastedSubUnitId, rule.cfId), {
                cfId: rule.cfId,
                unitId: pastedUnitId,
                subUnitId: pastedSubUnitId,
                ranges: rule.ranges,
                add: [],
                remove: targetRanges,
            });
        });

        // 2. if it is cut from another worksheet, need to delete the conditional formatting rules in the copy range.
        if (copyType === COPY_TYPE.CUT && (pastedUnitId !== copyUnitId || pastedSubUnitId !== copySubUnitId)) {
            const sourceRanges = sourceVirtualization.mapRange(sourceVirtualRange);
            copyInfo.rules.forEach((_ranges, cfId) => {
                const rule = this._conditionalFormattingRuleModel.getRule(copyUnitId, copySubUnitId, cfId);
                if (!rule) {
                    return;
                }
                effectedConditionalFormattingRuleRanges.set(getEffectKey(copyUnitId, copySubUnitId, cfId), {
                    cfId,
                    unitId: copyUnitId,
                    subUnitId: copySubUnitId,
                    ranges: rule.ranges,
                    add: [],
                    remove: sourceRanges,
                });
            });
        }

        const { rules, info } = copyInfo;
        const waitAddRule = new Map<string, IConditionFormattingRule>();
        const cacheCfIdMap: Record<string, IConditionFormattingRule> = {};

        // 3. generate the new conditional formatting rules based on the copy range's conditional formatting rules and the paste position.
        const getCurrentSheetCfRule = (copyRangeCfId: string) => {
            const oldRule = info?.cfMap[copyRangeCfId];
            if (isSameSheet) {
                const rule = this._conditionalFormattingRuleModel.getRule(pastedUnitId, pastedSubUnitId, copyRangeCfId);
                if (rule) {
                    cacheCfIdMap[copyRangeCfId] = rule;
                    return rule;
                }
            }

            const rule: IConditionFormattingRule = {
                rule: oldRule.rule,
                cfId: this._conditionalFormattingRuleModel.createCfId(pastedUnitId, pastedSubUnitId),
                ranges: [],
                stopIfTrue: oldRule.stopIfTrue,
            };
            cacheCfIdMap[copyRangeCfId] = rule;
            waitAddRule.set(rule.cfId, rule);
            return rule;
        };

        const sourceRuleEntries = Array.from(rules.entries());
        if (!isSameSheet) {
            // AddRule prepends, so emit lower-priority cross-sheet clones first.
            sourceRuleEntries.reverse();
        }
        sourceRuleEntries.forEach(([cfId, sourceRanges]) => {
            const rule = cacheCfIdMap[cfId] || getCurrentSheetCfRule(cfId);
            const effectKey = getEffectKey(pastedUnitId, pastedSubUnitId, rule.cfId);
            if (!effectedConditionalFormattingRuleRanges.has(effectKey)) {
                effectedConditionalFormattingRuleRanges.set(effectKey, {
                    cfId: rule.cfId,
                    unitId: pastedUnitId,
                    subUnitId: pastedSubUnitId,
                    ranges: rule.ranges,
                    add: [],
                    remove: [],
                });
            }
            const current = effectedConditionalFormattingRuleRanges.get(effectKey)!;
            current.add.push(...repeatRange.flatMap((item) => sourceRanges.flatMap((sourceRange) => (
                targetVirtualization.mapRange(Rectangle.getPositionRange(sourceRange, item.startRange))
            ))));
        });

        const redos = [];
        const undos = [];

        for (const effect of effectedConditionalFormattingRuleRanges.values()) {
            const { cfId, unitId, subUnitId, ranges: sourceRanges, add, remove } = effect;
            const ranges = this._conditionalFormattingRangeTransformService.applyRangeDelta(sourceRanges, remove, add);

            if (!ranges.length) {
                const deleteParams: IDeleteConditionalRuleMutationParams = {
                    unitId,
                    subUnitId,
                    cfId,
                };
                redos.push({ id: DeleteConditionalRuleMutation.id, params: deleteParams });
                undos.push(...DeleteConditionalRuleMutationUndoFactory(this._injector, deleteParams));
                continue;
            }

            const waitAdd = waitAddRule.get(cfId);
            if (waitAdd) {
                const addParams: IAddConditionalRuleMutationParams = {
                    unitId: pastedUnitId,
                    subUnitId: pastedSubUnitId,
                    rule: { ...waitAdd, ranges },
                };
                redos.push({ id: AddConditionalRuleMutation.id, params: addParams });
                undos.push(AddConditionalRuleMutationUndoFactory(this._injector, addParams));
            } else {
                const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cfId);
                if (!rule) {
                    continue;
                }
                const setParams: ISetConditionalRuleMutationParams = {
                    unitId,
                    subUnitId,
                    rule: { ...rule, ranges },
                };
                redos.push({ id: SetConditionalRuleMutation.id, params: setParams });
                undos.push(...setConditionalRuleMutationUndoFactory(this._injector, setParams));
            }
        }

        return {
            redos,
            undos,
        };
    }
}
