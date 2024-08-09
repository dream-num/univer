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

import type { IAccessor, ICommand } from '@univerjs/core';
import { CommandType, ICommandService, Range } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';

import { CURRENCYFORMAT } from '../../base/const/FORMATDETAIL';
import type { ISetNumfmtCommandParams } from './set-numfmt.command';
import { SetNumfmtCommand } from './set-numfmt.command';

// Mapping of country codes to currency symbols, including Euro countries
const currencyMap: Record<string, string> = {
    "US": "$", // United States Dollar
    "CA": "C$", // Canadian Dollar
    "GB": "£", // British Pound Sterling
    "JP": "¥", // Japanese Yen
    "IN": "₹", // Indian Rupee
    "AU": "A$", // Australian Dollar
    "CN": "¥", // Chinese Yuan
    "KR": "₩", // South Korean Won
    "RU": "₽", // Russian Ruble
    // Euro countries
    "AT": "€", "BE": "€", "CY": "€", "EE": "€", "FI": "€", "FR": "€",
    "DE": "€", "GR": "€", "IE": "€", "IT": "€", "LV": "€", "LT": "€",
    "LU": "€", "MT": "€", "NL": "€", "PT": "€", "SK": "€", "SI": "€", "ES": "€",
    // Add more mappings as needed
};

function getCurrencySymbol(): string {
    // Get the user's locale
    const userLocale: string = navigator.language || (navigator as any).userLanguage;
    const regionCode: string = userLocale.split('-')[1] || userLocale.split('-')[0];

    // Return the corresponding currency symbol or default to USD
    return currencyMap[regionCode] || "$";
}

export const SetCurrencyCommand: ICommand = {
    id: 'sheet.command.numfmt.set.currency',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);

        const selections = selectionManagerService.getCurrentSelections();
        if (!selections || !selections.length) {
            return false;
        }
        const values: ISetNumfmtCommandParams['values'] = [];

        const suffix = CURRENCYFORMAT[0].suffix(getCurrencySymbol());

        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => {
                values.push({ row, col, pattern: suffix, type: 'currency' });
            });
        });
        const result = await commandService.executeCommand(SetNumfmtCommand.id, { values });
        return result;
    },
};
