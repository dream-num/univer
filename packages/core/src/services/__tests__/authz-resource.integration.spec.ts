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

import type { Univer } from '../../univer';
import { UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UniverInstanceType } from '../../common/unit';
import { IAuthzIoService } from '../authz-io/type';
import { IUniverInstanceService } from '../instance/instance.service';
import { IMentionIOService } from '../mention-io/type';
import { IResourceLoaderService } from '../resource-loader/type';
import { UserManagerService } from '../user-manager/user-manager.service';
import { createTestBed } from './create-test-bed';

describe('Authz/resource integration', () => {
    let univer: Univer;
    let unitId: string;

    beforeEach(() => {
        const instance = createTestBed();
        univer = instance.univer;
        unitId = instance.unitId;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should persist and reload permission resources through a real workbook lifecycle', async () => {
        const injector = univer.__getInjector();
        const authzIoService = injector.get(IAuthzIoService);
        const resourceLoaderService = injector.get(IResourceLoaderService);
        const userManagerService = injector.get(UserManagerService);

        userManagerService.setCurrentUser({
            userID: 'Owner_real-user',
            name: 'Owner User',
            avatar: '',
        });

        const objectID = await authzIoService.create({
            objectType: UnitObject.SelectRange,
            selectRangeObject: {
                unitID: unitId,
                name: 'Protected range',
                collaborators: [],
                scope: undefined,
            },
        });

        expect(await authzIoService.allowed({ unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] })).toEqual([
            { action: UnitAction.Edit, allowed: true },
        ]);

        await authzIoService.update({
            objectType: UnitObject.SelectRange,
            objectID,
            unitID: unitId,
            share: undefined,
            name: 'Protected range',
            strategies: [{ action: UnitAction.Edit, role: UnitRole.Reader }],
            scope: undefined,
            collaborators: undefined,
        });

        expect(await authzIoService.allowed({ unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] })).toEqual([
            { action: UnitAction.Edit, allowed: false },
        ]);

        const listed = await authzIoService.list({
            unitID: unitId,
            objectIDs: [objectID],
            actions: [UnitAction.Edit, UnitAction.View],
        });

        expect(listed).toHaveLength(1);
        expect(listed[0].name).toBe('Protected range');
        expect(listed[0].actions).toContainEqual({ action: UnitAction.Edit, allowed: false });

        const batched = await authzIoService.batchAllowed([
            { unitID: unitId, objectID, objectType: UnitObject.SelectRange, actions: [UnitAction.Edit] },
            { unitID: unitId, objectID: 'missing', objectType: UnitObject.SelectRange, actions: [UnitAction.View] },
        ]);

        expect(batched[0].actions).toEqual([{ action: UnitAction.Edit, allowed: false }]);
        expect(batched[1].actions).toEqual([{ action: UnitAction.View, allowed: true }]);

        expect(await authzIoService.listCollaborators({ unitID: unitId, objectID })).toEqual([]);
        expect(await authzIoService.listRoles({ objectType: UnitObject.SelectRange })).toEqual({ roles: [], actions: [] });
        await expect(authzIoService.createCollaborator({ unitID: unitId, objectID } as never)).resolves.toBeUndefined();
        await expect(authzIoService.updateCollaborator({ unitID: unitId, objectID } as never)).resolves.toBeUndefined();
        await expect(authzIoService.deleteCollaborator({ unitID: unitId, objectID } as never)).resolves.toBeUndefined();
        await expect(authzIoService.putCollaborators({ unitID: unitId, objectID, collaborators: [] })).resolves.toBeUndefined();

        const snapshot = resourceLoaderService.saveUnit(unitId);
        const authzResource = snapshot?.resources.find((resource) => resource.name === 'SHEET_AuthzIoMockService_PLUGIN');

        expect(authzResource?.data).toContain(objectID);

        injector.get(IUniverInstanceService).disposeUnit(unitId);

        const unloaded = await authzIoService.list({
            unitID: unitId,
            objectIDs: [objectID],
            actions: [UnitAction.Edit],
        });

        expect(unloaded[0].name).toBe('');
        expect(unloaded[0].actions).toEqual([{ action: UnitAction.Edit, allowed: false }]);

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, snapshot!);

        const reloaded = await authzIoService.list({
            unitID: unitId,
            objectIDs: [objectID],
            actions: [UnitAction.Edit],
        });

        expect(reloaded[0].name).toBe('Protected range');
        expect(reloaded[0].actions).toEqual([{ action: UnitAction.Edit, allowed: false }]);
    });

    it('should expose current user data consistently through mention and user services', async () => {
        const injector = univer.__getInjector();
        const userManagerService = injector.get(UserManagerService);
        const mentionIOService = injector.get(IMentionIOService);
        const userEvents: string[] = [];

        userManagerService.userChange$.subscribe((event) => {
            userEvents.push(event.type);
        });

        userManagerService.setCurrentUser({
            userID: 'Owner_alice',
            name: 'Alice',
            avatar: 'alice.png',
        });
        userManagerService.addUser({ userID: 'Editor_bob', name: 'Bob' });

        expect(userManagerService.getCurrentUser().name).toBe('Alice');
        expect(userManagerService.getUser('Editor_bob')?.name).toBe('Bob');
        expect(userManagerService.list()).toHaveLength(2);

        const mentionResult = await mentionIOService.list({ page: 2, size: 5 });
        expect(mentionResult.page).toBe(2);
        expect(mentionResult.size).toBe(5);
        expect(mentionResult.list[0].mentions[0]).toMatchObject({
            objectId: 'Owner_alice',
            label: 'Alice',
            metadata: {
                icon: 'alice.png',
            },
        });

        let callbackCalled = false;
        expect(userManagerService.getUser('missing-user', () => {
            callbackCalled = true;
        })).toBeUndefined();
        expect(callbackCalled).toBe(true);

        userManagerService.delete('Editor_bob');
        userManagerService.clear();

        expect(userManagerService.list()).toEqual([]);
        expect(userEvents).toEqual(['add', 'add', 'delete', 'clear']);
    });
});
