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

import { ThreadCommentPlugin } from '@univerjs/thread-comment';
import { ICommandService, IConfigService, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { PLUGIN_NAME } from './types/const';
import { ThreadCommentPanelService } from './services/thread-comment-panel.service';
import { SetActiveCommentOperation, ToggleSheetCommentPanelOperation } from './commands/operations/comment.operations';
import { ThreadCommentUIController } from './controllers/thread-comment-ui.controller';
import type { IThreadCommentUIConfig } from './types/interfaces/i-thread-comment-mention';

export class ThreadCommentUIPlugin extends ThreadCommentPlugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        _config: IThreadCommentUIConfig,
        @Inject(Injector) protected override _injector: Injector,
        @ICommandService protected override _commandService: ICommandService,
        @IConfigService protected _configService: IConfigService
    ) {
        super(
            _config,
            _injector,
            _commandService
        );

        this._configService.setConfig(PLUGIN_NAME, _config);
    }

    override onStarting(injector: Injector): void {
        super.onStarting(injector);
        ([
            [ThreadCommentUIController],
            [ThreadCommentPanelService],
        ] as Dependency[]).forEach((dep) => {
            injector.add(dep);
        });

        [ToggleSheetCommentPanelOperation, SetActiveCommentOperation].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
