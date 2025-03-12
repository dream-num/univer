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
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverUIPlugin } from '@univerjs/ui';
import { DocQuickInsertTriggerController } from './controllers/doc-quick-insert-trigger.controller';
import { DocQuickInsertUIController } from './controllers/doc-quick-insert-ui.controller';
import { DocQuickInsertPopupService } from './services/doc-quick-insert-popup.service';
import { DocQuickInsertService } from './services/doc-quick-insert.service';

const PLUGIN_NAME = 'DOC_QUICK_INSERT_PLUGIN';

@DependentOn(UniverDrawingUIPlugin, UniverDrawingPlugin, UniverDocsDrawingPlugin, UniverUIPlugin)
export class UniverDocsQuickInsertUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_DOC;
    static override pluginName = PLUGIN_NAME;

    constructor(
        // private readonly _config: Partial<IUniverDocsDrawingUIConfig>,
        @Inject(Injector) protected _injector: Injector,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {}
            // defaultPluginConfig,
            // this._config
        );
        // this._configService.setConfig(DOCS_DRAWING_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const dependencies: Dependency[] = [
            [DocQuickInsertUIController],
            [DocQuickInsertTriggerController],
            [DocQuickInsertService],
            [DocQuickInsertPopupService],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));

        this._injector.get(DocQuickInsertUIController);
    }

    override onReady(): void {
        // ([] as Dependency[]).forEach((m) => this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m));
    }

    override onRendered(): void {
        this._injector.get(DocQuickInsertTriggerController);
        this._injector.get(DocQuickInsertPopupService);
    }
}
