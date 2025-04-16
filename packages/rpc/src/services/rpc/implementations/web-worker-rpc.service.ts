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

import { Observable, shareReplay } from 'rxjs';

import type { IMessageProtocol } from '../rpc.service';

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
