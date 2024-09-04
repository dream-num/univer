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

import { IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { DOC_MENTION_UI_PLUGIN } from './types/const/const';
import { DocMentionPopupService } from './services/doc-mention-popup.service';
import { DocMentionUIController } from './controllers/doc-mention-ui.controller';
import { DocMentionTriggerController } from './controllers/doc-mention-trigger.controller';
import { DocMentionService } from './services/doc-mention.service';
import type { IUniverDocsMentionUIConfig } from './controllers/config.schema';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';

export class UniverDocsMentionUIPlugin extends Plugin {
    static override pluginName = DOC_MENTION_UI_PLUGIN;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsMentionUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const deps: Dependency[] = [
            [DocMentionService],
            [DocMentionPopupService],
            [DocMentionUIController],
            [DocMentionTriggerController],
        ];

        deps.forEach((dep) => {
            this._injector.add(dep);
        });
    }
}
