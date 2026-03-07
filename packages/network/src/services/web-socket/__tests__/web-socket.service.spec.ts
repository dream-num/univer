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

import type { SocketBodyType } from '../web-socket.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSocketService } from '../web-socket.service';

type SocketEventName = 'open' | 'close' | 'error' | 'message';

class FakeWebSocket {
    static instances: FakeWebSocket[] = [];

    readonly listeners: Record<SocketEventName, Set<(event: Event | MessageEvent) => void>> = {
        open: new Set(),
        close: new Set(),
        error: new Set(),
        message: new Set(),
    };

    readonly send = vi.fn();

    readonly close = vi.fn((code?: number, reason?: string) => {
        this.closedWith = { code, reason };
    });

    closedWith?: { code?: number; reason?: string };

    constructor(readonly url: string) {
        FakeWebSocket.instances.push(this);
    }

    addEventListener(type: SocketEventName, callback: (event: Event | MessageEvent) => void) {
        this.listeners[type].add(callback);
    }

    removeEventListener(type: SocketEventName, callback: (event: Event | MessageEvent) => void) {
        this.listeners[type].delete(callback);
    }

    emit(type: SocketEventName, event: Event | MessageEvent) {
        this.listeners[type].forEach((callback) => callback(event));
    }
}

describe('WebSocketService', () => {
    const originalWebSocket = globalThis.WebSocket;

    beforeEach(() => {
        FakeWebSocket.instances = [];
        vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        globalThis.WebSocket = originalWebSocket;
    });

    it('creates sockets, forwards events, and removes listeners on close', () => {
        const service = new WebSocketService();
        const socket = service.createSocket('ws://example.com/socket');

        expect(socket).not.toBeNull();
        expect(socket?.URL).toBe('ws://example.com/socket');

        const createdSocket = FakeWebSocket.instances[0];
        const openEvents: Event[] = [];
        const messageEvents: MessageEvent[] = [];
        const errorEvents: Event[] = [];
        const closeEvents: Event[] = [];

        const openSubscription = socket!.open$.subscribe((event) => openEvents.push(event));
        const messageSubscription = socket!.message$.subscribe((event) => messageEvents.push(event));
        const errorSubscription = socket!.error$.subscribe((event) => errorEvents.push(event));
        const closeSubscription = socket!.close$.subscribe((event) => closeEvents.push(event));

        const openEvent = new Event('open');
        const messageEvent = new MessageEvent('message', { data: 'payload' });
        const errorEvent = new Event('error');
        const closeEvent = new Event('close');

        createdSocket.emit('open', openEvent);
        createdSocket.emit('message', messageEvent);
        createdSocket.emit('error', errorEvent);
        createdSocket.emit('close', closeEvent);

        expect(openEvents).toEqual([openEvent]);
        expect(messageEvents).toEqual([messageEvent]);
        expect(errorEvents).toEqual([errorEvent]);
        expect(closeEvents).toEqual([closeEvent]);

        const payload: SocketBodyType = 'hello';
        socket!.send(payload);
        expect(createdSocket.send).toHaveBeenCalledWith(payload);

        socket!.close(1000, 'done');
        expect(createdSocket.close).toHaveBeenCalledWith(1000, 'done');
        expect(createdSocket.listeners.open.size).toBe(0);
        expect(createdSocket.listeners.message.size).toBe(0);
        expect(createdSocket.listeners.error.size).toBe(0);
        expect(createdSocket.listeners.close.size).toBe(0);

        openSubscription.unsubscribe();
        messageSubscription.unsubscribe();
        errorSubscription.unsubscribe();
        closeSubscription.unsubscribe();
        service.dispose();
    });

    it('returns null when the platform WebSocket constructor throws', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        vi.stubGlobal('WebSocket', class ThrowingWebSocket {
            constructor() {
                throw new Error('unsupported');
            }
        } as unknown as typeof WebSocket);

        const service = new WebSocketService();

        expect(service.createSocket('ws://example.com/fail')).toBeNull();
        expect(errorSpy).toHaveBeenCalled();

        errorSpy.mockRestore();
        service.dispose();
    });
});
