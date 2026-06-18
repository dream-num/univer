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

import { Univer, UserManagerService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FUserManager } from '../f-usermanager';

describe('FUserManager', () => {
    let univer: Univer;

    beforeEach(() => {
        univer = new Univer();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should return the current collaborator from the shared user manager service', () => {
        const injector = univer.__getInjector();
        const userManagerService = injector.get(UserManagerService);
        const userManagerFacade = injector.createInstance(FUserManager);
        const observedUsers: string[] = [];
        const subscription = userManagerService.currentUser$.subscribe((user) => {
            observedUsers.push(user.userID);
        });

        userManagerService.setCurrentUser({ userID: 'u-1', name: 'Ada', avatar: 'ada.png' });
        expect(userManagerFacade.getCurrentUser()).toEqual({ userID: 'u-1', name: 'Ada', avatar: 'ada.png' });

        userManagerService.setCurrentUser({ userID: 'u-2', name: 'Grace' });
        expect(userManagerFacade.getCurrentUser()).toEqual({ userID: 'u-2', name: 'Grace' });
        expect(observedUsers).toEqual(expect.arrayContaining(['u-1', 'u-2']));

        subscription.unsubscribe();
    });
});
