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
        allowed: vi.fn(async () => [{ action: UnitAction.ManageCollaborator, allowed: true }]),
        batchAllowed: vi.fn(async (requests: Array<{ unitID: string; objectID: string; actions: UnitAction[] }>) =>
            requests.map((request) => ({ ...request, actions: request.actions.map((action) => ({ action, allowed: editorAllowed })) }))),
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
        [IPermissionService, { useClass: PermissionService }],
        [IAuthzIoService, { useValue: authz }],
        [ILogService, { useClass: DesktopLogService }],
    ]);
    injectors.push(injector);
    return { service: injector.get(ObjectPermissionService), permissions: injector.get(IPermissionService) };
}

function target(objectType: UnitObject, objectId = 'element/page/a') {
    return { unitId: 'unit', objectId, objectType };
}
function point(objectType: UnitObject) {
    return { id: `${objectType}.${UnitAction.Edit}_unit_element/page/a`, type: objectType, subType: UnitAction.Edit, value: true, status: PermissionStatus.INIT };
}

describe('ObjectPermissionService', () => {
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
