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
import { AUTO_FILL_APPLY_TYPE, AutoFillCommand, getSheetCommandTarget, IAutoFillService, SheetsSelectionsService } from '@univerjs/sheets';

export const SheetCopyDownCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-down',
    handler: async (accessor: IAccessor) => {
        const selectionService = accessor.get(SheetsSelectionsService);
        const selection = selectionService.getCurrentLastSelection();
        if (!selection) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const { startRow, endRow, startColumn, endColumn } = selection.range;

        let sourceRange;
        let targetRange;

        if (startRow === endRow) {
            if (startRow === 0) return false;
            sourceRange = { startRow: startRow - 1, endRow: startRow - 1, startColumn, endColumn };
            targetRange = { startRow: startRow - 1, endRow, startColumn, endColumn };
        } else {
            sourceRange = { startRow, endRow: startRow, startColumn, endColumn };
            targetRange = { startRow, endRow, startColumn, endColumn };
        }

        const result = await accessor.get(ICommandService).executeCommand(AutoFillCommand.id, {
            sourceRange,
            targetRange,
            unitId,
            subUnitId,
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });

        if (result) {
            accessor.get(IAutoFillService).setShowMenu(false);
        }

        return result;
    },
};

export const SheetCopyRightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-right',
    handler: async (accessor: IAccessor) => {
        const selectionService = accessor.get(SheetsSelectionsService);
        const selection = selectionService.getCurrentLastSelection();
        if (!selection) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const { startRow, endRow, startColumn, endColumn } = selection.range;

        let sourceRange;
        let targetRange;

        if (startColumn === endColumn) {
            if (startColumn === 0) return false;
            sourceRange = { startRow, endRow, startColumn: startColumn - 1, endColumn: startColumn - 1 };
            targetRange = { startRow, endRow, startColumn: startColumn - 1, endColumn };
        } else {
            sourceRange = { startRow, endRow, startColumn, endColumn: startColumn };
            targetRange = { startRow, endRow, startColumn, endColumn };
        }

        const result = await accessor.get(ICommandService).executeCommand(AutoFillCommand.id, {
            sourceRange,
            targetRange,
            unitId,
            subUnitId,
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });

        if (result) {
            accessor.get(IAutoFillService).setShowMenu(false);
        }

        return result;
    },
};
