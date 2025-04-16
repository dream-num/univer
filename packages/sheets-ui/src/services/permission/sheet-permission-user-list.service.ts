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

import type { ICollaborator } from '@univerjs/protocol';
import { BehaviorSubject } from 'rxjs';

export class SheetPermissionUserManagerService {
    private _userList: ICollaborator[] = [];
    private _userList$ = new BehaviorSubject<ICollaborator[]>(this._userList);
    userList$ = this._userList$.asObservable();

    private _oldCollaboratorList: ICollaborator[] = [];

    private _selectUserList: ICollaborator[] = [];
    private _selectUserList$ = new BehaviorSubject<ICollaborator[]>(this._selectUserList);
    selectUserList$ = this._selectUserList$.asObservable();

    get userList() {
        return this._userList;
    }

    // Set all editable users of this unit
    setCanEditUserList(userList: ICollaborator[]) {
        this._userList = userList;
        this._userList$.next(userList);
    }

    reset() {
        this._userList = [];
        this._oldCollaboratorList = [];
        this._selectUserList = [];
        this._selectUserList$.next([]);
    }

    get oldCollaboratorList() {
        return this._oldCollaboratorList;
    }

    setOldCollaboratorList(userList: ICollaborator[]) {
        this._oldCollaboratorList = userList;
    }

    get selectUserList() {
        return this._selectUserList;
    }

    // The results of the user dialog selection panel should be rendered in the permission panel
    setSelectUserList(userList: ICollaborator[]) {
        this._selectUserList = userList;
        this._selectUserList$.next(userList);
    }
}
