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
import type { IAllowedRequest, ICollaborator, IListPermPointResponse, IUpdatePermPointRequest } from '@univerjs/protocol';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CommandType, IAuthzIoService, ICommandService, LocaleType, ObjectPermissionService, Univer, UniverInstanceType, UserManagerService } from '@univerjs/core';
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
import { OBJECT_PERMISSION_DIALOG, ObjectPermissionButton, ObjectPermissionDialog, openObjectPermissionDialog } from '../ObjectPermissionButton';

const univers: Univer[] = [];
afterEach(() => {
    cleanup();
    univers.splice(0).forEach((univer) => univer.dispose());
});

function setup(options: { capable?: boolean; manage?: boolean; collaborators?: ICollaborator[]; inherit?: boolean; currentUser?: string } = {}) {
    let policies: IListPermPointResponse['objects'] = [];
    let members: ICollaborator[] = [];
    const update = vi.fn(async (request: IUpdatePermPointRequest) => {
        members = request.collaborators?.collaborators ?? [];
        policies = [{ ...request, shareOn: false, shareRole: UnitRole.Reader, shareScope: 0, creator: undefined, actions: [] }];
    });
    const listCollaborators = vi.fn(async ({ objectID }: { objectID: string }) => objectID === 'doc'
        ? options.collaborators ?? [{ id: 'editor', role: UnitRole.Editor, subject: { userID: 'editor', name: 'Editor', avatar: '' } }]
        : members);
    const authz = {
        getCfgEnableObjInherit: () => options.inherit ?? false,
        supportsObjectPermissionManagement: () => options.capable !== false,
        listUnitPermissions: async () => policies,
        list: async () => policies,
        listCollaborators,
        allowed: async () => [{ action: UnitAction.ManageCollaborator, allowed: options.manage !== false }],
        batchAllowed: async (requests: IAllowedRequest[]) => requests.map(({ unitID, objectID, actions }) => ({ unitID, objectID, actions: actions.map((action) => ({ action, allowed: true })) })),
        update,
    };
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS }, override: [[IAuthzIoService, { useValue: authz }]] });
    univers.push(univer);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'doc', title: 'Document', body: { dataStream: '\r\n' } });
    const injector = univer.__getInjector();
    if (options.currentUser) {
        injector.get(UserManagerService).setCurrentUser({ userID: options.currentUser, name: options.currentUser });
    }
    const service = injector.get(ObjectPermissionService);
    injector.get(ICommandService).registerCommand({
        id: 'test.command.set-permission',
        type: CommandType.COMMAND,
        handler: async (_, params: { policy: IObjectPermissionPolicy } | undefined) => {
            if (!params) {
                return false;
            }
            await service.save({ unitId: 'doc', objectId: 'entity//drawing/image', objectType: UnitObject.DocumentEntity }, params.policy);
            return true;
        },
    });
    const target = { unitId: 'doc', objectId: 'entity//drawing/image', objectType: UnitObject.DocumentEntity };
    const view = render(<RediProvider value={{ injector }}><ObjectPermissionButton target={target} name="Image" commandId="test.command.set-permission" /></RediProvider>);
    return { update, listCollaborators, service, target, injector, view };
}

