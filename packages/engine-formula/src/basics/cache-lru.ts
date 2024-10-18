/**
 * Copyright 2023-present DreamNum Inc.
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

import { hashAlgorithm, LRUMap } from '@univerjs/core';

// export const CACHE_FORMULA_AST = new LRUMap<string, AstRootNode>(100000);

export class FormulaAstLRU<T> {
    private _cache: LRUMap<string, T>;

    constructor(cacheCount: number) {
        this._cache = new LRUMap<string, T>(cacheCount);
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
        if (formulaString.length <= 64) {
            return formulaString;
        }
        return hashAlgorithm(formulaString).toString();
    }
}
