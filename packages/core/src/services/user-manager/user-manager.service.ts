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

import { BehaviorSubject, Subject } from 'rxjs';
import { createDefaultUser } from './const';

export interface IUser {
    userID: string;
    name: string;
    avatar?: string;
};

export class UserManagerService {
    private _model = new Map<string, IUser>();
    private _userChange$ = new Subject<{ type: 'add' | 'delete'; user: IUser } | { type: 'clear' }>();
    public userChange$ = this._userChange$.asObservable();
    private _currentUser$ = new BehaviorSubject<IUser>(createDefaultUser());
    /**
     * When the current user undergoes a switch or change
     * @memberof UserManagerService
     */
    public currentUser$ = this._currentUser$.asObservable();

    getCurrentUser<T extends IUser>() {
        return this._currentUser$.getValue() as T;
    }

    setCurrentUser<T extends IUser>(user: T) {
        this.addUser(user);
        this._currentUser$.next(user);
    }

    addUser<T extends IUser>(user: T) {
        this._model.set(user.userID, user);
        this._userChange$.next({ type: 'add', user });
    }

    getUser<T extends IUser>(userId: string, callBack?: () => void) {
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
