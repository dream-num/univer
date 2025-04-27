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
import { Inject, Injector, LocaleService, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { CustomMenuController } from './controllers/custom-menu.controller';
import enUS from './locale/en-US';
import zhCN from './locale/zh-CN';

const SHEET_CUSTOM_MENU_PLUGIN = 'SHEET_CUSTOM_MENU_PLUGIN';

export class UniverSheetsCustomMenuPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = SHEET_CUSTOM_MENU_PLUGIN;

    constructor(
        _config = {},
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._localeService.load({
            enUS,
            zhCN,
        });
    }

    override onStarting(): void {
        ([
            [CustomMenuController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onRendered(): void {
        touchDependencies(this._injector, [
            [CustomMenuController],
        ]);
    }
}
