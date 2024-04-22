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

import { LocaleService, Plugin } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

const PLUGIN_NAME = 'SHEETS_IMAGE_UI_PLUGIN';

export class UniverSheetsImageUIPlugin extends Plugin {
    constructor(
        config: undefined,
        @Inject(Injector) protected _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAME);
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [

            // services

            // controllers

        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
