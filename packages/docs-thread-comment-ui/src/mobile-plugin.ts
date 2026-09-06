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

import type { IUniverDocsThreadCommentUIConfig } from './config/config';
import { DependentOn, IConfigService, Inject, Injector } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsThreadCommentPlugin } from '@univerjs/docs-thread-comment';
import { UniverDocsMobileUIPlugin } from '@univerjs/docs-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { UniverThreadCommentMobileUIPlugin } from '@univerjs/thread-comment-ui';
import { defaultPluginConfig } from './config/config';
import { UniverDocsThreadCommentUIPlugin } from './plugin';

@DependentOn(
    UniverDocsPlugin,
    UniverDocsThreadCommentPlugin,
    UniverThreadCommentPlugin,
    UniverDrawingPlugin,
    UniverRenderEnginePlugin,
    UniverDocsMobileUIPlugin,
    UniverThreadCommentMobileUIPlugin
)
export class UniverDocsThreadCommentMobileUIPlugin extends UniverDocsThreadCommentUIPlugin {
    static override pluginName = UniverDocsThreadCommentUIPlugin.pluginName;

    constructor(
        config: Partial<IUniverDocsThreadCommentUIConfig> = defaultPluginConfig,
        @Inject(Injector) injector: Injector,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @IConfigService configService: IConfigService
    ) {
        super(config, injector, renderManagerService, configService);
    }
}
