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
import { type Dependency, Inject, type Injector } from '@wendellhu/redi';

import { FindReplaceController } from './controllers/find-replace.controller';
import { zhCN } from './locale';
import { FindReplaceService, IFindReplaceService } from './services/find-replace.service';

const PLUGIN_NAME = 'FIND_REPLACE';

export class UniverFindReplacePlugin extends Plugin {
    constructor(
        protected readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAME);

        this._localeService.load({
            zhCN,
        });
    }

    override onStarting(injector: Injector): void {
        ([[FindReplaceController], [IFindReplaceService, { useClass: FindReplaceService }]] as Dependency[]).forEach(
            (d) => {
                injector.add(d);
            }
        );
    }
}
