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

import type { IRange } from '@univerjs/core';
import type { ReactElement } from 'react';
import {
    IAuthzIoService,
    ICommandService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { ObjectScope, UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import {
    AddRangeProtectionCommand,
    AddWorksheetProtectionCommand,
    EditStateEnum,
    ViewStateEnum,
} from '@univerjs/sheets';
import { ISidebarService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { UNIVER_SHEET_PERMISSION_PANEL } from '../../../consts/permission';
import { SheetPermissionPanelModel } from '../../../services/permission/sheet-permission-panel.model';
import { SheetPermissionUserManagerService } from '../../../services/permission/sheet-permission-user-list.service';
import { PermissionDetailFooterPart } from '../panel-detail/PermissionDetailFooterPart';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'permission-footer-unit';
const SHEET_ID = 'sheet-1';
const CREATED_PERMISSION_ID = 'created-permission-id';

class TestWorksheet {
    getSheetId(): string {
        return SHEET_ID;
    }

    getRowCount(): number {
        return 20;
    }

    getColumnCount(): number {
        return 10;
    }
}

class TestWorkbook {
    private readonly _worksheet = new TestWorksheet();

    getUnitId(): string {
        return UNIT_ID;
    }

    getActiveSheet(): TestWorksheet {
        return this._worksheet;
    }
}

class TestUniverInstanceService {
    private readonly _workbook = new TestWorkbook();

    getCurrentUnitOfType(unitType: UniverInstanceType): TestWorkbook | null {
        return unitType === UniverInstanceType.UNIVER_SHEET ? this._workbook : null;
    }
}

class TestLocaleService {
    t(key: string): string {
        return key;
    }
}

class TestCommandService {
    readonly commands: Array<{ id: string; params?: unknown }> = [];

    async executeCommand(id: string, params?: unknown): Promise<boolean> {
        this.commands.push({ id, params });
        return true;
    }
}

class TestAuthzIoService {
    readonly creates: unknown[] = [];
    readonly updates: unknown[] = [];

    async create(config: unknown): Promise<string> {
        this.creates.push(config);
        return CREATED_PERMISSION_ID;
    }

    async update(config: unknown): Promise<void> {
        this.updates.push(config);
    }
}

class TestSidebarService {
    readonly sidebarOptions$ = new Subject();
    readonly scrollEvent$ = new Subject<Event>();
    readonly openHistory: unknown[] = [];
    private _container: HTMLElement = document.createElement('div');

    open(params: unknown) {
        this.openHistory.push(params);
        return { dispose(): void {} };
    }

    close(): void {}

    get visible(): boolean {
        return this.openHistory.length > 0;
    }

    get options(): unknown {
        return this.openHistory[this.openHistory.length - 1];
    }

    getContainer(): HTMLElement | undefined {
        return this._container;
    }

    setContainer(element?: HTMLElement): void {
        this._container = element ?? document.createElement('div');
    }

    get width(): number | undefined {
        return undefined;
    }

    setWidth(): void {}
}

function createPermissionFooterTestBed() {
    const injector = new Injector();
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([LocaleService, { useClass: TestLocaleService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([ISidebarService, { useClass: TestSidebarService as never }]);
    injector.add([SheetPermissionPanelModel, { useClass: SheetPermissionPanelModel }]);
    injector.add([SheetPermissionUserManagerService, { useClass: SheetPermissionUserManagerService }]);
    injector.add([IAuthzIoService, { useClass: TestAuthzIoService as never }]);

    return injector;
}

function renderWithDependencies(element: ReactElement, injector: Injector) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return {
        container,
        root,
        unmount: () => {
            act(() => root.unmount());
            container.remove();
        },
    };
}

function queryByText(container: HTMLElement, text: string): HTMLElement | null {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        if (node.textContent === text) {
            return node.parentElement;
        }
        node = walker.nextNode();
    }

    return null;
}

function getByText(container: HTMLElement, text: string): HTMLElement {
    const element = queryByText(container, text);
    if (!element) {
        throw new Error(`Text not found: ${text}`);
    }

    return element;
}

function clickConfirm(container: HTMLElement) {
    const confirmText = getByText(container, 'sheets-ui.permission.button.confirm');
    const button = confirmText.closest('button');
    if (!(button instanceof HTMLButtonElement)) {
        throw new TypeError('Confirm button not found');
    }

    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('PermissionDetailFooterPart', () => {
    const disposals: Array<() => void> = [];

    afterEach(() => {
        disposals.splice(0).forEach((dispose) => dispose());
    });

    it('creates range protection with selected editors and returns the sidebar to the list', async () => {
        const injector = createPermissionFooterTestBed();
        const userManager = injector.get(SheetPermissionUserManagerService);
        userManager.setSelectUserList([{ id: 'user-1', subject: undefined, role: UnitRole.Reader }]);
        const range: IRange = { startRow: 1, endRow: 3, startColumn: 2, endColumn: 4 };
        const { container, unmount } = renderWithDependencies(
            <PermissionDetailFooterPart
                permissionId=""
                id="range-rule"
                ranges={[range]}
                desc="Quarterly inputs"
                editState={EditStateEnum.DesignedUserCanEdit}
                viewState={ViewStateEnum.OthersCanView}
            />,
            injector
        );
        disposals.push(unmount);

        await act(async () => {
            clickConfirm(container);
            await Promise.resolve();
        });

        const authzIoService = injector.get(IAuthzIoService) as unknown as TestAuthzIoService;
        expect(authzIoService.creates).toEqual([{
            selectRangeObject: {
                collaborators: [{ id: 'user-1', subject: undefined, role: UnitRole.Editor }],
                unitID: UNIT_ID,
                name: '',
                scope: {
                    read: ObjectScope.AllCollaborator,
                    edit: ObjectScope.SomeCollaborator,
                },
            },
            objectType: UnitObject.SelectRange,
        }]);

        const commandService = injector.get(ICommandService) as unknown as TestCommandService;
        expect(commandService.commands).toEqual([{
            id: AddRangeProtectionCommand.id,
            params: {
                rule: {
                    unitId: UNIT_ID,
                    subUnitId: SHEET_ID,
                    permissionId: '',
                    id: 'range-rule',
                    viewState: ViewStateEnum.OthersCanView,
                    editState: EditStateEnum.DesignedUserCanEdit,
                    unitType: UnitObject.SelectRange,
                    ranges: [range],
                    description: 'Quarterly inputs',
                },
                permissionId: CREATED_PERMISSION_ID,
            },
        }]);

        const sidebarService = injector.get(ISidebarService) as unknown as TestSidebarService;
        expect(sidebarService.openHistory).toEqual([{
            header: { title: 'sheets-ui.permission.panel.title' },
            children: {
                label: UNIVER_SHEET_PERMISSION_PANEL,
                showDetail: false,
            },
            width: 330,
        }]);
    });

    it('converts a full-sheet range into worksheet protection before executing the add command', async () => {
        const injector = createPermissionFooterTestBed();
        const wholeSheetRange: IRange = { startRow: 0, endRow: 19, startColumn: 0, endColumn: 9 };
        const { container, unmount } = renderWithDependencies(
            <PermissionDetailFooterPart
                permissionId=""
                id="sheet-rule"
                ranges={[wholeSheetRange]}
                desc="Whole sheet locked"
                editState={EditStateEnum.OnlyMe}
                viewState={ViewStateEnum.OthersCanView}
            />,
            injector
        );
        disposals.push(unmount);

        await act(async () => {
            clickConfirm(container);
            await Promise.resolve();
        });

        const authzIoService = injector.get(IAuthzIoService) as unknown as TestAuthzIoService;
        expect(authzIoService.creates).toEqual([{
            worksheetObject: {
                collaborators: [],
                unitID: UNIT_ID,
                name: '',
                strategies: [
                    { role: UnitRole.Editor, action: UnitAction.Edit },
                    { role: UnitRole.Reader, action: UnitAction.View },
                ],
                scope: {
                    read: ObjectScope.AllCollaborator,
                    edit: ObjectScope.OneSelf,
                },
            },
            objectType: UnitObject.Worksheet,
        }]);

        const commandService = injector.get(ICommandService) as unknown as TestCommandService;
        expect(commandService.commands).toEqual([{
            id: AddWorksheetProtectionCommand.id,
            params: {
                rule: {
                    unitId: UNIT_ID,
                    subUnitId: SHEET_ID,
                    permissionId: CREATED_PERMISSION_ID,
                    id: 'sheet-rule',
                    viewState: ViewStateEnum.OthersCanView,
                    editState: EditStateEnum.OnlyMe,
                    unitType: UnitObject.Worksheet,
                    description: 'Whole sheet locked',
                },
                unitId: UNIT_ID,
            },
        }]);
    });
});
