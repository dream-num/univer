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

import type { IAccessor } from '@univerjs/core';
import { ICommandService } from '@univerjs/core';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_COPY, PREDEFINED_HOOK_NAME_PASTE, SheetPasteCommand } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetCopyFormulaOnlyCommand, SheetOnlyPasteFormulaCommand } from '../formula-clipboard.command';

describe('formula clipboard commands', () => {
    it('copies only formulas through the clipboard hook', async () => {
        const sheetClipboardService = { copy: vi.fn(() => true) };
        const accessor = {
            get: (token: unknown) => {
                if (token === ISheetClipboardService) return sheetClipboardService;
                throw new Error(`Unknown dependency: ${String(token)}`);
            },
        } as IAccessor;

        await expect(SheetCopyFormulaOnlyCommand.handler(accessor)).resolves.toBe(true);
        expect(sheetClipboardService.copy).toHaveBeenCalledWith({
            copyHookType: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY,
        });
    });

    it('pastes only formulas through the paste command', async () => {
        const commandService = { executeCommand: vi.fn(() => true) };
        const accessor = {
            get: (token: unknown) => {
                if (token === ICommandService) return commandService;
                throw new Error(`Unknown dependency: ${String(token)}`);
            },
        } as IAccessor;

        await expect(SheetOnlyPasteFormulaCommand.handler(accessor)).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMULA,
        });
    });
});
