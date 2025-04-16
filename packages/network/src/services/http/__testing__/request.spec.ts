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

import { beforeEach, describe, expect, it } from 'vitest';
import { ApplicationJSONType, HTTPHeaders } from '../headers';
import { HTTPParams } from '../params';
import { __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION, HTTPRequest } from '../request';

describe('test class HTTPRequest', () => {
    beforeEach(() => {
        __TEST_ONLY_RESET_REQUEST_UID_DO_NOT_USE_IN_PRODUCTION();
    });

    it('should have incremental UIDs for multiple requests', () => {
        const request1 = new HTTPRequest('GET', 'https://example.com');
        const request2 = new HTTPRequest('GET', 'https://example.com');

        expect(request1.uid).toBe(0);
        expect(request2.uid).toBe(1);
    });

    describe('getUrlWithParams', () => {
        it('should return original URL when no params', () => {
            const request = new HTTPRequest('GET', 'https://example.com');
            expect(request.getUrlWithParams()).toBe('https://example.com');
        });

        it('should append params with ? when URL has no query params', () => {
            const params = new HTTPParams({ key: 'value' });
            const request = new HTTPRequest('GET', 'https://example.com', {
                headers: new HTTPHeaders(),
                params,
                responseType: 'json',
                withCredentials: false,
            });

            expect(request.getUrlWithParams()).toBe('https://example.com?key=value');
        });

        it('should append params with & when URL already has query params', () => {
            const params = new HTTPParams({ key2: 'value2' });
            const request = new HTTPRequest('GET', 'https://example.com?key1=value1', {
                headers: new HTTPHeaders(),
                params,
                responseType: 'json',
                withCredentials: false,
            });

            expect(request.getUrlWithParams()).toBe('https://example.com?key1=value1&key2=value2');
        });
    });

    describe('getBody', () => {
        it('should return null for empty body', () => {
            const request = new HTTPRequest('GET', 'https://example.com', {
                headers: new HTTPHeaders(),
                responseType: 'json',
                withCredentials: false,
            });

            expect(request.getBody()).toBeNull();
        });

        it('should return FormData as is', () => {
            const formData = new FormData();
            const request = new HTTPRequest('POST', 'https://example.com', {
                body: formData,
                headers: new HTTPHeaders(),
                responseType: 'json',
                withCredentials: false,
            });

            expect(request.getBody()).toBe(formData);
        });

        it('should stringify object for JSON content type', () => {
            const body = { name: 'test', value: 123 };
            const headers = new HTTPHeaders({
                'Content-Type': ApplicationJSONType,
            });

            const request = new HTTPRequest('POST', 'https://example.com', {
                body,
                headers,
                responseType: 'json',
                withCredentials: false,
            });

            expect(request.getBody()).toBe(JSON.stringify(body));
        });

        it('should convert non-object body to string', () => {
            const request = new HTTPRequest('POST', 'https://example.com', {
                body: 123,
                headers: new HTTPHeaders(),
                responseType: 'text',
                withCredentials: false,
            });

            expect(request.getBody()).toBe('123');
        });
    });

    describe('getHeadersInit', () => {
        it('should return headers from HTTPHeaders object', () => {
            const headers = new HTTPHeaders({
                'X-Custom-Header': 'test',
                Authorization: 'Bearer token',
            });

            const request = new HTTPRequest('GET', 'https://example.com', {
                headers,
                responseType: 'json',
                withCredentials: false,
            });

            const headersInit = request.getHeadersInit();

            expect(headersInit).toHaveProperty('X-Custom-Header'.toLowerCase(), 'test');
            expect(headersInit).toHaveProperty('Authorization'.toLowerCase(), 'Bearer token');
        });

        it('should set Content-Type to application/json for JSON body', () => {
            const headers = new HTTPHeaders();
            const request = new HTTPRequest('POST', 'https://example.com', {
                headers,
                body: { name: 'test' },
                responseType: 'json',
                withCredentials: false,
            });

            const headersInit = request.getHeadersInit();
            expect(headersInit).toHaveProperty('content-type', 'application/json;charset=UTF-8');
        });

        it('should not set Content-Type for FormData body', () => {
            const formData = new FormData();
            const headers = new HTTPHeaders();
            const request = new HTTPRequest('POST', 'https://example.com', {
                headers,
                body: formData,
                responseType: 'json',
                withCredentials: false,
            });

            const headersInit = request.getHeadersInit();
            expect(headersInit).not.toHaveProperty('content-type');
        });
    });
});
