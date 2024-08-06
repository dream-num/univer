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

import { DependentOn, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { UniverDocsHyperLinkPlugin } from '@univerjs/docs-hyper-link';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DOC_HYPER_LINK_UI_PLUGIN } from './types/const';
import type { IDocHyperLinkUIConfig } from './controllers/ui.controller';
import { DocHyperLinkUIController } from './controllers/ui.controller';
import { DocHyperLinkPopupService } from './services/hyper-link-popup.service';
import { DocHyperLinkSelectionController } from './controllers/doc-hyper-link-selection.controller';
import { DocHyperLinkRenderController } from './controllers/render-controllers/render.controller';
import { DocHyperLinkClipboardController } from './controllers/doc-hyper-link-clipboard.controller';
import { DocHyperLinkCustomRangeController } from './controllers/doc-hyper-link-custom-range.controller';

@DependentOn(UniverDocsHyperLinkPlugin)
export class UniverDocsHyperLinkUIPlugin extends Plugin {
    static override pluginName = DOC_HYPER_LINK_UI_PLUGIN;
    static override type = UniverInstanceType.UNIVER_DOC;

    constructor(
        private _config: IDocHyperLinkUIConfig = { menu: {} },
        @Inject(Injector) protected override _injector: Injector,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService
    ) {
        super();
    }

    override onStarting(): void {
        const deps: Dependency[] = [
            [DocHyperLinkPopupService],
            [DocHyperLinkUIController,
                {
                    useFactory: () => this._injector.createInstance(DocHyperLinkUIController, this._config),
                },
            ],
            [DocHyperLinkSelectionController],
            [DocHyperLinkClipboardController],
            [DocHyperLinkCustomRangeController],
        ];

        deps.forEach((dep) => {
            this._injector.add(dep);
        });
    }

    override onRendered(): void {
        this._initRenderModule();
    }

    private _initRenderModule() {
        [DocHyperLinkRenderController].forEach((dep) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, dep as unknown as Dependency);
        });
    }
}
