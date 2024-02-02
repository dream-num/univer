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

import { remove, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';

/**
 * This service is responsible for storing layout information of the current
 * Univer application instance
 */
export class LayoutService {
    private _containers: HTMLElement[] = [];

    registerContainer(container: HTMLElement): IDisposable {
        if (this._containers.indexOf(container) === -1) {
            this._containers.push(container);
            return toDisposable(() => remove(this._containers, container));
        }

        throw new Error('[LayoutService]: container already registered!');
    }

    checkElementInCurrentApplicationScope(element: HTMLElement): boolean {
        return this._containers.some((container) => container.contains(element));
    }
}
