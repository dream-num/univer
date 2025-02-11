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

import type { IDisposable } from '@univerjs/core';
import type { IShortcutItem } from '@univerjs/ui';
import { FBase, Inject, Injector } from '@univerjs/core';
import { IShortcutService } from '@univerjs/ui';

/**
 * The Facade API object to handle shortcuts in Univer
 * @hideconstructor
 */
export class FShortcut extends FBase {
    private _forceDisableDisposable: IDisposable | null = null;

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IShortcutService protected readonly _shortcutService: IShortcutService
    ) {
        super();
    }

    /**
     * Enable shortcuts of Univer.
     * @returns {FShortcut} The Facade API instance itself for chaining.
     *
     * @example
     * ```typescript
     * fShortcut.enableShortcut(); // Use the FShortcut instance used by disableShortcut before, do not create a new instance
     * ```
     */
    enableShortcut(): this {
        this._forceDisableDisposable?.dispose();
        this._forceDisableDisposable = null;
        return this;
    }

    /**
     * Disable shortcuts of Univer.
     * @returns {FShortcut} The Facade API instance itself for chaining.
     *
     * @example
     * ```typescript
     * const fShortcut = univerAPI.getShortcut();
     * fShortcut.disableShortcut();
     * ```
     */
    disableShortcut(): this {
        if (!this._forceDisableDisposable) {
            this._forceDisableDisposable = this._shortcutService.forceDisable();
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
