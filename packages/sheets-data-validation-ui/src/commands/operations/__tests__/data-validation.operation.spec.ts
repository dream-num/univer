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

import type { Dependency, IDataValidationRule, IDisposable, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISidebarMethodOptions } from '@univerjs/ui';
import type { IDataValidationDropdownParam } from '../../../services/dropdown-manager.service';
import {
    DataValidationOperator,
    DataValidationType,
    ICommandService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleType,
    Plugin,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { ISidebarService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { DataValidationPanelService } from '../../../services/data-validation-panel.service';
import { DataValidationDropdownManagerService } from '../../../services/dropdown-manager.service';
import {
    CloseValidationPanelOperation,
    DATA_VALIDATION_PANEL,
    HideDataValidationDropdown,
    OpenValidationPanelOperation,
    ShowDataValidationDropdown,
    ToggleValidationPanelOperation,
} from '../data-validation.operation';

interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    workbook?: Workbook;
}

const RULE: IDataValidationRule = {
    uid: 'rule-1',
    type: DataValidationType.DECIMAL,
    operator: DataValidationOperator.EQUAL,
    formula1: '100',
    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
};

class TestDataValidationModel {
    getRuleById(unitId: string, subUnitId: string, ruleId: string): IDataValidationRule | undefined {
        return unitId === 'book-1' && subUnitId === 'sheet-1' && ruleId === RULE.uid ? RULE : undefined;
    }
}

class TestSidebarService {
    readonly sidebarOptions$ = new BehaviorSubject<ISidebarMethodOptions>({ visible: true });
    readonly openedPanels: ISidebarMethodOptions[] = [];
    disposeCount = 0;

    open(options: ISidebarMethodOptions): IDisposable {
        this.openedPanels.push(options);
        return toDisposable(() => {
            this.disposeCount++;
        });
    }
}

class TestDropdownManagerService {
    activeDropdown: IDataValidationDropdownParam | null = null;
    readonly shownLocations: Array<{ unitId: string; subUnitId: string; row: number; column: number }> = [];
    hideCount = 0;

    showDataValidationDropdown(unitId: string, subUnitId: string, row: number, column: number): void {
        this.shownLocations.push({ unitId, subUnitId, row, column });
        this.activeDropdown = {
            location: {
                unitId,
                subUnitId,
                row,
                col: column,
            },
        } as IDataValidationDropdownParam;
    }

    hideDropdown(): void {
        this.hideCount++;
        this.activeDropdown = null;
    }
}

function createWorkbookData(): IWorkbookData {
    return {
        id: 'book-1',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet-1'],
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {},
            },
        },
        styles: {},
    };
}

function registerDependencies(injector: Injector): void {
    const dependencies: Dependency[] = [
        [DataValidationModel, { useClass: TestDataValidationModel }],
        [ISidebarService, { useClass: TestSidebarService }],
        [DataValidationPanelService],
        [DataValidationDropdownManagerService, { useClass: TestDropdownManagerService }],
    ];
    dependencies.forEach((dependency) => injector.add(dependency));
}

function createTestBed(createWorkbook = true): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            registerDependencies(this._injector);
        }
    }

    univer.registerPlugin(TestPlugin);
    if (!createWorkbook) {
        registerDependencies(injector);
    }

    const commandService = injector.get(ICommandService);
    [
        OpenValidationPanelOperation,
        CloseValidationPanelOperation,
        ToggleValidationPanelOperation,
        ShowDataValidationDropdown,
        HideDataValidationDropdown,
    ].forEach((command) => commandService.registerCommand(command));

    const workbook = createWorkbook
        ? univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData())
        : undefined;
    if (workbook) {
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    }

    return {
        univer,
        get: injector.get.bind(injector),
        workbook,
    };
}

describe('data validation operations', () => {
    let testBed: ITestBed | undefined;

    afterEach(() => {
        testBed?.univer.dispose();
        testBed = undefined;
    });

    it('opens the panel for an active sheet rule and closes it from the sidebar callback', async () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);
        const panelService = testBed.get(DataValidationPanelService);
        const sidebarService = testBed.get(ISidebarService) as unknown as TestSidebarService;

        await expect(commandService.executeCommand(OpenValidationPanelOperation.id, { ruleId: RULE.uid, isAdd: true })).resolves.toBe(true);

        expect(panelService.isOpen).toBe(true);
        expect(panelService.activeRule).toEqual({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            rule: RULE,
        });
        expect(sidebarService.openedPanels.at(-1)).toMatchObject({
            id: DATA_VALIDATION_PANEL,
            header: { title: 'sheets-data-validation-ui.panel.addTitle' },
            children: { label: DATA_VALIDATION_PANEL },
            width: 312,
        });

        sidebarService.openedPanels.at(-1)!.onClose?.();

        expect(panelService.isOpen).toBe(false);
    });

    it('opens the rule list with empty params and returns false when no sheet is active', async () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);
        const panelService = testBed.get(DataValidationPanelService);

        await expect(commandService.executeCommand(OpenValidationPanelOperation.id)).resolves.toBe(false);
        expect(panelService.isOpen).toBe(false);

        await expect(commandService.executeCommand(OpenValidationPanelOperation.id, {})).resolves.toBe(true);
        expect(panelService.isOpen).toBe(true);
        expect(panelService.activeRule).toBeUndefined();

        testBed.univer.dispose();
        testBed = createTestBed(false);

        await expect(testBed.get(ICommandService).executeCommand(OpenValidationPanelOperation.id, {})).resolves.toBe(false);
    });

    it('toggles an opened validation panel closed through the command service', async () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);
        const panelService = testBed.get(DataValidationPanelService);
        const sidebarService = testBed.get(ISidebarService) as unknown as TestSidebarService;

        await expect(commandService.executeCommand(OpenValidationPanelOperation.id, {})).resolves.toBe(true);
        expect(panelService.isOpen).toBe(true);
        expect(sidebarService.openedPanels).toHaveLength(1);

        await expect(commandService.executeCommand(ToggleValidationPanelOperation.id)).resolves.toBe(true);
        expect(panelService.isOpen).toBe(false);
        expect(sidebarService.disposeCount).toBe(1);
    });

    it('does not recreate dropdowns for the same cell and hides an active dropdown on demand', async () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);
        const dropdownService = testBed.get(DataValidationDropdownManagerService) as unknown as TestDropdownManagerService;

        await expect(commandService.executeCommand(ShowDataValidationDropdown.id)).resolves.toBe(false);
        await expect(commandService.executeCommand(HideDataValidationDropdown.id)).resolves.toBe(false);

        await expect(commandService.executeCommand(ShowDataValidationDropdown.id, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            row: 1,
            column: 2,
        })).resolves.toBe(true);
        await expect(commandService.executeCommand(ShowDataValidationDropdown.id, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            row: 1,
            column: 2,
        })).resolves.toBe(true);

        expect(dropdownService.shownLocations).toEqual([
            { unitId: 'book-1', subUnitId: 'sheet-1', row: 1, column: 2 },
        ]);

        await expect(commandService.executeCommand(HideDataValidationDropdown.id, { reason: 'selection-change' })).resolves.toBe(true);

        expect(dropdownService.hideCount).toBe(1);
        expect(dropdownService.activeDropdown).toBeNull();
    });
});
