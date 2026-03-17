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

import type { IAccessor, ICommand, IRange } from '@univerjs/core';
import type { RepeatLastActionPermission } from '../../services/repeat-last-action.service';
import {
    CommandType,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    getSheetCommandTarget,
    RangeProtectionPermissionEditPoint,
    SetBorderBasicCommand,
    SetRangeValuesCommand,
    SheetPermissionCheckController,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import { IRepeatLastActionService } from '../../services/repeat-last-action.service';

const SET_NUMFMT_COMMAND_ID = 'sheet.command.numfmt.set.numfmt';

export const RepeatLastActionCommand: ICommand = {
    id: 'sheet.command.repeat-last-action',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const repeatLastActionService = accessor.get(IRepeatLastActionService);
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const localeService = accessor.get(LocaleService);
        const permissionCheckController = accessor.get(SheetPermissionCheckController);

        const action = repeatLastActionService.getAction();
        if (!action) {
            return false;
        }

        const selections = selectionManagerService.getCurrentSelections()?.map((selection) => selection.range);
        if (!selections?.length) {
            return false;
        }

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) {
            return false;
        }

        const { worksheet } = target;
        if (!_matchesSelectionRequirement(action.selectionRequirement, selections, worksheet.getMaxRows() - 1, worksheet.getMaxColumns() - 1)) {
            return false;
        }

        _ensurePermission(accessor, action.permission, permissionCheckController, localeService);

        return repeatLastActionService.runWithoutRecording(async () => {
            switch (action.kind) {
                case 'command':
                    return commandService.executeCommand(action.commandId, action.params);
                case 'set-border-basic':
                    return commandService.executeCommand(SetBorderBasicCommand.id, {
                        value: action.value,
                        ranges: selections,
                    });
                case 'set-numfmt':
                    return commandService.executeCommand(SET_NUMFMT_COMMAND_ID, {
                        values: _buildNumfmtValues(selections, action.pattern, action.type),
                    });
                case 'set-range-values':
                    return commandService.executeCommand(SetRangeValuesCommand.id, {
                        value: action.value,
                    });
                default:
                    return false;
            }
        });
    },
};

function _ensurePermission(
    accessor: IAccessor,
    permission: RepeatLastActionPermission,
    permissionCheckController: SheetPermissionCheckController,
    localeService: LocaleService
) {
    if (permission === 'none') {
        return;
    }

    const hasPermission = permission === 'cellStyle'
        ? permissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
            worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
        })
        : permissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
            worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission],
        });

    if (hasPermission) {
        return;
    }

    const errorMessage = permission === 'cellStyle'
        ? localeService.t('permission.dialog.setStyleErr')
        : localeService.t('permission.dialog.editErr');

    permissionCheckController.blockExecuteWithoutPermission(errorMessage);
}

function _matchesSelectionRequirement(
    selectionRequirement: 'none' | 'fullRows' | 'fullColumns',
    selections: IRange[],
    maxRow: number,
    maxColumn: number
): boolean {
    if (selectionRequirement === 'none') {
        return true;
    }

    if (selectionRequirement === 'fullRows') {
        return selections.every((range) => range.startColumn === 0 && range.endColumn === maxColumn);
    }

    return selections.every((range) => range.startRow === 0 && range.endRow === maxRow);
}

function _buildNumfmtValues(selections: IRange[], pattern?: string, type?: string) {
    const values: Array<{ pattern?: string; row: number; col: number; type?: string }> = [];

    selections.forEach((range) => {
        for (let row = range.startRow; row <= range.endRow; row++) {
            for (let col = range.startColumn; col <= range.endColumn; col++) {
                values.push({
                    row,
                    col,
                    pattern,
                    type,
                });
            }
        }
    });

    return values;
}
