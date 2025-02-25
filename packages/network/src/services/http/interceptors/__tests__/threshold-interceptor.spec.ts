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
import { awaitTime } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createHTTPTestBed, type MockHTTPImplementation } from '../../__testing__/http-testing-utils';
import { HTTPHeaders } from '../../headers';
import { HTTPService } from '../../http.service';
import { IHTTPImplementation } from '../../implementations/implementation';
import { __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION } from '../../request';
import { HTTPResponse, HTTPResponseError } from '../../response';
import { ThresholdInterceptorFactory } from '../threshold-interceptor';

describe('test "HTTPThresholdInterceptor"', () => {
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

    function emitSuccess(uid: number) {
        httpImplementation.getHandler(uid).emitResponse(new HTTPResponse({
            headers: new HTTPHeaders(),
            status: 200,
            statusText: 'Request Succeeded',
            body: {
                text: 'Succeeded',
            },
        }));
    }

    function emitError(uid: number) {
        httpImplementation.getHandler(uid).emitError(new HTTPResponseError({
            // eslint-disable-next-line ts/no-explicit-any
            request: {} as any,
            headers: new HTTPHeaders(),
            status: 400,
            statusText: 'Request Failed',
            error: 'Failed',
        }));
    }

    it('should control parallel requests', async () => {
        httpService.registerHTTPInterceptor({
            priority: 20,
            interceptor: ThresholdInterceptorFactory(),
        });

        const request0 = httpService.get('http://example.com');
        const request1 = httpService.get('http://example.com');

        expect(httpImplementation.getHandler(0)).toBeDefined();
        expect(() => httpImplementation.getHandler(1)).toThrowError(); // due to threshold, the second request should not be sent

        emitSuccess(0); // when the first request is completed, the second request should be sent
        expect((await request0 as HTTPResponse<{ text: string }>).body.text).toBe('Succeeded');
        expect(httpImplementation.getHandler(1)).toBeDefined();
        emitSuccess(1); // let the second request get completed
        expect((await request1 as HTTPResponse<{ text: string }>).body.text).toBe('Succeeded');

        const request2 = httpService.get('http://example.com'); // when the third request is sent, it should not be threshold
        expect(httpImplementation.getHandler(2)).toBeDefined();
        emitSuccess(2);
        expect((await request2 as HTTPResponse<{ text: string }>).body.text).toBe('Succeeded');
    });

    it('should support threshold params', async () => {
        httpService.registerHTTPInterceptor({
            priority: 20,
            interceptor: ThresholdInterceptorFactory({ maxParallel: 2 }),
        });

        const request0 = httpService.get('http://example.com');
        const request1 = httpService.get('http://example.com');

        // since the threshold is 2, the second should be sent simultaneously
        const handler0 = httpImplementation.getHandler(0);
        const handler1 = httpImplementation.getHandler(1);
        expect(handler0).toBeDefined();
        expect(handler1).toBeDefined();

        emitSuccess(0);
        emitSuccess(1);
        expect((await request0 as HTTPResponse<{ text: string }>).body.text).toBe('Succeeded');
        expect((await request1 as HTTPResponse<{ text: string }>).body.text).toBe('Succeeded');
    });

    it('should support threshold params with errors', async () => {
        httpService.registerHTTPInterceptor({
            priority: 20,
            interceptor: ThresholdInterceptorFactory({ maxParallel: 2 }),
        });

        let errored = false;
        const _request0 = httpService.get('http://example.com').catch(() => {
            errored = true;
        });

        const request1 = httpService.get('http://example.com');

        const handler0 = httpImplementation.getHandler(0);
        const handler1 = httpImplementation.getHandler(1);
        expect(handler0).toBeDefined();
        expect(handler1).toBeDefined();

        emitError(0);
        await awaitTime(20);
        expect(errored).toBe(true);

        emitSuccess(1);
        expect(await request1).toBeDefined();
    });
});
