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

/* eslint-disable ts/no-explicit-any */
/* eslint-disable no-case-declarations */

import type { Subscriber } from 'rxjs';
import type { HTTPRequest } from '../request';
import type { HTTPEvent, HTTPResponseBody } from '../response';
import type { IHTTPImplementation } from './implementation';
import { ILogService } from '@univerjs/core';
import { Observable } from 'rxjs';
import { HTTPHeaders } from '../headers';
import { HTTPStatusCode } from '../http';
import { HTTPProgress, HTTPResponse, HTTPResponseError } from '../response';
import { parseFetchParamsFromRequest } from './util';

/**
 * An HTTP implementation using Fetch API. This implementation can both run in browser and Node.js.
 *
 * It does not support streaming response yet (May 12, 2024).
 */
export class FetchHTTPImplementation implements IHTTPImplementation {
    constructor(
        @ILogService private readonly _logService: ILogService
    ) { }

    send(request: HTTPRequest): Observable<HTTPEvent<any>> {
        return new Observable((subscriber) => {
            const abortController = new AbortController();
            this._send(request, subscriber, abortController).catch((error) => {
                subscriber.error(new HTTPResponseError({
                    error,
                    request,
                }));
            });

            return () => abortController.abort();
        });
    }

    private async _send(request: HTTPRequest, subscriber: Subscriber<HTTPEvent<any>>, abortController: AbortController) {
        let response: Response;

        try {
            const fetchParams = parseFetchParamsFromRequest(request);
            const urlWithParams = request.getUrlWithParams();
            const fetchPromise = fetch(urlWithParams, {
                signal: abortController.signal,
                ...fetchParams,
            });

            this._logService.debug(`[FetchHTTPImplementation]: sending request to url ${urlWithParams} with params ${fetchParams}`);

            response = await fetchPromise;
        } catch (error: any) {
            const e = new HTTPResponseError({
                request,
                error,
                status: error.status ?? 0,
                statusText: error.statusText ?? 'Unknown Error',
                headers: error.headers,
            });

            this._logService.error('[FetchHTTPImplementation]: network error', e);

            subscriber.error(e);

            return;
        }

        const responseHeaders = new HTTPHeaders(response.headers);
        const status = response.status;
        const statusText = response.statusText;

        let body: HTTPResponseBody = null;
        if (response.body) {
            body = await this._readBody(request, response, subscriber);
        }

        const ok = status >= HTTPStatusCode.Ok && status < HTTPStatusCode.MultipleChoices;
        if (ok) {
            subscriber.next(new HTTPResponse({
                body,
                headers: responseHeaders,
                status,
                statusText,
            }));
        } else {
            const e = new HTTPResponseError({
                request,
                error: body,
                status,
                statusText,
                headers: responseHeaders,
            });

            this._logService.error('[FetchHTTPImplementation]: network error', e);

            subscriber.error(e);
        }

        subscriber.complete();
    }

    private async _readBody(
        request: HTTPRequest,
        response: Response,
        subscriber: Subscriber<HTTPEvent<any>>
    ): Promise<HTTPResponseBody> {
        const chunks: Uint8Array[] = [];
        const reader = response.body!.getReader();
        const contentLength = response.headers.get('content-length');

        let receivedLength = 0;

        const reportProgress = request.requestParams?.reportProgress;
        const responseType = request.responseType;
        let partialText: string | undefined;
        let decoder: TextDecoder;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            receivedLength += value.length;

            if (reportProgress && responseType === 'text') {
                partialText = (partialText ?? '') + (decoder ??= new TextDecoder()).decode(value, { stream: true });
                subscriber.next(new HTTPProgress(
                    contentLength ? Number.parseInt(contentLength, 10) : undefined,
                    receivedLength,
                    partialText
                ));
            }
        }

        const all = mergeChunks(chunks, receivedLength);
        try {
            const contentType = response.headers.get('content-type') ?? '';
            const body = deserialize(request, all, contentType);
            return body;
        } catch (error) {
            const e = new HTTPResponseError({
                request,
                error,
                status: response.status,
                statusText: response.statusText,
                headers: new HTTPHeaders(response.headers),
            });

            this._logService.error('[FetchHTTPImplementation]: network error', e);

            subscriber.error(e);

            return null;
        }
    }
}

function mergeChunks(chunks: Uint8Array[], totalLength: number): Uint8Array {
    const all = new Uint8Array(totalLength);
    let position = 0;

    for (const chunk of chunks) {
        all.set(chunk, position);
        position += chunk.length;
    }

    return all;
}

const XSSI_PREFIX = /^\)\]\}',?\n/;
function deserialize(request: HTTPRequest, bin: Uint8Array, contentType: string): HTTPResponseBody {
    switch (request.responseType) {
        case 'json':
            const text = new TextDecoder().decode(bin).replace(XSSI_PREFIX, '');
            return text === '' ? null : JSON.parse(text);
        case 'text':
            return new TextDecoder().decode(bin);
        case 'blob':
            return new Blob([bin], { type: contentType });
        case 'arraybuffer':
            return bin.buffer;
        default:
            throw new Error(`[FetchHTTPImplementation]: unknown response type: ${request.responseType}.`);
    }
}
