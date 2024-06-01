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

import { BehaviorSubject } from 'rxjs';
import type { ICollaborator } from '@univerjs/protocol';

export class SheetPermissionUserManagerService {
    private _userList: ICollaborator[] = [];
    private _oldCollaboratorList: ICollaborator[] = [];
    private _selectUserList: ICollaborator[] = [];
    private _allUserList: ICollaborator[] = [];

    private _selectUserList$ = new BehaviorSubject<ICollaborator[]>(this._selectUserList);

    selectUserList$ = this._selectUserList$.asObservable();

    get userList() {
        return this._userList;
    }

    get allUserList() {
        return this._allUserList;
    }

    setAllUserList(userList: ICollaborator[]) {
        this._allUserList = userList;
    }

    setUserList(userList: ICollaborator[]) {
        this._userList = userList;
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

    setSelectUserList(userList: ICollaborator[]) {
        this._selectUserList = userList;
        this._selectUserList$.next(userList);
    }
}
