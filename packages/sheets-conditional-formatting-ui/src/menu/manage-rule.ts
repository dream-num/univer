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
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { SelectionManagerService, SetWorksheetActiveOperation } from '@univerjs/sheets';

import { debounceTime } from 'rxjs/operators';
import type { Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, Rectangle, UniverInstanceType } from '@univerjs/core';
import { Conditions } from '@univerjs/icons';
import { AddConditionalRuleMutation, ConditionalFormattingRuleModel, DeleteConditionalRuleMutation, MoveConditionalRuleMutation, SetConditionalRuleMutation } from '@univerjs/sheets-conditional-formatting';

import { CF_MENU_OPERATION, OpenConditionalFormattingOperator } from '../commands/operations/open-conditional-formatting-panel';

const commandList = [SetWorksheetActiveOperation.id, AddConditionalRuleMutation.id, SetConditionalRuleMutation.id, DeleteConditionalRuleMutation.id, MoveConditionalRuleMutation.id];

export const FactoryManageConditionalFormattingRule = (componentManager: ComponentManager) => {
    const key = 'conditional-formatting-menu-icon';
    componentManager.register(key, Conditions);
    return (accessor: IAccessor) => {
        const localeService = accessor.get(LocaleService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
        const clearRangeEnable$ = new Observable<boolean>((subscriber) => merge(
            selectionManagerService.selectionMoveEnd$,
            new Observable<null>((commandSubscribe) => {
                const disposable = commandService.onCommandExecuted((commandInfo) => {
                    const { id, params } = commandInfo;
                    const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET)?.getUnitId();
                    if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                        commandSubscribe.next(null);
                    }
                });
                return () => disposable.dispose();
            })
        ).pipe(debounceTime(16)).subscribe(() => {
            const ranges = selectionManagerService.getSelections()?.map((selection) => selection.range) || [];
            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET);
            if (!workbook) return;
            const allRule = conditionalFormattingRuleModel.getSubunitRules(workbook.getUnitId(), workbook.getActiveSheet().getSheetId()) || [];
            const ruleList = allRule.filter((rule) => rule.ranges.some((ruleRange) => ranges.some((range) => Rectangle.intersects(range, ruleRange))));
            subscriber.next(!!ruleList.length);
        }));
        const clearSheetEnable$ = new Observable<boolean>((subscriber) =>
            merge(
                selectionManagerService.selectionMoveEnd$,
                new Observable<null>((commandSubscribe) => {
                    const disposable = commandService.onCommandExecuted((commandInfo) => {
                        const { id, params } = commandInfo;
                        const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET)?.getUnitId();
                        if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                            commandSubscribe.next(null);
                        }
                    });
                    return () => disposable.dispose();
                })
            ).pipe(debounceTime(16)).subscribe(() => {
                const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.SHEET);
                if (!workbook) return;
                const allRule = conditionalFormattingRuleModel.getSubunitRules(workbook.getUnitId(), workbook.getActiveSheet().getSheetId()) || [];
                subscriber.next(!!allRule.length);
            })
        );
        const selections$ = new Observable((subscriber) => {
            const commonSelections = getCommonSelection(localeService);
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
        return {
            id: OpenConditionalFormattingOperator.id,
            type: MenuItemType.SELECTOR,
            group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
            positions: [MenuPosition.TOOLBAR_START],
            icon: key,
            tooltip: localeService.t('sheet.cf.title'),
            selections: selections$,
            hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        } as IMenuSelectorItem;
    };
};

function getCommonSelection(localeService: LocaleService) {
    return [
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
            disabled: false,
        },
        {
            label: localeService.t('sheet.cf.menu.clearWorkSheetRules'),
            value: CF_MENU_OPERATION.clearWorkSheetRules,
        },
    ];
}
