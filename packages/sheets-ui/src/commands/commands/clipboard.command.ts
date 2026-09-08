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

import type { IAccessor, ICommand, IMultiCommand, Workbook } from '@univerjs/core';
import type { ISheetRangeLocation } from '@univerjs/sheets';
import type { LocaleKey } from '../../locale/types';
import type { IPasteHookKeyType } from '../../services/clipboard/type';
import { CommandType, ICommandService, IPermissionService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import {
    getSheetCommandTarget,
    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionViewPoint,
    SheetPermissionCheckController,
    WorkbookCopyPermission,
    WorkbookEditablePermission,
    WorksheetCopyPermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetSetColumnStylePermission,
} from '@univerjs/sheets';
import { CopyCommand, CutCommand, IClipboardInterfaceService, PasteCommand, SheetPasteShortKeyCommandName } from '@univerjs/ui';
import { whenSheetFocused } from '../../controllers/shortcuts/utils';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '../../services/clipboard/clipboard.service';

const SHEET_CLIPBOARD_PRIORITY = 998;

export const SheetCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'sheet.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: SHEET_CLIPBOARD_PRIORITY,
    preconditions: whenSheetFocused,
    handler: async (accessor) => {
        checkSheetClipboardPermission(accessor, CopyCommand.id);
        const sheetClipboardService = accessor.get(ISheetClipboardService);
        return sheetClipboardService.copy();
    },
};

export const SheetCutCommand: IMultiCommand = {
    id: CutCommand.id,
    name: 'sheet.command.cut',
    type: CommandType.COMMAND,
    multi: true,
    priority: SHEET_CLIPBOARD_PRIORITY,
    preconditions: whenSheetFocused,
    handler: async (accessor) => {
        checkSheetClipboardPermission(accessor, CutCommand.id);
        const sheetClipboardService = accessor.get(ISheetClipboardService);
        return sheetClipboardService.cut();
    },
};

export interface ISheetPasteParams {
    value: string;
    target?: ISheetRangeLocation;
}

export interface ISheetPasteByShortKeyParams {
    htmlContent?: string;
    textContent?: string;
    files?: File[];
    formulaClipboardPayload?: string;
    target?: ISheetRangeLocation;
}

export const SheetPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    type: CommandType.COMMAND,
    multi: true,
    name: 'sheet.command.paste',
    priority: SHEET_CLIPBOARD_PRIORITY,
    preconditions: whenSheetFocused,
    handler: async (accessor: IAccessor, params: ISheetPasteParams) => {
        const sheetClipboardService = accessor.get(ISheetClipboardService);
        const target = params?.target ?? sheetClipboardService.capturePasteTarget();
        if (!target) {
            return false;
        }
        const instanceService = accessor.get(IUniverInstanceService);
        const workbook = instanceService.getUnit<Workbook>(target.unitId);
        const worksheet = workbook?.getSheetBySheetId(target.subUnitId);
        if (!workbook || !worksheet) {
            return false;
        }
        const pasteParams = { value: params?.value, target };
        checkSheetClipboardPermission(accessor, PasteCommand.id, pasteParams);
        // const messageService = accessor.get(IMessageService);

        // TODO: @yuhongz: check if there is excel content in the clipboard, if so
        // ask users to use shortcuts instead.

        const clipboardInterfaceService = accessor.get(IClipboardInterfaceService);
        if (clipboardInterfaceService.supportClipboard) {
            const clipboardItems = await clipboardInterfaceService.read();
            // A restored unit may reuse the same IDs but must not inherit an old clipboard request.
            if (instanceService.getUnit(target.unitId) !== workbook || workbook.getSheetBySheetId(target.subUnitId) !== worksheet) {
                return false;
            }
            if (clipboardItems.length !== 0) {
                checkSheetClipboardPermission(accessor, PasteCommand.id, pasteParams);
                return sheetClipboardService.paste(clipboardItems[0], params?.value, target);
            }
        }

        const lastCopyId = sheetClipboardService.copyContentCache().getLastCopyId();
        if (lastCopyId) {
            console.warn('Since the current environment does not support the Clipboard API, we will use the internal copyId to paste the content.');
            return sheetClipboardService.pasteByCopyId(lastCopyId, params?.value, target);
        }

        return false;
    },
};

