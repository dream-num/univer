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

import { toDisposable } from '@univerjs/core';
import { type IDisposable, Inject } from '@univerjs/core';
import type { ForwardRefExoticComponent } from 'react';
import { Subject } from 'rxjs';

import { ComponentManager } from '../../common/component-manager';
import type { IGlobalZoneService } from './global-zone.service';

export class DesktopGlobalZoneService implements IGlobalZoneService {
    readonly visible$ = new Subject<boolean>();
    readonly componentKey$ = new Subject<string>();
    private _componentKey = '';

    constructor(
        @Inject(ComponentManager)
        private readonly _componentManager: ComponentManager
    ) {
        // empty
    }

    get componentKey() {
        return this._componentKey;
    }

    set(key: string, component: ForwardRefExoticComponent<any>): IDisposable {
        this._componentManager.register(key, component);
        this.componentKey$.next(key);
        this._componentKey = key;

        return toDisposable(() => {
            this._componentManager.delete(key);
            this.visible$.complete();
            this.componentKey$.complete();
        });
    }

    open(): void {
        this.visible$.next(true);
    }

    close() {
        this.visible$.next(false);
    }
}
