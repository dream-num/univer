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

import { FLOAT_TOOLBAR_MENU_POSITION } from '@univerjs/docs-ui';
import { describe, expect, it, vi } from 'vitest';
import { DOCS_THREAD_COMMENT_PANEL } from '../../common/const';
import { DocThreadCommentPanel } from '../../views/DocThreadCommentPanel';
import { DocThreadCommentUIController } from '../ui.controller';

describe('DocThreadCommentUIController', () => {
    it('should register commands, menus and components', () => {
        const registerCommand = vi.fn(() => ({ dispose: vi.fn() }));
        const mergeMenu = vi.fn();
        const appendRootMenu = vi.fn();
        const registerComponent = vi.fn(() => ({ dispose: vi.fn() }));
        const registerIcon = vi.fn(() => ({ dispose: vi.fn() }));

        const controller = new DocThreadCommentUIController(
            { registerCommand } as any,
            { appendRootMenu, mergeMenu } as any,
            { register: registerComponent } as any,
            { register: registerIcon } as any
        );

        expect(registerCommand).toHaveBeenCalled();
        expect(appendRootMenu).toHaveBeenCalledWith({ [FLOAT_TOOLBAR_MENU_POSITION]: {} });
        expect(mergeMenu).toHaveBeenCalled();
        expect(appendRootMenu.mock.invocationCallOrder[0]).toBeLessThan(mergeMenu.mock.invocationCallOrder[0]);
        expect(registerComponent).toHaveBeenCalledWith(DOCS_THREAD_COMMENT_PANEL, DocThreadCommentPanel);

        controller.dispose();
    });
});
