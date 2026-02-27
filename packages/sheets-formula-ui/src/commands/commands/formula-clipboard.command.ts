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

import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_COPY, PREDEFINED_HOOK_NAME_PASTE, SheetPasteCommand } from '@univerjs/sheets-ui';

export const SheetCopyFormulaOnlyCommand: ICommand = {
    id: 'sheet.command.copy-formula-only',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const sheetClipboardService = accessor.get(ISheetClipboardService);
        return sheetClipboardService.copy({
            copyHookType: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY,
        });
    },
};

export const SheetOnlyPasteFormulaCommand: ICommand = {
    id: 'sheet.command.paste-formula',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA,
        });
    },
};
