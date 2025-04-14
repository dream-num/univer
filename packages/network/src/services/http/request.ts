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

import type { HTTPHeaders } from './headers';
import type { HTTPResponseType } from './http';
import type { HTTPParams } from './params';
import { ApplicationJSONType, isApplicationJSONType } from './headers';

export type HTTPRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * @internal
 */
export interface IHTTPRequestParams {
    // eslint-disable-next-line ts/no-explicit-any
    body?: any;
    headers: HTTPHeaders;
    params?: HTTPParams;
    responseType: HTTPResponseType;
    withCredentials: boolean;
    reportProgress?: boolean;
}

let HTTPRequestUID = 0;

export function __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION() {
    HTTPRequestUID = 0;
}

export class HTTPRequest {
    get headers(): HTTPHeaders { return this.requestParams!.headers; }
    get withCredentials(): boolean { return this.requestParams!.withCredentials; }
    get responseType(): HTTPResponseType { return this.requestParams!.responseType; }

    readonly uid = HTTPRequestUID++;

    constructor(
        readonly method: HTTPRequestMethod,
        readonly url: string,
        readonly requestParams?: IHTTPRequestParams
    ) { }

    getUrlWithParams(): string {
        const params = this.requestParams?.params?.toString();
        if (!params) {
            return this.url;
        }

        return `${this.url}${this.url.includes('?') ? '&' : '?'}${params}`;
    }

    getBody(): string | FormData | null {
        const contentType = this.headers.get('Content-Type') ?? ApplicationJSONType;
        const body = this.requestParams?.body;

        if (body instanceof FormData) {
            return body;
        }

        if (isApplicationJSONType(contentType) && body && typeof body === 'object') {
            return JSON.stringify(body);
        }

        return body ? `${body}` : null;
    }

    getHeadersInit(): HeadersInit {
        const headersInit = this.headers.toHeadersInit(this.requestParams?.body);
        return headersInit;
    }
}
