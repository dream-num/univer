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

import { ICommandService, Univer } from '@univerjs/core';
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ScriptPanelService } from '../../../services/script-panel.service';
import { ScriptPanelComponentName, ToggleScriptPanelOperation } from '../panel.operation';

describe('ToggleScriptPanelOperation', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let scriptPanelService: ScriptPanelService;
    let sidebarService: ISidebarService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([ScriptPanelService]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(ToggleScriptPanelOperation);
        scriptPanelService = injector.get(ScriptPanelService);
        sidebarService = injector.get(ISidebarService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('opens the Uniscript sidebar when the panel is closed', async () => {
        const result = await commandService.executeCommand(ToggleScriptPanelOperation.id);

        expect(result).toBe(true);
        expect(scriptPanelService.isOpen).toBe(true);
        expect(sidebarService.visible).toBe(true);
        expect(sidebarService.options.children?.label).toBe(ScriptPanelComponentName);
        expect(sidebarService.width).toBeUndefined();
    });

    it('closes the Uniscript sidebar when the panel is already open', async () => {
        await commandService.executeCommand(ToggleScriptPanelOperation.id);

        const result = await commandService.executeCommand(ToggleScriptPanelOperation.id);

        expect(result).toBe(true);
        expect(scriptPanelService.isOpen).toBe(false);
        expect(sidebarService.visible).toBe(false);
    });
});
