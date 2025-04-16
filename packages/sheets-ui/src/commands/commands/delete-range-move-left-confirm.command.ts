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

import type { ICommand, IRange } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, LocaleService, Rectangle } from '@univerjs/core';
import { DeleteRangeMoveLeftCommand, getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { IConfirmService } from '@univerjs/ui';

export const DeleteRangeMoveLeftConfirmCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-range-move-left-confirm',
    handler: async (accessor) => {
        const confirmService = accessor.get(IConfirmService);
        const commandService = accessor.get(ICommandService);
        const localeService = accessor.get(LocaleService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selection = selectionManagerService.getCurrentSelections();
        if (!selection) {
            return false;
        }

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        let range = selection[0].range;
        if (!range) {
            return false;
        }

        range = { ...range, endColumn: worksheet.getColumnCount() - 1 };

        const getRowLength = (range: IRange) => range.endRow - range.startRow;
        const mergeData = worksheet.getMergeData().find((mergeRange) => {
            const interSectedRange = Rectangle.getIntersects(mergeRange, range);
            return interSectedRange ? getRowLength(mergeRange) > getRowLength(interSectedRange) : false;
        });

        if (!mergeData) {
            return commandService.executeCommand(DeleteRangeMoveLeftCommand.id);
        }

        const result = await confirmService.confirm({
            id: DeleteRangeMoveLeftConfirmCommand.id,
            title: { title: localeService.t('merge.confirm.waring') },
            children: { title: localeService.t('merge.confirm.dismantleMergeCellWaring') },
            cancelText: localeService.t('button.cancel'),
            confirmText: localeService.t('button.confirm'),
        });
        if (result) {
            return commandService.executeCommand(DeleteRangeMoveLeftCommand.id);
        }
        return true;
    },
};
