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

import type { DependencyOverride } from '@univerjs/core';
import { ICommandService, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';
import { type Dependency, Inject, Injector } from '@wendellhu/redi';
import { ThreadCommentModel } from './models/thread-comment.model';
import { ThreadCommentResourceController } from './controllers/tc-resource.controller';
import { TC_PLUGIN_NAME } from './types/const';
import { AddCommentMutation, DeleteCommentMutation, ResolveCommentMutation, UpdateCommentMutation, UpdateCommentRefMutation } from './commands/mutations/comment.mutation';
import { AddCommentCommand, DeleteCommentCommand, DeleteCommentTreeCommand, ResolveCommentCommand, UpdateCommentCommand } from './commands/commands/comment.command';
import { IThreadCommentDataSourceService, ThreadCommentDataSourceService } from './services/tc-datasource.service';

export interface IUniverThreadCommentConfig {
    overrides?: DependencyOverride;
}

export class UniverThreadCommentPlugin extends Plugin {
    static override pluginName = TC_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;
    private _config: IUniverThreadCommentConfig;

    constructor(
        config: IUniverThreadCommentConfig,
        @Inject(Injector) protected _injector: Injector,
        @ICommandService protected _commandService: ICommandService
    ) {
        super();
        this._config = config;
    }

    override onStarting(injector: Injector): void {
        (mergeOverrideWithDependencies([
            [ThreadCommentModel],
            [ThreadCommentResourceController],
            [IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }],
        ], this._config?.overrides) as Dependency[]).forEach(
            (d) => {
                injector.add(d);
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
    }
}
