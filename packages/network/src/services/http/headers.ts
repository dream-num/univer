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

interface IHeadersConstructorProps {
    [key: string]: string | number | boolean;
}

// Header keys in `HTTPHeaders` should be in lower case.
export const ApplicationJSONType = 'application/json';

/**
 * Check if the content type is application/json
 * "application/json" or "application/json; charset=utf-8" or ["application/json"]
 * @param contentType
 */
export function isApplicationJSONType(contentType: string | string[]): boolean {
    if (Array.isArray(contentType)) {
        return contentType.some((type) => type.includes(ApplicationJSONType));
    }
    return contentType.includes(ApplicationJSONType);
}

/**
 * It wraps headers of HTTP requests' and responses' headers.
 */
export class HTTPHeaders {
    private readonly _headers: Map<string, string[]> = new Map();

    constructor(headers?: IHeadersConstructorProps | Headers | string) {
        if (typeof headers === 'string') {
            this._handleHeadersString(headers);
        } else if (headers instanceof Headers) {
            this._handleHeaders(headers);
        } else if (headers) {
            this._handleHeadersConstructorProps(headers);
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

    set(key: string, value: string | number | boolean): void {
        this._setHeader(key, value);
    }

    toHeadersInit(body?: any): HeadersInit {
        const headers: HeadersInit = {};
        this._headers.forEach((values, key) => {
            headers[key] = values.join(',');
        });

        headers.accept ??= 'application/json, text/plain, */*';

        // If the request body is FormData, the browser will automatically generate Content Type with boundary
        if (!(body instanceof FormData)) {
            headers['content-type'] ??= 'application/json;charset=UTF-8';
        }

        return headers;
    }

    private _setHeader(name: string, value: string | number | boolean): void {
        const lowerCase = name.toLowerCase();
        if (this._headers.has(lowerCase)) {
            this._headers.get(lowerCase)!.push(value.toString());
        } else {
            this._headers.set(lowerCase, [value.toString()]);
        }
    }

    private _handleHeadersString(headers: string): void {
        headers.split('\n').forEach((header) => {
            const [name, value] = header.split(':');
            if (name && value) {
                this._setHeader(name, value);
            }
        });
    }

    private _handleHeadersConstructorProps(headers: IHeadersConstructorProps): void {
        Object.entries(headers).forEach(([name, value]) => this._setHeader(name, value));
    }

    private _handleHeaders(headers: Headers): void {
        headers.forEach((value, name) => this._setHeader(name, value));
    }
}
