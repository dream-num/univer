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

import { LocaleService, Plugin, Tools } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import type { IUniverUniscriptConfig } from './controllers/uniscript.controller';
import { DefaultUniscriptConfig, UniscriptController } from './controllers/uniscript.controller';
import { ScriptEditorService } from './services/script-editor.service';
import { IUniscriptExecutionService, UniscriptExecutionService } from './services/script-execution.service';
import { ScriptPanelService } from './services/script-panel.service';

const PLUGIN_NAME = 'uniscript';

export class UniverUniscriptPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverUniscriptConfig> = {},
        @Inject(Injector) protected override _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultUniscriptConfig, this._config);
    }

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = [
            // controllers
            [UniscriptController, { useFactory: () => injector.createInstance(UniscriptController, this._config) }],

            // services
            [ScriptEditorService, { useFactory: () => injector.createInstance(ScriptEditorService, this._config) }],
            [ScriptPanelService],
        ];

        dependencies.forEach((d) => injector.add(d));

        this.registerExecution();
    }

    /**
     * Allows being overridden, replacing with a new UniscriptExecutionService.
     */
    registerExecution(): void {
        this._injector.add([IUniscriptExecutionService, { useClass: UniscriptExecutionService }]);
    }
}
