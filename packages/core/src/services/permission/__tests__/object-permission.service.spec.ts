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

import type {
    IAllowedRequest,
    ICreateRequest,
    IListPermPointResponse,
    IUpdatePermPointRequest,
} from '@univerjs/protocol';
import type { ISetObjectPermissionRuleMutationParams } from '../object-permission-rule.model';
import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UniverInstanceType } from '../../../common/unit';
import { Univer } from '../../../univer';
import { IAuthzIoService } from '../../authz-io/type';
import { CommandType, ICommandService } from '../../command/command.service';
import { IConfigService } from '../../config/config.service';
import { IUniverInstanceService } from '../../instance/instance.service';
import { IResourceManagerService } from '../../resource-manager/type';
import { IUndoRedoService } from '../../undoredo/undoredo.service';
import { UserManagerService } from '../../user-manager/user-manager.service';
import { ObjectPermissionRuleModel } from '../object-permission-rule.model';
import { OBJECT_PERMISSION_CONFIG_KEY, ObjectPermissionService } from '../object-permission.service';
import { IPermissionService, PermissionStatus } from '../type';

const univers: Univer[] = [];
afterEach(() => univers.splice(0).forEach((univer) => univer.dispose()));
const types = [UnitObject.DocumentParagraph, UnitObject.SlideElement, UnitObject.BaseField, UnitObject.BoardElement];
const roots = [UnitObject.Document, UnitObject.Slide, UnitObject.Base, UnitObject.Board];
class TestRuleModel extends ObjectPermissionRuleModel {
    constructor(@IResourceManagerService resources: IResourceManagerService) {
        super(resources, 'UNIVER_TEST_PERMISSION_PLUGIN', UniverInstanceType.UNIVER_DOC, types);
    }
}
function createAuthz() {
    let policies: IListPermPointResponse['objects'] = [];
    let editorAllowed = true;
    let sequence = 0;
    const authz = {
        create: vi.fn(async (request: ICreateRequest) => {
            const payload = request.documentObject ?? request.slideObject ?? request.baseObject ?? request.boardObject!;
            const objectID = `permission-${++sequence}`;
            policies.push({ ...payload, objectID, objectType: request.objectType, creator: undefined, actions: [], shareOn: false, shareRole: UnitRole.Reader, shareScope: 0 });
            return objectID;
        }),
        list: vi.fn(async ({ objectIDs }: { objectIDs: string[] }) => policies.filter((policy) => objectIDs.includes(policy.objectID))),
        listCollaborators: vi.fn(async () => []),
        allowed: vi.fn(async ({ actions }: IAllowedRequest) => actions.map((action) => ({ action, allowed: true }))),
        batchAllowed: vi.fn(async (requests: IAllowedRequest[]) => requests.map((request) => ({ ...request, actions: request.actions.map((action) => ({ action, allowed: editorAllowed })) }))),
        update: vi.fn(async (request: IUpdatePermPointRequest) => {
            policies = policies.filter((policy) => policy.objectID !== request.objectID);
            policies.push({ ...request, creator: undefined, actions: [], shareOn: false, shareRole: UnitRole.Reader, shareScope: 0 });
        }),
    };
    return { authz, setAllowed: (allowed: boolean) => {
        editorAllowed = allowed;
    } };
}
function createClient(authz: ReturnType<typeof createAuthz>['authz'], enabled = true) {
    const univer = new Univer({ override: [[IAuthzIoService, { useValue: authz }]] });
    univers.push(univer);
    const injector = univer.__getInjector();
    injector.add([TestRuleModel]);
    const model = injector.get(TestRuleModel);
    const service = injector.get(ObjectPermissionService);
    const commands = injector.get(ICommandService);
    commands.registerCommand({ id: 'test.mutation.permission', type: CommandType.MUTATION, handler: (_, params: ISetObjectPermissionRuleMutationParams) => model.setRule(params.unitId, params.objectType, params.objectId, params.rule) });
    roots.forEach((root) => service.registerRuleModel(root, model, 'test.mutation.permission'));
    injector.get(IConfigService).setConfig(OBJECT_PERMISSION_CONFIG_KEY, enabled ? [...types, ...roots] : []);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'unit', body: { dataStream: '\r\n' } });
    injector.get(IUniverInstanceService).focusUnit('unit');
    return { service, model, commands, resources: injector.get(IResourceManagerService), history: injector.get(IUndoRedoService), permissions: injector.get(IPermissionService), users: injector.get(UserManagerService) };
}
function target(objectType: UnitObject, objectId = 'element/page/a') {
    return { unitId: 'unit', objectId, objectType };
}
function point(objectType: UnitObject) {
    return { id: `${objectType}.${UnitAction.Edit}_unit_element/page/a`, unitId: 'unit', objectId: 'element/page/a', type: objectType, subType: UnitAction.Edit, value: true, status: PermissionStatus.INIT };
}
const restriction = { edit: 'owner' as const, collaborators: [], strategies: [] };

