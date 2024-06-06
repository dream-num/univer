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

import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import type { Injector } from '@wendellhu/redi';
import { HTTPService } from '../../http.service';
import { createHTTPTestBed, type MockHTTPImplementation } from '../../__testing__/http-testing-utils';
import { IHTTPImplementation } from '../../implementations/implementation';
import { __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION } from '../../request';
import { ThresholdInterceptorFactory } from '../threshold-interceptor';
import { HTTPHeaders } from '../../headers';
import { HTTPResponse } from '../../response';

describe('test "HTTPThresholdInterceptor"', () => {
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

    it('should control parallel requests', () => {
        httpService.registerHTTPInterceptor({
            priority: 20,
            interceptor: ThresholdInterceptorFactory(),
        });

        const _request1 = httpService.get('http://example.com');
        const _request2 = httpService.get('http://example.com');

        // due to threshold, the second request should not be sent
        const _handler1 = httpImplementation.getHandler(0);
        expect(() => httpImplementation.getHandler(1)).toThrowError();

        // when the first request is completed, the second request should be sent
        emitSuccess(0);
        const _handler2 = httpImplementation.getHandler(1);

        // let the second request get completed
        emitSuccess(1);

        // when the third request is sent, it should not be threshold
        const _request3 = httpService.get('http://example.com');
        const _handler3 = httpImplementation.getHandler(2);
        emitSuccess(2);
    });

    it('should support threshold params', () => {
        httpService.registerHTTPInterceptor({
            priority: 20,
            interceptor: ThresholdInterceptorFactory({ maxParallel: 2 }),
        });

        const _request1 = httpService.get('http://example.com');
        const _request2 = httpService.get('http://example.com');

        // since the threshold is 2, the second should be sent simultaneously
        const _handler1 = httpImplementation.getHandler(0);
        const _handler2 = httpImplementation.getHandler(1);

        emitSuccess(0);
        emitSuccess(1);
    });
});

it('should work', () => {
    expect(1).toBe(1);
});
