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
import type { IMenuSelectorItem } from '@univerjs/ui';
import { DEFAULT_TEXT_FORMAT_EXCEL, fromCallback, ICommandService, isDefaultFormat, isPatternEqualWithoutDecimal, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import { AddDecimalCommand, getCurrencySymbolByLocale, getCurrencySymbolIconByLocale, SetCurrencyCommand, SetPercentCommand, SubtractDecimalCommand } from '@univerjs/sheets-numfmt';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { filter, merge, Observable } from 'rxjs';
import { OpenNumfmtPanelOperator } from '../commands/operations/open.numfmt.panel.operation';
import { MORE_NUMFMT_TYPE_KEY, OPTIONS_KEY } from '../views/components/MoreNumfmtType';

export const MENU_OPTIONS = (currencySymbol: string): Array<{ label: string; pattern: string | null } | '|'> => {
    return [
        {
            label: 'sheet.numfmt.general',
            pattern: null,
        },
        {
            label: 'sheet.numfmt.text',
            pattern: DEFAULT_TEXT_FORMAT_EXCEL,
        },
        '|',
        {
            label: 'sheet.numfmt.number',
            pattern: '0',
        },
        {
            label: 'sheet.numfmt.percent',
            pattern: '0.00%',
        },
        {
            label: 'sheet.numfmt.scientific',
            pattern: '0.00E+00',
        },
        '|',
        {
            label: 'sheet.numfmt.accounting',
            pattern: `"${currencySymbol}" #,##0.00_);[Red]("${currencySymbol}"#,##0.00)`,
        },
        {
            label: 'sheet.numfmt.financialValue',
            pattern: '#,##0.00;[Red]#,##0.00',
        },
        {
            label: 'sheet.numfmt.currency',
            pattern: `"${currencySymbol}"#,##0.00_);[Red]("${currencySymbol}"#,##0.00)`,
        },
        {
            label: 'sheet.numfmt.roundingCurrency',
            pattern: `"${currencySymbol}"#,##0;[Red]"${currencySymbol}"#,##0`,
        },
        '|',
        {
            label: 'sheet.numfmt.date',
            pattern: 'yyyy-mm-dd;@',
        },
        {
            label: 'sheet.numfmt.time',
            pattern: 'am/pm h":"mm":"ss',
        },
        {
            label: 'sheet.numfmt.dateTime',
            pattern: 'yyyy-m-d am/pm h:mm',
        },
        {
            label: 'sheet.numfmt.timeDuration',
            pattern: 'h:mm:ss',
        },
        '|',
        {
            label: 'sheet.numfmt.moreFmt',
            pattern: '',
        },
    ] as Array<{ label: string; pattern: string | null } | '|'>;
};

export const CurrencySymbolIconMenuItem = (accessor: IAccessor) => {
    return {
        icon: new Observable<string>((subscribe) => {
            const localeService = accessor.get(LocaleService);
            subscribe.next(getCurrencySymbolIconByLocale(localeService.getCurrentLocale()).icon);
            return localeService.localeChanged$.subscribe(() => {
                subscribe.next(getCurrencySymbolIconByLocale(localeService.getCurrentLocale()).icon);
            });
        }),
        id: SetCurrencyCommand.id,
        title: 'sheet.numfmt.currency',
        tooltip: 'sheet.numfmt.currency',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
};

export const AddDecimalMenuItem = (accessor: IAccessor) => {
    return {
        icon: 'AddDigitsIcon',
        id: AddDecimalCommand.id,
        title: 'sheet.numfmt.addDecimal',
        tooltip: 'sheet.numfmt.addDecimal',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
};

export const SubtractDecimalMenuItem = (accessor: IAccessor) => {
    return {
        icon: 'ReduceDigitsIcon',
        id: SubtractDecimalCommand.id,
        title: 'sheet.numfmt.subtractDecimal',
        tooltip: 'sheet.numfmt.subtractDecimal',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
};

export const PercentMenuItem = (accessor: IAccessor) => {
    return {
        icon: 'PercentIcon',
        id: SetPercentCommand.id,
        title: 'sheet.numfmt.percent',
        tooltip: 'sheet.numfmt.percent',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),

    };
};

export const FactoryOtherMenuItem = (accessor: IAccessor): IMenuSelectorItem => {
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
                    let value: string = localeService.t('sheet.numfmt.general');

                    if (isDefaultFormat(pattern)) {
                        subscribe.next(value);
                        return;
                    }

                    if (pattern) {
                        const item = MENU_OPTIONS(currencySymbol).filter((item) => typeof item === 'object' && item.pattern).find(
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
        )
    );

    return {
        label: MORE_NUMFMT_TYPE_KEY,
        id: OpenNumfmtPanelOperator.id,
        tooltip: 'sheet.numfmt.title',
        type: MenuItemType.SELECTOR,
        slot: true,
        selections: [
            {
                label: {
                    name: OPTIONS_KEY,
                    hoverable: false,
                    selectable: false,
                },
            },
        ],
        value$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
};
