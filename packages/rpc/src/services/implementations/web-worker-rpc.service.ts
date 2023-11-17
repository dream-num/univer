/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable, shareReplay } from 'rxjs';

import { IMessageProtocol } from '../rpc/rpc.service';

/**
 * Generate an `IMessageProtocol` on the web worker.
 */
export function createWebWorkerMessagePortOnWorker(): IMessageProtocol {
    return {
        send(message: unknown): void {
            postMessage(message);
        },
        onMessage: new Observable<any>((subscriber) => {
            const handler = (event: MessageEvent) => {
                subscriber.next(event.data);
            };
            addEventListener('message', handler);
            return () => removeEventListener('message', handler);
        }).pipe(shareReplay(1)),
    };
}

/**
 * Generate an `IMessageProtocol` on the main thread side.
 * @param worker The Web Worker object
 * @returns
 */
export function createWebWorkerMessagePortOnMain(worker: Worker): IMessageProtocol {
    return {
        send(message) {
            worker.postMessage(message);
        },
        onMessage: new Observable<any>((subscriber) => {
            const handler = (event: MessageEvent) => {
                subscriber.next(event.data);
            };
            worker.addEventListener('message', handler);
            return () => worker.removeEventListener('message', handler);
        }).pipe(shareReplay(1)),
    };
}
