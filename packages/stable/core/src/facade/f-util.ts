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

import type { INumfmt } from '@univerjs/core';
import { numfmt, Rectangle, Tools } from '@univerjs/core';

/**
 * @ignore
 */
export class FUtil {
    /**
     * @ignore
     */
    static _instance: FUtil | null;

    static get(): FUtil {
        if (this._instance) {
            return this._instance;
        }

        const instance = new FUtil();
        this._instance = instance;
        return instance;
    }

    /**
     * @ignore
     */
    static extend(source: any): void {
        Object.getOwnPropertyNames(source.prototype).forEach((name) => {
            if (name !== 'constructor') {
                // @ts-ignore
                this.prototype[name] = source.prototype[name];
            }
        });

        Object.getOwnPropertyNames(source).forEach((name) => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                // @ts-ignore
                this[name] = source[name];
            }
        });
    }

    /**
     * Rectangle utils, including range operations likes merge, subtract, split
     *
     * @example
     * ```ts
     * const ranges = [
     *   { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 },
     *   { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
     * ];
     * const merged = univerAPI.Util.rectangle.mergeRanges(ranges);
     * console.log(merged);
     * ```
     */
    get rectangle(): typeof Rectangle {
        return Rectangle;
    }

    /**
     * Number format utils, including parse and strigify about date, price, etc
     *
     * @example
     * ```ts
     * const text = univerAPI.Util.numfmt.format('#,##0.00', 1234.567);
     * console.log(text);
     * ```
     */
    get numfmt(): INumfmt {
        return numfmt;
    }

    /**
     * common tools
     *
     * @example
     * ```ts
     * const key = univerAPI.Util.tools.generateRandomId(6);
     * console.log(key);
     * ```
     */
    get tools(): typeof Tools {
        return Tools;
    }
}
