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

/* eslint-disable max-lines-per-function */
/* eslint-disable ts/no-explicit-any */

import type { Nullable } from '@univerjs/core';
import type { Observer } from 'rxjs';
import { Observable } from 'rxjs';

import { HTTPHeaders } from '../headers';
import { ErrorStatusCodeLowerBound, HTTPStatusCode, SuccessStatusCodeLowerBound } from '../http';
import type { HTTPRequest } from '../request';
import type { HTTPEvent } from '../response';
import { HTTPResponse, HTTPResponseError, ResponseHeader } from '../response';
import type { IHTTPImplementation } from './implementation';

/**
 * An HTTP implementation using XHR. HTTP service provided by this service could only be async (we do not support sync XHR now).
 */
export class XHRHTTPImplementation implements IHTTPImplementation {
    send(request: HTTPRequest): Observable<HTTPEvent<any>> {
        return new Observable((observer: Observer<HTTPEvent<any>>) => {
            const xhr = new XMLHttpRequest();
            xhr.open(request.method, request.getUrlWithParams());
            if (request.withCredentials) {
                xhr.withCredentials = true;
            }

            // set default HTTP headers

            request.headers.forEach((key, value) => xhr.setRequestHeader(key, value.join(',')));
            if (!request.headers.has('Accept')) {
                xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
            }

            if (!request.headers.has('Content-Type')) {
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            }

            let responseHeader: Nullable<ResponseHeader>;

            const buildResponseHeader = () => {
                if (responseHeader) {
                    return responseHeader;
                }

                const statusText = xhr.statusText || 'OK';
                const headers = new HTTPHeaders(xhr.getAllResponseHeaders());
                return new ResponseHeader(headers, xhr.status, statusText);
            };

            const onLoadHandler = () => {
                const { headers, statusText, status } = buildResponseHeader();
                const { responseType } = request;

                let body: any = null;
                let error: any = null;
                if (status !== HTTPStatusCode.NoContent) {
                    body = typeof xhr.response === 'undefined' ? xhr.responseText : xhr.response;
                }

                let success = status >= SuccessStatusCodeLowerBound && status < ErrorStatusCodeLowerBound;

                // Parse response body according to request's `responseType`.
                // However we will not verify whether the response type is
                // the same as the request's `responseType`. We will do that
                // in the `HTTPService` class because the verification should be
                // the same across different implementations.
                if (responseType === 'json' && typeof body === 'string') {
                    const originalBody = body;
                    try {
                        body = body ? JSON.parse(body) : null;
                    } catch (e) {
                        // make success as false to emit a HTTPResponseError
                        success = false;
                        // revert our change to the original body
                        body = originalBody;
                        error = e;
                    }
                }

                if (success) {
                    observer.next(
                        new HTTPResponse({
                            body,
                            headers,
                            status,
                            statusText,
                        })
                    );
                } else {
                    observer.error(
                        new HTTPResponseError({
                            error,
                            headers,
                            status,
                            statusText,
                        })
                    );
                    // Handler server logic error here
                }
            };

            const onErrorHandler = (error: ProgressEvent) => {
                const res = new HTTPResponseError({
                    error,
                    status: xhr.status || 0,
                    statusText: xhr.statusText || 'Unknown Error',
                    headers: buildResponseHeader().headers,
                });

                observer.error(res);
            };

            xhr.addEventListener('load', onLoadHandler);
            xhr.addEventListener('error', onErrorHandler);
            xhr.addEventListener('abort', onErrorHandler);
            xhr.addEventListener('timeout', onErrorHandler);

            const body = request.getBody();
            xhr.send(body);

            // Abort the request if the subscription is disposed before the request completes.
            return () => {
                if (xhr.readyState !== xhr.DONE) {
                    xhr.abort();
                }

                xhr.removeEventListener('load', onLoadHandler);
                xhr.removeEventListener('error', onErrorHandler);
                xhr.removeEventListener('abort', onErrorHandler);
                xhr.removeEventListener('timeout', onErrorHandler);
            };
        });
    }
}
