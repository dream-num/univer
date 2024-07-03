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

import { DependentOn, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocDrawingPopupMenuController } from './controllers/drawing-popup-menu.controller';
import { DocDrawingUIController } from './controllers/doc-drawing.controller';
import { DocDrawingUpdateRenderController } from './controllers/render-controllers/doc-drawing-update.render-controller';
import { DocDrawingTransformUpdateController } from './controllers/render-controllers/doc-drawing-transform-update.controller';
import { DocDrawingAddRemoveController } from './controllers/doc-drawing-notification.controller';
import { DocDrawingTransformerController } from './controllers/doc-drawing-transformer-update.controller';

const PLUGIN_NAME = 'DOCS_DRAWING_UI_PLUGIN';

@DependentOn(UniverDrawingUIPlugin, UniverDrawingPlugin, UniverDocsDrawingPlugin)
export class UniverDocsDrawingUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_DOC;
    static override pluginName = PLUGIN_NAME;

    constructor(
        _config: undefined,
        @Inject(Injector) protected _injector: Injector,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = [
            [DocDrawingUIController],
            [DocDrawingPopupMenuController],
            [DocDrawingTransformerController],
            [DocDrawingAddRemoveController],
        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }

    override onReady(): void {
        ([
            DocDrawingUpdateRenderController,
            DocDrawingTransformUpdateController,
        ]).forEach((m) => this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, m));
    }
}
