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

import type { IRange, Workbook } from '@univerjs/core';
import type { EffectRefRangeParams } from '@univerjs/sheets';
import type { IConditionFormattingRule, IDeleteConditionalRuleMutationParams, ISetConditionalRuleMutationParams } from '@univerjs/sheets-conditional-formatting';
import { Disposable, Inject, Injector, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { handleDefaultRangeChangeWithEffectRefCommands, RefRangeService } from '@univerjs/sheets';
import { ConditionalFormattingRuleModel, DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory, isRangesEqual, SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory } from '@univerjs/sheets-conditional-formatting';

export class SheetsCfRefRangeController extends Disposable {
    constructor(
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(RefRangeService) private _refRangeService: RefRangeService
    ) {
        super();

        this._initRefRange();
    }

    private _initRefRange() {
        const disposableMap: Map<string, () => void> = new Map();
        const getCfIdWithUnitId = (unitID: string, subUnitId: string, cfId: string) => `${unitID}_${subUnitId}_${cfId}`;
        const register = (unitId: string, subUnitId: string, rule: IConditionFormattingRule) => {
            const handleRangeChange = (commandInfo: EffectRefRangeParams) => {
                const oldRanges = [...rule.ranges];
                const resultRanges = oldRanges.map((range) => {
                    return handleDefaultRangeChangeWithEffectRefCommands(range, commandInfo) as IRange;
                }).filter((range) => !!range);
                const isEqual = isRangesEqual(resultRanges, oldRanges);
                if (isEqual) {
                    return { redos: [], undos: [] };
                }
                if (resultRanges.length) {
                    const redoParams: ISetConditionalRuleMutationParams = { unitId, subUnitId, rule: { ...rule, ranges: resultRanges } };
                    const redos = [{ id: SetConditionalRuleMutation.id, params: redoParams }];
                    const undos = setConditionalRuleMutationUndoFactory(this._injector, redoParams);
                    return { redos, undos };
                } else {
                    const redoParams: IDeleteConditionalRuleMutationParams = { unitId, subUnitId, cfId: rule.cfId };
                    const redos = [{ id: DeleteConditionalRuleMutation.id, params: redoParams }];
                    const undos = DeleteConditionalRuleMutationUndoFactory(this._injector, redoParams);
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

        this.disposeWithMe(this._conditionalFormattingRuleModel.$ruleChange.subscribe((option) => {
            const { unitId, subUnitId, rule } = option;
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            if (option.unitId !== workbook.getUnitId() || option.subUnitId !== worksheet?.getSheetId()) {
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

        this.disposeWithMe(toDisposable(() => {
            disposableMap.forEach((item) => {
                item();
            });
            disposableMap.clear();
        }));
    }
}
