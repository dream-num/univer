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
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import { ClearSelectionContentCommand, getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';

/**
 * The command to clear content in current selected ranges.
 */
export const CustomClearSelectionContentCommand: ICommand = {
    id: 'sheet.command.custom-clear-selection-content',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { unitId, subUnitId, worksheet } = target;

        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const range = selectionManagerService.getCurrentLastSelection()?.range;
        if (!range) return false;

        const commandService = accessor.get(ICommandService);
        const { startRow, endRow, startColumn, endColumn } = range;
        const isSingleCell = startRow === endRow && startColumn === endColumn;

        if (isSingleCell && startRow === 2 && startColumn === 2) {
            // If the range is cell C3, clear the entire row.
            return commandService.executeCommand(ClearSelectionContentCommand.id, {
                unitId,
                subUnitId,
                ranges: [
                    {
                        startRow,
                        endRow,
                        startColumn: 0,
                        endColumn: worksheet.getMaxColumns() - 1,
                    },
                ],
            });
        } else {
            // Clear the selected range.
            return commandService.executeCommand(ClearSelectionContentCommand.id, {
                unitId,
                subUnitId,
                ranges: [
                    {
                        startRow,
                        endRow,
                        startColumn,
                        endColumn,
                    },
                ],
            });
        }
    },
};
