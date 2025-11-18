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

import { Disposable, Inject } from '@univerjs/core';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IDefinedNamesService } from '../../services/defined-names.service';
import { LexerTreeBuilder } from './lexer-tree-builder';

export class Lexer extends Disposable {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IFormulaCurrentConfigService private readonly _formulaCurrentConfigService: IFormulaCurrentConfigService
    ) {
        super();
    }

    treeBuilder(formulaString: string, transformSuffix = true) {
        return this._lexerTreeBuilder.treeBuilder(formulaString, transformSuffix, {
            unitId: this._formulaCurrentConfigService.getExecuteUnitId(),
            getValueByName: this._definedNamesService.getValueByName.bind(this._definedNamesService),
            getDirtyDefinedNameMap: this._formulaCurrentConfigService.getDirtyDefinedNameMap.bind(this._formulaCurrentConfigService),
            getSheetName: this._formulaCurrentConfigService.getSheetName.bind(this._formulaCurrentConfigService),
        });
    }
}
