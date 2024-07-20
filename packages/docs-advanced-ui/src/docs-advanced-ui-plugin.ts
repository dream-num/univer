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

import { DependentOn, Inject, Injector, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { DocContextMenuRenderController } from './controllers/render-controllers/contextmenu.render-controller';
import { DocResizeRenderController } from './controllers/render-controllers/doc-resize.render-controller';
import type { IDocAdvancedUIConfig } from './controllers/doc-advanced-ui.controller';
import { DocAdvancedUIController } from './controllers/doc-advanced-ui.controller';

const DOC_ADVANCED_UI_PLUGIN_NAME = 'DOC_ADVANCED_UI_PLUGIN_NAME';

/**
 * Plugin for docs editor ui, shouldn't register to sheets
 */
@DependentOn(UniverDocsUIPlugin)
export class UniverDocsAdvancedUIPlugin extends Plugin {
    static override pluginName = DOC_ADVANCED_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private readonly _config: IDocAdvancedUIConfig,
        @Inject(Injector) override _injector: Injector,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService
    ) {
        super();

        this._config = Tools.deepMerge({}, {}, this._config);
        this._initDependencies(_injector);
    }

    override onRendered(): void {
        this._initRenderModules();
    }

    private _initDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            [DocAdvancedUIController, { useFactory: () => this._injector.createInstance(DocAdvancedUIController, this._config) }],
        ];

        dependencies.forEach((d) => injector.add(d));
    }

    private _initRenderModules(): void {
        ([
            [DocResizeRenderController],
            [DocContextMenuRenderController],
        ] as Dependency[]).forEach((m) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m);
        });
    }
}
