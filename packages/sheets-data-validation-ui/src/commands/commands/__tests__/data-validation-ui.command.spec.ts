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
    Dependency,
    ICommand,
    ICommandInfo,
    IDataValidationRule,
    IDisposable,
    IWorkbookData,
    Workbook,
} from '@univerjs/core';
import type { ISidebarMethodOptions } from '@univerjs/ui';
import {
    CommandType,
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
import { SheetsSelectionsService } from '@univerjs/sheets';
import { AddSheetDataValidationCommand } from '@univerjs/sheets-data-validation';
import { ISidebarService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { DataValidationPanelService } from '../../../services/data-validation-panel.service';
import { DATA_VALIDATION_PANEL, OpenValidationPanelOperation } from '../../operations/data-validation.operation';
import { AddSheetDataValidationAndOpenCommand } from '../data-validation-ui.command';

interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    workbook?: Workbook;
    executedCommands: ICommandInfo[];
}

class TestDataValidationModel {
    rejectAdd = false;
    readonly rules = new Map<string, IDataValidationRule>();

    addRule(unitId: string, subUnitId: string, rule: IDataValidationRule): void {
        this.rules.set(`${unitId}:${subUnitId}:${rule.uid}`, rule);
    }

    getRuleById(unitId: string, subUnitId: string, ruleId: string): IDataValidationRule | undefined {
        return this.rules.get(`${unitId}:${subUnitId}:${ruleId}`);
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
        [SheetsSelectionsService],
        [DataValidationModel, { useClass: TestDataValidationModel }],
        [ISidebarService, { useClass: TestSidebarService }],
        [DataValidationPanelService],
    ];
    dependencies.forEach((dependency) => injector.add(dependency));
}

function createTestBed(createWorkbook = true): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const executedCommands: ICommandInfo[] = [];

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
    commandService.registerCommand(AddSheetDataValidationAndOpenCommand);
    commandService.registerCommand(OpenValidationPanelOperation);
    commandService.registerCommand({
        id: AddSheetDataValidationCommand.id,
        type: CommandType.COMMAND,
        handler: (accessor, params) => {
            const model = accessor.get(DataValidationModel) as unknown as TestDataValidationModel;
            executedCommands.push({ id: AddSheetDataValidationCommand.id, params });

            const addParams = params as { unitId: string; subUnitId: string; rule: IDataValidationRule } | undefined;
            if (model.rejectAdd || !addParams) {
                return false;
            }

            model.addRule(addParams.unitId, addParams.subUnitId, addParams.rule);
            return true;
        },
    } as ICommand);

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
        executedCommands,
    };
}

describe('AddSheetDataValidationAndOpenCommand', () => {
    let testBed: ITestBed | undefined;

    afterEach(() => {
        testBed?.univer.dispose();
        testBed = undefined;
    });

    it('adds a default rule to the active sheet and opens the panel for that rule', () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);
        const panelService = testBed.get(DataValidationPanelService);
        const sidebarService = testBed.get(ISidebarService) as unknown as TestSidebarService;

        expect(commandService.syncExecuteCommand(AddSheetDataValidationAndOpenCommand.id)).toBe(true);

        const addParams = testBed.executedCommands[0].params as { unitId: string; subUnitId: string; rule: IDataValidationRule };
        expect(addParams.unitId).toBe('book-1');
        expect(addParams.subUnitId).toBe('sheet-1');
        expect(addParams.rule).toMatchObject({
            type: DataValidationType.DECIMAL,
            operator: DataValidationOperator.EQUAL,
            formula1: '100',
        });
        expect(panelService.activeRule).toEqual({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            rule: addParams.rule,
        });
        expect(panelService.isOpen).toBe(true);
        expect(sidebarService.openedPanels.at(-1)).toMatchObject({
            id: DATA_VALIDATION_PANEL,
            header: { title: 'sheets-data-validation-ui.panel.addTitle' },
            width: 312,
        });
    });

    it('does not add or open when there is no active sheet target', () => {
        testBed = createTestBed(false);
        const commandService = testBed.get(ICommandService);
        const panelService = testBed.get(DataValidationPanelService);
        const sidebarService = testBed.get(ISidebarService) as unknown as TestSidebarService;

        expect(commandService.syncExecuteCommand(AddSheetDataValidationAndOpenCommand.id)).toBe(false);
        expect(testBed.executedCommands).toEqual([]);
        expect(panelService.isOpen).toBe(false);
        expect(sidebarService.openedPanels).toEqual([]);
    });

    it('does not open the panel when the rule add command rejects the new rule', () => {
        testBed = createTestBed();
        const commandService = testBed.get(ICommandService);
        const panelService = testBed.get(DataValidationPanelService);
        const model = testBed.get(DataValidationModel) as unknown as TestDataValidationModel;

        model.rejectAdd = true;

        expect(commandService.syncExecuteCommand(AddSheetDataValidationAndOpenCommand.id)).toBe(false);
        expect(testBed.executedCommands).toHaveLength(1);
        expect(panelService.isOpen).toBe(false);
        expect(panelService.activeRule).toBeUndefined();
    });
});
