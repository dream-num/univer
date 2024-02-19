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

import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { UniscriptController } from './controllers/uniscript.controller';
import { zhCN } from './locale';
import type { IScriptEditorServiceConfig } from './services/script-editor.service';
import { ScriptEditorService } from './services/script-editor.service';
import { UniscriptExecutionService } from './services/script-execution.service';
import { ScriptPanelService } from './services/script-panel.service';

const PLUGIN_NAME = 'uniscript';

export interface IUniscriptConfig extends IScriptEditorServiceConfig { }

export class UniverUniscriptPlugin extends Plugin {
    static override type = PluginType.Univer;

    constructor(
        private readonly _config: IUniscriptConfig,
        @Inject(Injector) protected override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAME);
    }

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = [
            // controllers
            [UniscriptController],

            // services
            [ScriptEditorService, { useFactory: () => injector.createInstance(ScriptEditorService, this._config) }],
            [ScriptPanelService],
            [UniscriptExecutionService],
        ];

        dependencies.forEach((d) => injector.add(d));

        this._localeService.load({
            zhCN,
        });
    }
}
