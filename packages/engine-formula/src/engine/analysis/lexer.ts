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

import type { Nullable } from '@univerjs/core';
import { Disposable, Inject } from '@univerjs/core';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IDefinedNamesService } from '../../services/defined-names.service';
import { FormulaCacheService } from '../../services/formula-cache.service';
import { IFunctionService } from '../../services/function.service';
import { LexerNode } from './lexer-node';
import { LexerTreeBuilder } from './lexer-tree-builder';

export class Lexer extends Disposable {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IFormulaCurrentConfigService private readonly _formulaCurrentConfigService: IFormulaCurrentConfigService,
        @IFunctionService private readonly _functionService: IFunctionService,
        @Inject(FormulaCacheService) private readonly _cacheService: FormulaCacheService
    ) {
        super();
    }

    treeBuilder(formulaString: string, transformSuffix = true, unitId?: Nullable<string>, refOffsetX = 0, refOffsetY = 0) {
        const injectDefinedNameParam = this._definedNamesService.getAllDefinedNamesIsEmpty()
            ? undefined
            : {
                unitId: unitId ?? this._formulaCurrentConfigService.getExecuteUnitId(),
                sheetId: this._formulaCurrentConfigService.getExecuteSubUnitId(),
                refOffsetX,
                refOffsetY,
                hasFunction: this._functionService.hasExecutor.bind(this._functionService),
                getValueByName: this._definedNamesService.getValueByName.bind(this._definedNamesService),
                getDirtyDefinedNameMap: this._formulaCurrentConfigService.getDirtyDefinedNameMap.bind(this._formulaCurrentConfigService),
                getSheetName: this._formulaCurrentConfigService.getSheetName.bind(this._formulaCurrentConfigService),
            };
        // LET/LAMBDA trees are rewritten with AST-specific runtime parameter bindings.
        const isCacheable = transformSuffix === true && !/\b(?:LET|LAMBDA)\s*\(/iu.test(formulaString);
        const cacheKey = injectDefinedNameParam == null
            ? formulaString
            : `${injectDefinedNameParam.unitId ?? ''}\0${injectDefinedNameParam.sheetId ?? ''}\0${refOffsetX}\0${refOffsetY}\0${formulaString}`;
        if (isCacheable) {
            const lexerNode = this._cacheService.getLexerTree(cacheKey);
            if (lexerNode && (!injectDefinedNameParam || !this._isDefinedNameDirty(formulaString, injectDefinedNameParam.unitId, lexerNode))) {
                return lexerNode;
            }
        }

        const lexerNode = this._lexerTreeBuilder.treeBuilder(formulaString, transformSuffix, injectDefinedNameParam);
        if (isCacheable && lexerNode instanceof LexerNode) {
            this._cacheService.setLexerTree(cacheKey, lexerNode, injectDefinedNameParam?.unitId ?? undefined);
        }
        return lexerNode;
    }

    private _isDefinedNameDirty(formulaString: string, unitId: Nullable<string>, lexerNode: LexerNode): boolean {
        const definedNameMap = this._formulaCurrentConfigService.getDirtyDefinedNameMap();
        if (unitId != null && definedNameMap[unitId] != null) {
            const names = Object.keys(definedNameMap[unitId]!);
            for (let i = 0, len = names.length; i < len; i++) {
                const name = names[i];
                if (formulaString.indexOf(name) > -1 || lexerNode.getDefinedNames().includes(name)) {
                    return true;
                }
            }
        }
        return false;
    }
}
