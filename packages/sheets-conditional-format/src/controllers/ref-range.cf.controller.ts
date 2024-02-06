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

import type { IRange } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, toDisposable } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';
import type { IConditionFormatRule } from '../models/type';
import type { ISetConditionalRuleMutationParams } from '../commands/mutations/setConditionalRule.mutation';
import type { IDeleteConditionalRuleMutationParams } from '../commands/mutations/deleteConditionalRule.mutation';
import { deleteConditionalRuleMutation, deleteConditionalRuleMutationUndoFactory } from '../commands/mutations/deleteConditionalRule.mutation';
import { setConditionalRuleMutation, setConditionalRuleMutationUndoFactory } from '../commands/mutations/setConditionalRule.mutation';

@OnLifecycle(LifecycleStages.Rendered, RefRangeController)
export class RefRangeController extends Disposable {
    constructor(
        @Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(RefRangeService) private _refRangeService: RefRangeService) {
        super();
        this._initRefRange();
    }

    private _initRefRange() {
        const disposableMap: Map<string, () => void> = new Map();
        this.disposeWithMe(toDisposable(() => {
            disposableMap.forEach((item) => {
                item();
            });
            disposableMap.clear();
        }));

        const getCfIdWithUnitId = (unitID: string, subUnitId: string, cfId: string) => `${unitID}_${subUnitId}_${cfId}`;

        const register = (unitId: string, subUnitId: string, rule: IConditionFormatRule) => {
            const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
                const resultRange = rule.ranges.map((range) => {
                    return handleDefaultRangeChangeWithEffectRefCommands(range, commandInfo) as IRange;
                }).filter((range) => !!range);
                if (resultRange.length) {
                    const redoParams: ISetConditionalRuleMutationParams = { unitId, subUnitId, rule: { ...rule, ranges: resultRange } };
                    const redos = [{ id: setConditionalRuleMutation.id, params: redoParams }];
                    const undos = setConditionalRuleMutationUndoFactory(this._injector, redoParams);
                    return { redos, undos };
                } else {
                    const redoParams: IDeleteConditionalRuleMutationParams = { unitId, subUnitId, cfId: rule.cfId };
                    const redos = [{ id: deleteConditionalRuleMutation.id, params: redoParams }];
                    const undos = deleteConditionalRuleMutationUndoFactory(this._injector, redoParams);
                    return { redos, undos };
                }
            };
            const disposeList: (() => void)[] = [];
            rule.ranges.forEach((range) => {
                const disposable = this._refRangeService.registerRefRange(range, handleRangeChange);
                disposeList.push(() => disposable.dispose());
            });
            disposableMap.set(getCfIdWithUnitId(unitId, subUnitId, rule.cfId), () => disposeList.forEach((dispose) => dispose()));
        };

        this.disposeWithMe(this._conditionalFormatRuleModel.$ruleChange.subscribe((option) => {
            const { unitId, subUnitId, rule } = option;
            const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
            const worksheet = workbook.getActiveSheet();
            if (option.unitId !== workbook.getUnitId() || option.subUnitId !== worksheet.getSheetId()) {
                return;
            }
            switch (option.type) {
                case 'add':{
                    register(option.unitId, option.subUnitId, option.rule);
                    break;
                }
                case 'delete':{
                    const dispose = disposableMap.get(getCfIdWithUnitId(unitId, subUnitId, rule.cfId));
                    dispose && dispose();
                    break;
                }
                case 'set':{
                    const dispose = disposableMap.get(getCfIdWithUnitId(unitId, subUnitId, rule.cfId));
                    dispose && dispose();
                    // and to add
                    register(option.unitId, option.subUnitId, option.rule);
                }
            }
        }));
    }
}
