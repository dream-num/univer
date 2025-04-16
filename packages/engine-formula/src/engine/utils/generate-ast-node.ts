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
import type { ErrorType } from '../../basics/error-type';
import type { IFormulaCurrentConfigService } from '../../services/current-data.service';
import type { Lexer } from '../analysis/lexer';
import type { LexerNode } from '../analysis/lexer-node';
import type { AstTreeBuilder } from '../analysis/parser';
import type { AstRootNode } from '../ast-node/ast-root-node';
import type { IFormulaDependencyTree } from '../dependency/dependency-tree';
import { FormulaAstLRU } from '../../basics/cache-lru';
import { ERROR_TYPE_SET } from '../../basics/error-type';
import { type BaseAstNode, ErrorNode } from '../ast-node/base-ast-node';

const FORMULA_CACHE_LRU_COUNT = 5000;

export const FORMULA_AST_CACHE = new FormulaAstLRU<AstRootNode>(FORMULA_CACHE_LRU_COUNT);

export function generateAstNode(unitId: string, formulaString: string, lexer: Lexer, astTreeBuilder: AstTreeBuilder, currentConfigService: IFormulaCurrentConfigService): AstRootNode {
    // refOffsetX and refOffsetY are separated by -, otherwise x:1 y:10 will be repeated with x:11 y:0
    let astNode: Nullable<AstRootNode> = FORMULA_AST_CACHE.get(`${unitId}${formulaString}`);

    if (astNode && !isDirtyDefinedForNode(astNode, currentConfigService)) {
        // astNode.setRefOffset(refOffsetX, refOffsetY);
        return astNode;
    }

    const lexerNode = lexer.treeBuilder(formulaString);

    if (ERROR_TYPE_SET.has(lexerNode as ErrorType)) {
        return ErrorNode.create(lexerNode as ErrorType);
    }

    // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++

    astNode = astTreeBuilder.parse(lexerNode as LexerNode);

    if (astNode == null) {
        throw new Error('astNode is null');
    }

    // astNode.setRefOffset(refOffsetX, refOffsetY);

    FORMULA_AST_CACHE.set(`${unitId}${formulaString}`, astNode);

    return astNode;
}

function isDirtyDefinedForNode(node: BaseAstNode, currentConfigService: IFormulaCurrentConfigService) {
    const definedNameMap = currentConfigService.getDirtyDefinedNameMap();
    const executeUnitId = currentConfigService.getExecuteUnitId();
    if (executeUnitId != null && definedNameMap[executeUnitId] != null) {
        const names = Object.keys(definedNameMap[executeUnitId]!);
        for (let i = 0, len = names.length; i < len; i++) {
            const name = names[i];
            if (node.hasDefinedName(name)) {
                return true;
            }
        }
    }

    return false;
}

export function includeDefinedName(tree: IFormulaDependencyTree, node: Nullable<AstRootNode>, currentConfigService: IFormulaCurrentConfigService) {
    /**
     * Detect whether the dirty map contains a defined name.
     */
    // const node = tree.nodeData?.node;
    if (node != null) {
        const dirtyDefinedName = isDirtyDefinedForNode(node, currentConfigService);
        if (dirtyDefinedName) {
            return true;
        }
    }
    return false;
}
