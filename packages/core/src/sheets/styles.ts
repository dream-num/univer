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

import type { IKeyType, Nullable } from '../shared';
import type { IStyleData } from '../types/interfaces';
import type { ICellDataForSheetInterceptor } from './typedef';
import { LRUMap, Tools } from '../shared';

/**
 * Styles in a workbook, cells locate styles based on style IDs
 *
 */
export class Styles {
    private _styles: IKeyType<Nullable<IStyleData>>;

    private _cacheMap = new LRUMap<string, string>(100000);

    constructor(styles: IKeyType<Nullable<IStyleData>> = {}) {
        this._styles = styles;

        this._generateCacheMap();
    }

    each(
        callback: (
            value: [string, Nullable<IStyleData>],
            index: number,
            array: Array<[string, Nullable<IStyleData>]>
        ) => void
    ) {
        Object.entries(this._styles).forEach(callback);
        return this;
    }

    search(data: IStyleData, styleObject: string): string {
        // Take from cache

        if (this._cacheMap.has(styleObject)) {
            return this._cacheMap.get(styleObject) as string;
        }

        // Check if the data exists in _styles and not in _cacheMap
        const existingId = this._getExistingStyleId(data);
        if (existingId) {
            return existingId;
        }
        return '-1';
    }

    get(id: string | Nullable<IStyleData>): Nullable<IStyleData> {
        if (typeof id !== 'string') return id;
        id = String(id);

        return this._styles[id];
    }

    add(data: IStyleData, styleObject: string): string {
        const id = Tools.generateRandomId(6);
        this._styles[id] = data;
        // update cache
        this._cacheMap.set(styleObject, id);

        return id;
    }

    setValue(data: Nullable<IStyleData>): Nullable<string> {
        if (data == null) return;
        const styleObject = JSON.stringify(data);
        const result = this.search(data, styleObject);
        if (result !== '-1') {
            return result;
        }
        return this.add(data, styleObject);
    }

    toJSON(): IKeyType<Nullable<IStyleData>> {
        return this._styles;
    }

    // TODO: this should be `deReuseStyle` to be more accurate.
    getStyleByCell(cell: Nullable<ICellDataForSheetInterceptor>): Nullable<IStyleData> {
        let style;
        if (cell && Tools.isObject(cell.s)) {
            style = cell.s as IStyleData;
        } else {
            style = cell?.s && this.get(cell.s);
        }

        const interceptStyle = cell?.interceptorStyle;

        if (interceptStyle) {
            return {
                ...style,
                ...interceptStyle,
            } as IStyleData;
        }

        return style as IStyleData;
    }

    private _generateCacheMap(): void {
        const { _styles, _cacheMap } = this;
        for (const id in _styles) {
            const styleObject = JSON.stringify(_styles[id]);
            _cacheMap.set(styleObject, id);
        }
    }

    private _getExistingStyleId(data: IStyleData): Nullable<string> {
        const { _styles } = this;
        for (const id in _styles) {
            if (Tools.diffValue(_styles[id], data)) {
                return id;
            }
        }
        return null;
    }
}
