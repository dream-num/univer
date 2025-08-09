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

import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { createIdentifier } from '../../common/di';
import { Disposable } from '../../shared';
import { createDefaultUser } from './const';

export interface IUser {
    userID: string;
    name: string;
    avatar?: string;
}

export interface IUserManagerService<T extends IUser = IUser> {
    /** User changed event */
    userChange$: Observable<{ type: 'add' | 'delete'; user: T } | { type: 'clear' }>;
    /** When the current user undergoes a switch or change */
    currentUser$: Observable<T>;

    getCurrentUser(): T | Promise<T>;
    setCurrentUser(user: T): void | Promise<void>;
    addUser(user: T): void | Promise<void>;
    getUser(userId: string, callBack?: () => void): (T | undefined) | Promise<T | undefined>;
    delete(userId: string): void | Promise<void>;
    clear(): void | Promise<void>;
    list(): T[] | Promise<T[]>;
}
export const IUserManagerService = createIdentifier<IUserManagerService>('univer.user-manager.service');

export class UserManagerService<T extends IUser = IUser> extends Disposable implements IUserManagerService {
    private _model = new Map<string, T>();
    private _userChange$ = new Subject<{ type: 'add' | 'delete'; user: T } | { type: 'clear' }>();
    public userChange$ = this._userChange$.asObservable();
    private _currentUser$ = new BehaviorSubject<T>(createDefaultUser() as unknown as T);
    /**
     * When the current user undergoes a switch or change
     * @memberof UserManagerService
     */
    public currentUser$ = this._currentUser$.asObservable();

    override dispose(): void {
        super.dispose();

        this._model.clear();
        this._userChange$.complete();
        this._currentUser$.complete();
    }

    getCurrentUser(): T {
        return this._currentUser$.getValue() as T;
    }

    setCurrentUser(user: T) {
        this.addUser(user);
        this._currentUser$.next(user);
    }

    addUser(user: T) {
        this._model.set(user.userID, user);
        this._userChange$.next({ type: 'add', user });
    }

    getUser(userId: string, callBack?: () => void) {
        const user = this._model.get(userId) as T;
        if (user) {
            return user;
        }
        callBack && callBack();
    }

    delete(userId: string) {
        const user = this.getUser(userId);
        this._model.delete(userId);
        user && this._userChange$.next({ type: 'delete', user });
    }

    clear() {
        this._model.clear();
        this._userChange$.next({ type: 'clear' });
    }

    list() {
        return Array.from(this._model.values());
    }
}
