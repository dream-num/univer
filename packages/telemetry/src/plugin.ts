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

import type { Ctor, Dependency } from '@univerjs/core';
import { Inject, Injector, Plugin } from '@univerjs/core';
import { ITelemetryService } from './telemetry.service';

const UniverTelemetryPluginID = 'UNIVER_TELEMETRY_PLUGIN';

/**
 * Configuration for {@link UniverTelemetryPlugin}.
 * @property {Ctor<ITelemetryService>} impl - The telemetry service implementation.
 */
export interface IUniverTelemetryPluginConfig {
    impl: Ctor<ITelemetryService>;
}

/**
 * Telemetry plugin, used to provide telemetry services. This plugin does not provide any telemetry service implementation,
 * you need to provide a implementation via this plugin's config.
 */
export class UniverTelemetryPlugin extends Plugin {
    static override pluginName = UniverTelemetryPluginID;

    constructor(
        private _config: IUniverTelemetryPluginConfig,
        @Inject(Injector) protected override _injector: Injector
    ) {
        super();
    }

    override onStarting(): void {
        if (!this._config.impl) {
            throw new Error('[UniverTelemetryPlugin]: `impl` is required. Please provide a telemetry service implementation.');
        }

        const dependencies: Dependency[] = [
            [ITelemetryService, { useClass: this._config.impl }],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }
}
