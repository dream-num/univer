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

import type { ICellDataForSheetInterceptor, IRange, Nullable, Workbook } from '@univerjs/core';
import { Disposable, DisposableCollection, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import type { IRenderContext } from '@univerjs/engine-render';
import { ConditionalFormattingClearController } from '@univerjs/sheets-conditional-formatting-ui';
import type { IConditionalFormattingRuleConfig, IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';
import { UnitAction } from '@univerjs/protocol';

type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };

export const SHEET_PERMISSION_PASTE_PLUGIN = 'SHEET_PERMISSION_PASTE_PLUGIN';

@OnLifecycle(LifecycleStages.Steady, SheetPermissionInterceptorCfController)
export class SheetPermissionInterceptorCfController extends Disposable {
    disposableCollection = new DisposableCollection();

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ConditionalFormattingClearController) private readonly _conditionalFormattingClearController: ConditionalFormattingClearController
    ) {
        super();
        this._initConditionalFormattingPermissionInterceptor();
    }

    private _initConditionalFormattingPermissionInterceptor() {
        this.disposeWithMe(
            this._conditionalFormattingClearController.interceptor.intercept(this._conditionalFormattingClearController.interceptor.getInterceptPoints().CONDITIONAL_FORMATTING_PERMISSION_CHECK, {
                handler: (_: Nullable<(IConditionFormattingRule<IConditionalFormattingRuleConfig> & { disable?: boolean })[]>, rules: ((IConditionFormattingRule<IConditionalFormattingRuleConfig> & { disable?: boolean }))[]) => {
                    const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                    const worksheet = workbook.getActiveSheet();
                    const rulesByPermissionCheck = rules.map((rule) => {
                        const ranges = rule.ranges;
                        const haveNotPermission = ranges?.some((range) => {
                            const { startRow, startColumn, endRow, endColumn } = range;
                            for (let row = startRow; row <= endRow; row++) {
                                for (let col = startColumn; col <= endColumn; col++) {
                                    const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                                    if (permission?.[UnitAction.Edit] === false || permission?.[UnitAction.View] === false) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        });
                        if (haveNotPermission) {
                            return { ...rule, disable: true };
                        } else {
                            return { ...rule };
                        }
                    });
                    return rulesByPermissionCheck;
                },
            })
        );
    }
}
