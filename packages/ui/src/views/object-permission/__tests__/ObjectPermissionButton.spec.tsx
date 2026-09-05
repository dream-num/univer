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
import type { IAllowedRequest, IListPermPointResponse, IUpdatePermPointRequest } from '@univerjs/protocol';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CommandType, IAuthzIoService, ICommandService, LocaleType, ObjectPermissionService, Univer, UniverInstanceType } from '@univerjs/core';
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

function setup(options: { capable?: boolean; manage?: boolean } = {}) {
    let policies: IListPermPointResponse['objects'] = [];
    const update = vi.fn(async (request: IUpdatePermPointRequest) => {
        policies = [{ ...request, shareOn: false, shareRole: UnitRole.Reader, shareScope: 0, creator: undefined, actions: [] }];
    });
    const authz = {
        supportsObjectPermissionManagement: () => options.capable !== false,
        listUnitPermissions: async () => policies,
        list: async () => policies,
        listCollaborators: async () => [{ id: 'editor', role: UnitRole.Editor, subject: { userID: 'editor', name: 'Editor', avatar: '' } }],
        allowed: async () => [{ action: UnitAction.ManageCollaborator, allowed: options.manage !== false }],
        batchAllowed: async (requests: IAllowedRequest[]) => requests.map(({ unitID, objectID, actions }) => ({ unitID, objectID, actions: actions.map((action) => ({ action, allowed: true })) })),
        update,
    };
    const univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS }, override: [[IAuthzIoService, { useValue: authz }]] });
    univers.push(univer);
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'doc', title: 'Document', body: { dataStream: '\r\n' } });
    const injector = univer.__getInjector();
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
    return { update, service, target, injector, view };
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
