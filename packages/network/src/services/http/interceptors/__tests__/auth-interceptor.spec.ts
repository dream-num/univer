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
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { createHTTPTestBed, type MockHTTPImplementation } from '../../__testing__/http-testing-utils';
import { HTTPHeaders } from '../../headers';
import { HTTPService } from '../../http.service';
import { IHTTPImplementation } from '../../implementations/implementation';
import { __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION } from '../../request';
import { HTTPResponse, HTTPResponseError } from '../../response';
import { AuthInterceptorFactory } from '../auth-interceptor';

describe('test "HTTPAuthInterceptor"', () => {
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

    function emitError(uid: number, errorCode: number) {
        httpImplementation.getHandler(uid).emitError(new HTTPResponseError({
            // eslint-disable-next-line ts/no-explicit-any
            request: {} as any,
            headers: new HTTPHeaders(),
            status: errorCode,
            statusText: 'Internal Server Error',
            error: new Error('mocked error'),
        }));
    }

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

    it('should pass though on success', () => new Promise<void>((done) => {
        let error = false;

        httpService.registerHTTPInterceptor({
            priority: 10,
            interceptor: AuthInterceptorFactory({
                errorStatusCodes: [401, 403],
                onAuthError: () => {
                    error = true;
                },
            }),
        });

        const request = httpService.get('http://example.com');
        request.then(() => {
            expect(error).toBeFalsy();
            done();
        });

        emitSuccess(0);
    }));

    it('should pass though on other kind of errors', () => new Promise<void>((done) => {
        let error = false;

        httpService.registerHTTPInterceptor({
            priority: 10,
            interceptor: AuthInterceptorFactory({
                errorStatusCodes: [401, 403],
                onAuthError: () => {
                    error = true;
                },
            }),
        });

        const request = httpService.get('http://example.com');
        request.catch(() => {
            expect(error).toBeFalsy();
            done();
        });

        emitError(0, 500);
    }));

    it('should call "onAuthError" on error status codes', () => new Promise<void>((done) => {
        let error = false;

        httpService.registerHTTPInterceptor({
            priority: 10,
            interceptor: AuthInterceptorFactory({
                errorStatusCodes: [401, 403],
                onAuthError: () => {
                    error = true;
                },
            }),
        });

        const request = httpService.get('http://example.com');
        request.catch(() => {
            expect(error).toBeTruthy();
            done();
        });

        emitError(0, 401);
    }));
});
