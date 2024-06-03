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

import { LifecycleService, LifecycleStages, toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { filter } from 'rxjs';

export class FHooks {
    constructor(
        @Inject(LifecycleService) private readonly _lifecycleService: LifecycleService
    ) {
        // empty
    }

    /**
     * The onStarting event is fired when lifecycle stage is Starting.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onStarting(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Starting)).subscribe(callback));
    }

    /**
     * The onReady event is fired when lifecycle stage is Ready.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onReady(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Ready)).subscribe(callback));
    }

    /**
     * The onRendered event is fired when lifecycle stage is Rendered.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onRendered(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Rendered)).subscribe(callback));
    }

    /**
     * The onSteady event is fired when lifecycle stage is Steady.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    onSteady(callback: () => void): IDisposable {
        return toDisposable(this._lifecycleService.lifecycle$.pipe(filter((lifecycle) => lifecycle === LifecycleStages.Steady)).subscribe(callback));
    }
}
