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

import type { ICommandInfo } from '@univerjs/core';
import {
    createInternalEditorID,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
} from '@univerjs/core';
import { InsertTextCommand } from '@univerjs/docs';
import { IMEInputCommand } from '@univerjs/docs-ui';
import { EMPTY } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetPermissionCheckUIController } from '../sheet-permission-check-ui.controller';

type ControllerConstructorArgs = ConstructorParameters<typeof SheetPermissionCheckUIController>;

function createController() {
    let beforeCommandExecuted: ((commandInfo: ICommandInfo) => void) | undefined;
    const permissionCheckWithoutRange = vi.fn(() => false);
    const blockExecuteWithoutPermission = vi.fn();
    const controller = new SheetPermissionCheckUIController(
        {
            beforeCommandExecuted: vi.fn((listener: (commandInfo: ICommandInfo) => void) => {
                beforeCommandExecuted = listener;
                return { dispose: vi.fn() };
            }),
        } as unknown as ControllerConstructorArgs[0],
        {} as unknown as ControllerConstructorArgs[1],
        { getShowComponents: vi.fn(() => true) } as unknown as ControllerConstructorArgs[2],
        { open: vi.fn(), close: vi.fn() } as unknown as ControllerConstructorArgs[3],
        {} as unknown as ControllerConstructorArgs[4],
        { t: vi.fn((key: string) => `translated:${key}`) } as unknown as ControllerConstructorArgs[5],
        { getContextValue: vi.fn(() => false) } as unknown as ControllerConstructorArgs[6],
        {
            triggerPermissionUIEvent$: EMPTY,
            permissionCheckWithoutRange,
            blockExecuteWithoutPermission,
        } as unknown as ControllerConstructorArgs[7]
    );

    return {
        controller,
        executeBefore: (commandInfo: ICommandInfo) => beforeCommandExecuted?.(commandInfo),
        permissionCheckWithoutRange,
        blockExecuteWithoutPermission,
    };
}

describe('SheetPermissionCheckUIController', () => {
    it.each([
        [InsertTextCommand.id, 'document editor', 'host-doc'],
        [IMEInputCommand.id, 'document editor', 'host-doc'],
        [InsertTextCommand.id, 'shape text editor', createInternalEditorID('SHAPE_TEXT')],
        [IMEInputCommand.id, 'shape text editor', createInternalEditorID('SHAPE_TEXT')],
        [InsertTextCommand.id, 'slide text editor', createInternalEditorID('SLIDE_SHAPE_TEXT')],
    ])('does not apply sheet permissions to %s input from a %s', (id, _, unitId) => {
        const { controller, executeBefore, permissionCheckWithoutRange, blockExecuteWithoutPermission } = createController();

        executeBefore({
            id,
            params: { unitId },
        });

        expect(permissionCheckWithoutRange).not.toHaveBeenCalled();
        expect(blockExecuteWithoutPermission).not.toHaveBeenCalled();
        controller.dispose();
    });

    it.each([
        [InsertTextCommand.id, DOCS_NORMAL_EDITOR_UNIT_ID_KEY],
        [IMEInputCommand.id, DOCS_NORMAL_EDITOR_UNIT_ID_KEY],
        [InsertTextCommand.id, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY],
    ])('keeps applying sheet permissions to %s from %s', (id, unitId) => {
        const { controller, executeBefore, permissionCheckWithoutRange, blockExecuteWithoutPermission } = createController();

        executeBefore({
            id,
            params: { unitId },
        });

        expect(permissionCheckWithoutRange).toHaveBeenCalledOnce();
        expect(blockExecuteWithoutPermission).toHaveBeenCalledWith('translated:sheets-ui.permission.dialog.editErr');
        controller.dispose();
    });
});
