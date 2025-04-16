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

import type { HTTPEvent, HTTPRequestMethod, HTTPResponse, IPostRequestParams, IRequestParams } from '@univerjs/network';
import type { Observable } from 'rxjs';
import { Inject, Injector } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { HTTPService } from '@univerjs/network';

/**
 * This Facade provides a set of methods to make HTTP requests. You should not
 * create an instance of this class directly, instead, use `getNetwork` of
 * {@link FUniver} instead.
 *
 * @hideconstructor
 */
export class FNetwork extends FBase {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(HTTPService) protected readonly _httpService: HTTPService
    ) {
        super();
    }

    /**
     * Send a GET request to the server.
     * @param {string} url - The requested URL.
     * @param {IRequestParams} [params] - Query parameters.
     * @returns {Promise<HTTPResponse>} Network response.
     */
    get<T>(url: string, params?: IRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.get(url, params) as Promise<HTTPResponse<T>>; ;
    }

    /**
     * Send a POST request to the server.
     * @param {string} url - The requested URL.
     * @param {IPostRequestParams} [params] - Query parameters.
     * @returns {Promise<HTTPResponse>} Network response.
     */
    post<T>(url: string, params?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.post(url, params) as Promise<HTTPResponse<T>>; ;
    }

    /**
     * Send a PUT request to the server.
     * @param {string} url - The requested URL
     * @param {IPostRequestParams} [params] - Query parameters
     * @returns {Promise<HTTPResponse>} Network response
     */
    put<T>(url: string, params?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.put(url, params) as Promise<HTTPResponse<T>>; ;
    }

    /**
     * Send DELETE request to the server.
     * @param {string} url - The requested URL
     * @param {IRequestParams} [params] - Query parameters
     * @returns {Promise<HTTPResponse>} Network response
     */
    delete<T>(url: string, params?: IRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.delete(url, params) as Promise<HTTPResponse<T>>; ;
    }

    /**
     * Send PATCH request to the server.
     * @param {string} url - The requested URL
     * @param {IPostRequestParams} [params] - Query parameters
     * @returns {Promise<HTTPResponse>} Network response
     */
    patch<T>(url: string, params?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.patch(url, params) as Promise<HTTPResponse<T>>;
    }

    /**
     * Request for a stream of server-sent events. Instead of a single response, the server sends a stream of responses,
     * Univer wraps the stream in an [`Observable`](https://rxjs.dev/guide/observable) which you can call `subscribe` on.
     * @param {HTTPRequestMethod} method - HTTP request method
     * @param {string} url - The requested URL
     * @param {IPostRequestParams} [params] - params Query parameters
     * @returns {Observable<HTTPEvent>} An observable that emits the network response.
     */
    getSSE<T>(
        method: HTTPRequestMethod,
        url: string,
        params?: IPostRequestParams
    ): Observable<HTTPEvent<T>> {
        return this._httpService.getSSE(method, url, params);
    }
}
