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
import { firstValueFrom, skip, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetPermissionUserManagerService } from '../sheet-permission-user-list.service';

const OWNER: ICollaborator = {
    id: 'u-owner',
    role: 2,
    subject: undefined,
};

const EDITOR: ICollaborator = {
    id: 'u-editor',
    role: 1,
    subject: undefined,
};

describe('SheetPermissionUserManagerService', () => {
    it('tracks editable users, selected users and historical collaborators', async () => {
        const service = new SheetPermissionUserManagerService();

        expect(service.userList).toEqual([]);
        expect(service.oldCollaboratorList).toEqual([]);
        expect(service.selectUserList).toEqual([]);
        expect(await firstValueFrom(service.userList$.pipe(take(1)))).toEqual([]);
        expect(await firstValueFrom(service.selectUserList$.pipe(take(1)))).toEqual([]);

        const nextEditableUsers = firstValueFrom(service.userList$.pipe(skip(1), take(1)));
        service.setCanEditUserList([OWNER, EDITOR]);
        expect(service.userList).toEqual([OWNER, EDITOR]);
        expect(await nextEditableUsers).toEqual([OWNER, EDITOR]);

        service.setOldCollaboratorList([OWNER]);
        expect(service.oldCollaboratorList).toEqual([OWNER]);

        const nextSelectedUsers = firstValueFrom(service.selectUserList$.pipe(skip(1), take(1)));
        service.setSelectUserList([EDITOR]);
        expect(service.selectUserList).toEqual([EDITOR]);
        expect(await nextSelectedUsers).toEqual([EDITOR]);
    });

    it('clears stored collaborator state on reset', async () => {
        const service = new SheetPermissionUserManagerService();
        service.setCanEditUserList([OWNER]);
        service.setOldCollaboratorList([OWNER, EDITOR]);
        service.setSelectUserList([EDITOR]);

        const resetSelectedUsers = firstValueFrom(service.selectUserList$.pipe(skip(1), take(1)));
        service.reset();

        expect(service.userList).toEqual([]);
        expect(service.oldCollaboratorList).toEqual([]);
        expect(service.selectUserList).toEqual([]);
        expect(await resetSelectedUsers).toEqual([]);
    });
});
