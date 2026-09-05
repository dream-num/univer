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

import { IAuthzIoService, ICommandService, IPermissionService, Univer } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SetDocumentPermissionCommand } from '../set-document-permission.command';

const univers: Univer[] = [];
afterEach(() => univers.splice(0).forEach((univer) => univer.dispose()));

describe('SetDocumentPermissionCommand', () => {
    it('awaits the Authz write and propagates failure without changing effective permissions', async () => {
        const update = vi.fn(async () => {
            throw new Error('Authz rejected');
        });
        const univer = new Univer({ override: [[IAuthzIoService, { useValue: {
            supportsObjectPermissionManagement: () => true,
            listUnitPermissions: async () => [],
            list: async () => [],
            listCollaborators: async () => [],
            allowed: async () => [{ action: UnitAction.ManageCollaborator, allowed: true }],
            update,
        } }]] });
        univers.push(univer);
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        commands.registerCommand(SetDocumentPermissionCommand);
        await expect(commands.executeCommand(SetDocumentPermissionCommand.id, { unitId: 'unit', objectId: 'paragraph//a', action: UnitAction.Edit, value: false })).rejects.toThrow('Authz rejected');
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ unitID: 'unit', objectID: 'paragraph//a', objectType: UnitObject.DocumentParagraph }));
        expect(injector.get(IPermissionService).getPermissionPoint(`${UnitObject.DocumentParagraph}.${UnitAction.Edit}_unit_paragraph//a`)).toBeUndefined();
    });

    it('rejects unsupported child actions in policy payloads before calling Authz', async () => {
        const update = vi.fn();
        const univer = new Univer({ override: [[IAuthzIoService, { useValue: { update } }]] });
        univers.push(univer);
        const commands = univer.__getInjector().get(ICommandService);
        commands.registerCommand(SetDocumentPermissionCommand);
        const result = await commands.executeCommand(SetDocumentPermissionCommand.id, { unitId: 'unit', objectId: 'paragraph//a', action: UnitAction.Edit, value: false, policy: { edit: 'owner', collaborators: [], strategies: [{ action: UnitAction.Print, role: 2 }] } });
        expect(result).toBe(false);
        expect(update).not.toHaveBeenCalled();
    });
});
