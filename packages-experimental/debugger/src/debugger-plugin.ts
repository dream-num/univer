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

import type { Dependency } from '@univerjs/core';
import type { IUniverDebuggerConfig } from './controllers/config.schema';
import { IConfigService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import { DEBUGGER_PLUGIN_CONFIG_KEY, defaultPluginConfig } from './controllers/config.schema';
import { DarkModeController } from './controllers/dark-mode.controller';
import { DebuggerController } from './controllers/debugger.controller';
import { E2EController } from './controllers/e2e/e2e.controller';
import { PerformanceMonitorController } from './controllers/performance-monitor.controller';
import { UniverWatermarkMenuController } from './controllers/watermark.menu.controller';

export class UniverDebuggerPlugin extends Plugin {
    static override pluginName = 'UNIVER_DEBUGGER_PLUGIN';

    private _debuggerController!: DebuggerController;

    constructor(
        private readonly _config: Partial<IUniverDebuggerConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(DEBUGGER_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [PerformanceMonitorController],
            [DarkModeController],
            [DebuggerController],
            [E2EController],
            [UniverWatermarkMenuController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));

        this._injector.get(E2EController);
    }

    override onReady(): void {
        this._injector.get(DebuggerController);
    }

    override onRendered(): void {
        this._injector.get(DarkModeController);
        this._injector.get(PerformanceMonitorController);
        this._injector.get(UniverWatermarkMenuController);
    }

    getDebuggerController() {
        this._debuggerController = this._injector.get(DebuggerController);
        return this._debuggerController;
    }
}
