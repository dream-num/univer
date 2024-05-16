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

import { toDisposable } from '@univerjs/core';
import { type IDisposable, Inject } from '@wendellhu/redi';
import type { ForwardRefExoticComponent } from 'react';
import { Subject } from 'rxjs';

import { ComponentManager } from '../../common/component-manager';
import type { IZenZoneService } from './zen-zone.service';

export class DesktopZenZoneService implements IZenZoneService {
    readonly visible$ = new Subject<boolean>();
    readonly componentKey$ = new Subject<string>();
    private _visible = false;

    get visible() {
        return this._visible;
    }

    constructor(@Inject(ComponentManager) private readonly _componentManager: ComponentManager) {
        // super
    }

    set(key: string, component: ForwardRefExoticComponent<any>): IDisposable {
        this._componentManager.register(key, component);
        this.componentKey$.next(key);

        return toDisposable(() => {
            this._componentManager.delete(key);
            this.visible$.complete();
            this.componentKey$.complete();
        });
    }

    open(): void {
        this._visible = true;
        this.visible$.next(true);
    }

    close() {
        this._visible = false;
        this.visible$.next(false);
    }
}
