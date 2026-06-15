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
import { DocHyperLinkEdit } from '../../views/DocHyperLinkEdit';
import { DocHyperLinkUIController } from '../ui.controller';

describe('DocHyperLinkUIController', () => {
    it('creates the docs floating toolbar root before merging hyperlink menus', () => {
        const registerComponent = vi.fn(() => ({ dispose: vi.fn() }));
        const registerIcon = vi.fn(() => ({ dispose: vi.fn() }));
        const registerCommand = vi.fn();
        const appendRootMenu = vi.fn();
        const mergeMenu = vi.fn();
        const registerShortcut = vi.fn();

        const controller = new DocHyperLinkUIController(
            { register: registerComponent } as any,
            { register: registerIcon } as any,
            { registerCommand } as any,
            { appendRootMenu, mergeMenu } as any,
            { registerShortcut } as any
        );

        expect(registerComponent).toHaveBeenCalledWith(DocHyperLinkEdit.componentKey, DocHyperLinkEdit);
        expect(appendRootMenu).toHaveBeenCalledWith({ [FLOAT_TOOLBAR_MENU_POSITION]: {} });
        expect(mergeMenu).toHaveBeenCalled();
        expect(appendRootMenu.mock.invocationCallOrder[0]).toBeLessThan(mergeMenu.mock.invocationCallOrder[0]);
        expect(registerShortcut).toHaveBeenCalled();

        controller.dispose();
    });
});
