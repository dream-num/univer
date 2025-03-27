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

import type { IAccessor, Workbook } from '@univerjs/core';
import type { IMenuSelectorItem } from '@univerjs/ui';
import { ICommandService, IUniverInstanceService, Rectangle, UniverInstanceType } from '@univerjs/core';
import { checkRangesEditablePermission, RangeProtectionPermissionEditPoint, SetWorksheetActiveOperation, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission } from '@univerjs/sheets';
import { AddConditionalRuleMutation, ConditionalFormattingRuleModel, DeleteConditionalRuleMutation, MoveConditionalRuleMutation, SetConditionalRuleMutation } from '@univerjs/sheets-conditional-formatting';

import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { merge, Observable } from 'rxjs';

import { debounceTime } from 'rxjs/operators';
import { CF_MENU_OPERATION, OpenConditionalFormattingOperator } from '../commands/operations/open-conditional-formatting-panel';

const commandList = [
    SetWorksheetActiveOperation.id,
    AddConditionalRuleMutation.id,
    SetConditionalRuleMutation.id,
    DeleteConditionalRuleMutation.id,
    MoveConditionalRuleMutation.id,
];

const commonSelections = [
    {
        label: {
            name: 'sheet.cf.ruleType.highlightCell',
            selectable: false,
        },
        value: CF_MENU_OPERATION.highlightCell,
    },
    {
        label: {
            name: 'sheet.cf.panel.rankAndAverage',
            selectable: false,
        },
        value: CF_MENU_OPERATION.rank,
    },
    {
        label: {
            name: 'sheet.cf.ruleType.formula',
            selectable: false,
        },
        value: CF_MENU_OPERATION.formula,
    },
    {
        label: {
            name: 'sheet.cf.ruleType.colorScale',
            selectable: false,
        },
        value: CF_MENU_OPERATION.colorScale,
    },
    {
        label: {
            name: 'sheet.cf.ruleType.dataBar',
            selectable: false,
        },
        value: CF_MENU_OPERATION.dataBar,
    },
    {
        label: {
            name: 'sheet.cf.ruleType.iconSet',
            selectable: false,
        },
        value: CF_MENU_OPERATION.icon,
    },
    {
        label: {
            name: 'sheet.cf.menu.manageConditionalFormatting',
            selectable: false,
        },
        value: CF_MENU_OPERATION.viewRule,
    },
    {
        label: {
            name: 'sheet.cf.menu.createConditionalFormatting',
            selectable: false,
        },
        value: CF_MENU_OPERATION.createRule,
    },
    {
        label: {
            name: 'sheet.cf.menu.clearRangeRules',
            selectable: false,
        },
        value: CF_MENU_OPERATION.clearRangeRules,
        disabled: false,
    },
    {
        label: {
            name: 'sheet.cf.menu.clearWorkSheetRules',
            selectable: false,
        },
        value: CF_MENU_OPERATION.clearWorkSheetRules,
    },
];

// eslint-disable-next-line max-lines-per-function
export const FactoryManageConditionalFormattingRule = (accessor: IAccessor): IMenuSelectorItem => {
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const conditionalFormattingRuleModel = accessor.get(ConditionalFormattingRuleModel);

    const clearRangeEnable$ = new Observable<boolean>((subscriber) => merge(
        selectionManagerService.selectionMoveEnd$,
        selectionManagerService.selectionSet$,
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
        const ranges = selectionManagerService.getCurrentSelections()?.map((selection) => selection.range) || [];
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return;

        const allRule = conditionalFormattingRuleModel.getSubunitRules(workbook.getUnitId(), worksheet.getSheetId()) || [];
        const ruleList = allRule.filter((rule) => rule.ranges.some((ruleRange) => ranges.some((range) => Rectangle.intersects(range, ruleRange))));
        const hasPermission = ruleList.map((rule) => rule.ranges).every((ranges) => {
            return checkRangesEditablePermission(accessor, workbook.getUnitId(), worksheet.getSheetId(), ranges);
        });
        subscriber.next(hasPermission);
    }));
    const clearSheetEnable$ = new Observable<boolean>((subscriber) =>
        new Observable<null>((commandSubscribe) => {
            const disposable = commandService.onCommandExecuted((commandInfo) => {
                const { id, params } = commandInfo;
                const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
                if (commandList.includes(id) && (params as { unitId: string }).unitId === unitId) {
                    commandSubscribe.next(null);
                }
            });
            return () => disposable.dispose();
        }).pipe(debounceTime(16)).subscribe(() => {
            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return;
            const worksheet = workbook.getActiveSheet();
            if (!worksheet) return;

            const allRule = conditionalFormattingRuleModel.getSubunitRules(workbook.getUnitId(), worksheet.getSheetId()) || [];
            if (!allRule.length) {
                subscriber.next(false);
                return false;
            }

            const hasPermission = allRule.map((rule) => rule.ranges).every((ranges) => {
                return checkRangesEditablePermission(accessor, workbook.getUnitId(), worksheet.getSheetId(), ranges);
            });
            subscriber.next(hasPermission);
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
    return {
        id: OpenConditionalFormattingOperator.id,
        type: MenuItemType.SELECTOR,
        icon: 'Conditions',
        tooltip: 'sheet.cf.title',
        selections: selections$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    } as IMenuSelectorItem;
};
