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
import type { IUniverThreadCommentUIConfig } from './config/config';
import {
    DependentOn,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    merge,
    mergeOverrideWithDependencies,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import pkg from '../package.json';
import { SetActiveCommentOperation } from './commands/operations/comment.operations';
import { defaultPluginConfig, THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { ThreadCommentDraftService } from './services/thread-comment-draft.service';
import { ThreadCommentPanelService } from './services/thread-comment-panel.service';
import { PLUGIN_NAME } from './types/const';

@DependentOn(UniverThreadCommentPlugin, UniverDocsUIPlugin, UniverMobileUIPlugin)
export class UniverThreadCommentMobileUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: Partial<IUniverThreadCommentUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const { menu, ...rest } = merge({}, defaultPluginConfig, this._config);
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        (mergeOverrideWithDependencies([
            [ThreadCommentDraftService],
            [ThreadCommentPanelService],
        ], this._config?.overrides) as Dependency[]).forEach((dependency) => {
            this._injector.add(dependency);
        });

        this._commandService.registerCommand(SetActiveCommentOperation);
    }
}
