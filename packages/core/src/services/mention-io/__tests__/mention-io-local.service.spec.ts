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

import { beforeEach, describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { MentionType } from '../../../types/enum';
import { UserManagerService } from '../../user-manager/user-manager.service';
import { MentionIOLocalService } from '../mention-io-local.service';

describe('MentionIOLocalService', () => {
    let service: MentionIOLocalService;
    let userManagerService: UserManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([UserManagerService]);
        injector.add([MentionIOLocalService]);
        service = injector.get(MentionIOLocalService);
        userManagerService = injector.get(UserManagerService);
    });

    it('returns the current collaborator as the local mention candidate', async () => {
        userManagerService.setCurrentUser({ userID: 'u-1', name: 'Ada', avatar: 'avatar.png' });

        const response = await service.list({ page: 3, size: 20, search: 'Ada' });

        expect(response.page).toBe(3);
        expect(response.size).toBe(20);
        expect(response.total).toBe(1);
        expect(response.list[0].type).toBe(MentionType.PERSON);
        expect(response.list[0].mentions[0]).toMatchObject({
            objectType: MentionType.PERSON,
            objectId: 'u-1',
            label: 'Ada',
            metadata: { icon: 'avatar.png' },
        });
    });
});
