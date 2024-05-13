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

import type { HTTPHeaders } from './headers';

/**
 * There are multiple events could be resolved from the HTTP server.
 */
export type HTTPEvent<T> = HTTPResponse<T> | HTTPResponseError;

export type HTTPResponseBody = string | ArrayBuffer | Blob | object | null;

/** Wraps (success) response info. */
export class HTTPResponse<T> {
    readonly body: T;
    readonly headers: HTTPHeaders;
    readonly status: number;
    readonly statusText: string;

    constructor({
        body,
        headers,
        status,
        statusText,
    }: {
        body: T;
        headers: HTTPHeaders;
        status: number;
        statusText: string;
    }) {
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.statusText = statusText;
    }
}

export class HTTPResponseError {
    readonly headers?: HTTPHeaders;
    readonly status?: number;
    readonly statusText?: string;
    readonly error: any;

    constructor({
        headers,
        status,
        statusText,
        error,
    }: {
        headers?: HTTPHeaders;
        status?: number;
        statusText?: string;
        error: any;
    }) {
        this.headers = headers;
        this.status = status;
        this.statusText = statusText;
        this.error = error;
    }
}

export class ResponseHeader {
    constructor(
        readonly headers: HTTPHeaders,
        readonly status: number,
        readonly statusText: string
    ) {
        // empty
    }
}
