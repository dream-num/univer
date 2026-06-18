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

import type { HTTPRequest, ISocket, SocketBodyType } from '@univerjs/network';
import { ILogService, LogLevel, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    HTTPHeaders,
    HTTPResponse,
    HTTPService,
    IHTTPImplementation,
    ISocketService,
    WebSocketService,
} from '@univerjs/network';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MockHTTPImplementation } from '../../services/http/__tests__/http-testing-utils';
import '@univerjs/network/facade';

class FakeWebSocket {
    static instances: FakeWebSocket[] = [];

    readonly send = vi.fn();
    readonly close = vi.fn();

    constructor(readonly url: string) {
        FakeWebSocket.instances.push(this);
    }

    addEventListener(): void {}

    removeEventListener(): void {}
}

describe('network facade', () => {
    const originalWebSocket = globalThis.WebSocket;

    let univer: Univer;
    let univerAPI: FUniver;

    beforeEach(() => {
        FakeWebSocket.instances = [];
        vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket);

        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([HTTPService]);
        injector.add([IHTTPImplementation, { useClass: MockHTTPImplementation }]);
        injector.add([ISocketService, { useClass: WebSocketService }]);
        injector.get(ILogService).setLogLevel(LogLevel.SILENT);

        univerAPI = FUniver.newAPI(injector);
    });

    afterEach(() => {
        univer.dispose();
        vi.unstubAllGlobals();
        globalThis.WebSocket = originalWebSocket;
    });

    it('sends requests through the network facade with the configured HTTP service', async () => {
        const injector = univer.__getInjector();
        const httpImplementation = injector.get(IHTTPImplementation) as MockHTTPImplementation;
        const requests: HTTPRequest[] = [];

        const subscription = httpImplementation.newRequest$.subscribe((request) => {
            requests.push(request);
            httpImplementation.getHandler(request.uid).emitResponse(new HTTPResponse({
                body: { ok: true },
                headers: new HTTPHeaders({ 'content-type': 'application/json' }),
                status: 200,
                statusText: 'OK',
            }));
        });

        const response = await univerAPI.getNetwork().post<{ ok: boolean }>('https://example.com/api', {
            body: { name: 'Univer' },
            headers: { authorization: 'Bearer token' },
            params: { page: 1 },
        });

        expect(response.body).toEqual({ ok: true });
        expect(requests).toHaveLength(1);
        expect(requests[0].method).toBe('POST');
        expect(requests[0].getUrlWithParams()).toBe('https://example.com/api?page=1');
        expect(requests[0].getBody()).toBe(JSON.stringify({ name: 'Univer' }));
        expect(requests[0].headers.get('authorization')).toEqual(['Bearer token']);

        subscription.unsubscribe();
    });

    it('supports item lifecycle requests and server-sent event streams', async () => {
        const injector = univer.__getInjector();
        const httpImplementation = injector.get(IHTTPImplementation) as MockHTTPImplementation;

        const subscription = httpImplementation.newRequest$.subscribe((request) => {
            const url = request.getUrlWithParams();
            const body = request.getBody();
            const parseBody = () => JSON.parse(typeof body === 'string' ? body : '{}');
            const responseBody = (() => {
                if (request.method === 'GET' && url === '/items') {
                    return { items: ['item-1'] };
                }
                if (request.method === 'PUT' && url === '/items/1') {
                    return { replaced: parseBody().name };
                }
                if (request.method === 'DELETE' && url === '/items/1') {
                    return { deleted: 'item-1' };
                }
                if (request.method === 'PATCH' && url === '/items/1') {
                    return { patched: parseBody().name };
                }
                if (request.method === 'POST' && url === '/events') {
                    return { cursor: parseBody().cursor, stream: 'opened' };
                }
                return { error: 'unexpected request' };
            })();
            httpImplementation.getHandler(request.uid).emitResponse(new HTTPResponse({
                body: responseBody,
                headers: new HTTPHeaders(),
                status: 200,
                statusText: 'OK',
            }));
        });
        const network = univerAPI.getNetwork();

        await expect(network.get('/items')).resolves.toMatchObject({ body: { items: ['item-1'] } });
        await expect(network.put('/items/1', { body: { name: 'Item' } })).resolves.toMatchObject({ body: { replaced: 'Item' } });
        await expect(network.delete('/items/1')).resolves.toMatchObject({ body: { deleted: 'item-1' } });
        await expect(network.patch('/items/1', { body: { name: 'Patched' } })).resolves.toMatchObject({ body: { patched: 'Patched' } });
        await expect(firstValueFrom(network.getSSE('POST', '/events', { body: { cursor: 1 } }))).resolves.toMatchObject({ body: { cursor: 1, stream: 'opened' } });

        subscription.unsubscribe();
    });

    it('creates sockets through the WebSocket service registered in DI', () => {
        const socket = univerAPI.createSocket('wss://example.com/socket');
        const payload: SocketBodyType = 'hello';

        expect(socket.URL).toBe('wss://example.com/socket');
        socket.send(payload);
        socket.close(1000, 'done');

        const connection = FakeWebSocket.instances[0] as FakeWebSocket & ISocket;
        expect(connection.send).toHaveBeenCalledWith(payload);
        expect(connection.close).toHaveBeenCalledWith(1000, 'done');
    });
});
