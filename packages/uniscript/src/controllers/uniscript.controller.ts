/**
 * Copyright 2023-present DreamNum Inc.
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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { ScriptPanelComponentName, ToggleScriptPanelOperation } from '../commands/operations/panel.operation';
import { ScriptEditorPanel } from '../views/components/ScriptEditorPanel';
import { UniscriptMenuItemFactory } from './menu';

export interface IUniverUniscriptConfig {
    getWorkerUrl(moduleID: string, label: string): string;
    menu: MenuConfig;
}

export const DefaultUniscriptConfig = {};

@OnLifecycle(LifecycleStages.Steady, UniscriptController)
export class UniscriptController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverUniscriptConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService commandService: ICommandService,
        @Inject(ComponentManager) componentManager: ComponentManager
    ) {
        super();

        const { menu = {} } = this._config;

        this.disposeWithMe(_menuService.addMenuItem(this._injector.invoke(UniscriptMenuItemFactory), menu));
        this.disposeWithMe(componentManager.register(ScriptPanelComponentName, ScriptEditorPanel));
        this.disposeWithMe(commandService.registerCommand(ToggleScriptPanelOperation));
    }
}
