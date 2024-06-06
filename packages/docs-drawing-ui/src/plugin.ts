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

import { LocaleService, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { DocDrawingPopupMenuController } from './controllers/drawing-popup-menu.controller';
import { DocDrawingUIController } from './controllers/doc-drawing.controller';
import { DocDrawingUpdateController } from './controllers/doc-drawing-update.controller';

const PLUGIN_NAME = 'Docs_Drawing_UI_PLUGIN';

export class UniverDocsDrawingUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_DOC;
    static override pluginName = PLUGIN_NAME;
    constructor(
        config: undefined,
        @Inject(Injector) protected _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [

            // services

            // controllers
            [DocDrawingUIController],
            [DocDrawingUpdateController],
            [DocDrawingPopupMenuController],
        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
