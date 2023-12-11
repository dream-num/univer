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

import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
// import { TextFinder } from './domain/text-find';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FIND_PLUGIN_NAME } from './const/plugin-name';
import { FindController } from './controllers/find-controller';
import { FindModalController } from './controllers/find-modal-controller';
import { TextFinder } from './domain/text-find';
import { zhCN } from './locale';
import { FindService } from './services/find.service';
// import { FindPluginObserve, install } from './basics/observer';
// import { FindModalController } from './controllers/find-modal-controller';
// import { TextFinder } from './domain';

export interface IFindPluginConfig {}

export class FindPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _config: IFindPluginConfig = {};

    private _findController: FindController | null = null;

    private _findModalController: FindModalController | null = null;

    constructor(
        config: Partial<IFindPluginConfig>,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super(FIND_PLUGIN_NAME);

        this.initializeDependencies(_injector);
    }

    // installTo(universheetInstance: UniverSheet) {
    //     universheetInstance.installPlugin(this);
    // }

    // installTo(universheetInstance: UniverSheet) {
    //     universheetInstance.installPlugin(this);

    //     this._textFinder = new TextFinder(this);
    //     this._findModalController = new FindModalController(this);
    //     this._findController = new FindController(this);

    //     const context = this.getContext();
    //     let sheetsPlugin = context.getUniver().getGlobalContext().getPluginManager().getRequirePluginByName<UniverSheetsUI>(SHEET_UI_PLUGIN_NAME);
    //     sheetsPlugin?.UIDidMount(() => {
    //         sheetsPlugin.getComponentManager().register('SearchIcon', Icon.SearchIcon);
    //         sheetsPlugin.addToolButton(this._findController.getFindList());
    //     });
    // }

    initialize(): void {
        this._localeService.load({
            zhCN,
        });

        this.initController();
    }

    // createTextFinder(workSheet: Worksheet, type: FindType, text: string) {
    //     // return new TextFinder(workSheet, type, text);
    // }

    override onRendered(): void {
        this.initialize();
    }

    initController() {
        this._findController = this._injector.get(FindController);
        this._findModalController = this._injector.get(FindModalController);
    }

    initializeDependencies(sheetInjector: Injector) {
        const dependencies: Dependency[] = [[FindController], [TextFinder], [FindModalController], [FindService]];

        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
