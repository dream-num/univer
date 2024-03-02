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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, Range } from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetNumfmtCommandParams } from './set-numfmt.command';
import { SetNumfmtCommand } from './set-numfmt.command';

export const SetPercentCommand: ICommand = {
    id: 'sheet.command.numfmt.set.percent',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const selections = selectionManagerService.getSelections();
        if (!selections || !selections.length) {
            return false;
        }
        const values: ISetNumfmtCommandParams['values'] = [];

        const suffix = '0%';

        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => {
                values.push({ row, col, pattern: suffix, type: 'percent' });
            });
        });
        const result = await commandService.executeCommand(SetNumfmtCommand.id, { values });
        return result;
    },
};
