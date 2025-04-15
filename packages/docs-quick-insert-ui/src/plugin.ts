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
import { DependentOn, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverUIPlugin } from '@univerjs/ui';
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
        @Inject(Injector) protected _injector: Injector,
        @Inject(IRenderManagerService) private _renderManagerSrv: IRenderManagerService
    ) {
        super();
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
