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
import type { IUniverDocsQuickInsertUIConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverUIPlugin } from '@univerjs/ui';
import { defaultPluginConfig, DOCS_QUICK_INSERT_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DocQuickInsertMenuController } from './controllers/doc-quick-insert-menu.controller';
import { DocQuickInsertTriggerController } from './controllers/doc-quick-insert-trigger.controller';
import { DocQuickInsertUIController } from './controllers/doc-quick-insert-ui.controller';
import { DocQuickInsertPopupService } from './services/doc-quick-insert-popup.service';

const PLUGIN_NAME = 'DOC_QUICK_INSERT_UI_PLUGIN';

@DependentOn(UniverDrawingUIPlugin, UniverDrawingPlugin, UniverDocsDrawingUIPlugin, UniverDocsDrawingPlugin, UniverUIPlugin)
export class UniverDocsQuickInsertUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_DOC;
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverDocsQuickInsertUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @Inject(IRenderManagerService) private _renderManagerSrv: IRenderManagerService,
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
        this._configService.setConfig(DOCS_QUICK_INSERT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const dependencies: Dependency[] = [
            [DocQuickInsertUIController],
            [DocQuickInsertTriggerController],
            [DocQuickInsertPopupService],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));

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
