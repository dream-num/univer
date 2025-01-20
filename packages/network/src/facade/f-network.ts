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

import type { HTTPEvent, HTTPRequestMethod, HTTPResponse, IPostRequestParams, IRequestParams } from '@univerjs/network';
import type { Observable } from 'rxjs';
import { FBase, Inject, Injector } from '@univerjs/core';
import { HTTPService } from '@univerjs/network';

export class FNetwork extends FBase {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(HTTPService) protected readonly _httpService: HTTPService
    ) {
        super();
    }

    /**
     * Send GET request to the server.
     * @param url The requested URL
     * @param params Query parameters
     * @returns Network response
     */
    get<T>(url: string, params?: IRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.get(url, params) as Promise<HTTPResponse<T>>; ;
    }

    /**
     * Send POST request to the server.
     * @param url The requested URL
     * @param params Query parameters
     * @returns Network response
     */
    post<T>(url: string, params?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.post(url, params) as Promise<HTTPResponse<T>>; ;
    }

    /**
     * Send PUT request to the server.
     * @param url The requested URL
     * @param params Query parameters
     * @returns Network response
     */
    put<T>(url: string, params?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.put(url, params) as Promise<HTTPResponse<T>>; ;
    }

    /**
     * Send DELETE request to the server.
     * @param url The requested URL
     * @param params Query parameters
     * @returns Network response
     */
    delete<T>(url: string, params?: IRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.delete(url, params) as Promise<HTTPResponse<T>>; ;
    }

    /**
     * Send PATCH request to the server.
     * @param url The requested URL
     * @param params Query parameters
     * @returns Network response
     */
    patch<T>(url: string, params?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.patch(url, params) as Promise<HTTPResponse<T>>;
    }

    /**
     * Request for a stream of server-sent events. Instead of a single response, the server sends a stream of responses,
     * Univer wraps the stream in an [`Observable`](https://rxjs.dev/guide/observable) which you can call `subscribe` on.
     * @param method HTTP request method
     * @param url The requested URL
     * @param params Query parameters
     * @returns An observable that emits the network response
     */
    getSSE<T>(
        method: HTTPRequestMethod,
        url: string,
        params?: IPostRequestParams
    ): Observable<HTTPEvent<T>> {
        return this._httpService.getSSE(method, url, params);
    }
}
