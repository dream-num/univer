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
import { UserManagerService } from '../user-manager.service';

describe('UserManagerService', () => {
    let service: UserManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([UserManagerService]);
        service = injector.get(UserManagerService);
    });

    it('keeps the current collaborator in the user directory', () => {
        const events: string[] = [];
        service.userChange$.subscribe((event) => events.push(event.type));

        service.setCurrentUser({ userID: 'u-1', name: 'Ada' });

        expect(service.getCurrentUser().userID).toBe('u-1');
        expect(service.getUser('u-1')).toEqual({ userID: 'u-1', name: 'Ada' });
        expect(service.list()).toEqual([{ userID: 'u-1', name: 'Ada' }]);
        expect(events).toEqual(['add']);
    });

    it('emits directory changes when collaborators leave or the document closes', () => {
        const events: string[] = [];
        service.userChange$.subscribe((event) => events.push(event.type));

        service.addUser({ userID: 'u-1', name: 'Ada' });
        service.delete('u-1');
        service.clear();

        expect(service.list()).toEqual([]);
        expect(events).toEqual(['add', 'delete', 'clear']);
    });
});
