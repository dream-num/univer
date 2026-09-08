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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import {
    fromCallback,
    ICommandService,
    isDefaultFormat,
    isPatternEqualWithoutDecimal,
    IUniverInstanceService,
    LocaleService,
    RegionService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import {
    AddDecimalCommand,
    getCurrencySymbolByLocale,
    getCurrencySymbolIconByLocale,
    SetCurrencyCommand,
    SetPercentCommand,
    SubtractDecimalCommand,
} from '@univerjs/sheets-numfmt';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { filter, map, merge, Observable } from 'rxjs';
import { OpenNumfmtPanelOperator } from '../commands/operations/open.numfmt.panel.operation';
import { MORE_NUMFMT_TYPE_KEY, OPTIONS_KEY } from '../views/components/MoreNumfmtType';
import { MENU_OPTIONS } from './number-format-options';

export function CurrencySymbolIconMenuItem(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const regionService = accessor.get(RegionService);

    return {
        icon: regionService.currentRegion$.pipe(map((region) => getCurrencySymbolIconByLocale(region).icon)),
        id: SetCurrencyCommand.id,
        title: 'sheets-numfmt-ui.currency',
        tooltip: 'sheets-numfmt-ui.currency',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
};

export function AddDecimalMenuItem(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        icon: 'AddDigitsIcon',
        id: AddDecimalCommand.id,
        title: 'sheets-numfmt-ui.addDecimal',
        tooltip: 'sheets-numfmt-ui.addDecimal',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
};

export function SubtractDecimalMenuItem(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        icon: 'ReduceDigitsIcon',
        id: SubtractDecimalCommand.id,
        title: 'sheets-numfmt-ui.subtractDecimal',
        tooltip: 'sheets-numfmt-ui.subtractDecimal',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
};

export function PercentMenuItem(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        icon: 'PercentIcon',
        id: SetPercentCommand.id,
        title: 'sheets-numfmt-ui.percent',
        tooltip: 'sheets-numfmt-ui.percent',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),

    };
};

export function FactoryOtherMenuItem(accessor: IAccessor): IMenuSelectorItem<LocaleKey, string> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const localeService = accessor.get(LocaleService);
    const regionService = accessor.get(RegionService);

    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandList = [RemoveNumfmtMutation.id, SetNumfmtMutation.id];
    const value$ = deriveStateFromActiveSheet$(
        univerInstanceService,
        '',
        ({ workbook, worksheet }) => new Observable((subscribe) =>
            merge(
                selectionManagerService.selectionMoveEnd$,
                regionService.currentRegion$,
                fromCallback(commandService.onCommandExecuted.bind(commandService)).pipe(
                    filter(([commandInfo]) => commandList.includes(commandInfo.id))
                )
            ).subscribe(() => {
                const selections = selectionManagerService.getCurrentSelections();
                if (selections && selections[0]) {
                    const range = selections[0].range;
                    const row = range.startRow;
                    const col = range.startColumn;
                    const numfmtValue = workbook.getStyles().get(worksheet.getCell(row, col)?.s)?.n;
                    const pattern = numfmtValue?.pattern;
                    const currencySymbol = getCurrencySymbolByLocale(regionService.getCurrentRegion());

                    // Adapts the 'General' obtained during import, or the 'General' set manually
                    let value: string = localeService.t<LocaleKey>('sheets-numfmt-ui.general');

                    if (isDefaultFormat(pattern)) {
                        subscribe.next(value);
                        return;
                    }

                    if (pattern) {
                        const item = MENU_OPTIONS(currencySymbol).filter((item) => typeof item === 'object' && item.pattern).find(
                            (item) => isPatternEqualWithoutDecimal(pattern, (item as { pattern: string }).pattern)
                        );
                        if (item && typeof item === 'object' && item.pattern) {
                            value = localeService.t<LocaleKey>(item.label);
                        } else {
                            value = localeService.t<LocaleKey>('sheets-numfmt-ui.moreFmt');
                        }
                    }

                    subscribe.next(value);
                }
            })
        )
    );

    return {
        label: MORE_NUMFMT_TYPE_KEY,
        id: OpenNumfmtPanelOperator.id,
        tooltip: 'sheets-numfmt-ui.title',
        type: MenuItemType.SELECTOR,
        slot: true,
        selections: [{
            label: {
                name: OPTIONS_KEY,
                hoverable: false,
                selectable: false,
            },
        }],
        value$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
};
