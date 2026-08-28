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

import type { IUniverThreadCommentUIConfig } from './config/config';
import { DependentOn, ICommandService, IConfigService, Inject, Injector } from '@univerjs/core';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverThreadCommentPlugin } from '@univerjs/thread-comment';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import { defaultPluginConfig } from './config/config';
import { UniverThreadCommentUIPlugin } from './plugin';

@DependentOn(UniverThreadCommentPlugin, UniverDocsUIPlugin, UniverMobileUIPlugin)
export class UniverThreadCommentMobileUIPlugin extends UniverThreadCommentUIPlugin {
    static override pluginName = UniverThreadCommentUIPlugin.pluginName;

    constructor(
        config: Partial<IUniverThreadCommentUIConfig> = defaultPluginConfig,
        @Inject(Injector) injector: Injector,
        @ICommandService commandService: ICommandService,
        @IConfigService configService: IConfigService
    ) {
        super(config, injector, commandService, configService);
    }
}
