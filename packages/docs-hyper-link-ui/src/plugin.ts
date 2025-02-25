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
import type { IUniverDocsHyperLinkUIConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsHyperLinkPlugin } from '@univerjs/docs-hyper-link';
import { IRenderManagerService } from '@univerjs/engine-render';
import { defaultPluginConfig, DOCS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DocHyperLinkSelectionController } from './controllers/doc-hyper-link-selection.controller';
import { DocHyperLinkEventRenderController } from './controllers/render-controllers/hyper-link-event.render-controller';
import { DocHyperLinkRenderController } from './controllers/render-controllers/render.controller';
import { DocHyperLinkUIController } from './controllers/ui.controller';
import { DocHyperLinkPopupService } from './services/hyper-link-popup.service';
import { DOC_HYPER_LINK_UI_PLUGIN } from './types/const';

@DependentOn(UniverDocsHyperLinkPlugin)
export class UniverDocsHyperLinkUIPlugin extends Plugin {
    static override pluginName = DOC_HYPER_LINK_UI_PLUGIN;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: Partial<IUniverDocsHyperLinkUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
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
        this._configService.setConfig(DOCS_HYPER_LINK_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const deps: Dependency[] = [
            [DocHyperLinkPopupService],
            [DocHyperLinkUIController],
            [DocHyperLinkSelectionController],
        ];
        deps.forEach((dep) => {
            this._injector.add(dep);
        });

        this._injector.get(DocHyperLinkUIController);
    }

    override onReady(): void {
        this._injector.get(DocHyperLinkSelectionController);
    }

    override onRendered(): void {
        this._initRenderModule();
    }

    private _initRenderModule() {
        ([
            [DocHyperLinkRenderController],
            [DocHyperLinkEventRenderController],
        ] as Dependency[]).forEach((dep) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, dep);
        });
    }
}
