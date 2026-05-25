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
import { CommandType, LocaleService } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    SheetPermissionCheckController,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetSetColumnStylePermission,
    WorksheetSetRowStylePermission,
} from '@univerjs/sheets';
import { IRepeatLastActionService, RepeatLastActionPermission } from '../../services/repeat-last-action.service';

const permissionCheckMap = {
    [RepeatLastActionPermission.Editable]: {
        permissionTypes: {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        },
        errorMessageKey: 'sheets-ui.permission.dialog.editErr',
    },
    [RepeatLastActionPermission.CellStyle]: {
        permissionTypes: {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        },
        errorMessageKey: 'sheets-ui.permission.dialog.setStyleErr',
    },
    [RepeatLastActionPermission.CellValue]: {
        permissionTypes: {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        },
        errorMessageKey: 'sheets-ui.permission.dialog.editErr',
    },
    [RepeatLastActionPermission.RowStyle]: {
        permissionTypes: {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        },
        errorMessageKey: 'sheets-ui.permission.dialog.setRowColStyleErr',
    },
    [RepeatLastActionPermission.ColumnStyle]: {
        permissionTypes: {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        },
        errorMessageKey: 'sheets-ui.permission.dialog.setRowColStyleErr',
    },
};

export const RepeatLastActionCommand: ICommand = {
    id: 'sheet.command.repeat-last-action',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((selection) => selection.range);
        if (!selections?.length) {
            return false;
        }

        const repeatLastActionService = accessor.get(IRepeatLastActionService);
        const sheetPermissionCheckController = accessor.get(SheetPermissionCheckController);
        const localeService = accessor.get(LocaleService);
        const actionPermissionType = repeatLastActionService.getActionPermission();

        if (Array.isArray(actionPermissionType)) {
            for (const permissionType of actionPermissionType) {
                if (permissionType === RepeatLastActionPermission.None) {
                    continue;
                }

                const permissionConfig = permissionCheckMap[permissionType];
                const permission = sheetPermissionCheckController.permissionCheckWithRanges(permissionConfig.permissionTypes);
                if (!permission) {
                    sheetPermissionCheckController.blockExecuteWithoutPermission(localeService.t(permissionConfig.errorMessageKey));
                    return false;
                }
            }
        } else if (actionPermissionType !== RepeatLastActionPermission.None) {
            const permissionConfig = permissionCheckMap[actionPermissionType];
            const permission = sheetPermissionCheckController.permissionCheckWithRanges(permissionConfig.permissionTypes);
            if (!permission) {
                sheetPermissionCheckController.blockExecuteWithoutPermission(localeService.t(permissionConfig.errorMessageKey));
                return false;
            }
        }

        return await repeatLastActionService.runWithoutRecording(selections);
    },
};
