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
import type { Observable } from 'rxjs';
import { createIdentifier, Disposable, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export interface IContextMenuHostService {
    readonly activeMenuId: string | null;
    readonly activeMenuId$: Observable<string | null>;
    registerMenu(menuId: string, hide: () => void): IDisposable;
    activateMenu(menuId: string): void;
    deactivateMenu(menuId: string): void;
    hideActiveMenu(exceptMenuId?: string): void;
}

export const IContextMenuHostService = createIdentifier<IContextMenuHostService>('ui.contextmenu.host.service');

export class ContextMenuHostService extends Disposable implements IContextMenuHostService {
    private readonly _menuMap = new Map<string, () => void>();
    private readonly _activeMenuId$ = new BehaviorSubject<string | null>(null);
    readonly activeMenuId$ = this._activeMenuId$.asObservable();

    get activeMenuId(): string | null {
        return this._activeMenuId$.value;
    }

    registerMenu(menuId: string, hide: () => void): IDisposable {
        this._menuMap.set(menuId, hide);

        return toDisposable(() => {
            this._menuMap.delete(menuId);
            if (this.activeMenuId === menuId) {
                this._activeMenuId$.next(null);
            }
        });
    }

    activateMenu(menuId: string): void {
        this.hideActiveMenu(menuId);
        this._activeMenuId$.next(menuId);
    }

    deactivateMenu(menuId: string): void {
        if (this.activeMenuId === menuId) {
            this._activeMenuId$.next(null);
        }
    }

    hideActiveMenu(exceptMenuId?: string): void {
        const activeMenuId = this.activeMenuId;
        if (!activeMenuId || activeMenuId === exceptMenuId) {
            return;
        }

        const hide = this._menuMap.get(activeMenuId);
        this._activeMenuId$.next(null);
        hide?.();
    }

    override dispose(): void {
        this._activeMenuId$.complete();
        super.dispose();
    }
}
