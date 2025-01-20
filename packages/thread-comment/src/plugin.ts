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
import type { IUniverThreadCommentConfig } from './controllers/config.schema';
import { ICommandService, IConfigService, Inject, Injector, merge, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ResolveCommentCommand, UpdateCommentCommand } from './commands/commands/comment.command';
import { AddCommentMutation, DeleteCommentMutation, ResolveCommentMutation, UpdateCommentMutation, UpdateCommentRefMutation } from './commands/mutations/comment.mutation';
import { defaultPluginConfig, THREAD_COMMENT_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { ThreadCommentResourceController } from './controllers/tc-resource.controller';
import { ThreadCommentModel } from './models/thread-comment.model';
import { IThreadCommentDataSourceService, ThreadCommentDataSourceService } from './services/tc-datasource.service';
import { TC_PLUGIN_NAME } from './types/const';

export class UniverThreadCommentPlugin extends Plugin {
    static override pluginName = TC_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: Partial<IUniverThreadCommentConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @ICommandService protected _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(THREAD_COMMENT_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        (mergeOverrideWithDependencies([
            [IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }],
            [ThreadCommentModel],
            [ThreadCommentResourceController],
        ], this._config?.overrides) as Dependency[]).forEach(
            (d) => {
                this._injector.add(d);
            }
        );

        [
            AddCommentCommand,
            UpdateCommentCommand,
            DeleteCommentCommand,
            ResolveCommentCommand,
            DeleteCommentTreeCommand,

            AddCommentMutation,
            UpdateCommentMutation,
            UpdateCommentRefMutation,
            DeleteCommentMutation,
            ResolveCommentMutation,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });

        this._injector.get(ThreadCommentResourceController);
    }
}
