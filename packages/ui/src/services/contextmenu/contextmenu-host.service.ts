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
    /** Changes when pending menu interactions and focus restoration must be discarded. */
    readonly revision: number;
    readonly suspended: boolean;
    registerMenu(menuId: string | symbol, hide: (restoreFocus: boolean) => void): IDisposable;
    activateMenu(menuId: string): void;
    deactivateMenu(menuId: string): void;
    hideActiveMenu(exceptMenuId?: string): void;
    /** Close registered menus without returning focus to their triggers. */
    closeAll(): void;
    /** Close host menus and prevent reopening until every replacing view releases its lease. */
    suspend(): IDisposable;
}

export const IContextMenuHostService = createIdentifier<IContextMenuHostService>('ui.contextmenu.host.service');

export class ContextMenuHostService extends Disposable implements IContextMenuHostService {
    private readonly _menuMap = new Map<string | symbol, (restoreFocus: boolean) => void>();
    private readonly _activeMenuId$ = new BehaviorSubject<string | null>(null);
    private readonly _suspensions = new Set<symbol>();
    private _revision = 0;
    readonly activeMenuId$ = this._activeMenuId$.asObservable();

    get activeMenuId(): string | null {
        return this._activeMenuId$.value;
    }

    get revision(): number {
        return this._revision;
    }

    get suspended(): boolean {
        return this._disposed || this._suspensions.size > 0;
    }

    registerMenu(menuId: string | symbol, hide: (restoreFocus: boolean) => void): IDisposable {
        this.ensureNotDisposed();
        this._menuMap.set(menuId, hide);

        return toDisposable(() => {
            this._menuMap.delete(menuId);
            if (this.activeMenuId === menuId) {
                this._activeMenuId$.next(null);
            }
        });
    }

    activateMenu(menuId: string): void {
        if (this.suspended) return;
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
        hide?.(true);
    }

    closeAll(): void {
        ++this._revision;
        this._activeMenuId$.next(null);
        Array.from(this._menuMap.values()).forEach((hide) => hide(false));
    }

    suspend(): IDisposable {
        this.ensureNotDisposed();
        const token = Symbol('menu-suspension');
        this._suspensions.add(token);
        try {
            this.closeAll();
        } catch (error) {
            this._suspensions.delete(token);
            throw error;
        }
        return toDisposable(() => this._suspensions.delete(token));
    }

    override dispose(): void {
        if (this._disposed) return;
        super.dispose();
        try {
            this.closeAll();
        } finally {
            this._menuMap.clear();
            this._suspensions.clear();
            this._activeMenuId$.complete();
        }
    }
}
