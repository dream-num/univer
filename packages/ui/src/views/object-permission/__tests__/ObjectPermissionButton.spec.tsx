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

import type { IObjectPermissionPolicy } from '@univerjs/core';
import type {
    IAllowedRequest,
    ICollaborator,
    ICreateRequest,
    IListPermPointResponse,
} from '@univerjs/protocol';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
    CommandType,
    IAuthzIoService,
    ICommandService,
    IConfigService,
    IPermissionService,
    IResourceManagerService,
    LocaleType,
    OBJECT_PERMISSION_CONFIG_KEY,
    ObjectPermissionRuleModel,
    ObjectPermissionService,
    PermissionStatus,
    Univer,
    UniverInstanceType,
    UserManagerService,
} from '@univerjs/core';
import { UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager } from '../../../common/component-manager';
import { IconManager } from '../../../common/icon-manager';
import enUS from '../../../locale/en-US';
import { DesktopDialogService } from '../../../services/dialog/desktop-dialog.service';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { IUIPartsService, UIPartsService } from '../../../services/parts/parts.service';
import { RediProvider } from '../../../utils/di';
import { DialogPart } from '../../components/dialog-part/DialogPart';
import {
    OBJECT_PERMISSION_DIALOG,
    ObjectPermissionButton,
    ObjectPermissionDialog,
    openObjectPermissionDialog,
} from '../ObjectPermissionButton';

class TestRuleModel extends ObjectPermissionRuleModel {
    constructor(@IResourceManagerService resources: IResourceManagerService) {
        super(resources, 'DOC_TEST_PERMISSION_PLUGIN', UniverInstanceType.UNIVER_DOC, [UnitObject.DocumentEntity, UnitObject.DocumentSection]);
    }
}

const univers: Univer[] = [];
afterEach(() => {
    cleanup();
    univers.splice(0).forEach((univer) => univer.dispose());
});

function setup(options: { capable?: boolean; manage?: boolean; delete?: boolean; collaborators?: ICollaborator[]; inherit?: boolean; currentUser?: string } = {}) {
    let policies: IListPermPointResponse['objects'] = [];
    let members: ICollaborator[] = [];
    const create = vi.fn(async (request: ICreateRequest) => {
        const payload = request.documentObject!;
        members = payload.collaborators;
        policies = [{ ...payload, objectID: 'permission-1', objectType: request.objectType, shareOn: false, shareRole: UnitRole.Reader, shareScope: 0, creator: undefined, actions: [] }];
        return 'permission-1';
    });
    const listCollaborators = vi.fn(async ({ objectID }: { objectID: string }) => objectID === 'doc'
        ? options.collaborators ?? [{ id: 'editor', role: UnitRole.Editor, subject: { userID: 'editor', name: 'Editor', avatar: '' } }]
        : members);
    const authz = {
        getCfgEnableObjInherit: () => options.inherit ?? false,
        list: async () => policies,
        listCollaborators,
        allowed: async ({ actions }: IAllowedRequest) => actions.map((action) => ({ action, allowed: action === UnitAction.Delete ? options.delete === true : options.manage !== false })),
        batchAllowed: async (requests: IAllowedRequest[]) => requests.map(({ unitID, objectID, actions }) => ({ unitID, objectID, actions: actions.map((action) => ({ action, allowed: true })) })),
        create,
    };
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS }, override: [[IAuthzIoService, { useValue: authz }]] });
    univers.push(univer);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'doc', title: 'Document', body: { dataStream: '\r\n' } });
    const injector = univer.__getInjector();
    injector.add([TestRuleModel]);
    const rules = injector.get(TestRuleModel);
    injector.get(IConfigService).setConfig(OBJECT_PERMISSION_CONFIG_KEY, options.capable === false ? [] : [UnitObject.Document, UnitObject.DocumentEntity]);
    injector.get(ObjectPermissionService).registerRuleModel(UnitObject.Document, rules, 'test.mutation.permission');
    if (options.currentUser) {
        injector.get(UserManagerService).setCurrentUser({ userID: options.currentUser, name: options.currentUser });
    }
    injector.get(IPermissionService).addPermissionPoint({ id: `${UnitObject.Document}.${UnitAction.Edit}_doc`, type: UnitObject.Document, subType: UnitAction.Edit, value: true, status: PermissionStatus.DONE });
    const service = injector.get(ObjectPermissionService);
    injector.get(ICommandService).registerCommand({ id: 'test.mutation.permission', type: CommandType.MUTATION, handler: (_, params: { unitId: string; objectId: string; objectType: UnitObject; rule: { objectId: string; objectType: UnitObject; permissionId: string } | null }) => rules.setRule(params.unitId, params.objectType, params.objectId, params.rule) });
    injector.get(ICommandService).registerCommand({
        id: 'test.command.set-permission',
        type: CommandType.COMMAND,
        handler: async (_, params: { policy: IObjectPermissionPolicy; remove?: boolean } | undefined) => {
            if (!params) {
                return false;
            }
            const target = { unitId: 'doc', objectId: 'entity//drawing/image', objectType: UnitObject.DocumentEntity };
            if (params.remove) {
                await service.remove(target);
            } else {
                await service.save(target, params.policy);
            }
            return true;
        },
    });
    const target = { unitId: 'doc', objectId: 'entity//drawing/image', objectType: UnitObject.DocumentEntity };
    const view = render(<RediProvider value={{ injector }}><ObjectPermissionButton target={target} name="Image" commandId="test.command.set-permission" /></RediProvider>);
    return { rules, create, listCollaborators, service, target, injector, view };
}

