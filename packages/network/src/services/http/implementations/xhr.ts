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

/* eslint-disable max-lines-per-function */
/* eslint-disable ts/no-explicit-any */

import type { Nullable } from '@univerjs/core';
import type { Observer } from 'rxjs';
import type { HTTPRequest } from '../request';
import type { HTTPEvent } from '../response';
import type { IHTTPImplementation } from './implementation';
import { ILogService } from '@univerjs/core';
import { Observable } from 'rxjs';
import { HTTPHeaders } from '../headers';
import { ErrorStatusCodeLowerBound, HTTPStatusCode, SuccessStatusCodeLowerBound } from '../http';
import { HTTPResponse, HTTPResponseError, ResponseHeader } from '../response';
import { parseFetchParamsFromRequest } from './util';

/**
 * An HTTP implementation using XHR. HTTP service provided by this service could only be async (we do not support sync XHR now).
 */
export class XHRHTTPImplementation implements IHTTPImplementation {
    constructor(
        @ILogService private readonly _logService: ILogService
    ) { }

    send(request: HTTPRequest): Observable<HTTPEvent<any>> {
        return new Observable((observer: Observer<HTTPEvent<any>>) => {
            const xhr = new XMLHttpRequest();
            const urlWithParams = request.getUrlWithParams();
            const fetchParams = parseFetchParamsFromRequest(request);

            xhr.open(request.method, urlWithParams);
            if (request.withCredentials) {
                xhr.withCredentials = true;
            }

            if (fetchParams.headers) {
                Object.entries(fetchParams.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
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
                    const e = new HTTPResponseError({
                        request,
                        error,
                        headers,
                        status,
                        statusText,
                    });

                    this._logService.error('[XHRHTTPImplementation]: network error', e);

                    observer.error(e);
                }
            };

            const onErrorHandler = (error: ProgressEvent) => {
                const e = new HTTPResponseError({
                    request,
                    error,
                    status: xhr.status || 0,
                    statusText: xhr.statusText || 'Unknown Error',
                    headers: buildResponseHeader().headers,
                });

                this._logService.error('[XHRHTTPImplementation]: network error', e);

                observer.error(e);
            };

            xhr.addEventListener('load', onLoadHandler);
            xhr.addEventListener('error', onErrorHandler);
            xhr.addEventListener('abort', onErrorHandler);
            xhr.addEventListener('timeout', onErrorHandler);

            const body = request.getBody();
            xhr.send(body);

            this._logService.debug('[XHRHTTPImplementation]', `sending request to url ${urlWithParams} with params ${fetchParams}`);

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
