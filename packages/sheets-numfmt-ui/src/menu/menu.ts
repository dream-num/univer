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
    DEFAULT_TEXT_FORMAT_EXCEL,
    fromCallback,
    ICommandService,
    isDefaultFormat,
    isPatternEqualWithoutDecimal,
    IUniverInstanceService,
    LocaleService,
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
import { filter, merge, Observable } from 'rxjs';
import { OpenNumfmtPanelOperator } from '../commands/operations/open.numfmt.panel.operation';
import { MORE_NUMFMT_TYPE_KEY, OPTIONS_KEY } from '../views/components/MoreNumfmtType';

export const MENU_OPTIONS = (currencySymbol: string): Array<{
    label: LocaleKey;
    pattern: string | null;
} | '|'> => {
    return [
        {
            label: 'sheets-numfmt-ui.general',
            pattern: null,
        },
        {
            label: 'sheets-numfmt-ui.text',
            pattern: DEFAULT_TEXT_FORMAT_EXCEL,
        },
        '|',
        {
            label: 'sheets-numfmt-ui.number',
            pattern: '0',
        },
        {
            label: 'sheets-numfmt-ui.percent',
            pattern: '0.00%',
        },
        {
            label: 'sheets-numfmt-ui.scientific',
            pattern: '0.00E+00',
        },
        '|',
        {
            label: 'sheets-numfmt-ui.accounting',
            pattern: `"${currencySymbol}" #,##0.00_);[Red]("${currencySymbol}"#,##0.00)`,
        },
        {
            label: 'sheets-numfmt-ui.financialValue',
            pattern: '#,##0.00;[Red]#,##0.00',
        },
        {
            label: 'sheets-numfmt-ui.currency',
            pattern: `"${currencySymbol}"#,##0.00_);[Red]("${currencySymbol}"#,##0.00)`,
        },
        {
            label: 'sheets-numfmt-ui.roundingCurrency',
            pattern: `"${currencySymbol}"#,##0;[Red]"${currencySymbol}"#,##0`,
        },
        '|',
        {
            label: 'sheets-numfmt-ui.date',
            pattern: 'yyyy-mm-dd;@',
        },
        {
            label: 'sheets-numfmt-ui.time',
            pattern: 'am/pm h":"mm":"ss',
        },
        {
            label: 'sheets-numfmt-ui.dateTime',
            pattern: 'yyyy-m-d am/pm h:mm',
        },
        {
            label: 'sheets-numfmt-ui.timeDuration',
            pattern: 'h:mm:ss',
        },
        '|',
        {
            label: 'sheets-numfmt-ui.moreFmt',
            pattern: '',
        },
    ];
};

export function CurrencySymbolIconMenuItem(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        icon: new Observable<string>((subscribe) => {
            const localeService = accessor.get(LocaleService);
            subscribe.next(getCurrencySymbolIconByLocale(localeService.getCurrentLocale()).icon);
            return localeService.localeChanged$.subscribe(() => {
                subscribe.next(getCurrencySymbolIconByLocale(localeService.getCurrentLocale()).icon);
            });
        }),
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

    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandList = [RemoveNumfmtMutation.id, SetNumfmtMutation.id];
    const value$ = deriveStateFromActiveSheet$(
        univerInstanceService,
        '',
        ({ workbook, worksheet }) => new Observable((subscribe) =>
            merge(
                selectionManagerService.selectionMoveEnd$,
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
                    const currencySymbol = getCurrencySymbolByLocale(localeService.getCurrentLocale());

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
