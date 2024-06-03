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

import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import type { DependencyOverride } from '@univerjs/core';
import { DependentOn, ICommandService, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { PLUGIN_NAME } from './types/const';
import { ThreadCommentPanelService } from './services/thread-comment-panel.service';
import { SetActiveCommentOperation, ToggleSheetCommentPanelOperation } from './commands/operations/comment.operations';
import { ThreadCommentUIController } from './controllers/thread-comment-ui.controller';
import { IThreadCommentMentionDataService, ThreadCommentMentionDataService } from './services/thread-comment-mention-data.service';

export interface IUniverThreadCommentUIConfig {
    overrides?: DependencyOverride;
}

@DependentOn(UniverThreadCommentPlugin)
export class UniverThreadCommentUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: IUniverThreadCommentUIConfig | undefined,
        @Inject(Injector) protected override _injector: Injector,
        @ICommandService protected _commandService: ICommandService
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        (mergeOverrideWithDependencies([
            [ThreadCommentUIController],
            [ThreadCommentPanelService],
            [IThreadCommentMentionDataService, { useClass: ThreadCommentMentionDataService }],
        ], this._config?.overrides) as Dependency[]).forEach((dep) => {
            injector.add(dep);
        });

        [ToggleSheetCommentPanelOperation, SetActiveCommentOperation].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
