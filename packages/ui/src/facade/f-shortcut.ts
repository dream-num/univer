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
import type { IShortcutItem } from '@univerjs/ui';
import { Inject, Injector } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { IShortcutService } from '@univerjs/ui';

/**
 * The Facade API object to handle shortcuts in Univer
 * @hideconstructor
 */
export class FShortcut extends FBase {
    private _forceEscapeDisposable: IDisposable | null = null;

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IShortcutService protected readonly _shortcutService: IShortcutService
    ) {
        super();
    }

    /**
     * Enable shortcuts of Univer.
     * @returns {FShortcut} The Facade API instance itself for chaining.
     */
    enableShortcut(): this {
        this._forceEscapeDisposable?.dispose();
        this._forceEscapeDisposable = null;
        return this;
    }

    /**
     * Disable shortcuts of Univer.
     * @returns {FShortcut} The Facade API instance itself for chaining.
     */
    disableShortcut(): this {
        if (!this._forceEscapeDisposable) {
            this._forceEscapeDisposable = this._shortcutService.forceEscape();
        }

        return this;
    }

    /**
     * Dispatch a KeyboardEvent to the shortcut service and return the matched shortcut item.
     * @param {KeyboardEvent} e - The KeyboardEvent to dispatch.
     * @returns {IShortcutItem<object> | undefined} The matched shortcut item.
     *
     * @example
     * ```typescript
     * const fShortcut = univerAPI.getShortcut();
     * const pseudoEvent = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
     * const ifShortcutItem = fShortcut.dispatchShortcutEvent(pseudoEvent);
     * if (ifShortcutItem) {
     *   const commandId = ifShortcutItem.id;
     *   // Do something with the commandId.
     * }
     * ```
     */
    dispatchShortcutEvent(e: KeyboardEvent): IShortcutItem<object> | undefined {
        return this._shortcutService.dispatch(e);
    }
}
