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

import type { IDisposable } from '@univerjs/core';
import { toDisposable } from '@univerjs/core';

export function fromGlobalEvent<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
): IDisposable {
    window.addEventListener(type, listener, options);
    return toDisposable(() => window.removeEventListener(type, listener, options));
}

export function fromEvent<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
): IDisposable {
    target.addEventListener(type, listener, options);
    return toDisposable(() => target.removeEventListener(type, listener, options));
}
