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

import type { Injector } from '@univerjs/core';
import type { BaseAstNode, ISheetData, LexerNode } from '@univerjs/engine-formula';
import { AstTreeBuilder, generateExecuteAstNodeData, getObjectValue, IFormulaCurrentConfigService, Interpreter, Lexer } from '@univerjs/engine-formula';

export function calculateFormula(inject: Injector, formulaString: string, unitId: string, sheetData: ISheetData) {
    const formulaCurrentConfigService = inject.get(IFormulaCurrentConfigService);
    const lexer = inject.get(Lexer);
    const astTreeBuilder = inject.get(AstTreeBuilder);
    const interpreter = inject.get(Interpreter);
    formulaCurrentConfigService.load({
        formulaData: {},
        arrayFormulaCellData: {},
        arrayFormulaRange: {},
        forceCalculate: false,
        dirtyRanges: [],
        dirtyNameMap: {},
        dirtyDefinedNameMap: {},
        dirtyUnitFeatureMap: {},
        excludedCell: {},
        allUnitData: {
            [unitId]: sheetData,
        },
        dirtyUnitOtherFormulaMap: {},
    });

    const lexerNode = lexer.treeBuilder(formulaString);
    const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
    const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));
    return getObjectValue(result);
}
