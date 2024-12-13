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

    get<T>(url: string, params?: IRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.get(url, params) as Promise<HTTPResponse<T>>; ;
    }

    post<T>(url: string, params?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.post(url, params) as Promise<HTTPResponse<T>>; ;
    }

    put<T>(url: string, params?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.put(url, params) as Promise<HTTPResponse<T>>; ;
    }

    delete<T>(url: string, params?: IRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.delete(url, params) as Promise<HTTPResponse<T>>; ;
    }

    patch<T>(url: string, options?: IPostRequestParams): Promise<HTTPResponse<T>> {
        return this._httpService.patch(url, options) as Promise<HTTPResponse<T>>;
    }

    getSSE<T>(
        method: HTTPRequestMethod,
        url: string,
        options?: IPostRequestParams
    ): Observable<HTTPEvent<T>> {
        return this._httpService.getSSE(method, url, options);
    }
}
