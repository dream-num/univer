import { IDocumentBody, LRUMap, Tools } from '@univerjs/core';

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
    private _cache = new LRUMap<string, IDocumentBody>(COPY_CONTENT_CACHE_LIMIT);

    set(id: string, clipboardData: IDocumentBody) {
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
