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
import { HTTPParams } from '../../params';
import { HTTPRequest } from '../../request';
import { XHRHTTPImplementation } from '../xhr';

type Listener = (event: ProgressEvent) => void;

const xhrInstances: FakeXMLHttpRequest[] = [];

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
    vi.restoreAllMocks();
    xhrInstances.length = 0;
});

describe('XHRHTTPImplementation', () => {
    it('sends requests with headers, credentials and JSON body, then parses JSON responses', async () => {
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest as never);
        const impl = new XHRHTTPImplementation({ debug: vi.fn(), error: vi.fn() } as any);
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
        const impl = new XHRHTTPImplementation({ debug: vi.fn(), error: vi.fn() } as any);

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
        const logService = { debug: vi.fn(), error: vi.fn() };
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest as never);
        const impl = new XHRHTTPImplementation(logService as any);

        const statusError = new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[0].status = 500;
        xhrInstances[0].statusText = 'Server Error';
        xhrInstances[0].responseText = '{"ok":false}';
        xhrInstances[0].emit('load');
        await expect(statusError).rejects.toMatchObject({ status: 500, statusText: 'Server Error' });

        const jsonError = new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[1].responseText = '{bad';
        xhrInstances[1].emit('load');
        await expect(jsonError).rejects.toMatchObject({ status: 200, statusText: 'OK' });

        const blobError = new Promise((resolve, reject) => {
            impl.send(createRequest('blob')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[2].response = 'not-a-blob';
        xhrInstances[2].emit('load');
        await expect(blobError).rejects.toMatchObject({ status: 200, statusText: 'OK' });

        const networkError = new Promise((resolve, reject) => {
            impl.send(createRequest('json')).subscribe({ next: resolve, error: reject });
        });
        xhrInstances[3].status = 0;
        xhrInstances[3].statusText = '';
        xhrInstances[3].emit('error');
        await expect(networkError).rejects.toMatchObject({ status: 0, statusText: 'Unknown Error' });
        expect(logService.error).toHaveBeenCalled();
    });

    it('aborts pending requests and removes event listeners when unsubscribed', () => {
        vi.stubGlobal('XMLHttpRequest', FakeXMLHttpRequest as never);
        const impl = new XHRHTTPImplementation({ debug: vi.fn(), error: vi.fn() } as any);
        const subscription = impl.send(createRequest('json')).subscribe({ error: () => undefined });
        const xhr = xhrInstances[0];

        subscription.unsubscribe();

        expect(xhr.aborted).toBe(true);
        expect(xhr.removed.map(([type]) => type)).toEqual(['load', 'error', 'abort', 'timeout']);
    });
});
