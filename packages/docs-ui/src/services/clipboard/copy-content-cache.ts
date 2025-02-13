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

import type { IDocumentData } from '@univerjs/core';
import { LRUMap, Tools } from '@univerjs/core';

const COPY_CONTENT_CACHE_LIMIT = 10;
const ID_LENGTH = 6;

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
    private _cache = new LRUMap<string, Partial<IDocumentData>>(COPY_CONTENT_CACHE_LIMIT);

    set(id: string, clipboardData: Partial<IDocumentData>) {
        this._cache.set(id, clipboardData);
    }

    get(id: string) {
        return this._cache.get(id);
    }

    clear() {
        this._cache.clear();
    }
}

export const copyContentCache = new CopyContentCache();
