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

import { UnitAction } from '@univerjs/protocol';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_PERMISSION_PASTE_PLUGIN, SheetPermissionInterceptorClipboardController } from '../sheet-permission-interceptor-clipboard.controller';

function createController(protectedCell?: { row: number; col: number }) {
    let hook: any;
    const worksheet = {
        getCell: vi.fn((row: number, col: number) => protectedCell?.row === row && protectedCell?.col === col
            ? { selectionProtection: [{ [UnitAction.Edit]: false }] }
            : { selectionProtection: [{ [UnitAction.Edit]: true }] }),
    };
    const workbook = { getActiveSheet: vi.fn(() => worksheet) };
    const permissionCheckController = { blockExecuteWithoutPermission: vi.fn() };
    const controller = new SheetPermissionInterceptorClipboardController(
        { getCurrentUnitOfType: vi.fn(() => workbook) } as any,
        {
            getCurrentLastSelection: vi.fn(() => ({
                range: { startRow: 5, startColumn: 7 },
            })),
        } as any,
        { t: vi.fn((key: string) => `translated:${key}`) } as any,
        {
            addClipboardHook: vi.fn((registeredHook) => {
                hook = registeredHook;
                return { dispose: vi.fn() };
            }),
        } as any,
        permissionCheckController as any
    );

    return { controller, hook, permissionCheckController, worksheet };
}

describe('SheetPermissionInterceptorClipboardController', () => {
    it('allows paste when the target range has edit permission', () => {
        const { controller, hook, permissionCheckController } = createController();

        expect(hook.id).toBe(SHEET_PERMISSION_PASTE_PLUGIN);
        expect(hook.onBeforePaste({
            range: {
                rows: [0, 1],
                cols: [0, 1],
            },
        })).toBe(true);
        expect(permissionCheckController.blockExecuteWithoutPermission).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('blocks paste and shows permission feedback when any pasted cell is protected', () => {
        const { controller, hook, permissionCheckController, worksheet } = createController({ row: 6, col: 8 });

        expect(hook.onBeforePaste({
            range: {
                rows: [0, 1],
                cols: [0, 1],
            },
        })).toBe(false);
        expect(worksheet.getCell).toHaveBeenCalledWith(6, 8);
        expect(permissionCheckController.blockExecuteWithoutPermission).toHaveBeenCalledWith('translated:sheets-ui.permission.dialog.pasteErr');

        controller.dispose();
    });
});
