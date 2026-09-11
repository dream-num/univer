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
import type { IUniverDocsQuickInsertUIConfig } from './config/config';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDocsDrawingMobileUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniverDocsMobileUIPlugin } from '@univerjs/docs-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingMobileUIPlugin } from '@univerjs/drawing-ui';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import pkg from '../package.json';
import { defaultPluginConfig, DOCS_QUICK_INSERT_UI_PLUGIN_CONFIG_KEY, DOCS_QUICK_INSERT_UI_PLUGIN_NAME } from './config/config';
import { DocQuickInsertTriggerController } from './controllers/doc-quick-insert-trigger.controller';
import { MobileComponentsController } from './controllers/mobile/components.controller';
import { DocQuickInsertUIController } from './controllers/ui.controller';
import { DocQuickInsertMenuController } from './menu/doc-quick-insert-menu.controller';
import { DocQuickInsertPopupService } from './services/doc-quick-insert-popup.service';

@DependentOn(
    UniverDocsPlugin,
    UniverDocsDrawingPlugin,
    UniverDocsDrawingMobileUIPlugin,
    UniverDocsMobileUIPlugin,
    UniverDrawingPlugin,
    UniverDrawingMobileUIPlugin,
    UniverRenderEnginePlugin
)
export class UniverDocsQuickInsertMobileUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_DOC;
    static override pluginName = DOCS_QUICK_INSERT_UI_PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;

    constructor(
        private readonly _config: Partial<IUniverDocsQuickInsertUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @Inject(IRenderManagerService) private _renderManagerSrv: IRenderManagerService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(DOCS_QUICK_INSERT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const dependencies: Dependency[] = [
            [MobileComponentsController],
            [DocQuickInsertUIController],
            [DocQuickInsertTriggerController],
            [DocQuickInsertPopupService],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));

        this._injector.get(MobileComponentsController);
        this._injector.get(DocQuickInsertUIController);
    }

    override onRendered(): void {
        this._injector.get(DocQuickInsertTriggerController);
        this._injector.get(DocQuickInsertPopupService);

        ([
            [DocQuickInsertMenuController],
        ] as Dependency[]).forEach((m) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m);
        });
    }
}
