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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    getSheetsEmptySnapshot,
    ICommandService,
    IConfigService,
    IPermissionService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    InsertSheetCommand,
    InsertSheetMutation,
    WorkbookCreateSheetPermission,
    WorkbookEditablePermission,
    WorkbookHideSheetPermission,
    WorkbookRenameSheetPermission,
} from '@univerjs/sheets';
import { ContextMenuService, IContextMenuService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../../../config/config';
import enUS from '../../../../locale/en-US';
import { ISheetBarService, SheetBarService } from '../../../../services/sheet-bar/sheet-bar.service';
import { MobileSheetBar } from '../MobileSheetBar';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const disposals: Array<() => void> = [];

function renderSheetBar(show = true) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([ISheetBarService, { useClass: SheetBarService }]);
    injector.add([IContextMenuService, { useClass: ContextMenuService }]);
    injector.get(IConfigService).setConfig(SHEETS_UI_PLUGIN_CONFIG_KEY, { footer: { addSheetButtonConfig: { show } } });
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const workbook = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        getSheetsEmptySnapshot('mobile-sheet')
    );
    const permissions = injector.get(IPermissionService);
    [
        new WorkbookEditablePermission(workbook.getUnitId()),
        new WorkbookCreateSheetPermission(workbook.getUnitId()),
        new WorkbookRenameSheetPermission(workbook.getUnitId()),
        new WorkbookHideSheetPermission(workbook.getUnitId()),
    ].forEach((permission) => permissions.addPermissionPoint(permission));
    const commandService = injector.get(ICommandService);
    commandService.registerCommand(InsertSheetCommand);
    commandService.registerCommand(InsertSheetMutation);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(<RediContext.Provider value={{ injector }}><MobileSheetBar /></RediContext.Provider>));
    disposals.push(() => {
        act(() => root.unmount());
        container.remove();
        univer.dispose();
    });
    return { container, workbook, permissions };
}

afterEach(() => disposals.splice(0).forEach((dispose) => dispose()));

describe('MobileSheetBar permissions', () => {
    it.each([
        { label: 'workbook editing', Permission: WorkbookEditablePermission },
        { label: 'sheet creation', Permission: WorkbookCreateSheetPermission },
    ])(
        'hides the add button when $label is revoked and allows insertion after permission is restored',
        async ({ Permission }) => {
            const { container, workbook, permissions } = renderSheetBar();
            const initialCount = workbook.getSheets().length;
            const permission = new Permission(workbook.getUnitId());
            act(() => permissions.updatePermissionPoint(permission.id, false));
            expect(container.querySelector('button[aria-label="Add sheet"]')).toBeNull();

            act(() => permissions.updatePermissionPoint(permission.id, true));
            const button = container.querySelector<HTMLButtonElement>('button[aria-label="Add sheet"]')!;
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);
            await act(async () => button.click());
            expect(workbook.getSheets()).toHaveLength(initialCount + 1);
        }
    );

    it('preserves the explicit option to hide the add button', () => {
        const { container } = renderSheetBar(false);
        expect(container.querySelector('button[aria-label="Add sheet"]')).toBeNull();
    });
});
