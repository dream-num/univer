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
import {
    IAuthzIoService,
    ICommandService,
    IConfigService,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    OBJECT_PERMISSION_CONFIG_KEY,
    ObjectPermissionService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { afterEach, expect, it, vi } from 'vitest';
import { FDocumentPermission } from '../../../facade/f-document-permission';
import { DocumentPermissionRuleModel } from '../../../services/permission/document-permission-rule.model';
import { SetDocumentPermissionRuleMutation } from '../../mutations/set-document-permission-rule.mutation';
import { SetDocumentPermissionRulesMutation } from '../../mutations/set-document-permission-rules.mutation';
import { SetDocumentPermissionsCommand } from '../set-document-permissions.command';

const univers: Univer[] = [];
afterEach(() => univers.splice(0).forEach((univer) => univer.dispose()));
function setup() {
    let sequence = 0;
    const policies: IListPermPointResponse['objects'] = [];
    const authz = {
        create: vi.fn(async (request: ICreateRequest) => {
            const payload = request.documentObject ?? request.slideObject ?? request.baseObject ?? request.boardObject!;
            const objectID = `permission-${++sequence}`;
            policies.push({ ...payload, objectID, objectType: request.objectType, creator: undefined, actions: [], shareOn: false, shareRole: UnitRole.Reader, shareScope: 0 });
            return objectID;
        }),
        list: async ({ objectIDs }: { objectIDs: string[] }) => policies.filter((policy) => objectIDs.includes(policy.objectID)),
        allowed: async ({ actions }: IAllowedRequest) => actions.map((action) => ({ action, allowed: true })),
        batchAllowed: async (requests: IAllowedRequest[]) => requests.map((request) => ({ ...request, actions: request.actions.map((action) => ({ action, allowed: action !== UnitAction.Edit })) })),
        update: vi.fn(async (request: IUpdatePermPointRequest) => {
            Object.assign(policies.find((policy) => policy.objectID === request.objectID)!, request);
        }),
    };
    const univer = new Univer({ override: [[IAuthzIoService, { useValue: authz }]] });
    univers.push(univer);
    const injector = univer.__getInjector();
    injector.add([DocumentPermissionRuleModel]);
    const model = injector.get(DocumentPermissionRuleModel);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'unit', body: { dataStream: '\r\n' } });
    injector.get(IUniverInstanceService).focusUnit('unit');
    const commands = injector.get(ICommandService);
    commands.registerCommand(SetDocumentPermissionRulesMutation);
    commands.registerCommand(SetDocumentPermissionsCommand);
    injector.get(ObjectPermissionService).registerRuleModel(UnitObject.Document, model, SetDocumentPermissionRuleMutation.id, SetDocumentPermissionRulesMutation.id);
    injector.get(IConfigService).setConfig(OBJECT_PERMISSION_CONFIG_KEY, [UnitObject.DocumentParagraph]);
    const permission = new FDocumentPermission('unit', commands, injector.get(IPermissionService));
    return { model, commands, permission, authz, policies, permissions: injector.get(IPermissionService), history: injector.get(IUndoRedoService) };
}

it('uses Authz IDs across batch creation, policy updates, removal, and one-step binding undo', async () => {
    const { permission, model, authz, policies, permissions, history, commands } = setup();
    const first = 'paragraph//a';
    const second = 'paragraph//b';
    const policy = { edit: 'owner' as const, collaborators: [], strategies: [] };
    expect(await permission.setObjectPermissions([{ objectId: first, policy }, { objectId: second, policy }])).toEqual({ succeeded: [first, second], failed: [] });
    const rules = model.getRules('unit');
    expect(rules).toHaveLength(2);
    expect(permissions.getPermissionPoint(`${UnitObject.DocumentParagraph}.${UnitAction.Edit}_unit_${first}`)?.value).toBe(false);
    expect(await permission.setObjectPermissions([{ objectId: first, policy: { ...policy, edit: 'all' } }, { objectId: second, policy: null }])).toEqual({ succeeded: [first, second], failed: [] });
    expect(authz.update).toHaveBeenCalledWith(expect.objectContaining({ objectID: rules[0].permissionId }));
    expect(policies[0].scope?.edit).toBe(ObjectScope.AllCollaborator);
    expect(model.getRules('unit')).toEqual([rules[0]]);
    const undo = history.pitchTopUndoElement()!;
    expect(undo.undoMutations).toHaveLength(1);
    await commands.executeCommand(undo.undoMutations[0].id, undo.undoMutations[0].params);
    expect(model.getRules('unit')).toEqual(rules);
    expect(authz.create).toHaveBeenCalledTimes(2);
});

it('validates every policy before writes and reports partial Authz failures through the facade', async () => {
    const { permission, model, authz } = setup();
    const policy = { edit: 'owner' as const, collaborators: [], strategies: [] };
    await expect(permission.setObjectPermissions([
        { objectId: 'paragraph//a', policy },
        { objectId: 'paragraph//b', policy: { ...policy, strategies: [{ action: UnitAction.Copy, role: UnitRole.Owner }] } },
    ])).rejects.toThrow('Invalid');
    expect(authz.create).not.toHaveBeenCalled();
    authz.create.mockRejectedValueOnce(new Error('Forbidden'));
    const result = await permission.setObjectPermissions([{ objectId: 'paragraph//a', policy }, { objectId: 'paragraph//b', policy }]);
    expect(result.succeeded).toEqual(['paragraph//b']);
    expect(result.failed).toEqual([{ objectId: 'paragraph//a', error: expect.any(Error) }]);
    expect(model.getRules('unit').map((rule) => rule.objectId)).toEqual(['paragraph//b']);
});
