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
import type { LocaleKey } from '../locale/types';
import {
    DEFAULT_TEXT_FORMAT_EXCEL,
    LocaleService,
    RegionService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import {
    AddDecimalCommand,
    CURRENCYFORMAT,
    getCurrencySymbolByLocale,
    NUMBERFORMAT,
    SetCurrencyCommand,
    SetPercentCommand,
    SubtractDecimalCommand,
} from '@univerjs/sheets-numfmt';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { SetMobileNumfmtCommand } from '../commands/commands/set-mobile-numfmt.command';
import { MENU_OPTIONS } from './number-format-options';
import { getCurrentNumfmtPattern$, getNumberFormatLabelKey } from './numfmt-menu-util';

export const MOBILE_NUMFMT_MENU_ID = 'sheet.menu.mobile.numfmt';
export const MOBILE_CUSTOM_NUMFMT_COMPONENT = 'sheets-numfmt-ui.mobile.custom-format';

export interface IMobileNumberFormatMenuConfig {
    kind: 'number-format';
    title: LocaleKey;
    commandId: string;
    detailTitle: LocaleKey;
    customTitle: LocaleKey;
    customComponent: string;
    quickOptions: Array<{
        label: LocaleKey;
        commandId: string;
        value?: string;
    }>;
    decimalOptions: Array<{
        label: LocaleKey;
        commandId: string;
    }>;
    detailOptions: Array<{
        label?: LocaleKey;
        value?: string | null;
        divider?: boolean;
        custom?: boolean;
    }>;
    customPatterns: string[];
}

export function createMobileNumberFormatMenuConfig(currencySymbol: string): IMobileNumberFormatMenuConfig {
    const detailOptions: IMobileNumberFormatMenuConfig['detailOptions'] = MENU_OPTIONS(currencySymbol)
        .slice(0, -1)
        .map((item) => item === '|'
            ? { divider: true }
            : { label: item.label, value: item.pattern });
    detailOptions.push({ label: 'sheets-numfmt-ui.customFormat', custom: true });

    return {
        kind: 'number-format',
        title: 'sheets-numfmt-ui.title',
        commandId: SetMobileNumfmtCommand.id,
        detailTitle: 'sheets-numfmt-ui.moreFmt',
        customTitle: 'sheets-numfmt-ui.customFormat',
        customComponent: MOBILE_CUSTOM_NUMFMT_COMPONENT,
        quickOptions: [
            { label: 'sheets-numfmt-ui.percent', commandId: SetPercentCommand.id },
            { label: 'sheets-numfmt-ui.currency', commandId: SetCurrencyCommand.id },
            { label: 'sheets-numfmt-ui.date', commandId: SetMobileNumfmtCommand.id, value: 'yyyy-mm-dd;@' },
            {
                label: 'sheets-numfmt-ui.text',
                commandId: SetMobileNumfmtCommand.id,
                value: DEFAULT_TEXT_FORMAT_EXCEL,
            },
        ],
        decimalOptions: [
            { label: 'sheets-numfmt-ui.subtractDecimal', commandId: SubtractDecimalCommand.id },
            { label: 'sheets-numfmt-ui.addDecimal', commandId: AddDecimalCommand.id },
        ],
        detailOptions,
        customPatterns: [...new Set([
            ...CURRENCYFORMAT.map((item) => item.suffix(currencySymbol)),
            ...NUMBERFORMAT.map((item) => item.suffix),
        ])],
    };
}

export function FactoryMobileOtherMenuItem(
    accessor: IAccessor
): IMenuSelectorItem<LocaleKey, string> & { mobileNumberFormat: IMobileNumberFormatMenuConfig } {
    const localeService = accessor.get(LocaleService);
    const regionService = accessor.get(RegionService);
    const value$ = combineLatest([
        getCurrentNumfmtPattern$(accessor),
        regionService.currentRegion$,
        localeService.currentLocale$,
    ]).pipe(
        map(([pattern, region]) => localeService.t<LocaleKey>(getNumberFormatLabelKey(pattern, getCurrencySymbolByLocale(region)))),
        distinctUntilChanged()
    );

    return {
        id: MOBILE_NUMFMT_MENU_ID,
        title: 'sheets-numfmt-ui.title',
        tooltip: 'sheets-numfmt-ui.title',
        type: MenuItemType.SELECTOR,
        selections: [],
        value$,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
        mobileNumberFormat: createMobileNumberFormatMenuConfig(
            getCurrencySymbolByLocale(regionService.getCurrentRegion())
        ),
    };
}
