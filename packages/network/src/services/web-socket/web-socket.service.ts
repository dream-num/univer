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

import type { Nullable } from '@univerjs/core';
import { createIdentifier, Disposable, DisposableCollection, toDisposable } from '@univerjs/core';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

export type SocketBodyType = string | ArrayBufferLike | Blob | ArrayBufferView;

/**
 * This service is responsible for establishing bidi-directional connection to a remote server.
 */
export const ISocketService = createIdentifier<ISocketService>('univer.network.socket.service');
export interface ISocketService {
    createSocket(url: string): Nullable<ISocket>;
}

/**
 * An interface that represents a socket connection.
 */
export interface ISocket {
    URL: string;

    close(code?: number, reason?: string): void;

    /**
     * Send a message to the remote server.
     */
    send(data: SocketBodyType): void;

    close$: Observable<Event>;
    error$: Observable<Event>;
    message$: Observable<MessageEvent>;
    open$: Observable<Event>;
}

/**
 * This service create a WebSocket connection to a remote server.
 */
export class WebSocketService extends Disposable implements ISocketService {
    createSocket(URL: string): Nullable<ISocket> {
        try {
            const connection = new WebSocket(URL);

            const disposables = new DisposableCollection();
            const webSocket: ISocket = {
                URL,
                close: (code?: number, reason?: string) => {
                    connection.close(code, reason);
                    disposables.dispose();
                },
                send: (data: SocketBodyType) => {
                    connection.send(data);
                },
                open$: new Observable<Event>((subscriber) => {
                    const callback = (event: Event) => subscriber.next(event);
                    connection.addEventListener('open', callback);
                    disposables.add(toDisposable(() => connection.removeEventListener('open', callback)));
                }).pipe(share()),
                close$: new Observable<Event>((subscriber) => {
                    const callback = (event: Event) => subscriber.next(event);
                    connection.addEventListener('close', callback);
                    disposables.add(toDisposable(() => connection.removeEventListener('close', callback)));
                }).pipe(share()),
                error$: new Observable<Event>((subscriber) => {
                    const callback = (event: Event) => subscriber.next(event);
                    connection.addEventListener('error', callback);
                    disposables.add(toDisposable(() => connection.removeEventListener('error', callback)));
                }).pipe(share()),
                message$: new Observable<MessageEvent>((subscriber) => {
                    const callback = (event: MessageEvent) => subscriber.next(event);
                    connection.addEventListener('message', callback);
                    disposables.add(toDisposable(() => connection.removeEventListener('message', callback)));
                }).pipe(share()),
            };

            return webSocket;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
