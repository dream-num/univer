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
import type { ISidebarMethodOptions } from '../../views/components/sidebar/Sidebar';
import type { ISidebarService } from './sidebar.service';
import { toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';

export class DesktopSidebarService implements ISidebarService {
    private _sidebarOptions: ISidebarMethodOptions = {};
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();

    readonly scrollEvent$ = new Subject<Event>();

    private _container?: HTMLElement;

    get visible(): boolean {
        return this._sidebarOptions.visible || false;
    }

    get options() {
        return this._sidebarOptions;
    }

    open(params: ISidebarMethodOptions): IDisposable {
        this._sidebarOptions = {
            ...params,
            id: params.id,
            visible: true,
        };

        this.sidebarOptions$.next(this._sidebarOptions);

        return toDisposable(() => {
            this.close();
        });
    }

    close(id?: string) {
        if (id && this._sidebarOptions.id !== id) {
            return;
        }
        this._sidebarOptions = {
            ...this._sidebarOptions,
            visible: false,
        };
        this.sidebarOptions$.next(this._sidebarOptions);
        this._sidebarOptions.onClose && this._sidebarOptions.onClose();
    }

    getContainer() {
        return this._container;
    }

    setContainer(element: HTMLElement) {
        this._container = element;
    }
}
