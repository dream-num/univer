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

import { Plugin } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { DebuggerController } from './controllers/debugger.controller';
import { PerformanceMonitorController } from './controllers/performance-monitor.controller';
import { E2EMemoryController } from './controllers/e2e/e2e-memory.controller';

export interface IDebuggerPluginConfig { }

export class DebuggerPlugin extends Plugin {
    static override pluginName = 'debugger';

    private _debuggerController!: DebuggerController;

    constructor(
        _config: IDebuggerPluginConfig,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        ([
            [PerformanceMonitorController],
            [E2EMemoryController],
        ] as Dependency[]).forEach((d) => injector.add(d));
    }

    override onRendered(): void {
        this._injector.add([DebuggerController]);
        this._debuggerController = this._injector.get(DebuggerController);
    }

    getDebuggerController() {
        return this._debuggerController;
    }
}
