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

import type { ICommandService, Injector } from '@univerjs/core';
import type { IRenderManagerService } from '@univerjs/engine-render';
import type { ComponentManager, IMenuManagerService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { SheetsUIPart } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { MORE_FUNCTIONS_COMPONENT } from '../../views/more-functions/interface';
import { FormulaUIController } from '../formula-ui.controller';

describe('FormulaUIController', () => {
    it('registers formula commands, menus, shortcuts, UI parts, and render modules', () => {
        const mergeMenu = vi.fn();
        const registerCommand = vi.fn(() => ({ dispose: vi.fn() }));
        const registerShortcut = vi.fn(() => ({ dispose: vi.fn() }));
        const registerComponent = vi.fn(() => ({ dispose: vi.fn() }));
        const registerRenderModule = vi.fn(() => ({ dispose: vi.fn() }));
        const componentRegister = vi.fn();
        const injector = {};

        const controller = new FormulaUIController(
            injector as Injector,
            { mergeMenu } as unknown as IMenuManagerService,
            { registerCommand } as unknown as ICommandService,
            { registerShortcut } as unknown as IShortcutService,
            { registerComponent } as unknown as IUIPartsService,
            { registerRenderModule } as unknown as IRenderManagerService,
            { register: componentRegister } as unknown as ComponentManager
        );

        expect(controller).toBeTruthy();
        expect(mergeMenu).toHaveBeenCalledTimes(1);
        expect(registerCommand).toHaveBeenCalledTimes(8);
        expect(registerShortcut.mock.calls.length).toBeGreaterThan(3);
        expect(registerComponent).toHaveBeenCalledWith(SheetsUIPart.FORMULA_AUX, expect.any(Function));
        expect(componentRegister).toHaveBeenCalledWith(MORE_FUNCTIONS_COMPONENT, expect.any(Function));
        expect(registerRenderModule).toHaveBeenCalledWith(UniverInstanceType.UNIVER_SHEET, [expect.any(Function)]);
    });
});
