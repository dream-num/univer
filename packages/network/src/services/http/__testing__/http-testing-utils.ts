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
/* eslint-disable ts/no-this-alias */

import type { Observer } from 'rxjs';
import { Observable, Subject } from 'rxjs';
import { Disposable, Injector } from '@univerjs/core';

import { IHTTPImplementation } from '../implementations/implementation';
import type { HTTPRequest } from '../request';
import type { HTTPEvent, HTTPResponse, HTTPResponseError } from '../response';
import { HTTPService } from '../http.service';

/**
 * A mocked HTTP implementation service for testing purposes. Besides methods in the interface, it
 * provides several public methods to control the process of http request.
 */
export class MockHTTPImplementation extends Disposable implements IHTTPImplementation {
    private readonly _newRequest$ = new Subject<HTTPRequest>();
    readonly newRequest$ = this._newRequest$.asObservable();

    private readonly _handlers: Map<number, IMockHTTPHandler> = new Map();

    override dispose(): void {
        super.dispose();
        this._newRequest$.complete();
    }

    send(request: HTTPRequest): Observable<HTTPEvent<any>> {
        return new Observable((observer: Observer<HTTPEvent<any>>) => {
            const service = this;
            const handler: IMockHTTPHandler = {
                emitResponse: (response) => {
                    observer.next(response);
                    removeHandler();
                },
                emitError: (error) => {
                    observer.error(error);
                    removeHandler();
                },
            };

            function removeHandler() {
                service._handlers.delete(request.uid);
            }

            this._handlers.set(request.uid, handler);
            this._newRequest$.next(request);
        });
    }

    /**
     * Get a handler to interact with the request.
     * @param uid the request's unique identifier
     * @returns the handler for the request
     */
    getHandler(uid: number): IMockHTTPHandler {
        const handler = this._handlers.get(uid);
        if (!handler) {
            throw new Error(`[MockHTTPImplementation]: no handler found for ${uid}!`);
        }

        return handler;
    }
}

export interface IMockHTTPHandler {
    /**
     * Emit a response event to the observer.
     */
    emitResponse<T>(response: HTTPResponse<T>): void;

    /**
     * Emit an error event to the observer.
     */
    emitError(error: HTTPResponseError): void;
}

export function createHTTPTestBed() {
    const injector = new Injector();

    injector.add([HTTPService]);
    injector.add([IHTTPImplementation, { useClass: MockHTTPImplementation }]);

    return { injector };
}
