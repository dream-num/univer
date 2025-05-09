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

import type { Dependency } from '@univerjs/core';
import type { IUniverActionRecorderConfig } from './controllers/config.schema';
import { IConfigService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import { ActionRecorderController } from './controllers/action-recorder.controller';
import { ACTION_RECORDER_PLUGIN_CONFIG_KEY, defaultPluginConfig } from './controllers/config.schema';
import { ActionRecorderService } from './services/action-recorder.service';
import { ActionReplayService } from './services/replay.service';

/**
 * This plugin provides a recorder for user's interactions with Univer,
 * it only records commands (and some special operations) so that it can be replayed later.
 */
export class UniverActionRecorderPlugin extends Plugin {
    static override pluginName = 'UNIVER_ACTION_RECORDER_PLUGIN';

    constructor(
        private readonly _config: Partial<IUniverActionRecorderConfig> = defaultPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector,
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
        this._configService.setConfig(ACTION_RECORDER_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const dependency = this._config.replayOnly
            ? [[ActionReplayService]]
            : [
                [ActionRecorderService],
                [ActionReplayService],
                [ActionRecorderController],
            ];
        (dependency as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onSteady(): void {
        if (this._config.replayOnly) {
            return;
        }
        this._injector.get(ActionRecorderController);
    }
}
