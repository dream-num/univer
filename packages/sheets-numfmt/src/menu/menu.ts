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

import { ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import {
    INumfmtService,
    RangeProtectionPermissionEditPoint,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import type { IMenuSelectorItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@univerjs/core';
import { merge, Observable } from 'rxjs';

import { deriveStateFromActiveSheet$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { MENU_OPTIONS } from '../base/const/MENU-OPTIONS';
import { AddDecimalCommand } from '../commands/commands/add-decimal.command';
import { SetCurrencyCommand } from '../commands/commands/set-currency.command';
import { SubtractDecimalCommand } from '../commands/commands/subtract-decimal.command';
import { OpenNumfmtPanelOperator } from '../commands/operations/open.numfmt.panel.operation';
import { MORE_NUMFMT_TYPE_KEY, OPTIONS_KEY } from '../components/more-numfmt-type/MoreNumfmtType';
import { isPatternEqualWithoutDecimal } from '../utils/decimal';
import { SetPercentCommand } from '../commands/commands/set-percent.command';

export const CurrencyMenuItem = (accessor: IAccessor) => {
    return {
        icon: 'RmbSingle',
        id: SetCurrencyCommand.id,
        title: 'sheet.numfmt.currency',
        tooltip: 'sheet.numfmt.currency',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),

    };
};

export const AddDecimalMenuItem = (accessor: IAccessor) => {
    return {
        icon: 'AddDigitsSingle',
        id: AddDecimalCommand.id,
        title: 'sheet.numfmt.addDecimal',
        tooltip: 'sheet.numfmt.addDecimal',
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
};

export const SubtractDecimalMenuItem = (accessor: IAccessor) => {
    return {
        icon: 'ReduceDigitsSingle',
        id: SubtractDecimalCommand.id,
        title: 'sheet.numfmt.subtractDecimal',
        tooltip: 'sheet.numfmt.subtractDecimal',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
};

export const PercentMenuItem = (accessor: IAccessor) => {
    return {
        icon: 'PercentSingle',
        id: SetPercentCommand.id,
        title: 'sheet.numfmt.percent',
        tooltip: 'sheet.numfmt.percent',
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),

    };
};

export const FactoryOtherMenuItem = (accessor: IAccessor): IMenuSelectorItem => {
    const numfmtService = accessor.get(INumfmtService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const localeService = accessor.get(LocaleService);

    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const value$ = deriveStateFromActiveSheet$(univerInstanceService, '', ({ workbook, worksheet }) => new Observable((subscribe) =>
        merge(
            selectionManagerService.selectionMoveEnd$,
            new Observable<null>((commandSubscribe) => {
                const commandList = [RemoveNumfmtMutation.id, SetNumfmtMutation.id];
                const disposable = commandService.onCommandExecuted((commandInfo) => {
                    if (commandList.includes(commandInfo.id)) {
                        commandSubscribe.next(null);
                    }
                });
                return () => disposable.dispose();
            })
        ).subscribe(() => {
            const selections = selectionManagerService.getCurrentSelections();
            if (selections && selections[0]) {
                const range = selections[0].range;
                const row = range.startRow;
                const col = range.startColumn;

                const numfmtValue = workbook.getStyles().get(worksheet.getCell(row, col)?.s)?.n;

                const pattern = numfmtValue?.pattern;
                let value: string = localeService.t('sheet.numfmt.general');

                if (pattern) {
                    const item = MENU_OPTIONS.filter((item) => typeof item === 'object' && item.pattern).find(
                        (item) => isPatternEqualWithoutDecimal(pattern, (item as { pattern: string }).pattern)
                    );
                    if (item && typeof item === 'object' && item.pattern) {
                        value = localeService.t(item.label);
                    } else {
                        value = localeService.t('sheet.numfmt.moreFmt');
                    }
                }

                subscribe.next(value);
            }
        })
    ));

    return {
        label: MORE_NUMFMT_TYPE_KEY,
        id: OpenNumfmtPanelOperator.id,
        tooltip: 'sheet.numfmt.title',
        type: MenuItemType.SELECTOR,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [
            {
                label: {
                    name: OPTIONS_KEY,
                    hoverable: false,
                },
            },
        ],
        value$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
};
