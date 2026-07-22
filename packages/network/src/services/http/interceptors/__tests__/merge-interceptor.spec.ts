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

import type { Injector } from '@univerjs/core';
import type { MockHTTPImplementation } from '../../__tests__/http-testing-utils';
import type { HTTPHandlerFn } from '../../interceptor';
import type { HTTPEvent } from '../../response';
import { Observable } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { createHTTPTestBed } from '../../__tests__/http-testing-utils';
import { HTTPHeaders } from '../../headers';
import { HTTPService } from '../../http.service';
import { IHTTPImplementation } from '../../implementations/implementation';
import { __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION, HTTPRequest } from '../../request';
import { HTTPResponse } from '../../response';
import { MergeInterceptorFactory } from '../merge-interceptor';

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
        interface IRequest { ids: string[] };
        interface IResponse { list: number[] };
        const response: IResponse = { list: [1, 2] };
        httpService.registerHTTPInterceptor({
            priority: 999,
            interceptor: MergeInterceptorFactory<IRequest, IResponse>({
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

        const request1 = httpService.post<IResponse>(path, { body: { ids: [1] } });
        const request2 = httpService.post<IResponse>(path, { body: { ids: [2] } });

        request1.then((e) => {
            expect(e.body.list).toEqual(response.list);
        });
        request2.then((e) => {
            expect(e.body.list).toEqual(response.list);
        });

        await vitest.advanceTimersByTimeAsync(1200);

        // The first request created does not result in a real request
        expect(() => httpImplementation.getHandler(0)).toThrowError();
        expect(() => httpImplementation.getHandler(1)).toThrowError();

        // The first two create requests and the last merge result in a new request, so the sequence number is 2
        emitSuccess(2, response);
    });

    it('does not send a queued request after its subscriber unsubscribes', async () => {
        let resolveFetch!: (value: boolean) => void;
        const next: HTTPHandlerFn = vitest.fn(() => new Observable<HTTPEvent<unknown>>());
        const interceptor = MergeInterceptorFactory<string, unknown>({
            isMatch: () => true,
            getParamsFromRequest: (request) => request.url,
            mergeParamsToRequest: (_list, request) => request,
        }, {
            fetchCheck: () => new Promise((resolve) => {
                resolveFetch = resolve;
            }),
        });
        const request = new HTTPRequest('GET', 'http://example.com');

        const subscription = interceptor(request, next).subscribe();
        subscription.unsubscribe();
        resolveFetch(true);
        await Promise.resolve();

        expect(next).not.toHaveBeenCalled();
    });

    it('cancels an active merged request when its subscriber unsubscribes', async () => {
        const teardown = vitest.fn();
        const next: HTTPHandlerFn = vitest.fn(() => new Observable<HTTPEvent<unknown>>(() => teardown));
        const interceptor = MergeInterceptorFactory<string, unknown>({
            isMatch: () => true,
            getParamsFromRequest: (request) => request.url,
            mergeParamsToRequest: (_list, request) => request,
        }, {
            fetchCheck: () => Promise.resolve(true),
        });
        const request = new HTTPRequest('GET', 'http://example.com');

        const subscription = interceptor(request, next).subscribe();
        await Promise.resolve();
        expect(next).toHaveBeenCalledOnce();

        subscription.unsubscribe();
        expect(teardown).toHaveBeenCalledOnce();
    });

    it('keeps an active merged request until every subscriber unsubscribes', async () => {
        const teardown = vitest.fn();
        const next: HTTPHandlerFn = vitest.fn(() => new Observable<HTTPEvent<unknown>>(() => teardown));
        const fetchCheck = vitest.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
        const interceptor = MergeInterceptorFactory<string, unknown>({
            isMatch: () => true,
            getParamsFromRequest: (request) => request.url,
            mergeParamsToRequest: (_list, request) => request,
        }, { fetchCheck });

        const firstSubscription = interceptor(new HTTPRequest('GET', 'http://example.com/first'), next).subscribe();
        const secondSubscription = interceptor(new HTTPRequest('GET', 'http://example.com/second'), next).subscribe();
        await Promise.resolve();
        expect(next).toHaveBeenCalledOnce();

        firstSubscription.unsubscribe();
        expect(teardown).not.toHaveBeenCalled();

        secondSubscription.unsubscribe();
        expect(teardown).toHaveBeenCalledOnce();
    });
});
