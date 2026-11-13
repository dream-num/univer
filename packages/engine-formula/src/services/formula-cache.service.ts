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

import { Disposable, LRUMap } from '@univerjs/core';
import type { IFunctionNames } from '../basics/function';
import type { LexerNode } from '../engine/analysis/lexer-node';
import type { AstRootNode } from '../engine/ast-node/ast-root-node';
import type { BaseAstNode } from '../engine/ast-node/base-ast-node';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import { FormulaAstLRU } from '../basics/cache-lru';
import { normalizeFunctionToken } from '../basics/function';
import { InvertedIndexCache } from '../basics/inverted-index-cache';
import { prefixToken } from '../basics/token';

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

/** One owner per Univer injector; no dependency on the parser, calculator or function registry. */
export class FormulaCacheService extends Disposable {
    private readonly _asts = new LRUMap<string, { unitId: string; node: AstRootNode }>(5000);
    private readonly _lexerTrees = new LRUMap<string, { unitId?: string | null; node: LexerNode }>(2000);
    private readonly _calculations = new Set<FormulaCalculationCache>();

    get closed(): boolean {
        return this._disposed;
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
