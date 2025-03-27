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
import type { HTTPRequest } from './request';

export type HTTPEvent<T> = HTTPResponse<T> | HTTPProgress;
export enum HTTPEventType {
    DownloadProgress,
    Response,
}

interface IHTTPEvent {
    type: HTTPEventType;
}

export type HTTPResponseBody = string | ArrayBuffer | Blob | object | null;

/**
 * Wraps success response info.
 */
export class HTTPResponse<T> implements IHTTPEvent {
    readonly type = HTTPEventType.Response;

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

/**
 * Progress event for HTTP request. Usually used for reporting download/upload progress or SSE streaming.
 */
export class HTTPProgress implements IHTTPEvent {
    readonly type = HTTPEventType.DownloadProgress;

    constructor(
        /**
         * Total number of bytes to download. Depending on the request or
         * response, this may not be computable and thus may not be present.
         */
        public readonly total: number | undefined,

        /**
         * Number of bytes downloaded.
         */
        public readonly loaded: number,
        /**
         * The partial response body as downloaded so far.
         *
         * Only present if the responseType was `text`.
         */
        public readonly partialText?: string | undefined
    ) {
        // empty
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

// #region error

export class HTTPResponseError {
    readonly request: HTTPRequest;
    readonly headers?: HTTPHeaders;
    readonly status?: number;
    readonly statusText?: string;
    readonly error: any;

    constructor({
        request,
        headers,
        status,
        statusText,
        error,
    }: {
        request: HTTPRequest;
        headers?: HTTPHeaders;
        status?: number;
        statusText?: string;
        error: any;
    }) {
        this.request = request;
        this.headers = headers;
        this.status = status;
        this.statusText = statusText;
        this.error = error;
    }
}

// #endregion
