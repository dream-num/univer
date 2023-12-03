import type { IRange, ObjectMatrix } from '@univerjs/core';
import { LRUMap, Tools } from '@univerjs/core';

import type { COPY_TYPE, ICellDataWithSpanInfo } from './type';

const COPY_CONTENT_CACHE_LIMIT = 10;
const ID_LENGTH = 6;

export interface ICopyContentCacheData {
    worksheetId: string;
    workbookId: string;
    range: IRange;
    copyType: COPY_TYPE;
    matrix: ObjectMatrix<ICellDataWithSpanInfo>;
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
}

export const copyContentCache = new CopyContentCache();
