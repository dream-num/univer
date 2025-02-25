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

import type { Nullable, ObjectMatrix } from '@univerjs/core';
import type { IDiscreteRange } from '../../controllers/utils/range-tools';

import type { COPY_TYPE, ICellDataWithSpanInfo } from './type';
import { LRUMap, Tools } from '@univerjs/core';

const COPY_CONTENT_CACHE_LIMIT = 10;
const ID_LENGTH = 6;

export interface ICopyContentCacheData {
    subUnitId: string;
    unitId: string;
    range: IDiscreteRange;
    copyType: COPY_TYPE;
    matrix: Nullable<ObjectMatrix<ICellDataWithSpanInfo>>;
}

export function genId() {
    return Tools.generateRandomId(ID_LENGTH);
}

export function extractId(html: string) {
    const match = html.match(/data-copy-id="([^\s]+)"/);

    if (match && match[1]) {
        return match[1];
    }

    return null;
}

export class CopyContentCache {
    private _cache = new LRUMap<string, ICopyContentCacheData>(COPY_CONTENT_CACHE_LIMIT);

    set(id: string, clipboardData: ICopyContentCacheData) {
        this._cache.set(id, clipboardData);
    }

    get(id: string) {
        return this._cache.get(id);
    }

    del(id: string) {
        this._cache.delete(id);
    }

    clear() {
        this._cache.clear();
    }

    clearWithUnitId(unitId: string) {
        this._cache.forEach((value, key) => {
            if (value.unitId === unitId) {
                this._cache.delete(key);
            }
        });
    }
}

export const copyContentCache = new CopyContentCache();
