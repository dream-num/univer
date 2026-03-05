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

import type { IChannel, IMessageProtocol } from '../rpc.service';
import { Observable, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ChannelClient, ChannelServer, fromModule, toModule } from '../rpc.service';

const REQUEST_INITIALIZATION = 50;
const CALL = 100;
const SUBSCRIBE = 101;
const UNSUBSCRIBE = 102;

const INITIALIZE = 0;
const CALL_SUCCESS = 201;
const CALL_FAILURE = 202;
const SUBSCRIBE_NEXT = 300;
const SUBSCRIBE_ERROR = 301;
const SUBSCRIBE_COMPLETE = 302;

function flushPromises() {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 0);
    });
}

function getType(value: unknown): number | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return (value as { type?: number }).type;
}

function getSeq(value: unknown): number | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    return (value as { seq?: number }).seq;
}

class TestMessageProtocol {
    readonly sent: unknown[] = [];
    private readonly _message$ = new Subject<unknown>();
    readonly onMessage = this._message$.asObservable();

    send(message: unknown): void {
        this.sent.push(message);
    }

    emit(message: unknown): void {
        this._message$.next(message);
    }
}

describe('rpc.service edge cases', () => {
    it('fromModule should cover args/no-args, non-observable and missing methods', async () => {
        const channel = fromModule({
            sum(a: number, b: number) {
                return a + b;
            },
            ping() {
                return 'pong';
            },
            value$() {
                return 7;
            },
        });

        await expect(channel.call<number>('sum', [1, 2])).resolves.toBe(3);
        await expect(channel.call<string>('ping')).resolves.toBe('pong');

        const values: number[] = [];
        channel.subscribe<number>('value$').subscribe((value) => values.push(value));
        expect(values).toEqual([7]);

        expect(() => channel.call('missing')).toThrow('[RPC]: method not found for missing!');
        expect(() => channel.subscribe('missing$')).toThrow('[RPC]: observable method not found for missing$!');
    });

    it('toModule should route call/subscribe and hide dispose', async () => {
        const call = vi.fn(async () => 'ok') as IChannel['call'];
        const subscribe = vi.fn(() => new Observable<number>((subscriber) => {
            subscriber.next(1);
            subscriber.complete();
        })) as IChannel['subscribe'];

        const channel: IChannel = { call, subscribe };
        const module = toModule<{
            dispose?: () => void;
            fetch(value: number): Promise<string>;
            values$(): Observable<number>;
        }>(channel);

        expect(module.dispose).toBeUndefined();
        await expect(module.fetch(123)).resolves.toBe('ok');

        const values: number[] = [];
        module.values$().subscribe((value) => values.push(value));
        expect(values).toEqual([1]);

        expect(call).toHaveBeenCalledWith('fetch', [123]);
        expect(subscribe).toHaveBeenCalledWith('values$', []);
    });

    it('ChannelClient should wait initialization, support disposal, and hit unknown response branches', async () => {
        const protocol = new TestMessageProtocol();
        const client = new ChannelClient(protocol as IMessageProtocol);
        const channel = client.getChannel<IChannel>('demo');

        const callPromise = channel.call<string>('get', ['value']);
        expect(getType(protocol.sent[0])).toBe(REQUEST_INITIALIZATION);
        expect(protocol.sent.some((msg) => getType(msg) === CALL)).toBe(false);

        const lazySubscription = channel.subscribe<number>('count$').subscribe(() => undefined);
        lazySubscription.unsubscribe();

        protocol.emit({ seq: -1, type: INITIALIZE });
        await flushPromises();

        const callRequest = protocol.sent.find((msg) => getType(msg) === CALL);
        expect(callRequest).toBeDefined();
        const callSeq = getSeq(callRequest);
        expect(callSeq).toBeTypeOf('number');

        protocol.emit({ seq: callSeq, type: CALL_SUCCESS, data: 'done' });
        await expect(callPromise).resolves.toBe('done');

        const failurePromise = channel.call<string>('fail', []);
        const failureRequest = [...protocol.sent].reverse().find((msg) => getType(msg) === CALL);
        protocol.emit({ seq: getSeq(failureRequest), type: CALL_FAILURE, data: 'boom' });
        await expect(failurePromise).rejects.toBe('boom');

        const unknownCallPromise = channel.call<string>('unknown', []);
        const unknownCallRequest = [...protocol.sent].reverse().find((msg) => getType(msg) === CALL);
        const callPending = (client as unknown as {
            _pendingRequests: Map<number, { handle(response: { seq: number; type: number; data?: unknown }): void }>;
        })._pendingRequests;
        expect(() =>
            callPending.get(getSeq(unknownCallRequest) as number)?.handle({
                seq: getSeq(unknownCallRequest) as number,
                type: SUBSCRIBE_NEXT,
                data: 'x',
            })
        ).toThrow('[ChannelClient]: unknown response type!');
        callPending.delete(getSeq(unknownCallRequest) as number);
        void unknownCallPromise.catch(() => undefined);

        const values: number[] = [];
        const stream = channel.subscribe<number>('stream$').subscribe((value) => values.push(value));
        const subscribeRequest = [...protocol.sent].reverse().find((msg) => getType(msg) === SUBSCRIBE);
        const subscribeSeq = getSeq(subscribeRequest);

        protocol.emit({ seq: subscribeSeq, type: SUBSCRIBE_NEXT, data: 1 });
        expect(values).toEqual([1]);

        const subscribePending = (client as unknown as {
            _pendingRequests: Map<number, { handle(response: { seq: number; type: number; data?: unknown }): void }>;
        })._pendingRequests;
        expect(() =>
            subscribePending.get(subscribeSeq as number)?.handle({
                seq: subscribeSeq as number,
                type: CALL_SUCCESS,
                data: 'x',
            })
        ).toThrow('[ChannelClient]: unknown response type!');

        protocol.emit({ seq: subscribeSeq, type: SUBSCRIBE_COMPLETE });
        stream.unsubscribe();

        (client as unknown as { _disposed: boolean })._disposed = true;
        await expect(channel.call('disposed')).rejects.toBeUndefined();
        expect(() => channel.subscribe('disposed$')).toThrow('[ChannelClient]: client is disposed!');
        client.dispose();
    });

    it('ChannelServer should handle request branches, call/subscribe failures and unsubscription', async () => {
        const protocol = new TestMessageProtocol();
        const server = new ChannelServer(protocol as IMessageProtocol);

        expect(getType(protocol.sent[0])).toBe(INITIALIZE);

        protocol.emit({ type: REQUEST_INITIALIZATION, seq: 1, channelName: '', method: '' });
        expect(protocol.sent.filter((msg) => getType(msg) === INITIALIZE).length).toBe(2);

        protocol.emit({ type: 999, seq: 1, channelName: '', method: '' });

        protocol.emit({ type: CALL, seq: 10, channelName: 'missing', method: 'm' });
        await flushPromises();
        expect(protocol.sent).toContainEqual({
            seq: 10,
            type: CALL_FAILURE,
            data: '[ChannelServer]: Channel missing not found!',
        });

        server.registerChannel('bad-call', {
            call: () => {
                const nonError: unknown = 'text-error';
                return Promise.reject(nonError);
            },
            subscribe: () => new Observable(),
        } as IChannel);
        protocol.emit({ type: CALL, seq: 11, channelName: 'bad-call', method: 'm', args: [] });
        await flushPromises();
        expect(protocol.sent).toContainEqual({
            seq: 11,
            type: CALL_FAILURE,
            data: 'text-error',
        });

        server.registerChannel('no-args', {
            call: async () => 'ok',
            subscribe: () => new Observable(),
        } as IChannel);
        protocol.emit({ type: CALL, seq: 12, channelName: 'no-args', method: 'm' });
        await flushPromises();
        expect(protocol.sent).toContainEqual({
            seq: 12,
            type: CALL_SUCCESS,
            data: 'ok',
        });

        protocol.emit({ type: SUBSCRIBE, seq: 20, channelName: 'missing-sub', method: 'stream$' });
        expect(protocol.sent).toContainEqual({
            seq: 20,
            type: SUBSCRIBE_ERROR,
            data: '[ChannelServer]: Channel missing-sub not found!',
        });

        server.registerChannel('bad-sub', {
            call: async () => true,
            subscribe: () => {
                const nonError: unknown = 'subscribe-error';
                throw nonError;
            },
        } as IChannel);
        protocol.emit({ type: SUBSCRIBE, seq: 21, channelName: 'bad-sub', method: 'stream$' });
        expect(protocol.sent).toContainEqual({
            seq: 21,
            type: SUBSCRIBE_ERROR,
            data: 'subscribe-error',
        });

        let unsubscribed = false;
        server.registerChannel('stream', {
            call: async () => true,
            subscribe: () => new Observable<string>(() => () => {
                unsubscribed = true;
            }),
        } as IChannel);
        protocol.emit({ type: SUBSCRIBE, seq: 30, channelName: 'stream', method: 'stream$', args: [] });
        protocol.emit({ type: UNSUBSCRIBE, seq: 999, channelName: 'stream', method: 'stream$' });
        protocol.emit({ type: UNSUBSCRIBE, seq: 30, channelName: 'stream', method: 'stream$' });
        expect(unsubscribed).toBe(true);

        server.dispose();
    });
});
