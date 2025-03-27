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
import { DependentOn, Inject, Injector, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';

import { IUniFormulaService, UniverDocUniFormulaPlugin } from '@univerjs/uni-formula';
import { DOC_FORMULA_UI_PLUGIN_NAME } from './const';
import { DocUniFormulaInputController } from './controllers/doc-formula-input.controller';
import { SlideUniFormulaInputController } from './controllers/slide-formula-input.controller';
import { UniFormulaUniController } from './controllers/uni-formula-ui.controller';
import { UniFormulaPopupService } from './services/formula-popup.service';
import { SlideUIFormulaCacheService } from './services/slide-ui-formula-cache.service';
import { UniFormulaService } from './services/uni-formula.service';

@DependentOn(UniverDocUniFormulaPlugin)
export class UniverDocUniFormulaUIPlugin extends Plugin {
    static override pluginName: string = DOC_FORMULA_UI_PLUGIN_NAME;
    static override type: UniverInstanceType = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        _config: unknown,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting() {
        ([
            [UniFormulaUniController],
            [DocUniFormulaInputController],
            [SlideUniFormulaInputController],
            [SlideUIFormulaCacheService],
            [UniFormulaPopupService],
            [IUniFormulaService, { useClass: UniFormulaService }],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [IUniFormulaService],
        ]);
    }

    override onSteady(): void {
        touchDependencies(this._injector, [
            [UniFormulaUniController],
            [DocUniFormulaInputController],
            [SlideUniFormulaInputController],
        ]);
    }
}
