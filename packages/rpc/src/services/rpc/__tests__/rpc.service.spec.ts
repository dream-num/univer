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

/* eslint-disable ts/no-explicit-any */

import type { Observable } from 'rxjs';
import type { IMessageProtocol } from '../rpc.service';
import { awaitTime } from '@univerjs/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ChannelClient, ChannelServer, fromModule, toModule } from '../rpc.service';

async function wait() {
    return awaitTime(1);
}

describe('test ChannelClient & ChannelServer', () => {
    let clientProtocol: TestMessageProtocolForClient;
    let serverProtocol: TestMessageProtocolForServer;

    let client: ChannelClient;
    let server: ChannelServer;

    // Here we mock an in-memory message protocol for client and server.

    class TestMessageProtocolForClient implements IMessageProtocol {
        private readonly _message$ = new Subject<any>();
        onMessage = this._message$.asObservable();

        send(message: any): void {
            serverProtocol.mockSendMessage(message);
        }

        mockSendMessage(message: any): void {
            this._message$.next(message);
        }
    }

    class TestMessageProtocolForServer implements IMessageProtocol {
        private readonly _message$ = new Subject<any>();
        onMessage = this._message$.asObservable();

        send(message: any): void {
            clientProtocol.mockSendMessage(message);
        }

        mockSendMessage(message: any): void {
            this._message$.next(message);
        }
    }

    beforeEach(() => {
        clientProtocol = new TestMessageProtocolForClient();
        serverProtocol = new TestMessageProtocolForServer();

        client = new ChannelClient(clientProtocol);
        server = new ChannelServer(serverProtocol);
    });

    describe('test fromModule and toModule', async () => {
        it('should remote call work', async () => {
            interface INameService {
                getName(): Promise<string>;
                getCount$(): Observable<number>;
            }

            const clientService = toModule<INameService>(client.getChannel('test'));
            server.registerChannel(
                'test',
                fromModule({
                    async getName(): Promise<string> {
                        return 'service';
                    },
                    getCount$(): Observable<number> {
                        return of(1, 2, 3);
                    },
                } as INameService)
            );

            const name = await clientService.getName();
            expect(name).toBe('service');

            // Should not emit any value when the returned observable is not subscribe.
            const values: number[] = [];
            const observable = clientService.getCount$();
            await wait();
            expect(values).toEqual([]);

            // Should send request only after the observable is subscribed.
            const subscription = observable.subscribe((value) => values.push(value));
            await wait();
            expect(values).toEqual([1, 2, 3]);
            expect(subscription.closed).toBe(true);
        });

        it('should remote subscription work', async () => {
            interface ISignalService {
                getSignal$(): Observable<number>;
            }

            const signalSubject$ = new BehaviorSubject<number>(0);

            const clientService = toModule<ISignalService>(client.getChannel('test'));
            server.registerChannel(
                'test',
                fromModule({
                    getSignal$(): Observable<number> {
                        return signalSubject$.asObservable();
                    },
                })
            );

            let err: string = '';
            let completed = false;

            const values: number[] = [];
            const subscription = clientService.getSignal$()
                .subscribe({
                    next(value) {
                        values.push(value);
                    },
                    error(e) {
                        err = e;
                    },
                    complete() {
                        completed = true;
                    },
                });

            await wait();
            expect(values).toEqual([0]);

            signalSubject$.next(1);
            await wait();
            expect(values).toEqual([0, 1]);

            signalSubject$.error(new Error('mock error'));
            await wait();
            expect(err).toEqual('mock error');

            subscription.unsubscribe();
            signalSubject$.next(2);
            await wait();
            expect(values).toEqual([0, 1]);

            signalSubject$.complete();
            await wait();
            expect(completed).toBe(false);
        });

        it('should remote completion work', async () => {
            interface ISignalService {
                getSignal$(): Observable<number>;
            }

            const signalSubject$ = new BehaviorSubject<number>(0);

            const clientService = toModule<ISignalService>(client.getChannel('test'));
            server.registerChannel(
                'test',
                fromModule({
                    getSignal$(): Observable<number> {
                        return signalSubject$.asObservable();
                    },
                })
            );

            let completed = false;

            const values: number[] = [];
            const subscription = clientService.getSignal$()
                .subscribe({
                    next(value) {
                        values.push(value);
                    },
                    complete() {
                        completed = true;
                    },
                });

            await wait();
            expect(values).toEqual([0]);

            signalSubject$.complete();
            await wait();
            expect(completed).toBe(true);
            expect(subscription.closed).toBe(true);
        });
    });
});
