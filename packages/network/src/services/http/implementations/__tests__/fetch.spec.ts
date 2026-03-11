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

import { afterEach, describe, expect, it, vi } from 'vitest';

import { HTTPHeaders } from '../../headers';
import { HTTPRequest } from '../../request';
import { FetchHTTPImplementation } from '../fetch';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('FetchHTTPImplementation', () => {
    it('should emit HTTPResponse for json response', async () => {
        const body = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ ok: true })));
                controller.close();
            },
        });

        vi.stubGlobal('fetch', vi.fn(async () => new Response(body, {
            status: 200,
            headers: {
                'content-type': 'application/json',
                'content-length': '12',
            },
        })));

        const impl = new FetchHTTPImplementation({ debug: vi.fn(), error: vi.fn() } as any);
        const req = new HTTPRequest('GET', 'https://example.com', {
            responseType: 'json',
            headers: new HTTPHeaders(),
            withCredentials: false,
        } as any);

        const result = await new Promise<any>((resolve, reject) => {
            impl.send(req).subscribe({
                next: (e) => resolve(e),
                error: reject,
            });
        });

        expect(result.status).toBe(200);
        expect(result.body).toEqual({ ok: true });
    });

    it('should emit HTTPProgress when reportProgress enabled for text', async () => {
        const body = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode('a'));
                controller.enqueue(new TextEncoder().encode('b'));
                controller.close();
            },
        });

        vi.stubGlobal('fetch', vi.fn(async () => new Response(body, {
            status: 200,
            headers: { 'content-type': 'text/plain', 'content-length': '2' },
        })));

        const impl = new FetchHTTPImplementation({ debug: vi.fn(), error: vi.fn() } as any);
        const req = new HTTPRequest('GET', 'https://example.com', {
            responseType: 'text',
            reportProgress: true,
            headers: new HTTPHeaders(),
            withCredentials: false,
        } as any);

        const events: any[] = [];
        await new Promise<void>((resolve, reject) => {
            impl.send(req).subscribe({
                next: (e) => events.push(e),
                error: reject,
                complete: () => resolve(),
            });
        });

        expect(events.some((e) => e.type === 0)).toBe(true);
        expect(events.at(-1).body).toBe('ab');
    });
});
