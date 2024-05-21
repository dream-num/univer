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
import type { IMenuSelectorItem } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { getMenuHiddenObservable, IMenuService, MenuGroup, MenuItemType, MenuPosition, mergeMenuConfigs } from '@univerjs/ui';
import { SelectionManagerService, SetWorksheetActiveOperation } from '@univerjs/sheets';

import { debounceTime } from 'rxjs/operators';
import type { Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, Rectangle, UniverInstanceType } from '@univerjs/core';
import { AddConditionalRuleMutation, ConditionalFormattingRuleModel, DeleteConditionalRuleMutation, MoveConditionalRuleMutation, SetConditionalRuleMutation } from '@univerjs/sheets-conditional-formatting';

import { CF_MENU_OPERATION, OpenConditionalFormattingOperator } from '../commands/operations/open-conditional-formatting-panel';

const commandList = [SetWorksheetActiveOperation.id, AddConditionalRuleMutation.id, SetConditionalRuleMutation.id, DeleteConditionalRuleMutation.id, MoveConditionalRuleMutation.id];

const commonSelections = [
    {
        label: 'sheet.cf.ruleType.highlightCell',
        value: CF_MENU_OPERATION.highlightCell,
    },
    {
        label: 'sheet.cf.panel.rankAndAverage',
        value: CF_MENU_OPERATION.rank,
    },
    {
        label: 'sheet.cf.ruleType.formula',
        value: CF_MENU_OPERATION.formula,
    },
    {
        label: 'sheet.cf.ruleType.colorScale',
        value: CF_MENU_OPERATION.colorScale,
    },
    {
        label: 'sheet.cf.ruleType.dataBar',
        value: CF_MENU_OPERATION.dataBar,
    }, {
        label: 'sheet.cf.ruleType.iconSet',
        value: CF_MENU_OPERATION.icon,
    },
    {
        label: 'sheet.cf.menu.manageConditionalFormatting',
        value: CF_MENU_OPERATION.viewRule,
    }, {
        label: 'sheet.cf.menu.createConditionalFormatting',
        value: CF_MENU_OPERATION.createRule,
    },
    {
        label: 'sheet.cf.menu.clearRangeRules',
        value: CF_MENU_OPERATION.clearRangeRules,
        disabled: false,
    },
    {
        label: 'sheet.cf.menu.clearWorkSheetRules',
        value: CF_MENU_OPERATION.clearWorkSheetRules,
    },
];

export const FactoryManageConditionalFormattingRule = (accessor: IAccessor) => {
    const selectionManagerService = accessor.get(SelectionManagerService);
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(OpenConditionalFormattingOperator.id);

    const clearRangeEnable$ = new Observable<boolean>((subscriber) => merge(
        selectionManagerService.selectionMoveEnd$,
        new Observable<null>((commandSubscribe) => {
            const disposable = commandService.onCommandExecuted((commandInfo) => {
                const { id, params } = commandInfo;
                const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
                if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                    commandSubscribe.next(null);
                }
            });
            return () => disposable.dispose();
        })
    ).pipe(debounceTime(16)).subscribe(() => {
        const ranges = selectionManagerService.getSelections()?.map((selection) => selection.range) || [];
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
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
                    const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
                    if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                        commandSubscribe.next(null);
                    }
                });
                return () => disposable.dispose();
            })
        ).pipe(debounceTime(16)).subscribe(() => {
            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return;
            const allRule = conditionalFormattingRuleModel.getSubunitRules(workbook.getUnitId(), workbook.getActiveSheet().getSheetId()) || [];
            subscriber.next(!!allRule.length);
        })
    );
    const selections$ = new Observable((subscriber) => {
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

    return mergeMenuConfigs({
        id: OpenConditionalFormattingOperator.id,
        type: MenuItemType.SELECTOR,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
        icon: 'Conditions',
        tooltip: 'sheet.cf.title',
        selections: selections$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    }, menuItemConfig) as IMenuSelectorItem;
};
