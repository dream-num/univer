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

import { Injector, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { UnitObject } from '@univerjs/protocol';
import { EditStateEnum, ViewStateEnum } from '@univerjs/sheets';
import { IDialogService, ISidebarService } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import {
    UNIVER_SHEET_PERMISSION_DIALOG,
    UNIVER_SHEET_PERMISSION_DIALOG_ID,
    UNIVER_SHEET_PERMISSION_PANEL,
} from '../../../consts/permission';
import { SheetPermissionPanelModel } from '../../../services/permission/sheet-permission-panel.model';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { DEFINED_NAME_CONTAINER } from '../../../views/defined-name/component-name';
import { RenameSheetOperation } from '../rename-sheet.operation';
import { SheetPermissionOpenDialogOperation } from '../sheet-permission-open-dialog.operation';
import { SheetPermissionOpenPanelOperation } from '../sheet-permission-open-panel.operation';
import { SidebarDefinedNameOperation } from '../sidebar-defined-name.operation';

class SidebarServiceForTest {
    readonly openCalls: unknown[] = [];
    closeCount = 0;

    open(props: unknown) {
        this.openCalls.push(props);
    }

    close() {
        this.closeCount += 1;
    }
}

class DialogServiceForTest {
    readonly openCalls: unknown[] = [];
    readonly closeIds: string[] = [];

    open(props: unknown) {
        this.openCalls.push(props);
    }

    close(id: string) {
        this.closeIds.push(id);
    }
}

class SheetBarServiceForTest {
    readonly renameIds: string[] = [];

    setRenameId(subUnitId: string) {
        this.renameIds.push(subUnitId);
    }
}

class EditorServiceForTest {
}

class LocaleServiceForTest {
    t(key: string) {
        return `localized:${key}`;
    }
}

class WorkbookForTest {
    getUnitId() {
        return 'unit-1';
    }

    getActiveSheet() {
        return {
            getSheetId: () => 'sheet-1',
        };
    }
}

class UniverInstanceWithSheet {
    getCurrentUnitOfType() {
        return new WorkbookForTest();
    }
}

class UniverInstanceWithoutSheet {
    getCurrentUnitOfType() {
        return null;
    }
}

function addUseClass(injector: Injector, token: unknown, useClass: unknown) {
    injector.add([token, { useClass }] as any);
}

function createOperationInjector(univerClass: typeof UniverInstanceWithSheet | typeof UniverInstanceWithoutSheet = UniverInstanceWithSheet) {
    const injector = new Injector();
    addUseClass(injector, ISidebarService, SidebarServiceForTest);
    addUseClass(injector, IDialogService, DialogServiceForTest);
    addUseClass(injector, ISheetBarService, SheetBarServiceForTest);
    addUseClass(injector, IEditorService, EditorServiceForTest);
    addUseClass(injector, LocaleService, LocaleServiceForTest);
    addUseClass(injector, IUniverInstanceService, univerClass);
    injector.add([SheetPermissionPanelModel]);
    injector.add([SheetPermissionUserManagerService]);
    return injector;
}

describe('SidebarDefinedNameOperation', () => {
    it('returns false when there is no sheet command target', async () => {
        const injector = createOperationInjector(UniverInstanceWithoutSheet);

        await expect(SidebarDefinedNameOperation.handler(injector, { value: 'open' })).resolves.toBe(false);

        const sidebarService = injector.get(ISidebarService) as unknown as SidebarServiceForTest;
        expect(sidebarService.openCalls).toEqual([]);
        expect(sidebarService.closeCount).toBe(0);
    });

    it('opens sidebar with localized title when value is open', async () => {
        const injector = createOperationInjector();

        await expect(SidebarDefinedNameOperation.handler(injector, { value: 'open' })).resolves.toBe(true);

        const sidebarService = injector.get(ISidebarService) as unknown as SidebarServiceForTest;
        expect(sidebarService.openCalls).toEqual([expect.objectContaining({
            id: DEFINED_NAME_CONTAINER,
            width: 333,
            header: { title: 'localized:sheets-ui.definedName.featureTitle' },
            children: { label: DEFINED_NAME_CONTAINER },
            bodyStyle: {
                height: '100%',
                overflow: 'hidden',
            },
        })]);
        (sidebarService.openCalls[0] as { onClose: () => void }).onClose();
        expect(sidebarService.closeCount).toBe(0);
    });

    it('closes sidebar for close/default action', async () => {
        const injector = createOperationInjector();

        await expect(SidebarDefinedNameOperation.handler(injector, { value: 'close' })).resolves.toBe(true);
        await expect(SidebarDefinedNameOperation.handler(injector, { value: 'other' })).resolves.toBe(true);

        expect((injector.get(ISidebarService) as unknown as SidebarServiceForTest).closeCount).toBe(2);
    });
});

describe('sheet bar and permission operations', () => {
    it('marks the requested sheet as being renamed from the sheet bar', async () => {
        const injector = createOperationInjector();

        await expect(RenameSheetOperation.handler(injector, { subUnitId: 'sheet-2' })).resolves.toBe(true);
        await expect(RenameSheetOperation.handler(injector)).resolves.toBe(true);

        expect((injector.get(ISheetBarService) as unknown as SheetBarServiceForTest).renameIds).toEqual(['sheet-2']);
    });

    it('opens the permission dialog after closing find and replace', async () => {
        const injector = createOperationInjector();

        await expect(SheetPermissionOpenDialogOperation.handler(injector)).resolves.toBe(true);

        const dialogService = injector.get(IDialogService) as unknown as DialogServiceForTest;
        expect(dialogService.closeIds).toEqual(['DESKTOP_FIND_REPLACE_DIALOG']);
        expect(dialogService.openCalls).toEqual([expect.objectContaining({
            id: UNIVER_SHEET_PERMISSION_DIALOG_ID,
            title: { title: 'sheets-ui.permission.dialog.allowedPermissionType' },
            children: { label: UNIVER_SHEET_PERMISSION_DIALOG },
            width: 393,
            destroyOnClose: true,
        })]);

        (dialogService.openCalls[0] as { onClose: () => void }).onClose();
        expect(dialogService.closeIds).toEqual(['DESKTOP_FIND_REPLACE_DIALOG', UNIVER_SHEET_PERMISSION_DIALOG_ID]);
    });

    it('opens the permission panel with rule context and resets panel state on close', async () => {
        const injector = createOperationInjector();
        const model = injector.get(SheetPermissionPanelModel);
        const userManager = injector.get(SheetPermissionUserManagerService);
        const rule = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            permissionId: 'permission-1',
            unitType: UnitObject.SelectRange,
            id: 'rule-1',
            ranges: [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 }],
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        };
        userManager.setCanEditUserList([{ id: 'user-1', role: 1, subject: undefined }]);
        userManager.setSelectUserList([{ id: 'user-1', role: 1, subject: undefined }]);

        await expect(SheetPermissionOpenPanelOperation.handler(injector, {
            fromSheetBar: true,
            showDetail: false,
            rule,
            oldRule: rule,
        })).resolves.toBe(true);

        const sidebarService = injector.get(ISidebarService) as unknown as SidebarServiceForTest;
        expect(model.getVisible()).toBe(true);
        expect(sidebarService.openCalls).toEqual([expect.objectContaining({
            header: { title: 'sheets-ui.permission.panel.title' },
            width: 330,
            children: {
                label: UNIVER_SHEET_PERMISSION_PANEL,
                showDetail: false,
                fromSheetBar: true,
                rule,
                oldRule: rule,
            },
        })]);

        (sidebarService.openCalls[0] as { onClose: () => void }).onClose();
        expect(model.getVisible()).toBe(false);
        expect(userManager.userList).toEqual([]);
        expect(userManager.selectUserList).toEqual([]);
    });
});
