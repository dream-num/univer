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

import type { IUser } from '@univerjs/protocol';
import { BehaviorSubject, Subject } from 'rxjs';


export class UserManagerService {
    private _model = new Map<string, IUser>();
    private _userChange$ = new Subject<{ type: 'add' | 'delete'; user: IUser } | { type: 'clear' }>();
    public userChange$ = this._userChange$.asObservable();

    private _currentUser: IUser | null;
    private _currentUser$ = new BehaviorSubject<IUser | null>(null);
    public currentUser$ = this._currentUser$.asObservable();

    getCurrentUser() {
        return this._currentUser;
    }

    setCurrentUser(user: IUser) {
        this._currentUser = user;
        this.addUser(user);
        this._currentUser$.next(user);
    }

    addUser(user: IUser) {
        this._model.set(user.userID, user);
        this._userChange$.next({ type: 'add', user });
    }

    getUser(userId: string, callBack?: () => void) {
        const user = this._model.get(userId);
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
}
