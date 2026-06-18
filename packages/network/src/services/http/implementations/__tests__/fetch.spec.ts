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
    function createRequest(responseType: string, extra: Record<string, unknown> = {}) {
        return new HTTPRequest('GET', 'https://example.com', {
            responseType,
            headers: new HTTPHeaders(),
            withCredentials: false,
            ...extra,
        } as any);
    }

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

    it('should deserialize text, blob, and arraybuffer bodies', async () => {
        const impl = new FetchHTTPImplementation({ debug: vi.fn(), error: vi.fn() } as any);

        vi.stubGlobal('fetch', vi.fn(async () => new Response('plain', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
        })));
        await expect(new Promise<any>((resolve, reject) => {
            impl.send(createRequest('text')).subscribe({ next: resolve, error: reject });
        })).resolves.toMatchObject({ body: 'plain' });

        vi.stubGlobal('fetch', vi.fn(async () => new Response('blob-body', {
            status: 200,
            headers: { 'content-type': 'text/plain' },
        })));
        const blobResponse = await new Promise<any>((resolve, reject) => {
            impl.send(createRequest('blob')).subscribe({ next: resolve, error: reject });
        });
        expect(blobResponse.body).toBeInstanceOf(Blob);
        expect(await blobResponse.body.text()).toBe('blob-body');

        vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), {
            status: 200,
            headers: { 'content-type': 'application/octet-stream' },
        })));
        const arrayBufferResponse = await new Promise<any>((resolve, reject) => {
            impl.send(createRequest('arraybuffer')).subscribe({ next: resolve, error: reject });
        });
        expect(Array.from(new Uint8Array(arrayBufferResponse.body))).toEqual([1, 2, 3]);
    });

    it('should emit a null body when the response has no stream', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204, statusText: 'No Content' })));

        const impl = new FetchHTTPImplementation({ debug: vi.fn(), error: vi.fn() } as any);

        await expect(new Promise<any>((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        })).resolves.toMatchObject({ status: 204, statusText: 'No Content', body: null });
    });

    it('should emit HTTPResponseError for failed status, bad JSON, unknown response type, and fetch rejection', async () => {
        const logService = { debug: vi.fn(), error: vi.fn() };
        const impl = new FetchHTTPImplementation(logService as any);

        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'bad' }), {
            status: 500,
            statusText: 'Server Error',
            headers: { 'content-type': 'application/json' },
        })));
        await expect(new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        })).rejects.toMatchObject({ status: 500, statusText: 'Server Error' });

        vi.stubGlobal('fetch', vi.fn(async () => new Response('{bad', {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
        })));
        await expect(new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        })).rejects.toMatchObject({ status: 200, statusText: 'OK' });

        vi.stubGlobal('fetch', vi.fn(async () => new Response('body', {
            status: 200,
            statusText: 'OK',
        })));
        await expect(new Promise((resolve, reject) => {
            impl.send(createRequest('document')).subscribe({ next: resolve, error: reject });
        })).rejects.toMatchObject({ status: 200, statusText: 'OK' });

        vi.stubGlobal('fetch', vi.fn(async () => {
            throw Object.assign(new Error('offline'), { status: 0, statusText: 'Offline' });
        }));
        await expect(new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        })).rejects.toMatchObject({ status: 0, statusText: 'Offline' });
        expect(logService.error).toHaveBeenCalled();
    });

    it('should abort the fetch request when unsubscribed', () => {
        let capturedSignal: AbortSignal | undefined;
        vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => {
            capturedSignal = init.signal as AbortSignal;
            return new Promise(() => {});
        }));

        const impl = new FetchHTTPImplementation({ debug: vi.fn(), error: vi.fn() } as any);
        const subscription = impl.send(createRequest('json')).subscribe();

        expect(capturedSignal?.aborted).toBe(false);
        subscription.unsubscribe();
        expect(capturedSignal?.aborted).toBe(true);
    });
});
