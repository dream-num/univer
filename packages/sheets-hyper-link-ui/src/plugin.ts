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
import { Plugin, UniverInstanceType } from '@univerjs/core';
import { SheetsHyperLinkRemoveSheetController } from './controllers/remove-sheet.controller';
import { SheetsHyperLinkRefRangeController } from './controllers/ref-range.controller';
import { SheetsHyperLinkRenderController } from './controllers/render-controllers/render.controller';
import { SheetsHyperLinkPopupService } from './services/popup.service';
import { SheetsHyperLinkResolverService } from './services/resolver.service';

const SHEETS_HYPER_LINK_UI_PLUGIN = 'univer.sheets.hyper-link-ui';

export class UniverSheetsHyperLinkPlugin extends Plugin {
    static override pluginName: string = SHEETS_HYPER_LINK_UI_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        @Inject(Injector) protected _injector: Injector
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = [
            [SheetsHyperLinkResolverService],
            [SheetsHyperLinkPopupService],

            [SheetsHyperLinkRemoveSheetController],
            [SheetsHyperLinkRefRangeController],
            [SheetsHyperLinkRenderController],
        ];

        dependencies.forEach((dep) => {
            injector.add(dep);
        });
    }
}
