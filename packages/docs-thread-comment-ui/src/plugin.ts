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
import type { IUniverDocsThreadCommentUIConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { PLUGIN_NAME } from './common/const';
import { defaultPluginConfig, DOCS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DocThreadCommentSelectionController } from './controllers/doc-thread-comment-selection.controller';
import { DocThreadCommentUIController } from './controllers/doc-thread-comment-ui.controller';
import { DocThreadCommentRenderController } from './controllers/render-controllers/render.controller';
import { DocThreadCommentService } from './services/doc-thread-comment.service';

@DependentOn(UniverThreadCommentUIPlugin)
export class UniverDocsThreadCommentUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsThreadCommentUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
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
        this._configService.setConfig(DOCS_THREAD_COMMENT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [DocThreadCommentUIController],
            [DocThreadCommentSelectionController],
            [DocThreadCommentService],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });
    }

    override onRendered(): void {
        this._initRenderModule();

        this._injector.get(DocThreadCommentSelectionController);
        this._injector.get(DocThreadCommentUIController);
    }

    private _initRenderModule() {
        [DocThreadCommentRenderController].forEach((dep) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, dep as unknown as Dependency);
        });
    }
}
