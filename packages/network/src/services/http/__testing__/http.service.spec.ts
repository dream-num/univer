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
import type { MockHTTPImplementation } from './http-testing-utils';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HTTPHeaders } from '../headers';
import { HTTPService } from '../http.service';
import { IHTTPImplementation } from '../implementations/implementation';
import { __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION } from '../request';
import { HTTPProgress, HTTPResponse } from '../response';
import { createHTTPTestBed } from './http-testing-utils';

describe('test "HTTPService"', () => {
    let httpService: HTTPService;
    let httpImplementation: MockHTTPImplementation;
    let injector: Injector;

    beforeEach(() => {
        injector = createHTTPTestBed().injector;
        httpService = injector.get(HTTPService);
        httpImplementation = injector.get(IHTTPImplementation) as MockHTTPImplementation;
    });

    afterEach(() => {
        injector.dispose();
        __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION();
    });

    it('runs interceptors in ascending priority order under the current implementation', async () => {
        const callOrder: string[] = [];

        httpService.registerHTTPInterceptor({
            priority: 10,
            interceptor: (request, next) => {
                callOrder.push('priority-10:request');
                request.headers.set('X-Chain', 'first');
                return next(request);
            },
        });
        httpService.registerHTTPInterceptor({
            priority: 100,
            interceptor: (request, next) => {
                callOrder.push('priority-100:request');
                request.headers.set('X-Chain', 'second');
                return next(request);
            },
        });

        const sentRequestPromise = firstValueFrom(httpImplementation.newRequest$);
        const request = httpService.get<{ ok: boolean }>('http://example.com');
        const sentRequest = await sentRequestPromise;

        expect(callOrder).toEqual(['priority-10:request', 'priority-100:request']);
        expect(sentRequest.headers.get('x-chain')).toEqual(['first', 'second']);

        httpImplementation.getHandler(sentRequest.uid).emitResponse(new HTTPResponse({
            headers: new HTTPHeaders(),
            status: 200,
            statusText: 'OK',
            body: { ok: true },
        }));

        await expect(request).resolves.toMatchObject({ body: { ok: true } });
    });

    it('rebuilds the request pipe after a new interceptor is registered', async () => {
        const firstInterceptorCalls: string[] = [];
        const secondInterceptorCalls: string[] = [];

        httpService.registerHTTPInterceptor({
            priority: 0,
            interceptor: (request, next) => {
                firstInterceptorCalls.push(request.url);
                return next(request);
            },
        });

        const firstSentRequestPromise = firstValueFrom(httpImplementation.newRequest$);
        const firstRequest = httpService.get<{ step: number }>('http://example.com/first');
        const firstSentRequest = await firstSentRequestPromise;

        httpImplementation.getHandler(firstSentRequest.uid).emitResponse(new HTTPResponse({
            headers: new HTTPHeaders(),
            status: 200,
            statusText: 'OK',
            body: { step: 1 },
        }));

        await expect(firstRequest).resolves.toMatchObject({ body: { step: 1 } });

        httpService.registerHTTPInterceptor({
            priority: 50,
            interceptor: (request, next) => {
                secondInterceptorCalls.push(request.url);
                request.headers.set('X-Second', 'enabled');
                return next(request);
            },
        });

        const secondSentRequestPromise = firstValueFrom(httpImplementation.newRequest$);
        const secondRequest = httpService.get<{ step: number }>('http://example.com/second');
        const secondSentRequest = await secondSentRequestPromise;

        expect(firstInterceptorCalls).toEqual(['http://example.com/first', 'http://example.com/second']);
        expect(secondInterceptorCalls).toEqual(['http://example.com/second']);
        expect(secondSentRequest.headers.get('x-second')).toEqual(['enabled']);

        httpImplementation.getHandler(secondSentRequest.uid).emitResponse(new HTTPResponse({
            headers: new HTTPHeaders(),
            status: 200,
            statusText: 'OK',
            body: { step: 2 },
        }));

        await expect(secondRequest).resolves.toMatchObject({ body: { step: 2 } });
    });

    it('streams progress events before the final response when using getSSE', async () => {
        const sentRequestPromise = firstValueFrom(httpImplementation.newRequest$);
        const eventsPromise = firstValueFrom(httpService.getSSE<string>('GET', 'http://example.com/sse'));
        const sentRequest = await sentRequestPromise;

        expect(sentRequest.responseType).toBe('json');
        expect(sentRequest.requestParams?.reportProgress).toBe(true);

        httpImplementation.getHandler(sentRequest.uid).emitResponse(new HTTPProgress(100, 40, 'partial'));

        await expect(eventsPromise).resolves.toEqual(new HTTPProgress(100, 40, 'partial'));
    });
});
