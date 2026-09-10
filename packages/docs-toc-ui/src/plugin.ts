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
import type { IUniverDocsTocUIConfig } from './config/config';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsTocPlugin } from '@univerjs/docs-toc';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import pkg from '../package.json';
import { defaultPluginConfig, DOCS_TOC_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { ComponentsController } from './controllers/components.controller';
import { TableOfContentsHighlightRenderController } from './controllers/table-of-contents-highlight.render-controller';
import { TableOfContentsRibbonController } from './controllers/table-of-contents-ribbon.controller';
import { DocsTocUIController } from './controllers/ui.controller';

@DependentOn(UniverDocsPlugin, UniverRenderEnginePlugin, UniverDocsTocPlugin, UniverDocsUIPlugin)
export class UniverDocsTocUIPlugin extends Plugin {
    static override pluginName = 'DOCS_TOC_UI_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: IUniverDocsTocUIConfig = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        const { menu, ...rest } = merge({}, defaultPluginConfig, this._config);
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(DOCS_TOC_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [ComponentsController],
            [DocsTocUIController],
            [TableOfContentsRibbonController],
        ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));
        this._injector.get(ComponentsController);
        this._injector.get(DocsTocUIController);
    }

    override onReady(): void {
        this._injector.get(TableOfContentsRibbonController);
    }

    override onRendered(): void {
        this.disposeWithMe(this._renderManagerService.registerRenderModule(
            UniverInstanceType.UNIVER_DOC,
            [TableOfContentsHighlightRenderController]
        ));
    }
}
