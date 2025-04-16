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
import type { IUniverSheetsThreadCommentUIConfig } from './controllers/config.schema';
import { DependentOn, ICommandService, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { ShowAddSheetCommentModalOperation } from './commands/operations/comment.operation';
import { defaultPluginConfig, SHEETS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsThreadCommentRenderController } from './controllers/render-controllers/render.controller';
import { SheetsThreadCommentCopyPasteController } from './controllers/sheets-thread-comment-copy-paste.controller';
import { SheetsThreadCommentHoverController } from './controllers/sheets-thread-comment-hover.controller';
import { SheetsThreadCommentPopupController } from './controllers/sheets-thread-comment-popup.controller';
import { ThreadCommentRemoveSheetsController } from './controllers/sheets-thread-comment-remove.controller';
import { SheetsThreadCommentController } from './controllers/sheets-thread-comment.controller';
import { SheetsThreadCommentPopupService } from './services/sheets-thread-comment-popup.service';
import { SHEETS_THREAD_COMMENT } from './types/const';

@DependentOn(UniverThreadCommentUIPlugin, UniverSheetsThreadCommentPlugin)
export class UniverSheetsThreadCommentUIPlugin extends Plugin {
    static override pluginName = SHEETS_THREAD_COMMENT;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsThreadCommentUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @Inject(ICommandService) protected _commandService: ICommandService,
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
        this._configService.setConfig(SHEETS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsThreadCommentController],
            [SheetsThreadCommentRenderController],
            [SheetsThreadCommentCopyPasteController],
            [SheetsThreadCommentHoverController],
            [ThreadCommentRemoveSheetsController],
            [SheetsThreadCommentPopupController],
            [SheetsThreadCommentPopupService],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });

        [ShowAddSheetCommentModalOperation].forEach((command) => {
            this._commandService.registerCommand(command);
        });

        this._injector.get(SheetsThreadCommentController);
    }

    override onReady(): void {
        this._injector.get(SheetsThreadCommentRenderController);
        this._injector.get(ThreadCommentRemoveSheetsController);
    }

    override onRendered(): void {
        this._injector.get(SheetsThreadCommentCopyPasteController);
        this._injector.get(SheetsThreadCommentHoverController);
        this._injector.get(SheetsThreadCommentPopupController);
    }
}