describe('ObjectPermissionButton', () => {
    it('hides the action for a provider without object management', () => {
        setup({ capable: false });
        expect(screen.queryByRole('button', { name: 'Permissions' })).toBeNull();
    });

    it('shows a read-only dialog when the user cannot manage the object', async () => {
        setup({ manage: false });
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        await screen.findByText('You cannot manage permissions for this object.');
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
    });

    it('rechecks an open dialog when the current user changes', async () => {
        const options = { manage: true, currentUser: 'manager' };
        const { injector, create } = setup(options);
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByText('Object owner only'));
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(false);
        options.manage = false;
        act(() => injector.get(UserManagerService).setCurrentUser({ userID: 'editor', name: 'Editor' }));
        await screen.findByText('You cannot manage permissions for this object.');
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
        expect(screen.getByRole('radio', { name: 'Object owner only' }).hasAttribute('disabled')).toBe(true);
        expect(create).not.toHaveBeenCalled();
    });

    it('disables the permission entry when file editing is revoked', () => {
        const { injector } = setup();
        act(() => injector.get(IPermissionService).updatePermissionPoint(`${UnitObject.Document}.${UnitAction.Edit}_doc`, false));
        expect(screen.getByRole('button', { name: 'Permissions' }).hasAttribute('disabled')).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('removes an existing rule through the product command and restores inheritance', async () => {
        const { service, target, rules } = setup({ delete: true });
        await act(() => service.save(target, { edit: 'owner', strategies: [], collaborators: [] }));
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Remove protection' }));
        await waitFor(() => expect(rules.getRules('doc')).toEqual([]));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(service.hasPolicy(target)).toBe(false);
    });

    it('saves a restriction through a Command and shows primary even when the owner can still edit', async () => {
        const { create, service, target } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByText('Object owner only'));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(service.hasPolicy(target)).toBe(true);
        expect(screen.getByRole('button', { name: 'Permissions' }).className).toContain('text-primary');
    });

    it('searches people inline, preserves hidden selections, and persists with one Save', async () => {
        const { create } = setup({ collaborators: [
            { id: 'alice', role: UnitRole.Editor, subject: { userID: 'alice', name: 'Alice', avatar: '' } },
            { id: 'bob', role: UnitRole.Editor, subject: { userID: 'bob', name: 'Bob', avatar: '' } },
            { id: 'reader', role: UnitRole.Reader, subject: { userID: 'reader', name: 'Reader', avatar: '' } },
        ] });
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByText('Selected members'));
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
        await screen.findByRole('checkbox', { name: /^Alice / });
        expect(screen.getAllByRole('dialog')).toHaveLength(1);
        expect(screen.queryByText('Reader')).toBeNull();
        const search = screen.getByRole('textbox', { name: 'Search people' });
        fireEvent.change(search, { target: { value: '  ALICE  ' } });
        expect(screen.queryByText('Bob')).toBeNull();
        fireEvent.click(screen.getByRole('checkbox', { name: /^Alice / }));
        fireEvent.change(search, { target: { value: 'missing' } });
        expect(screen.getByText('No matching people')).toBeTruthy();
        expect(screen.getByText('Selected: 1')).toBeTruthy();
        fireEvent.change(search, { target: { value: 'bob' } });
        fireEvent.click(screen.getByRole('checkbox', { name: /^Bob / }));
        expect(create).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
        expect(create.mock.calls[0][0].documentObject?.collaborators.map((user) => user.id)).toEqual(['alice', 'bob']);
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        await waitFor(() => expect((screen.getByRole('checkbox', { name: /^Alice / }) as HTMLInputElement).checked).toBe(true));
        expect((screen.getByRole('checkbox', { name: /^Bob / }) as HTMLInputElement).checked).toBe(true);
    });

    it('discards unsaved choices on Cancel and supports deselecting a person inline', async () => {
        const { create } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByText('Selected members'));
        fireEvent.click(await screen.findByRole('checkbox', { name: /^Editor / }));
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(create).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByText('Selected members'));
        const editor = await screen.findByRole('checkbox', { name: /^Editor / });
        expect((editor as HTMLInputElement).checked).toBe(false);
        fireEvent.click(editor);
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(false);
        fireEvent.click(editor);
        expect(screen.getByText('Selected: 0')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
    });

    it('loads candidates only for selected-member policies and supports retrying inline', async () => {
        const { listCollaborators, create } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        await screen.findByText('Selected members');
        expect(listCollaborators.mock.calls.map(([request]) => request.objectID)).toEqual([]);
        listCollaborators.mockRejectedValueOnce(new Error('Offline'));
        fireEvent.click(screen.getByText('Selected members'));
        expect(await screen.findByRole('alert')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
        expect(await screen.findByRole('checkbox', { name: /^Editor / })).toBeTruthy();
        fireEvent.change(screen.getByRole('textbox', { name: 'Search people' }), { target: { value: 'edi' } });
        expect(listCollaborators.mock.calls.map(([request]) => request.objectID)).toEqual(['doc', 'doc']);
        expect(create).not.toHaveBeenCalled();
    });

    it('separates names from file roles and respects inherited owner access', async () => {
        setup({ currentUser: 'me', inherit: true, collaborators: [
            { id: 'me', role: UnitRole.Editor, subject: { userID: 'me', name: 'Me', avatar: '' } },
            { id: 'owner', role: UnitRole.Owner, subject: { userID: 'owner', name: 'Alice', avatar: '' } },
            { id: 'editor', role: UnitRole.Editor, subject: { userID: 'editor', name: 'Bob', avatar: '' } },
        ] });
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByText('Selected members'));
        const owner = await screen.findByRole('checkbox', { name: /^Alice / });
        expect(owner.hasAttribute('disabled')).toBe(true);
        expect(screen.getByText('File owner, inherited access')).toBeTruthy();
        expect(screen.getByText('File editor')).toBeTruthy();
        expect(screen.queryByText('Me')).toBeNull();
    });

    it('preserves members omitted by the candidate service and matches candidates by user ID', async () => {
        const { service, target } = setup({ collaborators: [
            { id: 'file-alice', role: UnitRole.Owner, subject: { userID: 'alice', name: 'Alice', avatar: '' } },
        ] });
        await act(() => service.save(target, {
            edit: 'members',
            strategies: [],
            collaborators: [
                { id: 'object-alice', role: UnitRole.Editor, subject: { userID: 'alice', name: 'Alice', avatar: '' } },
                { id: 'bob', role: UnitRole.Editor, subject: { userID: 'bob', name: 'Bob', avatar: '' } },
            ],
        }));
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        await screen.findByText('File owner');
        expect(screen.getAllByRole('checkbox', { name: /^Alice / })).toHaveLength(1);
        expect((screen.getByRole('checkbox', { name: /^Alice / }) as HTMLInputElement).checked).toBe(true);
        expect((screen.getByRole('checkbox', { name: /^Bob / }) as HTMLInputElement).checked).toBe(true);
        fireEvent.click(screen.getByRole('checkbox', { name: /^Alice / }));
        expect(screen.getByText('Selected: 1')).toBeTruthy();
    });

    it('keeps selected people when saving fails and supports retrying Save', async () => {
        const { create } = setup();
        create.mockRejectedValueOnce(new Error('Offline'));
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByText('Selected members'));
        fireEvent.click(await screen.findByRole('checkbox', { name: /^Editor / }));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await screen.findByRole('alert');
        expect((screen.getByRole('checkbox', { name: /^Editor / }) as HTMLInputElement).checked).toBe(true);
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(false);
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(create.mock.calls[1][0].documentObject?.collaborators.map((user) => user.id)).toEqual(['editor']);
    });

    it('requires reloading when remote policy changes while a draft is being edited', async () => {
        const { service } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Permissions' }));
        fireEvent.click(await screen.findByText('Object owner only'));
        await act(() => service.refreshUnit('doc'));
        await screen.findByText('Permissions changed. Reload before saving.');
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
    });
});

