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

import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { DependentOn, ICommandService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { UniverSheetsThreadCommentBasePlugin } from '@univerjs/sheets-thread-comment-base';
import type { IUniverSheetsThreadCommentConfig } from './controllers/sheets-thread-comment.controller';
import { DefaultSheetsThreadCommentConfig, SheetsThreadCommentController } from './controllers/sheets-thread-comment.controller';
import { SheetsThreadCommentPopupService } from './services/sheets-thread-comment-popup.service';
import { ShowAddSheetCommentModalOperation } from './commands/operations/comment.operation';
import { SheetsThreadCommentRenderController } from './controllers/render-controllers/render.controller';
import { SHEETS_THREAD_COMMENT } from './types/const';
import { SheetsThreadCommentCopyPasteController } from './controllers/sheets-thread-comment-copy-paste.controller';
import { SheetsThreadCommentHoverController } from './controllers/sheets-thread-comment-hover.controller';
import { ThreadCommentRemoveSheetsController } from './controllers/sheets-thread-comment-remove.controller';

@DependentOn(UniverThreadCommentUIPlugin, UniverSheetsThreadCommentBasePlugin)
export class UniverSheetsThreadCommentPlugin extends Plugin {
    static override pluginName = SHEETS_THREAD_COMMENT;
    static override type = UniverInstanceType.UNIVER_SHEET;

    private _pluginConfig: IUniverSheetsThreadCommentConfig;

    constructor(
        config: Partial<IUniverSheetsThreadCommentConfig> = {},
        @Inject(Injector) protected override _injector: Injector,
        @Inject(ICommandService) protected _commandService: ICommandService
    ) {
        super();

        this._pluginConfig = Tools.deepMerge({}, DefaultSheetsThreadCommentConfig, config);
    }

    override onStarting(injector: Injector): void {
        ([
            [
                SheetsThreadCommentController,
                {
                    useFactory: () => this._injector.createInstance(SheetsThreadCommentController, this._pluginConfig),
                },
            ],
            [SheetsThreadCommentRenderController],
            [SheetsThreadCommentCopyPasteController],
            [SheetsThreadCommentHoverController],
            [ThreadCommentRemoveSheetsController],
            [SheetsThreadCommentPopupService],
        ] as Dependency[]).forEach((dep) => {
            injector.add(dep);
        });

        [ShowAddSheetCommentModalOperation].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
