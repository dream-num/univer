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

/* eslint-disable ts/no-explicit-any */
/* eslint-disable no-case-declarations */

import type { Subscriber } from 'rxjs';
import { Observable } from 'rxjs';
import type { HTTPRequest } from '../request';
import type { HTTPEvent, HTTPResponseBody } from '../response';
import { HTTPResponse, HTTPResponseError } from '../response';
import { HTTPHeaders } from '../headers';
import { HTTPStatusCode } from '../http';
import type { IHTTPImplementation } from './implementation';

// CREDIT: This implementation is inspired by (and uses lots of code from) Angular's HttpClient implementation.

/**
 * An HTTP implementation using Fetch API. This implementation can both run in browser and Node.js.
 *
 * It does not support streaming response yet (May 12, 2024).
 */
export class FetchHTTPImplementation implements IHTTPImplementation {
    send(request: HTTPRequest): Observable<HTTPEvent<any>> {
        return new Observable((subscriber) => {
            const abortController = new AbortController();
            this._send(request, subscriber, abortController).then(() => {}, (error) => {
                subscriber.error(new HTTPResponseError({
                    error,

                }));
            });

            return () => abortController.abort();
        });
    }

    private async _send(request: HTTPRequest, subscriber: Subscriber<HTTPEvent<any>>, abortController: AbortController) {
        let response: Response;

        try {
            const fetchParams = this._parseFetchParamsFromRequest(request);
            const fetchPromise = fetch(request.getUrlWithParams(), {
                signal: abortController.signal,
                ...fetchParams,
            });

            response = await fetchPromise;
        } catch (error: any) {
            subscriber.error(new HTTPResponseError({
                error,
                status: error.status ?? 0,
                statusText: error.statusText ?? 'Unknown Error',
                headers: error.headers,
            }));

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
            subscriber.error(new HTTPResponseError({
                error: body,
                status,
                statusText,
                headers: responseHeaders,
            }));
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

        let receivedLength = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            chunks.push(value);
            receivedLength += value.length;
        }

        const all = mergeChunks(chunks, receivedLength);
        try {
            const contentType = response.headers.get('content-type') ?? '';
            const body = deserialize(request, all, contentType);
            return body;
        } catch (error) {
            subscriber.error(new HTTPResponseError({
                error,
                status: response.status,
                statusText: response.statusText,
                headers: new HTTPHeaders(response.headers),
            }));
            return null;
        }
    }

    private _parseFetchParamsFromRequest(request: HTTPRequest): RequestInit {
        const fetchParams: RequestInit = {
            method: request.method,
            headers: request.getHeadersInit(),
            body: request.getBody(),
            credentials: request.withCredentials ? 'include' : undefined,
        };

        return fetchParams;
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
