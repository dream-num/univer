import { Disposable, DisposableCollection, Nullable, toDisposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import { Observable } from 'rxjs';

export type SocketBodyType = string | ArrayBufferLike | Blob | ArrayBufferView;

/**
 * This service is responsible for establishing bidi-directional connection to a remote server.
 */
export const ISocketService = createIdentifier<ISocketService>('univer.socket');
export interface ISocketService {
    createSocket(url: string): Nullable<ISocket>;
}

/**
 * An interface that represents a socket connection.
 */
export interface ISocket {
    URL: string;

    close(code?: number, reason?: string): void;

    // TODO: Data type can support plain object as a type.

    /**
     * Send a message to the remote server.
     */
    send(data: SocketBodyType): void;

    close$: Observable<[ISocket, CloseEvent]>;
    error$: Observable<[ISocket, Event]>;
    message$: Observable<[ISocket, MessageEvent]>;
    open$: Observable<[ISocket, Event]>;
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
                open$: new Observable((subscriber) => {
                    const callback = (event: Event) => subscriber.next([webSocket, event]);
                    connection.addEventListener('open', callback);
                    disposables.add(toDisposable(() => connection.removeEventListener('open', callback)));
                }),
                close$: new Observable((subscriber) => {
                    const callback = (event: CloseEvent) => subscriber.next([webSocket, event]);
                    connection.addEventListener('close', callback);
                    disposables.add(toDisposable(() => connection.removeEventListener('close', callback)));
                }),
                error$: new Observable((subscriber) => {
                    const callback = (event: Event) => subscriber.next([webSocket, event]);
                    connection.addEventListener('error', callback);
                    disposables.add(toDisposable(() => connection.removeEventListener('error', callback)));
                }),
                message$: new Observable((subscriber) => {
                    const callback = (event: MessageEvent) => subscriber.next([webSocket, event]);
                    connection.addEventListener('message', callback);
                    disposables.add(toDisposable(() => connection.removeEventListener('message', callback)));
                }),
            };

            return webSocket;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
