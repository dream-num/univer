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
import type { IUniverDocsDrawingConfig } from './controllers/config.schema';
import { IConfigService, Inject, Injector, merge, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { defaultPluginConfig, DOCS_DRAWING_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DocDrawingController, DOCS_DRAWING_PLUGIN } from './controllers/doc-drawing.controller';
import { DocDrawingService, IDocDrawingService } from './services/doc-drawing.service';

export class UniverDocsDrawingPlugin extends Plugin {
    static override pluginName = DOCS_DRAWING_PLUGIN;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsDrawingConfig> = defaultPluginConfig,
        @Inject(Injector) override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(DOCS_DRAWING_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [DocDrawingController],
            [DocDrawingService],
            [IDocDrawingService, { useClass: DocDrawingService }],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

        touchDependencies(this._injector, [
            [DocDrawingController],
        ]);
    }
}
