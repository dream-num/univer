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

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ICommandService } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IContextMenuService } from '../../../../services/contextmenu/contextmenu.service';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { IMenuManagerService } from '../../../../services/menu/menu-manager.service';
import { IUIRuntimeScopeService } from '../../../../services/runtime-scope/ui-runtime-scope.service';
import { DesktopContextMenu } from '../ContextMenu';

const executeCommand = vi.fn();
const services = new Map<unknown, unknown>([
    [ICommandService, { executeCommand }],
    [ILayoutService, { focus: vi.fn() }],
    [IMenuManagerService, {}],
    [IUIRuntimeScopeService, { get: () => undefined }],
    [IContextMenuService, { registerContextMenuHandler: () => ({ dispose: vi.fn() }) }],
]);

vi.mock('../../../../utils/di', () => ({
    useDependency: (token: unknown) => services.get(token),
}));

// The panel reports a selected item with its menu schema key as `label` and its own id as `id`.
vi.mock('../AnchoredContextMenu', () => ({
    AnchoredContextMenu: (props: { onOptionSelect: (option: { id: string; label: string }) => void }) => (
        <button
            type="button"
            onClick={() => props.onOptionSelect({ id: 'test.operation.insert-row', label: 'test.menu.insert-row' })}
        >
            Insert row
        </button>
    ),
}));

describe('DesktopContextMenu', () => {
    afterEach(() => {
        cleanup();
        executeCommand.mockClear();
    });

    it('runs the item command when its menu key differs from it', () => {
        render(<DesktopContextMenu />);

        fireEvent.click(screen.getByRole('button', { name: 'Insert row' }));

        expect(executeCommand).toHaveBeenCalledWith('test.operation.insert-row', { value: undefined });
    });
});
