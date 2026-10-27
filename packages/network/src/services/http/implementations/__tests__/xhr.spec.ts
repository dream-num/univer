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

import { DesktopLogService, ILogService, Injector, LogLevel } from '@univerjs/core';
import { createServer } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPHeaders } from '../../headers';
import { HTTPService } from '../../http.service';
import { HTTPParams } from '../../params';
import { HTTPRequest } from '../../request';
import { FetchHTTPImplementation } from '../fetch';
import { IHTTPImplementation } from '../implementation';
import { XHRHTTPImplementation } from '../xhr';

type Listener = (event: ProgressEvent) => void;

const xhrInstances: FakeXMLHttpRequest[] = [];
let injector: Injector;

beforeEach(() => {
    injector = new Injector([
        [ILogService, { useClass: DesktopLogService }],
        [IHTTPImplementation, { useClass: XHRHTTPImplementation }],
        [HTTPService],
    ]);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
});

class FakeXMLHttpRequest {
    DONE = 4;
    readyState = 1;
    status = 200;
    statusText = 'OK';
    responseType = '';
    response: unknown;
    responseText = '';
    withCredentials = false;
    method = '';
    url = '';
    sentBody: unknown;
    aborted = false;
    headers = new Map<string, string>();
    removed: Array<[string, Listener]> = [];
    private _listeners = new Map<string, Listener[]>();

    constructor() {
        xhrInstances.push(this);
    }

    open(method: string, url: string): void {
        this.method = method;
        this.url = url;
    }

    setRequestHeader(key: string, value: string): void {
        this.headers.set(key, value);
    }

    getAllResponseHeaders(): string {
        return 'Content-Type: application/json\nX-Trace: trace-1';
    }

    addEventListener(type: string, listener: Listener): void {
        const listeners = this._listeners.get(type) ?? [];
        listeners.push(listener);
        this._listeners.set(type, listeners);
    }

    removeEventListener(type: string, listener: Listener): void {
        this.removed.push([type, listener]);
        this._listeners.set(type, (this._listeners.get(type) ?? []).filter((item) => item !== listener));
    }

    send(body: unknown): void {
        this.sentBody = body;
    }

    abort(): void {
        this.aborted = true;
        this.readyState = this.DONE;
        this.emit('abort');
    }

    emit(type: string): void {
        (this._listeners.get(type) ?? []).forEach((listener) => listener(new ProgressEvent(type)));
    }
}

function createRequest(responseType: string, extra: Record<string, unknown> = {}) {
    return new HTTPRequest('POST', 'https://example.com/api', {
        responseType,
        withCredentials: true,
        headers: new HTTPHeaders({ 'X-Test': 'yes' }),
        params: new HTTPParams({ q: 'search' }),
        body: { ok: true },
        ...extra,
    } as any);
}

afterEach(() => {
    injector.dispose();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    xhrInstances.length = 0;
});

describe('XHRHTTPImplementation', () => {
    it.each([
        { name: 'XHR', implementation: XHRHTTPImplementation },
        { name: 'Fetch', implementation: FetchHTTPImplementation },
    ])('preserves a failed HTTP response body in error with $name', async ({ implementation }) => {
        injector.replace([IHTTPImplementation, { useClass: implementation }]);
        const server = createServer((request, response) => {
            if (request.method === 'OPTIONS') {
                response.writeHead(204, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                });
                response.end();
                return;
            }

            response.writeHead(403, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            response.end(JSON.stringify({ error: { code: 9018, message: 'Domain is not authorized' } }));
        });
        await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

        try {
            const address = server.address();
            if (!address || typeof address === 'string') {
                throw new Error('Expected a TCP server address');
            }

            const httpService = injector.get(HTTPService);
            await expect(httpService.get(`http://127.0.0.1:${address.port}/session-ticket`))
                .rejects
                .toMatchObject({
                    status: 403,
                    error: { error: { code: 9018, message: 'Domain is not authorized' } },
                });
        } finally {
            await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
        }
    });

    it('sends requests with headers, credentials and JSON body, then parses JSON responses', async () => {
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest as never);
        const impl = injector.get(IHTTPImplementation);
        const events: any[] = [];
        const promise = new Promise<void>((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({
                next: (event) => {
                    events.push(event);
                    resolve();
                },
                error: reject,
            });
        });
        const xhr = xhrInstances[0];

        xhr.responseText = '{"ok":true}';
        xhr.emit('load');
        await promise;

        expect(xhr.method).toBe('POST');
        expect(xhr.url).toBe('https://example.com/api?q=search');
        expect(xhr.withCredentials).toBe(true);
        expect(xhr.headers.get('x-test')).toBe('yes');
        expect(xhr.headers.get('content-type')).toBe('application/json;charset=UTF-8');
        expect(xhr.sentBody).toBe('{"ok":true}');
        expect(events.at(-1).body).toEqual({ ok: true });
    });

    it('returns null for no-content responses and raw text for text responses', async () => {
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest as never);
        const impl = injector.get(IHTTPImplementation);

        const noContentPromise = new Promise<any>((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[0].status = 204;
        xhrInstances[0].responseText = '{"ignored":true}';
        xhrInstances[0].emit('load');
        await expect(noContentPromise).resolves.toMatchObject({ body: null });

        const textPromise = new Promise<any>((resolve, reject) => {
            impl.send(createRequest('text')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[1].responseText = 'plain';
        xhrInstances[1].emit('load');
        await expect(textPromise).resolves.toMatchObject({ body: 'plain' });
    });

    it('emits response errors for status errors, invalid JSON, blob mismatches, and network failures', async () => {
        const logError = vi.spyOn(injector.get(ILogService), 'error');
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest as never);
        const impl = injector.get(IHTTPImplementation);

        const statusError = new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[0].status = 500;
        xhrInstances[0].statusText = 'Server Error';
        xhrInstances[0].responseText = '{"ok":false}';
        xhrInstances[0].emit('load');
        await expect(statusError).rejects.toMatchObject({ status: 500, statusText: 'Server Error', error: { ok: false } });

        const jsonError = new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[1].responseText = '{bad';
        xhrInstances[1].emit('load');
        await expect(jsonError).rejects.toMatchObject({ status: 200, statusText: 'OK', error: expect.any(SyntaxError) });

        const blobError = new Promise((resolve, reject) => {
            impl.send(createRequest('blob')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[2].response = 'not-a-blob';
        xhrInstances[2].emit('load');
        await expect(blobError).rejects.toMatchObject({
            status: 200,
            statusText: 'OK',
            error: expect.objectContaining({ message: 'Response is not a Blob object' }),
        });

        const networkError = new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[3].status = 0;
        xhrInstances[3].statusText = '';
        xhrInstances[3].emit('error');
        await expect(networkError).rejects.toMatchObject({
            status: 0,
            statusText: 'Unknown Error',
            error: expect.any(ProgressEvent),
        });
        expect(logError).toHaveBeenCalled();
    });

    it('aborts pending requests and removes event listeners when unsubscribed', () => {
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest as never);
        const impl = injector.get(IHTTPImplementation);
        const subscription = impl.send(createRequest('json')).subscribe({ error: () => undefined });
        const xhr = xhrInstances[0];

        subscription.unsubscribe();

        expect(xhr.aborted).toBe(true);
        expect(xhr.removed.map(([type]) => type)).toEqual(['load', 'error', 'abort', 'timeout']);
    });
});
