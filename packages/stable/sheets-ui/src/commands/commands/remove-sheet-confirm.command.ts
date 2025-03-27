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
import { CommandType, ICommandService, LocaleService } from '@univerjs/core';
import { RemoveSheetCommand } from '@univerjs/sheets';
import { IConfirmService } from '@univerjs/ui';

interface IRemoveSheetConfirmCommandParams {
    subUnitId: string;
}

export const RemoveSheetConfirmCommand: ICommand = {
    id: 'sheet.command.remove-sheet-confirm',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IRemoveSheetConfirmCommandParams) => {
        const { subUnitId } = params;
        const confirmService = accessor.get(IConfirmService);
        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);
        const result = await confirmService.confirm({
            id: 'sheet.confirm.remove-sheet',
            title: {
                title: localeService.t('sheetConfig.deleteSheet'),
            },
            children: { title: localeService.t('sheetConfig.deleteSheetContent') },
            cancelText: localeService.t('button.cancel'),
            confirmText: localeService.t('button.confirm'),
        });

        if (result) {
            await commandService.executeCommand(RemoveSheetCommand.id, { subUnitId });
            return true;
        }

        return false;
    },
};
