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
import type { IDisposable } from '@wendellhu/redi';
import { Subject } from 'rxjs';

import type { ISidebarMethodOptions } from '../../views/components/sidebar/interface';
import type { ISidebarService } from './sidebar.service';

export class DesktopSidebarService implements ISidebarService {
    private _sidebarOptions: ISidebarMethodOptions = {};
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();

    open(params: ISidebarMethodOptions): IDisposable {
        this._sidebarOptions = {
            ...params,
            visible: true,
        };

        this.sidebarOptions$.next(this._sidebarOptions);

        return toDisposable(() => {
            this.close();
        });
    }

    close() {
        this._sidebarOptions = {
            ...this._sidebarOptions,
            visible: false,
        };

        this.sidebarOptions$.next(this._sidebarOptions);
        this._sidebarOptions.onClose && this._sidebarOptions.onClose();
    }
}
