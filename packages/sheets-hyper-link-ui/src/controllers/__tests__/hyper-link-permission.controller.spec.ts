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

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InsertLinkShortcut } from '../../menu/menu';
import { SheetsHyperLinkPermissionController } from '../hyper-link-permission.controller';

describe('SheetsHyperLinkPermissionController', () => {
    let beforeCommandExecuted: any;

    beforeEach(() => {
        beforeCommandExecuted = undefined;
    });

    it('should block shortcut execution when permission fails', () => {
        const localeService = { t: (key: string) => key } as any;

        const commandService = {
            beforeCommandExecuted: vi.fn((fn) => {
                beforeCommandExecuted = fn;
                return { dispose: vi.fn() };
            }),
        } as any;

        const blockExecuteWithoutPermission = vi.fn();
        const sheetPermissionCheckController = {
            permissionCheckWithRanges: vi.fn(() => false),
            blockExecuteWithoutPermission,
        } as any;

        const controller = new SheetsHyperLinkPermissionController(localeService, commandService, sheetPermissionCheckController);

        beforeCommandExecuted({ id: InsertLinkShortcut.id });
        expect(blockExecuteWithoutPermission).toHaveBeenCalledWith('permission.dialog.hyperLinkErr');

        controller.dispose();
    });

    it('should not block when permission passes', () => {
        const localeService = { t: (key: string) => key } as any;

        const commandService = {
            beforeCommandExecuted: vi.fn((fn) => {
                beforeCommandExecuted = fn;
                return { dispose: vi.fn() };
            }),
        } as any;

        const blockExecuteWithoutPermission = vi.fn();
        const sheetPermissionCheckController = {
            permissionCheckWithRanges: vi.fn(() => true),
            blockExecuteWithoutPermission,
        } as any;

        const controller = new SheetsHyperLinkPermissionController(localeService, commandService, sheetPermissionCheckController);
        beforeCommandExecuted({ id: InsertLinkShortcut.id });
        expect(blockExecuteWithoutPermission).not.toHaveBeenCalled();

        controller.dispose();
    });
});
