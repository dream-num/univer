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

import type { IUniverSheetsThreadCommentUIConfig } from './config/config';
import { DependentOn, ICommandService, IConfigService, Inject, Injector } from '@univerjs/core';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsMobileUIPlugin } from '@univerjs/sheets-ui';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { UniverThreadCommentMobileUIPlugin } from '@univerjs/thread-comment-ui';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import { defaultPluginConfig } from './config/config';
import { SheetsThreadCommentCopyPasteController } from './controllers/sheets-thread-comment-copy-paste.controller';
import { SheetsThreadCommentPermissionController } from './controllers/sheets-thread-comment-permission.controller';
import { SheetsThreadCommentPopupController } from './controllers/sheets-thread-comment-popup.controller';
import { UniverSheetsThreadCommentUIPlugin } from './plugin';

@DependentOn(
    UniverRenderEnginePlugin,
    UniverThreadCommentPlugin,
    UniverSheetsPlugin,
    UniverThreadCommentMobileUIPlugin,
    UniverSheetsThreadCommentPlugin,
    UniverMobileUIPlugin,
    UniverSheetsMobileUIPlugin
)
export class UniverSheetsThreadCommentMobileUIPlugin extends UniverSheetsThreadCommentUIPlugin {
    static override pluginName = UniverSheetsThreadCommentUIPlugin.pluginName;

    constructor(
        config: Partial<IUniverSheetsThreadCommentUIConfig> = defaultPluginConfig,
        @Inject(Injector) injector: Injector,
        @Inject(ICommandService) commandService: ICommandService,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @IConfigService configService: IConfigService
    ) {
        super(config, injector, commandService, renderManagerService, configService);
    }

    override onRendered(): void {
        this._injector.get(SheetsThreadCommentCopyPasteController);
        this._injector.get(SheetsThreadCommentPopupController);
        this._injector.get(SheetsThreadCommentPermissionController);
    }
}