describe('ObjectPermissionService', () => {
    it.each(types)('preserves local overrides without remote opt-in (%s)', async (objectType) => {
        const backend = createAuthz();
        const client = createClient(backend.authz, false);
        await client.service.setPoint(target(objectType), point(objectType), false);
        expect(client.permissions.getPermissionPoint(point(objectType).id)?.value).toBe(false);
        await client.service.setPoint(target(objectType), point(objectType), true);
        expect(client.permissions.getPermissionPoint(point(objectType).id)?.value).toBe(true);
        await expect(client.service.save(target(objectType), restriction)).rejects.toThrow('not supported');
        expect(backend.authz.create).not.toHaveBeenCalled();
        expect(backend.authz.list).not.toHaveBeenCalled();
        expect(backend.authz.update).not.toHaveBeenCalled();
    });

    it.each(types)('persists server-issued IDs in resources and resolves effective rights after reload (%s)', async (objectType) => {
        const backend = createAuthz();
        const first = createClient(backend.authz);
        backend.setAllowed(false);
        await first.service.setPoint(target(objectType), point(objectType), false);
        const rule = first.model.getRule('unit', objectType, 'element/page/a')!;
        expect(rule.permissionId).toBe('permission-1');
        expect(backend.authz.update).not.toHaveBeenCalled();
        expect(first.permissions.getPermissionPoint(point(objectType).id)?.value).toBe(false);
        const second = createClient(backend.authz);
        second.resources.loadResources('unit', first.resources.getResources('unit', UniverInstanceType.UNIVER_DOC));
        await second.service.refreshUnit('unit');
        expect(second.model.getRules('unit')).toEqual([rule]);
        expect(second.permissions.getPermissionPoint(point(objectType).id)?.value).toBe(false);
        expect(second.service.hasPolicy(target(objectType))).toBe(true);
        expect(backend.authz.list.mock.calls.every(([request]) => request.objectIDs.length > 0 && !request.objectIDs.includes('element/page/a'))).toBe(true);
        await second.service.save(target(objectType), restriction);
        expect(backend.authz.update).toHaveBeenCalledWith(expect.objectContaining({ objectID: rule.permissionId, objectType, unitID: 'unit' }));
        expect(backend.authz.create).toHaveBeenCalledTimes(1);
    });

    it('removes only the binding and reuses the Authz rule on undo and collaboration replay', async () => {
        const backend = createAuthz();
        backend.setAllowed(false);
        const client = createClient(backend.authz);
        const object = target(UnitObject.BoardElement);
        await client.service.save(object, restriction);
        await client.service.remove(object);
        expect(client.model.getRules('unit')).toEqual([]);
        expect(client.permissions.getPermissionPoint(point(object.objectType).id)?.value).toBe(true);
        const undo = client.history.pitchTopUndoElement()!;
        expect(undo.undoMutations).toHaveLength(1);
        await client.commands.executeCommand(undo.undoMutations[0].id, undo.undoMutations[0].params);
        await client.service.refreshUnit('unit');
        expect(client.service.hasPolicy(object)).toBe(true);
        expect(client.permissions.getPermissionPoint(point(object.objectType).id)?.value).toBe(false);
        const peer = createClient(backend.authz);
        await peer.commands.executeCommand(undo.undoMutations[0].id, undo.undoMutations[0].params);
        await peer.service.refreshUnit('unit');
        expect(peer.model.getRules('unit')).toEqual(client.model.getRules('unit'));
        await client.commands.executeCommand(undo.redoMutations[0].id, undo.redoMutations[0].params);
        expect(client.model.getRules('unit')).toEqual([]);
        expect(backend.authz.create).toHaveBeenCalledTimes(1);
        expect(backend.authz.update).not.toHaveBeenCalled();
    });

    it('does not publish a binding or undo entry when creation fails', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        backend.authz.create.mockRejectedValueOnce(new Error('Forbidden'));
        await expect(client.service.save(target(UnitObject.BoardElement), restriction)).rejects.toThrow('Forbidden');
        expect(client.model.getRules('unit')).toEqual([]);
        expect(client.history.pitchTopUndoElement()).toBeNull();
    });

    it('keeps owner effective access distinct from the saved policy and rejects failed updates', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        const object = target(UnitObject.BoardElement);
        await client.service.save(object, restriction);
        expect(client.permissions.getPermissionPoint(point(object.objectType).id)?.value).toBe(true);
        expect(client.service.hasPolicy(object)).toBe(true);
        backend.authz.update.mockRejectedValueOnce(new Error('Forbidden'));
        await expect(client.service.save(object, { ...restriction, edit: 'all' })).rejects.toThrow('Forbidden');
        expect(client.service.hasPolicy(object)).toBe(true);
    });

    it.each(types)('checks Create on the file, Manage and Delete on the persisted rule (%s)', async (objectType) => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        backend.authz.allowed.mockImplementation(async ({ actions }) => actions.map((action) => ({ action, allowed: action === UnitAction.CreatePermissionObject })));
        await client.service.save(target(objectType), restriction);
        expect(backend.authz.allowed).toHaveBeenCalledWith({ unitID: 'unit', objectID: 'unit', objectType: roots[types.indexOf(objectType)], actions: [UnitAction.CreatePermissionObject] });
        await expect(client.service.save(target(objectType), restriction)).rejects.toThrow('denied');
        await expect(client.service.remove(target(objectType))).rejects.toThrow('denied');
        expect(backend.authz.allowed).toHaveBeenLastCalledWith({ unitID: 'unit', objectID: 'permission-1', objectType, actions: [UnitAction.Delete] });
        expect(client.model.getRules('unit')).toHaveLength(1);
    });

    it('allows the server-declared creator while keeping Authz write enforcement', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        const object = target(UnitObject.BoardElement);
        await client.service.save(object, restriction);
        const [policy] = await backend.authz.list({ objectIDs: ['permission-1'] });
        backend.authz.list.mockResolvedValue([{ ...policy, creator: { userID: 'creator', name: 'Creator', avatar: '' } }]);
        backend.authz.allowed.mockResolvedValue([{ action: UnitAction.ManageCollaborator, allowed: false }]);
        client.users.setCurrentUser({ userID: 'creator', name: 'Creator' });
        expect(await client.service.canManage(object)).toBe(true);
        backend.authz.update.mockRejectedValueOnce(new Error('Forbidden'));
        await expect(client.service.save(object, restriction)).rejects.toThrow('Forbidden');
        client.users.setCurrentUser({ userID: 'editor', name: 'Editor' });
        expect(await client.service.canManage(object)).toBe(false);
    });

    it('preserves unrelated strategies and read scope when updating one point', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        const object = target(UnitObject.BoardElement);
        await client.service.save(object, restriction);
        await backend.authz.update({ unitID: 'unit', objectID: 'permission-1', objectType: object.objectType, name: 'Object', share: undefined, strategies: [{ action: UnitAction.Copy, role: UnitRole.Owner }], scope: { edit: ObjectScope.AllCollaborator, read: ObjectScope.SomeCollaborator }, collaborators: undefined });
        await client.service.setPoint(object, point(object.objectType), false);
        expect(backend.authz.update).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Object', strategies: expect.arrayContaining([{ action: UnitAction.Copy, role: UnitRole.Owner }]), scope: { edit: ObjectScope.OneSelf, read: ObjectScope.SomeCollaborator } }));
    });

    it('does not overwrite a concurrent binding while Authz creation is pending', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        const object = target(UnitObject.BoardElement);
        let finish!: (id: string) => void;
        backend.authz.create.mockImplementationOnce(() => new Promise((resolve) => {
            finish = resolve;
        }));
        const save = client.service.save(object, restriction);
        const rejected = expect(save).rejects.toThrow('binding changed');
        await vi.waitFor(() => expect(backend.authz.create).toHaveBeenCalledTimes(1));
        const rule = { objectId: object.objectId, objectType: object.objectType, permissionId: 'remote-rule' };
        await client.commands.executeCommand('test.mutation.permission', { ...object, rule });
        expect(client.permissions.getPermissionPoint(point(object.objectType).id)?.value).toBe(false);
        finish('local-rule');
        await rejected;
        expect(client.model.getRules('unit')).toEqual([rule]);
        expect(client.history.pitchTopUndoElement()).toBeNull();
        expect(client.commands.syncExecuteCommand('test.mutation.permission', { ...object })).toBe(false);
        expect(client.model.getRules('unit')).toEqual([rule]);
    });

    it('does not reinterpret an unresolved persisted rule as permission to create a replacement', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        const object = target(UnitObject.BoardElement);
        await client.service.save(object, restriction);
        backend.authz.list.mockResolvedValue([]);
        expect(await client.service.canManage(object)).toBe(false);
        await expect(client.service.save(object, restriction)).rejects.toThrow('denied');
        expect(backend.authz.create).toHaveBeenCalledTimes(1);
        expect(client.model.getRules('unit')[0].permissionId).toBe('permission-1');
    });

    it('preserves file membership when changing root operation permissions', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        const object = target(UnitObject.Board, 'unit');
        await client.service.save(object, restriction);
        expect(backend.authz.update).toHaveBeenCalledWith(expect.objectContaining({ objectID: 'unit', collaborators: undefined }));
        await expect(client.service.save(object, { ...restriction, edit: 'members' })).rejects.toThrow('sharing service');
        expect(client.model.getRules('unit')).toEqual([]);
        expect(backend.authz.create).not.toHaveBeenCalled();
    });

    it('discards a refresh completed after the Unit was disposed', async () => {
        const backend = createAuthz();
        const client = createClient(backend.authz);
        await client.service.save(target(UnitObject.BoardElement), restriction);
        let finish!: (policies: IListPermPointResponse['objects']) => void;
        backend.authz.list.mockImplementationOnce(() => new Promise((resolve) => {
            finish = resolve;
        }));
        const refresh = client.service.refreshUnit('unit');
        client.service.clearUnit('unit');
        finish([]);
        await refresh;
        expect(client.service.getPolicies('unit')).toEqual([]);
    });
});
