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

import { numfmt, Rectangle, Tools } from '../shared';

export class FUtil {
    static _instance: FUtil | null;
    static get() {
        if (this._instance) {
            return this._instance;
        }

        const instance = new FUtil();
        this._instance = instance;
        return instance;
    }

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
     */
    get rectangle() {
        return Rectangle;
    }

    /**
     * Number format utils, including parse and strigify about date, price, etc
     */
    get numfmt() {
        return numfmt;
    }

    /**
     * common tools
     */
    get tools() {
        return Tools;
    }
}
