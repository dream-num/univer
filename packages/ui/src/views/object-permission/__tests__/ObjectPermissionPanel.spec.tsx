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

import type { IObjectPermissionButtonProps } from '../ObjectPermissionButton';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CommandType, IAuthzIoService, ICommandService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { afterEach, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { DesktopSidebarService } from '../../../services/sidebar/desktop-sidebar.service';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { RediProvider } from '../../../utils/di';
import { ObjectPermissionPanel } from '../ObjectPermissionPanel';

let univer: Univer;
afterEach(() => {
    cleanup();
    univer?.dispose();
});
it('does not enumerate collapsed scopes or rescan them on editing commands, and loads more on demand', () => {
    const list = vi.fn();
    univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS }, override: [[IAuthzIoService, { useValue: {
        supportsObjectPermissionManagement: () => true,
        listUnitPermissions: list,
    } }]] });
    univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'doc', body: { dataStream: '\r\n' } });
    const injector = univer.__getInjector();
    injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
    let enumerated = 0;
    function* getTargets(): Iterable<IObjectPermissionButtonProps> {
        yield { target: { unitId: 'doc', objectId: 'doc', objectType: UnitObject.Document }, name: 'Document', commandId: 'test.permission' };
        for (let i = 0; i < 10000; i++) {
            enumerated++;
            yield { target: { unitId: 'doc', objectId: `section/${i}`, objectType: UnitObject.DocumentSection }, name: String(i), commandId: 'test.permission' };
        }
    }
    render(<RediProvider value={{ injector }}><ObjectPermissionPanel unitId="doc" getTargets={getTargets} expandable={UnitObject.DocumentSection} /></RediProvider>);
    expect(enumerated).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Section' }));
    expect(enumerated).toBeLessThanOrEqual(51);
    expect(screen.getAllByRole('button', { name: 'Permission settings' })).toHaveLength(50);
    const count = enumerated;
    injector.get(ICommandService).registerCommand({ id: 'test.edit', type: CommandType.COMMAND, handler: () => true });
    act(() => {
        injector.get(ICommandService).syncExecuteCommand('test.edit');
    });
    expect(enumerated).toBe(count);
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(screen.getAllByRole('button', { name: 'Permission settings' })).toHaveLength(100);
    expect(list).not.toHaveBeenCalled();
});