export const SheetPasteShortKeyCommand: ICommand = {
    id: SheetPasteShortKeyCommandName,
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISheetPasteByShortKeyParams) => {
        const clipboardService = accessor.get(ISheetClipboardService);
        const target = params.target ?? clipboardService.capturePasteTarget();
        if (!target) {
            return false;
        }
        checkSheetClipboardPermission(accessor, PasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
            target,
        });
        const { htmlContent, textContent, files, formulaClipboardPayload } = params;
        return clipboardService.legacyPaste(htmlContent, textContent, files, formulaClipboardPayload, target);
    },
};

function checkSheetClipboardPermission(accessor: IAccessor, commandId: string, params?: ISheetPasteParams): void {
    const permissionCheckController = accessor.get(SheetPermissionCheckController);
    let permission = true;
    let errorKey: LocaleKey = 'sheets-ui.permission.dialog.commonErr';

    switch (commandId) {
        case CopyCommand.id:
            permission = permissionCheckController.permissionCheckWithRanges({
                workbookTypes: [WorkbookCopyPermission],
                worksheetTypes: [WorksheetCopyPermission],
                rangeTypes: [RangeProtectionPermissionViewPoint],
            });
            errorKey = 'sheets-ui.permission.dialog.copyErr';
            break;
        case CutCommand.id:
            permission = permissionCheckController.permissionCheckWithRanges({
                workbookTypes: [WorkbookCopyPermission, WorkbookEditablePermission],
                worksheetTypes: [WorksheetCopyPermission, WorksheetEditPermission],
                rangeTypes: [RangeProtectionPermissionViewPoint, RangeProtectionPermissionEditPoint],
            });
            errorKey = 'sheets-ui.permission.dialog.cutErr';
            break;
        case PasteCommand.id:
            permission = checkSheetPastePermission(permissionCheckController, params);
            errorKey = 'sheets-ui.permission.dialog.pasteErr';
            break;
    }

    if (permission) {
        return;
    }

    const localeService = accessor.get(LocaleService);
    let errorMsg = localeService.t<LocaleKey>(errorKey);
    if (commandId === CopyCommand.id || commandId === CutCommand.id) {
        const instanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(instanceService);
        const permissionService = accessor.get(IPermissionService);
        if (
            target &&
            !permissionService.getPermissionPoint(new WorkbookCopyPermission(target.unitId).id)?.value
        ) {
            errorMsg = localeService.t<LocaleKey>('sheets-ui.permission.dialog.workbookCopyErr');
        }
    }

    permissionCheckController.blockExecuteWithoutPermission(errorMsg);
}

function checkSheetPastePermission(
    permissionCheckController: SheetPermissionCheckController,
    params?: ISheetPasteParams
): boolean {
    const target = params?.target;
    const ranges = target ? [target.range] : undefined;
    if (
        params?.value === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE ||
        params?.value === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA ||
        params?.value === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT
    ) {
        return permissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }, ranges, target?.unitId, target?.subUnitId);
    }

    if (params?.value === PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH) {
        return permissionCheckController.permissionCheckWithRanges({
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [
                WorksheetEditPermission,
                WorksheetSetCellValuePermission,
                WorksheetSetCellStylePermission,
                WorksheetSetColumnStylePermission,
            ],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }, ranges, target?.unitId, target?.subUnitId);
    }

    return permissionCheckController.permissionCheckWithRanges({
        workbookTypes: [WorkbookEditablePermission],
        worksheetTypes: [WorksheetSetCellValuePermission, WorksheetSetCellStylePermission, WorksheetEditPermission],
        rangeTypes: [RangeProtectionPermissionEditPoint],
    }, ranges, target?.unitId, target?.subUnitId);
}

export const SheetPasteValueCommand: ICommand = {
    id: 'sheet.command.paste-value',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
        });
    },
};

export const SheetPasteFormatCommand: ICommand = {
    id: 'sheet.command.paste-format',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
        });
    },
};

export const SheetPasteColWidthCommand: ICommand = {
    id: 'sheet.command.paste-col-width',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
        });
    },
};

export const SheetPasteBesidesBorderCommand: ICommand = {
    id: 'sheet.command.paste-besides-border',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_BESIDES_BORDER,
        });
    },
};

export const SheetOptionalPasteCommand: ICommand = {
    id: 'sheet.command.optional-paste',
    type: CommandType.COMMAND,
    handler: async (accessor, { type }: { type: IPasteHookKeyType }) => {
        const clipboardService = accessor.get(ISheetClipboardService);

        return clipboardService.rePasteWithPasteType(type);
    },
};
