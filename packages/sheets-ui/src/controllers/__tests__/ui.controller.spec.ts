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

import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { BuiltInUIPart } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetUIController } from '../ui.controller';

describe('SheetUIController', () => {
    it('registers commands, menus, shortcuts, workbench parts and sheet focus handler', () => {
        let focusHandler: ((unitId: string) => void) | undefined;
        const docSelectionRenderService = { focus: vi.fn() };
        const currentDoc = { getUnitId: vi.fn(() => 'doc-1') };
        const renderManagerService = {
            getRenderUnitById: vi.fn(() => ({
                with: vi.fn((token) => token === DocSelectionRenderService ? docSelectionRenderService : null),
            })),
        };
        const univerInstanceService = {
            getCurrentUnitOfType: vi.fn((type) => type === UniverInstanceType.UNIVER_DOC ? currentDoc : null),
        };
        const injector = {
            get: vi.fn((token) => {
                if (token === IRenderManagerService) return renderManagerService;
                if (token === IUniverInstanceService) return univerInstanceService;
                return {};
            }),
        };
        const layoutService = {
            registerFocusHandler: vi.fn((_type, handler) => {
                focusHandler = handler;
                return { dispose: vi.fn() };
            }),
        };
        const commandService = { registerCommand: vi.fn(() => ({ dispose: vi.fn() })) };
        const shortcutService = { registerShortcut: vi.fn(() => ({ dispose: vi.fn() })) };
        const menuManagerService = { mergeMenu: vi.fn() };
        const uiPartsService = { registerComponent: vi.fn(() => ({ dispose: vi.fn() })) };

        const controller = new SheetUIController(
            injector as any,
            layoutService as any,
            commandService as any,
            shortcutService as any,
            menuManagerService as any,
            uiPartsService as any,
            {} as any
        );

        expect(commandService.registerCommand).toHaveBeenCalledWith(expect.objectContaining({ id: 'sheet.command.set-zoom-ratio' }));
        expect(commandService.registerCommand.mock.calls.length).toBeGreaterThan(40);
        expect(menuManagerService.mergeMenu).toHaveBeenCalledWith(expect.any(Object));
        expect(shortcutService.registerShortcut.mock.calls.length).toBeGreaterThan(40);
        expect(uiPartsService.registerComponent).toHaveBeenCalledWith(BuiltInUIPart.HEADER, expect.any(Function));
        expect(uiPartsService.registerComponent).toHaveBeenCalledWith(BuiltInUIPart.FOOTER, expect.any(Function));
        expect(uiPartsService.registerComponent).toHaveBeenCalledWith(BuiltInUIPart.CONTENT, expect.any(Function));
        expect(layoutService.registerFocusHandler).toHaveBeenCalledWith(UniverInstanceType.UNIVER_SHEET, expect.any(Function));

        focusHandler?.('unit-1');
        expect(docSelectionRenderService.focus).toHaveBeenCalled();

        controller.dispose();
    });
});
