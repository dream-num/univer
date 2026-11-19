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

import { LRUMap } from '@univerjs/core';

export class FormulaAstLRU<T> {
    private _cache: LRUMap<string, T>;

    constructor(cacheCount: number) {
        this._cache = new LRUMap<string, T>(cacheCount);
    }

    // The full key is stored as-is. Hashing long keys into 32 bits let two different
    // formulas share one entry, so a cell could be evaluated with another cell's AST.
    set(formulaString: string, node: T) {
        this._cache.set(formulaString, node);
    }

    get(formulaString: string) {
        return this._cache.get(formulaString);
    }

    clear() {
        this._cache.clear();
    }

    delete(formulaString: string) {
        this._cache.delete(formulaString);
    }

    forEach(callbackfn: (value: T, key: string, map: LRUMap<string, T>) => void, thisArg?: any) {
        this._cache.forEach(callbackfn, thisArg);
    }
}
