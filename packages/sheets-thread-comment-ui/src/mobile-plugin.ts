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
import type { IUniverSheetsThreadCommentUIConfig } from './config/config';
import { DependentOn, ICommandService, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsMobileUIPlugin } from '@univerjs/sheets-ui';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { UniverThreadCommentMobileUIPlugin } from '@univerjs/thread-comment-ui';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import pkg from '../package.json';
import {
    AddSheetDrawingCommentOperation,
    OpenSheetCommentPanelOperation,
    ToggleSheetCommentPanelOperation,
} from './commands/operations/comment.operation';
import { ShowAddSheetCommentMobileOperation } from './commands/operations/mobile/show-add-sheet-comment.operation';
import { defaultPluginConfig, SHEETS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { MobileComponentsController } from './controllers/mobile/components.controller';
import { SheetsThreadCommentMobileController } from './controllers/mobile/sheets-thread-comment.controller';
import { SheetsThreadCommentRenderController } from './controllers/render-controllers/render.controller';
import { SheetsThreadCommentCopyPasteController } from './controllers/sheets-thread-comment-copy-paste.controller';
import { SheetsThreadCommentPermissionController } from './controllers/sheets-thread-comment-permission.controller';
import { MobileSheetCommentDraftService } from './services/mobile/mobile-sheet-comment-draft.service';
import { SheetsThreadCommentPopupService } from './services/sheets-thread-comment-popup.service';
import { PLUGIN_NAME } from './types/const';

@DependentOn(
    UniverRenderEnginePlugin,
    UniverThreadCommentPlugin,
    UniverSheetsPlugin,
    UniverThreadCommentMobileUIPlugin,
    UniverSheetsThreadCommentPlugin,
    UniverMobileUIPlugin,
    UniverSheetsMobileUIPlugin
)
export class UniverSheetsThreadCommentMobileUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsThreadCommentUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const { menu, ...rest } = merge({}, defaultPluginConfig, this._config);
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(SHEETS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [MobileComponentsController],
            [SheetsThreadCommentMobileController],
            [SheetsThreadCommentRenderController],
            [SheetsThreadCommentCopyPasteController],
            [SheetsThreadCommentPopupService],
            [SheetsThreadCommentPermissionController],
            [MobileSheetCommentDraftService],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
        this._injector.get(MobileComponentsController);

        [
            AddSheetDrawingCommentOperation,
            OpenSheetCommentPanelOperation,
            ShowAddSheetCommentMobileOperation,
            ToggleSheetCommentPanelOperation,
        ].forEach((command) => this._commandService.registerCommand(command));

        this._injector.get(SheetsThreadCommentMobileController);
    }

    override onReady(): void {
        this._injector.get(SheetsThreadCommentRenderController);
    }

    override onRendered(): void {
        this._injector.get(SheetsThreadCommentCopyPasteController);
        this._injector.get(SheetsThreadCommentPermissionController);
    }
}
