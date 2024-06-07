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

import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { DependentOn, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsHyperLinkRemoveSheetController } from './controllers/remove-sheet.controller';
import { SheetsHyperLinkRenderController, SheetsHyperLinkRenderManagerController } from './controllers/render-controllers/render.controller';
import { SheetsHyperLinkPopupService } from './services/popup.service';
import { SheetsHyperLinkResolverService } from './services/resolver.service';
import { SheetHyperLinkSetRangeController } from './controllers/set-range.controller';
import { SheetsHyperLinkPopupController } from './controllers/popup.controller';
import type { IUniverSheetsHyperLinkUIConfig } from './controllers/ui.controller';
import { SheetsHyperLinkUIController } from './controllers/ui.controller';
import { SHEET_HYPER_LINK_UI_PLUGIN } from './types/const';
import { SheetsHyperLinkAutoFillController } from './controllers/auto-fill.controller';
import { SheetsHyperLinkCopyPasteController } from './controllers/copy-paste.controller';
import { SheetHyperLinkUrlController } from './controllers/url.controller';
import { SheetsHyperLinkPermissionController } from './controllers/hyper-link-permission.controller';

@DependentOn(UniverSheetsHyperLinkPlugin)
export class UniverSheetsHyperLinkUIPlugin extends Plugin {
    static override pluginName: string = SHEET_HYPER_LINK_UI_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private _config: IUniverSheetsHyperLinkUIConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = [
            [SheetsHyperLinkResolverService],
            [SheetsHyperLinkPopupService],

            [SheetsHyperLinkRemoveSheetController],
            [SheetsHyperLinkRenderManagerController],
            [SheetHyperLinkSetRangeController],
            [SheetsHyperLinkPopupController],
            [
                SheetsHyperLinkUIController,
                {
                    useFactory: () => this._injector.createInstance(SheetsHyperLinkUIController, this._config),
                },
            ],
            [SheetsHyperLinkAutoFillController],
            [SheetsHyperLinkCopyPasteController],
            [SheetsHyperLinkPermissionController],
            [SheetHyperLinkUrlController],
        ];

        dependencies.forEach((dep) => injector.add(dep));

        this._renderManagerService.registerRenderController(UniverInstanceType.UNIVER_SHEET, SheetsHyperLinkRenderController);
    }
}
