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

export class LRUHelper {
    static hasLength(array: unknown[], size: number) {
        return array.length === size;
    }

    static getValueType(value: any): string {
        return Object.prototype.toString.apply(value);
    }

    static isObject<T = object>(value?: any): value is T {
        return this.getValueType(value) === '[object Object]';
    }

    static isIterable<T>(value?: any): value is Iterable<T> {
        return value[Symbol.iterator] != null;
    }

    static isNumber(value?: any): value is number {
        return this.getValueType(value) === '[object Number]';
    }
}
