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

import { Disposable, IConfigService, LRUMap, Optional } from '@univerjs/core';
import type { IFunctionNames } from '../basics/function';
import type { IUniverEngineFormulaConfig } from '../config/config';
import type { LexerNode } from '../engine/analysis/lexer-node';
import type { AstRootNode } from '../engine/ast-node/ast-root-node';
import type { BaseAstNode } from '../engine/ast-node/base-ast-node';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import { FormulaAstLRU } from '../basics/cache-lru';
import { normalizeFunctionToken } from '../basics/function';
import { InvertedIndexCache } from '../basics/inverted-index-cache';
import { prefixToken } from '../basics/token';
import { ENGINE_FORMULA_PLUGIN_CONFIG_KEY } from '../config/config';

function usesFunction(node: BaseAstNode | LexerNode, names: Set<string>): boolean {
    let token = node.getToken().trim().toUpperCase();
    if (token[0] === prefixToken.MINUS || token[0] === prefixToken.AT) token = token.slice(1);
    return names.has(normalizeFunctionToken(token)) || node.getChildren().some((child) =>
        typeof child !== 'string' && usesFunction(child, names));
}

/** Runtime-only context. Values may outlive a calculation, but must not revive its caches. */
export class FormulaCalculationCache extends Disposable {
    readonly references = new FormulaAstLRU<ArrayValueObject>(10000);
    readonly invertedIndex = new InvertedIndexCache();

    get closed(): boolean {
        return this._disposed;
    }

    clearUnit(unitId: string): void {
        this.references.forEach((value, key) => {
            if (value.getUnitId() === unitId) {
                this.references.delete(key);
            }
        });
        this.invertedIndex.deleteUnit(unitId);
    }

    override dispose(): void {
        super.dispose();
        this.references.clear();
        this.invertedIndex.clear();
    }
}

export const DEFAULT_FORMULA_AST_CACHE_LIMIT = 5000;
export const DEFAULT_FORMULA_LEXER_TREE_CACHE_LIMIT = 2000;

/** One owner per Univer injector; no dependency on the parser, calculator or function registry. */
export class FormulaCacheService extends Disposable {
    private readonly _asts: LRUMap<string, { unitId: string; node: AstRootNode }>;
    private readonly _lexerTrees: LRUMap<string, { unitId?: string | null; node: LexerNode }>;
    private readonly _calculations = new Set<FormulaCalculationCache>();

    constructor(
        @Optional(IConfigService) private readonly _configService?: IConfigService
    ) {
        super();

        const config = this._configService?.getConfig<IUniverEngineFormulaConfig>(ENGINE_FORMULA_PLUGIN_CONFIG_KEY);
        const astLimit = config?.astCacheSize ?? DEFAULT_FORMULA_AST_CACHE_LIMIT;
        const lexerLimit = config?.lexerTreeCacheSize ?? DEFAULT_FORMULA_LEXER_TREE_CACHE_LIMIT;

        this._asts = new LRUMap<string, { unitId: string; node: AstRootNode }>(astLimit);
        this._lexerTrees = new LRUMap<string, { unitId?: string | null; node: LexerNode }>(lexerLimit);
    }

    get closed(): boolean {
        return this._disposed;
    }

    get astLimit(): number {
        return this._asts.limit;
    }

    get lexerTreeLimit(): number {
        return this._lexerTrees.limit;
    }

    setAstLimit(limit: number): void {
        this._asts.limit = limit;
        while (this._asts.size > this._asts.limit) {
            this._asts.shift();
        }
    }

    setLexerTreeLimit(limit: number): void {
        this._lexerTrees.limit = limit;
        while (this._lexerTrees.size > this._lexerTrees.limit) {
            this._lexerTrees.shift();
        }
    }

    ensureAstCapacity(requiredCapacity: number): void {
        if (requiredCapacity > this._asts.limit) {
            this._asts.limit = requiredCapacity;
        }
    }

    ensureLexerTreeCapacity(requiredCapacity: number): void {
        if (requiredCapacity > this._lexerTrees.limit) {
            this._lexerTrees.limit = requiredCapacity;
        }
    }

    getAst(key: string): AstRootNode | undefined {
        return this._asts.get(key)?.node;
    }

    setAst(key: string, unitId: string, node: AstRootNode): void {
        if (!this._disposed) {
            this._asts.set(key, { unitId, node });
        }
    }

    getLexerTree(key: string): LexerNode | undefined {
        return this._lexerTrees.get(key)?.node;
    }

    setLexerTree(key: string, node: LexerNode, unitId?: string | null): void {
        if (!this._disposed) {
            this._lexerTrees.set(key, { unitId, node });
        }
    }

    clearCompiled(): void {
        this._asts.clear();
        this._lexerTrees.clear();
    }

    clearFunctions(functionNames: IFunctionNames[]): void {
        const names = new Set(functionNames.map((name) => String(name).toUpperCase()));
        this._asts.forEach((entry, key) => {
            if (usesFunction(entry.node, names)) {
                this._asts.delete(key);
            }
        });
        this._lexerTrees.forEach((entry, key) => {
            if (usesFunction(entry.node, names)) {
                this._lexerTrees.delete(key);
            }
        });
    }

    clearUnit(unitId: string): void {
        this._asts.forEach((entry, key) => {
            if (entry.unitId === unitId) {
                this._asts.delete(key);
            }
        });
        this._lexerTrees.forEach((entry, key) => {
            if (entry.unitId === unitId) {
                this._lexerTrees.delete(key);
            }
        });
        this._calculations.forEach((context) => context.clearUnit(unitId));
    }

    createCalculation(): FormulaCalculationCache | undefined {
        if (this._disposed) {
            return;
        }
        const context = new FormulaCalculationCache();
        this._calculations.add(context);
        return context;
    }

    releaseCalculation(context: FormulaCalculationCache): void {
        context.dispose();
        this._calculations.delete(context);
    }

    override dispose(): void {
        super.dispose();
        this.clearCompiled();
        this._calculations.forEach((context) => context.dispose());
        this._calculations.clear();
    }
}
