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

/* eslint-disable import/first */

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('rxjs', async () => {
    const actual = await vi.importActual<typeof import('rxjs')>('rxjs');
    return {
        ...actual,
        shareReplay: () => (source: unknown) => source,
    };
});

import { createWebWorkerMessagePortOnMain, createWebWorkerMessagePortOnWorker } from '../web-worker-rpc.service';

describe('web-worker-rpc.service', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create worker-side message protocol', () => {
        const postMessageSpy = vi.fn();
        const addEventListenerSpy = vi.fn();
        const removeEventListenerSpy = vi.fn();

        vi.stubGlobal('postMessage', postMessageSpy);
        vi.stubGlobal('addEventListener', addEventListenerSpy);
        vi.stubGlobal('removeEventListener', removeEventListenerSpy);

        const protocol = createWebWorkerMessagePortOnWorker();
        protocol.send('worker-message');

        const received: unknown[] = [];
        const subscription = protocol.onMessage.subscribe((message) => received.push(message));
        const handler = addEventListenerSpy.mock.calls[0][1] as (event: MessageEvent) => void;
        handler({ data: 'from-main' } as MessageEvent);

        expect(postMessageSpy).toHaveBeenCalledWith('worker-message');
        expect(received).toEqual(['from-main']);

        subscription.unsubscribe();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('message', handler);
    });

    it('should create main-side message protocol', () => {
        const worker = {
            postMessage: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };

        const protocol = createWebWorkerMessagePortOnMain(worker as unknown as Worker);
        protocol.send('main-message');

        const received: unknown[] = [];
        const subscription = protocol.onMessage.subscribe((message) => received.push(message));
        const handler = worker.addEventListener.mock.calls[0][1] as (event: MessageEvent) => void;
        handler({ data: 'from-worker' } as MessageEvent);

        expect(worker.postMessage).toHaveBeenCalledWith('main-message');
        expect(received).toEqual(['from-worker']);

        subscription.unsubscribe();
        expect(worker.removeEventListener).toHaveBeenCalledWith('message', handler);
    });
});
