import { hashAlgorithm, LRUMap } from '@univerjs/core';

import { AstRootNode } from './ast-root-node';

// export const CACHE_FORMULA_AST = new LRUMap<string, AstRootNode>(100000);

const FORMULA_AST_CACHE_LRU_COUNT = 100000;

class FormulaAstLRU {
    private _cache = new LRUMap<number, AstRootNode>(FORMULA_AST_CACHE_LRU_COUNT);

    set(formulaString: string, node: AstRootNode) {
        const hash = this._hash(formulaString);
        this._cache.set(hash, node);
    }

    get(formulaString: string) {
        const hash = this._hash(formulaString);
        return this._cache.get(hash);
    }

    clear() {
        this._cache.clear();
    }

    private _hash(formulaString: string) {
        return hashAlgorithm(formulaString);
    }
}

export const FormulaASTCache = new FormulaAstLRU();
