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
import { createIdentifier, Disposable, toDisposable } from '@univerjs/core';

export interface IContextMenuHostService {
    readonly activeMenuId: string | null;
    registerMenu(menuId: string, hide: () => void): IDisposable;
    activateMenu(menuId: string): void;
    deactivateMenu(menuId: string): void;
    hideActiveMenu(exceptMenuId?: string): void;
}

export const IContextMenuHostService = createIdentifier<IContextMenuHostService>('ui.contextmenu.host.service');

export class ContextMenuHostService extends Disposable implements IContextMenuHostService {
    private readonly _menuMap = new Map<string, () => void>();
    private _activeMenuId: string | null = null;

    get activeMenuId(): string | null {
        return this._activeMenuId;
    }

    registerMenu(menuId: string, hide: () => void): IDisposable {
        this._menuMap.set(menuId, hide);

        return toDisposable(() => {
            this._menuMap.delete(menuId);
            if (this._activeMenuId === menuId) {
                this._activeMenuId = null;
            }
        });
    }

    activateMenu(menuId: string): void {
        this.hideActiveMenu(menuId);
        this._activeMenuId = menuId;
    }

    deactivateMenu(menuId: string): void {
        if (this._activeMenuId === menuId) {
            this._activeMenuId = null;
        }
    }

    hideActiveMenu(exceptMenuId?: string): void {
        if (!this._activeMenuId || this._activeMenuId === exceptMenuId) {
            return;
        }

        const hide = this._menuMap.get(this._activeMenuId);
        this._activeMenuId = null;
        hide?.();
    }
}
