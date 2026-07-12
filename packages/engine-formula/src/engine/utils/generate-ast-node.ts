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
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { IFormulaDependencyTree } from '../dependency/dependency-tree';
import { regexp } from '@univerjs/core';
import { FormulaAstLRU } from '../../basics/cache-lru';
import { ERROR_TYPE_SET } from '../../basics/error-type';
import { ErrorNode } from '../ast-node/base-ast-node';

const FORMULA_CACHE_LRU_COUNT = 5000;

export const FORMULA_AST_CACHE = new FormulaAstLRU<AstRootNode>(FORMULA_CACHE_LRU_COUNT);

type IDirtyStringMap = Record<string, string>;

const DIRTY_DEFINED_NAME_SET_CACHE = new WeakMap<IDirtyStringMap, Set<string>>();
const DIRTY_SUPER_TABLE_PATTERN_CACHE = new WeakMap<IDirtyStringMap, RegExp | null>();

export function generateAstNode(
    unitId: string,
    formulaString: string,
    lexer: Lexer,
    astTreeBuilder: AstTreeBuilder,
    currentConfigService: IFormulaCurrentConfigService,
    subUnitId?: string
): AstRootNode {
    if (subUnitId) {
        currentConfigService.setExecuteUnitId(unitId);
        currentConfigService.setExecuteSubUnitId(subUnitId);
    }

    const executeSubUnitId = subUnitId ?? currentConfigService.getExecuteSubUnitId() ?? '';
    const cacheKey = `${unitId}:${executeSubUnitId}:${formulaString}`;
    // refOffsetX and refOffsetY are separated by -, otherwise x:1 y:10 will be repeated with x:11 y:0
    let astNode: Nullable<AstRootNode> = FORMULA_AST_CACHE.get(cacheKey);

    // Dirty registry metadata invalidates the cached AST for this calculation because
    // defined names and SuperTable references are resolved while the AST is built.
    const shouldRebuildAst =
        checkIsChangedByDefinedName(unitId, formulaString, currentConfigService) ||
        checkIsChangedBySuperTable(unitId, formulaString, currentConfigService);

    if (!shouldRebuildAst && astNode && !isDirtyDefinedForNode(astNode, currentConfigService, unitId)) {
        // astNode.setRefOffset(refOffsetX, refOffsetY);
        return astNode;
    }

    const lexerNode = lexer.treeBuilder(formulaString, true, unitId);

    if (ERROR_TYPE_SET.has(lexerNode as ErrorType)) {
        return ErrorNode.create(lexerNode as ErrorType);
    }

    // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++

    astNode = astTreeBuilder.parse(lexerNode as LexerNode);

    if (astNode == null) {
        console.error('generateAstNode astNode is null');
        return ErrorNode.create(lexerNode as ErrorType);
    }

    // astNode.setRefOffset(refOffsetX, refOffsetY);
    // Rebuilding and caching are separate concerns: dirty metadata prevents reading
    // the old AST, while the newly parsed AST reflects the current registry and must
    // replace it. Otherwise, after the dirty map is cleared, an ordinary range
    // recalculation can fall back to the stale pre-registration AST.
    FORMULA_AST_CACHE.set(cacheKey, astNode);

    return astNode;
}

// Dirty defined names can make formula AST nodes inaccurate, so when a defined name is modified,
// related formulas must regenerate AST nodes and cannot use cache.
function checkIsChangedByDefinedName(unitId: string, formula: string, currentConfigService: IFormulaCurrentConfigService): boolean {
    const changedDefinedNameMap = currentConfigService.getDirtyDefinedNameMap();
    const unitDefinedNameMap = changedDefinedNameMap[unitId];

    if (unitDefinedNameMap == null) {
        return false;
    }

    // Dirty defined-name entries use the changed formula text as the key.
    return getNormalizedDirtyDefinedNameSet(unitDefinedNameMap).has(normalizeFormulaText(formula));
}

function normalizeFormulaText(formula: string): string {
    return formula.startsWith('=') ? formula.slice(1) : formula;
}

function checkIsChangedBySuperTable(unitId: string, formula: string, currentConfigService: IFormulaCurrentConfigService): boolean {
    const getDirtySuperTableMap = currentConfigService.getDirtySuperTableMap?.bind(currentConfigService);
    const changedSuperTableMap = getDirtySuperTableMap?.();
    const unitSuperTableMap = changedSuperTableMap?.[unitId];

    if (unitSuperTableMap == null) {
        return false;
    }

    const tableReferencePattern = getDirtySuperTableReferencePattern(unitSuperTableMap);
    return tableReferencePattern?.test(normalizeFormulaText(formula)) ?? false;
}

function getNormalizedDirtyDefinedNameSet(unitDefinedNameMap: IDirtyStringMap): Set<string> {
    let normalizedNameSet = DIRTY_DEFINED_NAME_SET_CACHE.get(unitDefinedNameMap);
    if (normalizedNameSet == null) {
        normalizedNameSet = new Set(Object.keys(unitDefinedNameMap).map(normalizeFormulaText));
        DIRTY_DEFINED_NAME_SET_CACHE.set(unitDefinedNameMap, normalizedNameSet);
    }

    return normalizedNameSet;
}

function getDirtySuperTableReferencePattern(unitSuperTableMap: IDirtyStringMap): RegExp | null {
    let tableReferencePattern = DIRTY_SUPER_TABLE_PATTERN_CACHE.get(unitSuperTableMap);
    if (tableReferencePattern === undefined) {
        const tableNames = Object.keys(unitSuperTableMap)
            .filter((tableName) => tableName.length > 0);

        tableReferencePattern = tableNames.length > 0
            ? regexp.createRegExpFromSafeFragment(`(^|[^A-Za-z0-9_])${regexp.or(...tableNames)}(\\s*\\[|$|[^A-Za-z0-9_])`, 'i')
            : null;
        DIRTY_SUPER_TABLE_PATTERN_CACHE.set(unitSuperTableMap, tableReferencePattern);
    }

    return tableReferencePattern;
}

function isDirtyDefinedForNode(node: BaseAstNode, currentConfigService: IFormulaCurrentConfigService, unitId: string) {
    const definedNameMap = currentConfigService.getDirtyDefinedNameMap();
    const executeUnitId = unitId;
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
        const dirtyDefinedName = isDirtyDefinedForNode(node, currentConfigService, tree.unitId);
        if (dirtyDefinedName) {
            return true;
        }
    }
    return false;
}
