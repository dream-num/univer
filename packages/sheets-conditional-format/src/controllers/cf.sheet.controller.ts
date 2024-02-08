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
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IRemoveSheetCommandParams } from '@univerjs/sheets';

import {
    RemoveSheetCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';
import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';
import type { IDeleteConditionalRuleMutationParams } from '../commands/mutations/deleteConditionalRule.mutation';
import { deleteConditionalRuleMutation, deleteConditionalRuleMutationUndoFactory } from '../commands/mutations/deleteConditionalRule.mutation';

@OnLifecycle(LifecycleStages.Rendered, ConditionalFormatSheetController)
export class ConditionalFormatSheetController extends Disposable {
    constructor(
        @Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._initSheetChange();
    }

    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const unitId = params.unitId || getUnitId(this._univerInstanceService);
                        const subUnitId = params.subUnitId || getSubUnitId(this._univerInstanceService);
                        const ruleList = this._conditionalFormatRuleModel.getSubunitRules(unitId, subUnitId);
                        if (!ruleList) {
                            return { redos: [], undos: [] };
                        }

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        ruleList.forEach((item) => {
                            const params: IDeleteConditionalRuleMutationParams = {
                                unitId, subUnitId,
                                cfId: item.cfId,
                            };
                            redos.push({
                                id: deleteConditionalRuleMutation.id, params,
                            });
                            undos.push(...deleteConditionalRuleMutationUndoFactory(this._injector, params));
                        });

                        return {
                            redos,
                            undos,
                        };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }
}

function getUnitId(u: IUniverInstanceService) {
    return u.getCurrentUniverSheetInstance().getUnitId();
}
function getSubUnitId(u: IUniverInstanceService) {
    return u.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
}
