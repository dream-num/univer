/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IDisposable } from '@wendellhu/redi';
import { Observable } from 'rxjs';

type CallbackFn<T extends readonly unknown[]> = (cb: (...args: T) => void) => IDisposable;

export function fromCallback<T extends readonly unknown[]>(callback: CallbackFn<T>): Observable<T> {
    return new Observable((subscriber) => {
        const disposable: IDisposable | undefined = callback((...args: T) => subscriber.next(args));
        return () => disposable?.dispose();
    });
};
