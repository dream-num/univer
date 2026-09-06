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

import type { IUniverDocsUIConfig } from './config/config';
import { DependentOn, ICommandService, IConfigService, Inject, Injector } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import { defaultPluginConfig } from './config/config';
import { UniverDocsUIPlugin } from './plugin';

@DependentOn(UniverDocsPlugin, UniverRenderEnginePlugin, UniverMobileUIPlugin)
export class UniverDocsMobileUIPlugin extends UniverDocsUIPlugin {
    static override pluginName = UniverDocsUIPlugin.pluginName;

    constructor(
        config: Partial<IUniverDocsUIConfig> = {},
        @Inject(Injector) injector: Injector,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @ICommandService commandService: ICommandService,
        @IConfigService configService: IConfigService
    ) {
        super({
            ...config,
            fitToWidth: {
                ...defaultPluginConfig.fitToWidth,
                mode: 'fit-width',
                target: 'viewport',
                paddingX: 12,
                minScale: 0,
                maxScale: 1,
                align: 'center',
                ...config.fitToWidth,
            },
        }, injector, renderManagerService, commandService, configService);
    }
}
