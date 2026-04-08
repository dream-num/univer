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

import { describe, expect, it, vi } from 'vitest';
import { ZEN_EDITOR_COMPONENT } from '../../views/zen-editor';
import { ZenEditorUIController } from '../zen-editor-ui.controller';

describe('ZenEditorUIController', () => {
    it('should register zen component, commands, menus and shortcuts', () => {
        const set = vi.fn(() => ({ dispose: vi.fn() }));
        const registerCommand = vi.fn(() => ({ dispose: vi.fn() }));
        const mergeMenu = vi.fn();
        const registerShortcut = vi.fn(() => ({ dispose: vi.fn() }));

        const controller = new ZenEditorUIController(
            { set } as any,
            { registerCommand } as any,
            { mergeMenu } as any,
            { registerShortcut } as any
        );

        expect(set).toHaveBeenCalledWith(ZEN_EDITOR_COMPONENT, expect.any(Function));
        expect(registerCommand).toHaveBeenCalledTimes(3);
        expect(mergeMenu).toHaveBeenCalledTimes(1);
        expect(registerShortcut).toHaveBeenCalledTimes(2);

        controller.dispose();
    });
});
