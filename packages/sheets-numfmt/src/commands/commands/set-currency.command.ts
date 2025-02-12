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

import type { IAccessor, ICommand } from '@univerjs/core';
import type { ISetNumfmtCommandParams } from './set-numfmt.command';
import { CommandType, ICommandService, Range } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { countryCurrencyMap } from '../../base/const/currency-symbols';
import { CURRENCYFORMAT } from '../../base/const/formatdetail';
import { MenuCurrencyService } from '../../service/menu.currency.service';
import { SetNumfmtCommand } from './set-numfmt.command';

export const SetCurrencyCommand: ICommand = {
    id: 'sheet.command.numfmt.set.currency',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const menuCurrencyService = accessor.get(MenuCurrencyService);
        const symbol = countryCurrencyMap[menuCurrencyService.getCurrencySymbol()] || '$';
        const selections = selectionManagerService.getCurrentSelections();
        if (!selections || !selections.length) {
            return false;
        }
        const values: ISetNumfmtCommandParams['values'] = [];

        const suffix = CURRENCYFORMAT[4].suffix(symbol);

        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => {
                values.push({ row, col, pattern: suffix, type: 'currency' });
            });
        });
        const result = await commandService.executeCommand(SetNumfmtCommand.id, { values });
        return result;
    },
};
