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

import type { IMutationInfo, Workbook } from '@univerjs/core';
import { createInterceptorKey, Disposable, InterceptorManager, IUniverInstanceService, LifecycleStages, OnLifecycle, Rectangle, UniverInstanceType } from '@univerjs/core';
import { ClearSelectionAllCommand, ClearSelectionFormatCommand, RangeMergeUtil, SelectionManagerService, SheetInterceptorService } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { ConditionalFormattingRuleModel, DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory, SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory } from '@univerjs/sheets-conditional-formatting';
import type { IConditionalFormattingRuleConfig, IConditionFormattingRule, IDeleteConditionalRuleMutationParams, ISetConditionalRuleMutationParams } from '@univerjs/sheets-conditional-formatting';

export const CONDITIONAL_FORMATTING_PERMISSION_CHECK = createInterceptorKey<(IConditionFormattingRule<IConditionalFormattingRuleConfig> & { disable?: boolean })[], (IConditionFormattingRule<IConditionalFormattingRuleConfig> & { disable?: boolean })[]>('conditionalFormattingPermissionCheck');

@OnLifecycle(LifecycleStages.Rendered, ConditionalFormattingClearController)
export class ConditionalFormattingClearController extends Disposable {
    public interceptor = new InterceptorManager({ CONDITIONAL_FORMATTING_PERMISSION_CHECK });

    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel

    ) {
        super();

        this._init();
    }

    private _init() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({
            getMutations: (commandInfo) => {
                const redos: IMutationInfo[] = [];
                const undos: IMutationInfo[] = [];
                const defaultV = { redos, undos };
                if ([ClearSelectionFormatCommand.id, ClearSelectionAllCommand.id].includes(commandInfo.id)) {
                    const ranges = this._selectionManagerService.getSelectionRanges();
                    if (!ranges) {
                        return defaultV;
                    }
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const worksheet = workbook.getActiveSheet();
                    const allRules = this._conditionalFormattingRuleModel.getSubunitRules(workbook.getUnitId(), worksheet.getSheetId());
                    if (!allRules || !allRules.length) {
                        return defaultV;
                    }
                    allRules.filter((rule) => {
                        return ranges.some((range) => rule.ranges.some((ruleRange) => Rectangle.getIntersects(ruleRange, range)));
                    }).forEach((rule) => {
                        const mergeUtil = new RangeMergeUtil();
                        const mergeRanges = mergeUtil.add(...rule.ranges).subtract(...ranges).merge();
                        if (mergeRanges.length) {
                            const redo: IMutationInfo<ISetConditionalRuleMutationParams> = {
                                id: SetConditionalRuleMutation.id,
                                params: {
                                    unitId: workbook.getUnitId(),
                                    subUnitId: worksheet.getSheetId(),
                                    rule: { ...rule, ranges: mergeRanges },
                                },
                            };
                            const undo = setConditionalRuleMutationUndoFactory(this._injector, redo.params);
                            redos.push(redo);
                            undos.push(...undo);
                        } else {
                            const redo: IMutationInfo<IDeleteConditionalRuleMutationParams> = {
                                id: DeleteConditionalRuleMutation.id,
                                params: {
                                    unitId: workbook.getUnitId(),
                                    subUnitId: worksheet.getSheetId(),
                                    cfId: rule.cfId,
                                },
                            };
                            const undo = DeleteConditionalRuleMutationUndoFactory(this._injector, redo.params);
                            redos.push(redo);
                            undos.push(...undo);
                        }
                    });
                }
                return defaultV;
            },
        }));
    }
}
