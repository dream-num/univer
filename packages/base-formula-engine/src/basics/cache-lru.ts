import { hashAlgorithm, LRUMap } from '@univerjs/core';

// export const CACHE_FORMULA_AST = new LRUMap<string, AstRootNode>(100000);

export class FormulaAstLRU<T> {
    private _cache: LRUMap<number, T>;

    constructor(cacheCount: number) {
        this._cache = new LRUMap<number, T>(cacheCount);
    }

    set(formulaString: string, node: T) {
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