describe('ObjectPermissionButton', () => {
    it('hides the action for a provider without object management', () => {
        setup({ capable: false });
        expect(screen.queryByRole('button', { name: 'Permission settings' })).toBeNull();
    });

    it('shows a read-only dialog when the user cannot manage the object', async () => {
        setup({ manage: false });
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
        await screen.findByText('You cannot manage permissions for this object.');
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
    });

    it('saves a restriction through a Command and shows primary even when the owner can still edit', async () => {
        const { update, service, target } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
        fireEvent.click(await screen.findByText('Object owner only'));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        expect(service.hasPolicy(target)).toBe(true);
        expect(screen.getByRole('button', { name: 'Permission settings' }).className).toContain('text-primary');
    });

    it('searches eligible people, keeps hidden selections, and persists only after confirmation and Save', async () => {
        const { update } = setup({ collaborators: [
            { id: 'alice', role: UnitRole.Editor, subject: { userID: 'alice', name: 'Alice', avatar: '' } },
            { id: 'bob', role: UnitRole.Editor, subject: { userID: 'bob', name: 'Bob', avatar: '' } },
            { id: 'reader', role: UnitRole.Reader, subject: { userID: 'reader', name: 'Reader', avatar: '' } },
        ] });
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
        fireEvent.click(await screen.findByText('Selected members'));
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Add people' }));
        const picker = within(await screen.findByRole('dialog', { name: 'Add people' }));
        await picker.findByRole('checkbox', { name: 'Alice' });
        expect(picker.queryByText('Reader')).toBeNull();
        fireEvent.change(picker.getByRole('textbox', { name: 'Search people' }), { target: { value: '  ALICE  ' } });
        expect(picker.queryByText('Bob')).toBeNull();
        fireEvent.click(await picker.findByRole('checkbox', { name: 'Alice' }));
        fireEvent.change(picker.getByRole('textbox', { name: 'Search people' }), { target: { value: 'missing' } });
        expect(picker.getByText('No matching people')).toBeTruthy();
        fireEvent.change(picker.getByRole('textbox', { name: 'Search people' }), { target: { value: 'bob' } });
        fireEvent.click(await picker.findByRole('checkbox', { name: 'Bob' }));
        expect(update).not.toHaveBeenCalled();
        fireEvent.click(picker.getByRole('button', { name: 'Confirm' }));
        await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add people' })).toBeNull());
        expect(screen.getByRole('group', { name: 'Alice' })).toBeTruthy();
        expect(screen.getByRole('group', { name: 'Bob' })).toBeTruthy();
        expect(update).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
        expect(update.mock.calls[0][0].collaborators?.collaborators.map((user) => user.id)).toEqual(['alice', 'bob']);
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
        expect(await screen.findByRole('group', { name: 'Alice' })).toBeTruthy();
        expect(screen.getByRole('group', { name: 'Bob' })).toBeTruthy();
    });

    it('discards cancelled picker choices and allows removing confirmed people', async () => {
        setup();
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
        fireEvent.click(await screen.findByText('Selected members'));
        fireEvent.click(screen.getByRole('button', { name: 'Add people' }));
        let picker = within(await screen.findByRole('dialog', { name: 'Add people' }));
        fireEvent.click(await picker.findByRole('checkbox', { name: 'Editor' }));
        fireEvent.click(picker.getByRole('button', { name: 'Cancel' }));
        await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add people' })).toBeNull());
        expect(screen.getByText('No people selected')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Add people' }));
        picker = within(await screen.findByRole('dialog', { name: 'Add people' }));
        expect((await picker.findByRole('checkbox', { name: 'Editor' }) as HTMLInputElement).checked).toBe(false);
        fireEvent.click(await picker.findByRole('checkbox', { name: 'Editor' }));
        fireEvent.click(picker.getByRole('button', { name: 'Confirm' }));
        await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add people' })).toBeNull());
        fireEvent.pointerDown(within(screen.getByRole('group', { name: 'Editor' })).getByText('Can edit'), { button: 0, ctrlKey: false });
        fireEvent.click(await screen.findByText('Remove'));
        expect(screen.queryByRole('group', { name: 'Editor' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
    });

    it('loads file candidates only when Add people opens and retries without losing the policy draft', async () => {
        const { listCollaborators, update } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
        fireEvent.click(await screen.findByText('Selected members'));
        expect(listCollaborators.mock.calls.map(([request]) => request.objectID)).toEqual(['entity//drawing/image']);
        listCollaborators.mockRejectedValueOnce(new Error('Offline'));
        fireEvent.click(screen.getByRole('button', { name: 'Add people' }));
        const picker = within(await screen.findByRole('dialog', { name: 'Add people' }));
        expect(await picker.findByRole('alert')).toBeTruthy();
        expect(picker.getByRole('button', { name: 'Confirm' }).hasAttribute('disabled')).toBe(true);
        fireEvent.click(picker.getByRole('button', { name: 'Reload' }));
        expect(await picker.findByRole('checkbox', { name: 'Editor' })).toBeTruthy();
        expect(listCollaborators.mock.calls.map(([request]) => request.objectID)).toEqual(['entity//drawing/image', 'doc', 'doc']);
        expect(update).not.toHaveBeenCalled();
    });

    it('uses the current user service and respects inherited file-owner access like Sheet', async () => {
        setup({ currentUser: 'me', inherit: true, collaborators: [
            { id: 'me', role: UnitRole.Editor, subject: { userID: 'me', name: 'Me', avatar: '' } },
            { id: 'owner', role: UnitRole.Owner, subject: { userID: 'owner', name: 'Owner', avatar: '' } },
        ] });
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
        fireEvent.click(await screen.findByText('Selected members'));
        fireEvent.click(screen.getByRole('button', { name: 'Add people' }));
        const picker = within(await screen.findByRole('dialog', { name: 'Add people' }));
        const owner = await picker.findByRole('checkbox', { name: /Owner/ });
        expect(owner.hasAttribute('disabled')).toBe(true);
        expect(picker.queryByText('Me')).toBeNull();
    });

    it('keeps the dialog and draft open when saving fails', async () => {
        const { update } = setup();
        update.mockRejectedValueOnce(new Error('Offline'));
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
        fireEvent.click(await screen.findByText('Object owner only'));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await screen.findByRole('alert');
        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(false);
    });

    it('requires reloading when remote policy changes while a draft is being edited', async () => {
        const { service } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Permission settings' }));
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
        const { update } = openHostedDialog();
        await screen.findByText('Original image');
        fireEvent.click(await screen.findByText('Object owner only'));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('searches and confirms people from a hosted toolbar dialog', async () => {
        const { update } = openHostedDialog();
        fireEvent.click(await screen.findByText('Selected members'));
        fireEvent.click(screen.getByRole('button', { name: 'Add people' }));
        const picker = within(await screen.findByRole('dialog', { name: 'Add people' }));
        fireEvent.change(picker.getByRole('textbox', { name: 'Search people' }), { target: { value: 'editor' } });
        fireEvent.click(await picker.findByRole('checkbox', { name: 'Editor' }));
        fireEvent.click(picker.getByRole('button', { name: 'Confirm' }));
        await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add people' })).toBeNull());
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
        expect(update.mock.calls[0][0].collaborators?.collaborators.map((user) => user.id)).toEqual(['editor']);
    });

    it('rejects saving if the original element was deleted while the dialog was open', async () => {
        let exists = true;
        const { update } = openHostedDialog(() => exists);
        fireEvent.click(await screen.findByText('Object owner only'));
        exists = false;
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await screen.findByRole('alert');
        expect(update).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toBeTruthy();
    });
});
