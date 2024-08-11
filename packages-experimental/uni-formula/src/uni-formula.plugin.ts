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

import type { Dependency } from '@univerjs/core';
import { Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { DumbUniFormulaService, IUniFormulaService } from './services/uni-formula.service';
import { UNI_FORMULA_PLUGIN_NAME } from './const';
import { UniFormulaController } from './controller/uni-formula.controller';

export class UniverDocUniFormulaPlugin extends Plugin {
    static override pluginName: string = UNI_FORMULA_PLUGIN_NAME;

    // This plugin should load only when sheet related modules are loaded.
    static override type: UniverInstanceType = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: { playDumb: boolean } | undefined,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(): void {
        this._injector.add([UniFormulaController]);
        this._injector.get(UniFormulaController);

        if (this._config?.playDumb) {
            this._injector.add([IUniFormulaService, { useClass: DumbUniFormulaService }] as Dependency);
            this._injector.get(IUniFormulaService);
        }
    }
}
