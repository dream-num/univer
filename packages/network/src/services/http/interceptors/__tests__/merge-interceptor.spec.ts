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

import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';

import type { Injector } from '@univerjs/core';
import { HTTPService } from '../../http.service';
import { createHTTPTestBed, type MockHTTPImplementation } from '../../__testing__/http-testing-utils';
import { IHTTPImplementation } from '../../implementations/implementation';
import { HTTPResponse } from '../../response';
import { HTTPHeaders } from '../../headers';
import { MergeInterceptorFactory } from '../merge-interceptor';
import { __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION, HTTPRequest } from '../../request';

describe('test "HTTPMergeInterceptor"', () => {
    let httpService: HTTPService;
    let httpImplementation: MockHTTPImplementation;
    let injector: Injector;

    beforeEach(() => {
        injector = createHTTPTestBed().injector;
        httpService = injector.get(HTTPService);
        httpImplementation = injector.get(IHTTPImplementation) as MockHTTPImplementation;

        vitest.useFakeTimers();
    });

    afterEach(() => {
        injector.dispose();

        __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION();

        vitest.useRealTimers();
    });

    function emitSuccess(uid: number, body: any) {
        httpImplementation.getHandler(uid).emitResponse(new HTTPResponse({
            headers: new HTTPHeaders(),
            status: 200,
            statusText: 'Request Succeeded',
            body,
        }));
    }

    it('two requests were created, but only one was a real request', async () => {
        const path = 'http://example.com';
        interface Request { ids: string[] };
        interface Response { list: number[] };
        const response: Response = { list: [1, 2] };
        httpService.registerHTTPInterceptor({
            priority: 999,
            interceptor: MergeInterceptorFactory<Request, Response>({
                isMatch(config) {
                    return config.url === path;
                },
                getParamsFromRequest(config) {
                    const body = config.requestParams?.body as { ids: string[] };
                    return body;
                },

                mergeParamsToRequest(list, currentConfig) {
                    const ids = list.reduce((a, b) => {
                        a.push(...b.ids);
                        return a;
                    }, [] as string[]);
                    return new HTTPRequest(currentConfig.method, currentConfig.url, {
                        headers: currentConfig.headers,
                        responseType: currentConfig.responseType,
                        withCredentials: currentConfig.withCredentials,
                        body: { ids },
                    });
                },
            }),
        });

        const request1 = httpService.post<Response>(path, { body: { ids: [1] } });
        const request2 = httpService.post<Response>(path, { body: { ids: [2] } });

        request1.then((e) => {
            expect((e as HTTPResponse<Response>).body.list).toEqual(response.list);
        });
        request2.then((e) => {
            expect((e as HTTPResponse<Response>).body.list).toEqual(response.list);
        });

        await vitest.advanceTimersByTimeAsync(1200);

        // The first request created does not result in a real request
        expect(() => httpImplementation.getHandler(0)).toThrowError();
        expect(() => httpImplementation.getHandler(1)).toThrowError();

        // The first two create requests and the last merge result in a new request, so the sequence number is 2
        emitSuccess(2, response);
    });
});
