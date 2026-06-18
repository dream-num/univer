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

import { describe, expect, it } from 'vitest';
import { HTTPHeaders, isApplicationJSONType } from '../headers';

describe('HTTPHeaders', () => {
    it('normalizes constructor headers and keeps repeated values', () => {
        const headers = new HTTPHeaders({
            Accept: 'text/plain',
            'X-Retry': 1,
            'X-Enabled': true,
        });

        headers.set('x-retry', 2);

        expect(headers.has('ACCEPT')).toBe(true);
        expect(headers.get('accept')).toEqual(['text/plain']);
        expect(headers.get('x-retry')).toEqual(['1', '2']);
        expect(headers.get('missing')).toBeNull();
    });

    it('parses browser Headers and raw header strings into fetch init values', () => {
        const browserHeaders = new Headers();
        browserHeaders.set('X-Token', 'abc');
        const fromBrowser = new HTTPHeaders(browserHeaders);
        const fromString = new HTTPHeaders('Content-Type: text/plain\nX-Trace: trace-1\nBroken');
        const seen: Array<[string, string[]]> = [];

        fromBrowser.forEach((name, value) => seen.push([name, value]));

        expect(seen).toEqual([['x-token', ['abc']]]);
        expect(fromString.toHeadersInit()).toEqual({
            'content-type': ' text/plain',
            'x-trace': ' trace-1',
            accept: 'application/json, text/plain, */*',
        });
    });

    it('adds default JSON headers except for FormData bodies', () => {
        expect(new HTTPHeaders().toHeadersInit()).toEqual({
            accept: 'application/json, text/plain, */*',
            'content-type': 'application/json;charset=UTF-8',
        });
        expect(new HTTPHeaders().toHeadersInit(new FormData())).toEqual({
            accept: 'application/json, text/plain, */*',
        });
    });

    it('detects JSON content types in string or array forms', () => {
        expect(isApplicationJSONType('application/json; charset=utf-8')).toBe(true);
        expect(isApplicationJSONType(['text/plain', 'application/json'])).toBe(true);
        expect(isApplicationJSONType('text/plain')).toBe(false);
    });
});
