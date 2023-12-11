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

interface IHeadersConstructorProps {
    [key: string]: string | number | boolean;
}

// Header keys in `HTTPHeaders` should be in lower case.
export const ApplicationJSONType = 'application/json';

/**
 * It wraps headers of HTTP requests' and responses' headers.
 */
export class HTTPHeaders {
    private readonly _headers: Map<string, string[]> = new Map();

    constructor(headers?: IHeadersConstructorProps | string) {
        if (typeof headers === 'string') {
            // split header text and serialize them to HTTPHeaders
            headers.split('\n').forEach((header) => {
                const [name, value] = header.split(':');
                if (name && value) {
                    this._setHeader(name, value);
                }
            });
        } else {
            if (headers) {
                Object.keys(headers).forEach(([name, value]) => {
                    this._setHeader(name, value);
                });
            }
        }
    }

    forEach(callback: (name: string, value: string[]) => void): void {
        this._headers.forEach((v, key) => callback(key, v));
    }

    has(key: string): boolean {
        return !!this._headers.has(key.toLowerCase());
    }

    get(key: string): string[] | null {
        const k = key.toLowerCase();
        return this._headers.has(k) ? this._headers.get(k)! : null;
    }

    private _setHeader(name: string, value: string | number | boolean): void {
        const lowerCase = name.toLowerCase();
        if (this._headers.has(lowerCase)) {
            this._headers.get(lowerCase)!.push(value.toString());
        } else {
            this._headers.set(lowerCase, [value.toString()]);
        }
    }
}
