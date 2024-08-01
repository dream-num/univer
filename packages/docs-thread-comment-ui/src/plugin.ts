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

import { DependentOn, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { PLUGIN_NAME } from './common/const';
import type { IDocThreadCommentUIConfig } from './controllers/doc-thread-comment-ui.controller';
import { DocThreadCommentUIController } from './controllers/doc-thread-comment-ui.controller';
import { DocThreadCommentService } from './services/doc-thread-comment.service';
import { DocThreadCommentSelectionController } from './controllers/doc-thread-comment-selection.controller';
import { DocThreadCommentRenderController } from './controllers/render-controllers/render.controller';

@DependentOn(UniverThreadCommentUIPlugin)
export class UniverDocsThreadCommentUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private _config: IDocThreadCommentUIConfig = { menu: {} },
        @Inject(Injector) protected _injector: Injector,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [
                DocThreadCommentUIController,
                {
                    useFactory: () => this._injector.createInstance(DocThreadCommentUIController, this._config),
                },
            ],
            [DocThreadCommentSelectionController],

            [DocThreadCommentService],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });
    }

    override onRendered(): void {
        this._initRenderModule();
    }

    private _initRenderModule() {
        [DocThreadCommentRenderController].forEach((dep) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, dep as unknown as Dependency);
        });
    }
}
