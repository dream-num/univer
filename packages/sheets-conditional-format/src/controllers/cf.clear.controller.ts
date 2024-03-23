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

import type { IMutationInfo } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, Rectangle } from '@univerjs/core';
import { ClearSelectionAllCommand, ClearSelectionFormatCommand, RangeMergeUtil, SelectionManagerService, SheetInterceptorService } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';
import type { ISetConditionalRuleMutationParams } from '../commands/mutations/setConditionalRule.mutation';
import { setConditionalRuleMutation, setConditionalRuleMutationUndoFactory } from '../commands/mutations/setConditionalRule.mutation';
import type { IDeleteConditionalRuleMutationParams } from '../commands/mutations/deleteConditionalRule.mutation';
import { deleteConditionalRuleMutation, deleteConditionalRuleMutationUndoFactory } from '../commands/mutations/deleteConditionalRule.mutation';

@OnLifecycle(LifecycleStages.Rendered, ConditionalFormatClearController)
export class ConditionalFormatClearController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService,
        @Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel

    ) {
        super();

        this._init();
    }

    private _init() {
        this.disposeWithMe(this._sheetInterceptorService.interceptCommand({ getMutations: (commandInfo) => {
            const redos: IMutationInfo[] = [];
            const undos: IMutationInfo[] = [];
            const defaultV = { redos, undos };
            if ([ClearSelectionFormatCommand.id, ClearSelectionAllCommand.id].includes(commandInfo.id)) {
                const ranges = this._selectionManagerService.getSelectionRanges();
                if (!ranges) {
                    return defaultV;
                }
                const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                const worksheet = workbook.getActiveSheet();
                const allRules = this._conditionalFormatRuleModel.getSubunitRules(workbook.getUnitId(), worksheet.getSheetId());
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
                            id: setConditionalRuleMutation.id,
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
                            id: deleteConditionalRuleMutation.id,
                            params: {
                                unitId: workbook.getUnitId(),
                                subUnitId: worksheet.getSheetId(),
                                cfId: rule.cfId,
                            },
                        };
                        const undo = deleteConditionalRuleMutationUndoFactory(this._injector, redo.params);
                        redos.push(redo);
                        undos.push(...undo);
                    }
                });
            }
            return defaultV;
        } }));
    }
}
