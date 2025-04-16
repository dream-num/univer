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

import type { ComponentType } from '../../common/component-manager';
import type { IZenZoneService } from './zen-zone.service';
import { toDisposable } from '@univerjs/core';

import { type IDisposable, Inject } from '@univerjs/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { ComponentManager } from '../../common/component-manager';

export class DesktopZenZoneService implements IZenZoneService, IDisposable {
    readonly visible$ = new BehaviorSubject<boolean>(false);
    readonly componentKey$ = new ReplaySubject<string>();

    private readonly _temporaryHidden$ = new BehaviorSubject<boolean>(false);
    readonly temporaryHidden$ = this._temporaryHidden$.asObservable();

    private _visible = false;
    get visible() {
        return this._visible;
    }

    get temporaryHidden() {
        return this._temporaryHidden$.getValue();
    }

    constructor(@Inject(ComponentManager) private readonly _componentManager: ComponentManager) {
        // super
    }

    dispose(): void {
        this.visible$.next(false);
        this.visible$.complete();

        this.componentKey$.complete();
    }

    hide(): void {
        this._temporaryHidden$.next(true);
    }

    show(): void {
        this._temporaryHidden$.next(false);
    }

    set(key: string, component: ComponentType): IDisposable {
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
