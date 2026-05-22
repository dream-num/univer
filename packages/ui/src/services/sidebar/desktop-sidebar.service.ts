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
import { Disposable, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';

export class DesktopSidebarService extends Disposable implements ISidebarService {
    private _sidebarOptions: ISidebarMethodOptions = {};
    readonly sidebarOptions$ = new Subject<ISidebarMethodOptions>();

    readonly scrollEvent$ = new Subject<Event>();

    private _container?: HTMLElement;
    private _openAnimationFrameId: number | null = null;
    private _width?: number;

    get visible(): boolean {
        return this._sidebarOptions.visible || false;
    }

    get options() {
        return this._sidebarOptions;
    }

    get width(): number | undefined {
        return this._width;
    }

    setWidth(value: number): void {
        this._width = value;
    }

    override dispose(): void {
        super.dispose();
        this.close();
        this.sidebarOptions$.complete();
        this.scrollEvent$.complete();
    }

    private _clearPendingOpenFrame() {
        if (this._openAnimationFrameId !== null) {
            cancelAnimationFrame(this._openAnimationFrameId);
            this._openAnimationFrameId = null;
        }
    }

    open(params: ISidebarMethodOptions): IDisposable {
        this._sidebarOptions = {
            ...params,
            id: params.id,
            visible: true,
        };

        this.sidebarOptions$.next(this._sidebarOptions);
        this._clearPendingOpenFrame();
        this._openAnimationFrameId = requestAnimationFrame(() => {
            this._openAnimationFrameId = null;
            this._sidebarOptions.onOpen && this._sidebarOptions.onOpen();
        });

        return toDisposable(() => {
            this.close();
        });
    }

    close(id?: string) {
        if (id && this._sidebarOptions.id !== id) {
            return;
        }

        this._clearPendingOpenFrame();
        this._sidebarOptions = {
            ...this._sidebarOptions,
            visible: false,
        };
        this.sidebarOptions$.next(this._sidebarOptions);
        this._sidebarOptions.onClose?.();
    }

    getContainer() {
        return this._container;
    }

    setContainer(element: HTMLElement) {
        this._container = element;
    }
}