describe('workbench object permission dialog', () => {
    function openHostedDialog(exists: () => boolean = () => true) {
        const context = setup();
        context.view.unmount();
        const { injector, target } = context;
        injector.add([ComponentManager]);
        injector.add([IconManager]);
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([IDialogService, { useClass: DesktopDialogService }]);
        injector.get(ComponentManager).register(OBJECT_PERMISSION_DIALOG, ObjectPermissionDialog);
        const openDialog = () => {
            expect(openObjectPermissionDialog(injector, {
                target,
                name: 'Original image',
                commandId: 'test.command.set-permission',
                exists,
            })).toBe(true);
        };
        const host = render(
            <RediProvider value={{ injector }}>
                <div><button onClick={openDialog}>Open from toolbar</button></div>
                <DialogPart />
            </RediProvider>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Open from toolbar' }));
        host.rerender(
            <RediProvider value={{ injector }}>
                <div />
                <DialogPart />
            </RediProvider>
        );
        return context;
    }

    it('saves through the shared dialog after the originating toolbar unmounts', async () => {
        const { create } = openHostedDialog();
        await screen.findByText('Original image');
        fireEvent.click(await screen.findByText('Object owner only'));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('selects people inline in a hosted toolbar dialog and saves once', async () => {
        const { create } = openHostedDialog();
        fireEvent.click(await screen.findByText('Selected members'));
        fireEvent.change(screen.getByRole('textbox', { name: 'Search people' }), { target: { value: 'editor' } });
        fireEvent.click(await screen.findByRole('checkbox', { name: /^Editor / }));
        expect(screen.getAllByRole('dialog')).toHaveLength(1);
        expect(create).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
        expect(create.mock.calls[0][0].documentObject?.collaborators.map((user) => user.id)).toEqual(['editor']);
    });

    it('rejects saving if the original element was deleted while the dialog was open', async () => {
        let exists = true;
        const { create } = openHostedDialog(() => exists);
        fireEvent.click(await screen.findByText('Object owner only'));
        exists = false;
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await screen.findByRole('alert');
        expect(create).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toBeTruthy();
    });
});
