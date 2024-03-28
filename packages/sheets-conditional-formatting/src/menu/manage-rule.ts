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

import { merge, Observable } from 'rxjs';
import type { ComponentManager, IMenuSelectorItem } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { IZenZoneService, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { SelectionManagerService, SetWorksheetActiveOperation } from '@univerjs/sheets';

import { debounceTime } from 'rxjs/operators';
import { ICommandService, IUniverInstanceService, LocaleService, Rectangle } from '@univerjs/core';
import { Conditions } from '@univerjs/icons';
import { AddConditionalRuleMutation } from '../commands/mutations/add-conditional-rule.mutation';
import { SetConditionalRuleMutation } from '../commands/mutations/set-conditional-rule.mutation';
import { DeleteConditionalRuleMutation } from '../commands/mutations/delete-conditional-rule.mutation';
import { MoveConditionalRuleMutation } from '../commands/mutations/move-conditional-rule.mutation';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';

import { CF_MENU_OPERATION, OpenConditionalFormattingOperator } from '../commands/operations/open-conditional-formatting-panel';

export const FactoryManageConditionalFormattingRule = (componentManager: ComponentManager) => {
    const key = 'conditional-formatting-menu-icon';
    componentManager.register(key, Conditions);
    return (_accessor: IAccessor) => {
        const localeService = _accessor.get(LocaleService);
        const selectionManagerService = _accessor.get(SelectionManagerService);
        const commandService = _accessor.get(ICommandService);
        const univerInstanceService = _accessor.get(IUniverInstanceService);
        const conditionalFormattingRuleModel = _accessor.get(ConditionalFormattingRuleModel);
        const zenZoneService = _accessor.get(IZenZoneService);

        const commandList = [SetWorksheetActiveOperation.id, AddConditionalRuleMutation.id, SetConditionalRuleMutation.id, DeleteConditionalRuleMutation.id, MoveConditionalRuleMutation.id];

        const clearRangeEnable$ = new Observable<boolean>((subscriber) =>
            merge(
                selectionManagerService.selectionMoveEnd$,
                new Observable<null>((commandSubscribe) => {
                    const disposable = commandService.onCommandExecuted((commandInfo) => {
                        const { id, params } = commandInfo;
                        const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                        if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                            commandSubscribe.next(null);
                        }
                    });
                    return () => disposable.dispose();
                })
            ).pipe(debounceTime(16)).subscribe(() => {
                const ranges = selectionManagerService.getSelections()?.map((selection) => selection.range) || [];
                const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                const subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
                const allRule = conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId) || [];
                const ruleList = allRule.filter((rule) => rule.ranges.some((ruleRange) => ranges.some((range) => Rectangle.intersects(range, ruleRange))));
                subscriber.next(!!ruleList.length);
            })
        );
        const clearSheetEnable$ = new Observable<boolean>((subscriber) =>
            merge(
                selectionManagerService.selectionMoveEnd$,
                new Observable<null>((commandSubscribe) => {
                    const disposable = commandService.onCommandExecuted((commandInfo) => {
                        const { id, params } = commandInfo;
                        const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                        if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                            commandSubscribe.next(null);
                        }
                    });
                    return () => disposable.dispose();
                })
            ).pipe(debounceTime(16)).subscribe(() => {
                const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                const subUnitId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
                const allRule = conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId) || [];
                subscriber.next(!!allRule.length);
            })
        );
        const selections$ = new Observable((subscriber) => {
            const commonSelections = [
                {
                    label: localeService.t('sheet.cf.ruleType.highlightCell'),
                    value: CF_MENU_OPERATION.highlightCell,
                },
                {
                    label: localeService.t('sheet.cf.panel.rankAndAverage'),
                    value: CF_MENU_OPERATION.rank,
                },
                {
                    label: localeService.t('sheet.cf.ruleType.formula'),
                    value: CF_MENU_OPERATION.formula,
                },
                {
                    label: localeService.t('sheet.cf.ruleType.colorScale'),
                    value: CF_MENU_OPERATION.colorScale,
                },
                {
                    label: localeService.t('sheet.cf.ruleType.dataBar'),
                    value: CF_MENU_OPERATION.dataBar,
                }, {
                    label: localeService.t('sheet.cf.ruleType.iconSet'),
                    value: CF_MENU_OPERATION.icon,
                },
                {
                    label: localeService.t('sheet.cf.menu.manageConditionalFormatting'),
                    value: CF_MENU_OPERATION.viewRule,
                }, {
                    label: localeService.t('sheet.cf.menu.createConditionalFormatting'),
                    value: CF_MENU_OPERATION.createRule,
                },
                {
                    label: localeService.t('sheet.cf.menu.clearRangeRules'),
                    value: CF_MENU_OPERATION.clearRangeRules,
                    disabled: !clearRangeEnable$,
                },
                {
                    label: localeService.t('sheet.cf.menu.clearWorkSheetRules'),
                    value: CF_MENU_OPERATION.clearWorkSheetRules,
                }];
            clearRangeEnable$.subscribe((v) => {
                const item = commonSelections.find((item) => item.value === CF_MENU_OPERATION.clearRangeRules);
                if (item) {
                    item.disabled = !v;
                    subscriber.next(commonSelections);
                }
            });
            clearSheetEnable$.subscribe((v) => {
                const item = commonSelections.find((item) => item.value === CF_MENU_OPERATION.clearWorkSheetRules);
                if (item) {
                    item.disabled = !v;
                    subscriber.next(commonSelections);
                }
            });
            subscriber.next(commonSelections);
        });
        const hidden$ = new Observable((subscriber) => {
            const disposable = zenZoneService.visible$.subscribe((v) => {
                subscriber.next(v);
            });
            return () => {
                disposable.unsubscribe();
            };
        });
        return {
            id: OpenConditionalFormattingOperator.id,
            type: MenuItemType.SELECTOR,
            group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
            positions: [MenuPosition.TOOLBAR_START],
            icon: key,
            tooltip: localeService.t('sheet.cf.title'),
            selections: selections$,
            hidden$,
        } as IMenuSelectorItem;
    };
};
