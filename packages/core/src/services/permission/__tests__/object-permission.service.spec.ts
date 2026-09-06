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

import type { IListPermPointResponse, IUpdatePermPointRequest } from '@univerjs/protocol';
import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Injector } from '../../../common/di';
import { IAuthzIoService } from '../../authz-io/type';
import { DesktopLogService, ILogService } from '../../log/log.service';
import { UserManagerService } from '../../user-manager/user-manager.service';
import { ObjectPermissionService } from '../object-permission.service';
import { PermissionService } from '../permission.service';
import { IPermissionService, PermissionStatus } from '../type';

const injectors: Injector[] = [];
afterEach(() => injectors.splice(0).forEach((injector) => injector.dispose()));

function createAuthz() {
    let policies: IListPermPointResponse['objects'] = [];
    let editorAllowed = true;
    const authz = {
        supportsObjectPermissionManagement: () => true,
        listUnitPermissions: vi.fn(async () => policies),
        list: vi.fn(async () => policies),
        listCollaborators: vi.fn(async () => []),
        allowed: vi.fn(async ({ actions }: { actions: UnitAction[] }) => actions.map((action) => ({ action, allowed: true }))),
        batchAllowed: vi.fn(async (requests: Array<{ unitID: string; objectID: string; actions: UnitAction[] }>) =>
            requests.map((request) => ({ ...request, actions: request.actions.map((action) => ({ action, allowed: editorAllowed })) }))),
        deleteObjectPermission: vi.fn(async () => { policies = []; }),
        update: vi.fn(async (request: IUpdatePermPointRequest) => {
            policies = [{ ...request, creator: undefined, actions: [], shareOn: false, shareRole: UnitRole.Reader, shareScope: 0 }];
        }),
    };
    return { authz, setAllowed: (allowed: boolean) => {
        editorAllowed = allowed;
    }, clear: () => {
        policies = [];
    } };
}

function createClient(authz: ReturnType<typeof createAuthz>['authz']) {
    const injector = new Injector([
        [ObjectPermissionService],
        [UserManagerService],
        [IPermissionService, { useClass: PermissionService }],
        [IAuthzIoService, { useValue: authz }],
        [ILogService, { useClass: DesktopLogService }],
    ]);
    injectors.push(injector);
    return { service: injector.get(ObjectPermissionService), permissions: injector.get(IPermissionService), users: injector.get(UserManagerService) };
}

function target(objectType: UnitObject, objectId = 'element/page/a') {
    return { unitId: 'unit', objectId, objectType };
}
function point(objectType: UnitObject) {
    return { id: `${objectType}.${UnitAction.Edit}_unit_element/page/a`, type: objectType, subType: UnitAction.Edit, value: true, status: PermissionStatus.INIT };
}

