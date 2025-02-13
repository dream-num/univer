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
import { CommandType, ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import type { IRemoveRowColCommandParams } from '@univerjs/sheets';
import { getSheetCommandTarget, RemoveColCommand, RemoveRowCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { IConfirmService } from '@univerjs/ui';

import { isAllColumnsCovered, isAllRowsCovered } from './utils/selection-utils';

export const RemoveRowConfirmCommand: ICommand = {
    id: 'sheet.command.remove-row-confirm',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);

        let range = params?.range;
        if (!range) {
            range = selectionManagerService.getCurrentLastSelection()?.range;
        }
        if (!range) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        const allRowRanges = worksheet.getVisibleRows();

        if (isAllRowsCovered(allRowRanges, [range])) {
            const confirmService = accessor.get(IConfirmService);
            const localeService = accessor.get(LocaleService);

            await confirmService.confirm({
                id: 'sheet.confirm.remove-row',
                title: {
                    title: localeService.t('info.problem'),
                },
                children: { title: localeService.t('rightClick.deleteAllRowsAlert') },
                cancelText: localeService.t('button.cancel'),
                confirmText: localeService.t('button.confirm'),
            });

            return false;
        }

        await commandService.executeCommand(RemoveRowCommand.id, { range });
        return true;
    },
};

export const RemoveColConfirmCommand: ICommand = {
    id: 'sheet.command.remove-col-confirm',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);

        let range = params?.range;
        if (!range) {
            range = selectionManagerService.getCurrentLastSelection()?.range;
        }
        if (!range) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        const allColumnRanges = worksheet.getVisibleCols();

        if (isAllColumnsCovered(allColumnRanges, [range])) {
            const confirmService = accessor.get(IConfirmService);
            const localeService = accessor.get(LocaleService);

            await confirmService.confirm({
                id: 'sheet.confirm.remove-col',
                title: {
                    title: localeService.t('info.problem'),
                },
                children: { title: localeService.t('rightClick.deleteAllColumnsAlert') },
                cancelText: localeService.t('button.cancel'),
                confirmText: localeService.t('button.confirm'),
            });

            return false;
        }

        await commandService.executeCommand(RemoveColCommand.id, { range });
        return true;
    },
};