describe('ObjectPermissionService', () => {
    it.each([UnitObject.DocumentParagraph, UnitObject.SlideElement, UnitObject.BaseField, UnitObject.BoardElement])('preserves local overrides without remote opt-in (%s)', async (objectType) => {
        const backend = createAuthz();
        backend.authz.supportsObjectPermissionManagement = () => false;
        const client = createClient(backend.authz);
        const permissionPoint = point(objectType);

        await client.service.setPoint(target(objectType), permissionPoint, false);
        expect(client.permissions.getPermissionPoint(permissionPoint.id)?.value).toBe(false);
        await client.service.setPoint(target(objectType), permissionPoint, true);
        expect(client.permissions.getPermissionPoint(permissionPoint.id)?.value).toBe(true);
        expect(client.service.supports(target(objectType))).toBe(false);
        await expect(client.service.save(target(objectType), { edit: 'owner', collaborators: [], strategies: [] })).rejects.toThrow('not supported');
        expect(backend.authz.list).not.toHaveBeenCalled();
        expect(backend.authz.allowed).not.toHaveBeenCalled();
        expect(backend.authz.update).not.toHaveBeenCalled();
        expect(backend.authz.listUnitPermissions).not.toHaveBeenCalled();
        expect(backend.authz.batchAllowed).not.toHaveBeenCalled();
    });

    it.each([UnitObject.DocumentParagraph, UnitObject.SlideElement, UnitObject.BaseField, UnitObject.BoardElement])('persists stable objects and reloads effective rights in another client (%s)', async (objectType) => {
        const backend = createAuthz();
        const first = createClient(backend.authz);
        const second = createClient(backend.authz);
        backend.setAllowed(false);
        await first.service.setPoint(target(objectType), point(objectType), false);
        expect(backend.authz.update).toHaveBeenCalledWith(expect.objectContaining({ objectID: 'element/page/a', objectType, unitID: 'unit' }));
        await second.service.refreshUnit('unit');
        expect(second.permissions.getPermissionPoint(point(objectType).id)?.value).toBe(false);
        expect(second.service.hasPolicy(target(objectType))).toBe(true);
        backend.clear();
        backend.setAllowed(true);
        await second.service.refreshUnit('unit');
        expect(second.permissions.getPermissionPoint(point(objectType).id)?.value).toBe(true);
        expect(second.service.hasPolicy(target(objectType))).toBe(false);
    });

    it('preserves file membership when changing file operation permissions', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        await client.service.save(target(UnitObject.Board, 'unit'), { edit: 'owner', strategies: [], collaborators: [] });
        expect(backend.authz.update).toHaveBeenCalledWith(expect.objectContaining({ objectID: 'unit', collaborators: undefined }));
        await expect(client.service.save(target(UnitObject.Board, 'unit'), { edit: 'members', strategies: [], collaborators: [] })).rejects.toThrow('sharing service');
        expect(backend.authz.update).toHaveBeenCalledTimes(1);
    });

    it('keeps the owner effective permission separate from the saved restriction', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        await client.service.setPoint(target(UnitObject.BoardElement), point(UnitObject.BoardElement), false);
        expect(client.permissions.getPermissionPoint(point(UnitObject.BoardElement).id)?.value).toBe(true);
        expect(client.service.hasPolicy(target(UnitObject.BoardElement))).toBe(true);
    });

    it('does not change the cache or create a policy when the server rejects a write', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        client.permissions.addPermissionPoint(point(UnitObject.BoardElement));
        backend.authz.update.mockRejectedValueOnce(new Error('Forbidden'));
        await expect(client.service.setPoint(target(UnitObject.BoardElement), point(UnitObject.BoardElement), false)).rejects.toThrow('Forbidden');
        expect(client.permissions.getPermissionPoint(point(UnitObject.BoardElement).id)?.value).toBe(true);
        expect(client.service.hasPolicy(target(UnitObject.BoardElement))).toBe(false);
    });

    it('checks management permission before writing', async () => {
        const backend = createAuthz();
        backend.authz.allowed.mockResolvedValueOnce([{ action: UnitAction.ManageCollaborator, allowed: false }]);
        const client = createClient(backend.authz);
        await expect(client.service.setPoint(target(UnitObject.BoardElement), point(UnitObject.BoardElement), false)).rejects.toThrow('denied');
        expect(backend.authz.update).not.toHaveBeenCalled();
    });

    it('allows the server-declared rule creator like Sheet, while leaving write authorization to Authz', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        client.users.setCurrentUser({ userID: 'creator', name: 'Creator' });
        await client.service.setPoint(target(UnitObject.BoardElement), point(UnitObject.BoardElement), false);
        const policy = (await backend.authz.list())[0];
        backend.authz.list.mockResolvedValue([{ ...policy, creator: { userID: 'creator', name: 'Creator', avatar: '' } }]);
        backend.authz.allowed.mockResolvedValue([{ action: UnitAction.ManageCollaborator, allowed: false }]);
        expect(await client.service.canManage(target(UnitObject.BoardElement))).toBe(true);
        backend.authz.update.mockRejectedValueOnce(new Error('Forbidden'));
        await expect(client.service.save(target(UnitObject.BoardElement), { edit: 'all', strategies: [], collaborators: [] })).rejects.toThrow('Forbidden');
        client.users.setCurrentUser({ userID: 'editor', name: 'Editor' });
        expect(await client.service.canManage(target(UnitObject.BoardElement))).toBe(false);
        await expect(client.service.save(target(UnitObject.BoardElement), { edit: 'all', strategies: [], collaborators: [] })).rejects.toThrow('denied');
        expect(backend.authz.update).toHaveBeenCalledTimes(2);
    });

    it('does not use a creator from another object or trust a previous management check', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        client.users.setCurrentUser({ userID: 'creator', name: 'Creator' });
        await client.service.setPoint(target(UnitObject.BoardElement), point(UnitObject.BoardElement), false);
        const policy = (await backend.authz.list())[0];
        backend.authz.list.mockResolvedValue([{ ...policy, objectID: 'another-object', creator: { userID: 'creator', name: 'Creator', avatar: '' } }]);
        expect(await client.service.canManage(target(UnitObject.BoardElement))).toBe(true);
        backend.authz.allowed.mockResolvedValue([{ action: UnitAction.ManageCollaborator, allowed: false }]);
        await expect(client.service.save(target(UnitObject.BoardElement), { edit: 'all', strategies: [], collaborators: [] })).rejects.toThrow('denied');
        expect(backend.authz.update).toHaveBeenCalledTimes(1);
    });

    it.each([
        [UnitObject.DocumentParagraph, UnitObject.Document],
        [UnitObject.SlidePage, UnitObject.Slide],
        [UnitObject.BaseRecord, UnitObject.Base],
        [UnitObject.BoardElement, UnitObject.Board],
    ])('separates creation on the root Unit from management on the existing rule (%s)', async (objectType, rootType) => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        backend.authz.allowed.mockImplementation(async ({ actions }) => actions.map((action) => ({ action, allowed: action === UnitAction.CreatePermissionObject })));
        await client.service.save(target(objectType), { edit: 'owner', strategies: [], collaborators: [] });
        expect(backend.authz.allowed).toHaveBeenCalledWith({ unitID: 'unit', objectID: 'unit', objectType: rootType, actions: [UnitAction.CreatePermissionObject] });
        await expect(client.service.save(target(objectType), { edit: 'all', strategies: [], collaborators: [] })).rejects.toThrow('denied');
        expect(backend.authz.update).toHaveBeenCalledTimes(1);
        client.permissions.addPermissionPoint({ ...point(rootType), id: `${rootType}.${UnitAction.Edit}_unit`, value: false });
        expect(client.service.canView(target(objectType))).toBe(false);
        client.permissions.updatePermissionPoint(`${rootType}.${UnitAction.Edit}_unit`, true);
        expect(client.service.canView(target(objectType))).toBe(true);
    });

    it('requires Delete separately, preserves policies after failure, and reloads inherited rights after removal', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        backend.setAllowed(false);
        await client.service.setPoint(target(UnitObject.BoardElement), point(UnitObject.BoardElement), false);
        backend.authz.allowed.mockImplementation(async ({ actions }) => actions.map((action) => ({ action, allowed: action === UnitAction.ManageCollaborator })));
        await expect(client.service.remove(target(UnitObject.BoardElement))).rejects.toThrow('denied');
        expect(backend.authz.deleteObjectPermission).not.toHaveBeenCalled();
        backend.authz.allowed.mockImplementation(async ({ actions }) => actions.map((action) => ({ action, allowed: action === UnitAction.Delete })));
        backend.authz.deleteObjectPermission.mockRejectedValueOnce(new Error('Forbidden'));
        await expect(client.service.remove(target(UnitObject.BoardElement))).rejects.toThrow('Forbidden');
        expect(client.service.hasPolicy(target(UnitObject.BoardElement))).toBe(true);
        backend.setAllowed(true);
        await client.service.remove(target(UnitObject.BoardElement));
        expect(client.service.hasPolicy(target(UnitObject.BoardElement))).toBe(false);
        expect(client.permissions.getPermissionPoint(point(UnitObject.BoardElement).id)?.value).toBe(true);
        await expect(client.service.remove(target(UnitObject.Board, 'unit'))).rejects.toThrow('denied');
        expect(backend.authz.deleteObjectPermission).toHaveBeenCalledTimes(2);
    });

    it('preserves unrelated strategies and read scope when updating one point', async () => {
        const backend = createAuthz();
        await backend.authz.update({ unitID: 'unit', objectID: 'element/page/a', objectType: UnitObject.BoardElement, name: 'Object', share: undefined, strategies: [{ action: UnitAction.Copy, role: UnitRole.Owner }], scope: { edit: ObjectScope.AllCollaborator, read: ObjectScope.SomeCollaborator }, collaborators: undefined });
        const client = createClient(backend.authz);
        await client.service.setPoint(target(UnitObject.BoardElement), point(UnitObject.BoardElement), false);
        expect(backend.authz.update).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Object', strategies: expect.arrayContaining([{ action: UnitAction.Copy, role: UnitRole.Owner }]), scope: { edit: ObjectScope.OneSelf, read: ObjectScope.SomeCollaborator } }));
    });

    it('discards a refresh completed after the Unit was disposed', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        let finish!: (policies: IListPermPointResponse['objects']) => void;
        backend.authz.listUnitPermissions.mockImplementationOnce(() => new Promise((resolve) => {
            finish = resolve;
        }));
        const refresh = client.service.refreshUnit('unit');
        client.service.clearUnit('unit');
        finish([]);
        await refresh;
        expect(client.service.getPolicies('unit')).toEqual([]);
    });
});
