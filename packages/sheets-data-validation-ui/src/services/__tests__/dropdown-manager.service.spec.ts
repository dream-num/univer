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

import type { Dependency, ICommand, ICommandInfo, IDisposable, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IDropdownParam } from '@univerjs/sheets-ui';
import {
    awaitTime,
    CommandType,
    DataValidationErrorStyle,
    DataValidationRenderMode,
    dateKit,
    ICommandService,
    Inject,
    Injector,
    LocaleType,
    Plugin,
    toDisposable,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DataValidatorDropdownType, DataValidatorRegistryService } from '@univerjs/data-validation';
import { serializeListOptions, SetRangeValuesCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import {
    IEditorBridgeService,
    ISheetCellDropdownManagerService,
    SetCellEditVisibleOperation,
} from '@univerjs/sheets-ui';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { OpenValidationPanelOperation } from '../../commands/operations/data-validation.operation';
import { DataValidationDropdownManagerService } from '../dropdown-manager.service';

interface IRule {
    uid: string;
    type: string;
    formula1?: string;
    renderMode?: DataValidationRenderMode;
    errorStyle?: DataValidationErrorStyle;
    bizInfo?: Record<string, unknown>;
}

interface IValidator {
    dropdownType?: DataValidatorDropdownType;
    getListWithColor?: (rule: IRule, unitId: string, subUnitId: string) => Array<{ label: string; color?: string }>;
    validator?: (context: unknown, rule: IRule) => boolean | Promise<boolean>;
    getRuleFinalError?: (rule: IRule, location: unknown) => string;
}

class TestDataValidatorRegistryService {
    validator: IValidator | undefined;

    getValidatorItem(): IValidator | undefined {
        return this.validator;
    }
}

class TestSheetDataValidationModel {
    rule: IRule | null = null;

    getRuleByLocation(_unitId: string, _subUnitId: string, row: number, col: number): IRule | null {
        return col === 2 && row >= 1 && row <= 4 ? this.rule : null;
    }
}

class TestSheetsSelectionsService {
    private readonly _selectionMoveEnd$ = new Subject<ISelectionWithStyle[]>();
    readonly selectionMoveEnd$ = this._selectionMoveEnd$.asObservable();

    moveEnd(selections: ISelectionWithStyle[]): void {
        this._selectionMoveEnd$.next(selections);
    }
}

class TestCellDropdownManagerService {
    dropdownParam: (IDropdownParam & { onHide?: () => void }) | undefined;
    hideCount = 0;

    showDropdown(param: IDropdownParam & { onHide?: () => void }): IDisposable {
        this.dropdownParam = param;

        return toDisposable(() => {
            this.hideCount++;
        });
    }
}

class TestEditorBridgeService {
    visible = true;

    isVisible(): { visible: boolean } {
        return { visible: this.visible };
    }
}

interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    workbook: Workbook;
    executedCommands: ICommandInfo[];
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
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    1: {
                        2: { v: 'Open' },
                    },
                    2: {
                        2: { v: 'East/West' },
                    },
                    3: {
                        2: { v: '#ff0000' },
                    },
                    4: {
                        2: { v: 45800 },
                    },
                },
            },
        },
        styles: {},
    };
}

function createTestBed(): ITestBed {
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
            const dependencies: Dependency[] = [
                [DataValidatorRegistryService, { useClass: TestDataValidatorRegistryService }],
                [SheetDataValidationModel, { useClass: TestSheetDataValidationModel }],
                [SheetsSelectionsService, { useClass: TestSheetsSelectionsService }],
                [ISheetCellDropdownManagerService, { useClass: TestCellDropdownManagerService }],
                [IEditorBridgeService, { useClass: TestEditorBridgeService }],
                [DataValidationDropdownManagerService],
            ];
            dependencies.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    const commandService = injector.get(ICommandService);
    [SetRangeValuesCommand.id, SetCellEditVisibleOperation.id, OpenValidationPanelOperation.id].forEach((id) => {
        commandService.registerCommand({
            id,
            type: CommandType.COMMAND,
            handler: (_accessor, params) => {
                executedCommands.push({ id, params });
                return true;
            },
        } as ICommand);
    });

    return {
        univer,
        get: injector.get.bind(injector),
        workbook,
        executedCommands,
    };
}

function setRule(testBed: ITestBed, rule: IRule, validator: IValidator): void {
    (testBed.get(SheetDataValidationModel) as unknown as TestSheetDataValidationModel).rule = rule;
    (testBed.get(DataValidatorRegistryService) as unknown as TestDataValidatorRegistryService).validator = validator;
}

function getDropdown(testBed: ITestBed): IDropdownParam {
    return (testBed.get(ISheetCellDropdownManagerService) as unknown as TestCellDropdownManagerService).dropdownParam!;
}

function showDropdown(testBed: ITestBed, row: number, col = 2): void {
    testBed.get(DataValidationDropdownManagerService).showDataValidationDropdown('book-1', 'sheet-1', row, col);
}

function getSetRangeValue(testBed: ITestBed): unknown {
    return (testBed.executedCommands.find((command) => command.id === SetRangeValuesCommand.id)?.params as { value?: unknown } | undefined)?.value;
}

describe('DataValidationDropdownManagerService', () => {
    let testBed: ITestBed | undefined;

    afterEach(() => {
        testBed?.univer.dispose();
        testBed = undefined;
    });

    it('shows a list dropdown, saves the selected item, and opens the validation panel for editing', async () => {
        testBed = createTestBed();
        setRule(testBed, {
            uid: 'rule-list',
            type: 'list',
            renderMode: DataValidationRenderMode.CUSTOM,
        }, {
            dropdownType: DataValidatorDropdownType.LIST,
            getListWithColor: () => [
                { label: 'Open', color: '#00aa00' },
                { label: 'Closed' },
            ],
        });

        showDropdown(testBed, 1);

        const dropdown = getDropdown(testBed);
        expect(dropdown.type).toBe('list');
        expect(dropdown.props).toMatchObject({
            defaultValue: 'Open',
            multiple: false,
            showEdit: true,
            showSearch: true,
            options: [
                { label: 'Open', value: 'Open', color: '#00aa00' },
                { label: 'Closed', value: 'Closed', color: '#ECECEC' },
            ],
        });

        await (dropdown.props as { onChange: (value: string[]) => Promise<boolean> }).onChange(['Closed']);
        await awaitTime(0);
        expect(getSetRangeValue(testBed)).toEqual({
            v: 'Closed',
            p: null,
            f: null,
            si: null,
        });
        expect(testBed.executedCommands.some((command) => command.id === SetCellEditVisibleOperation.id)).toBe(true);

        (dropdown.props as { onEdit: () => void }).onEdit();
        expect(testBed.executedCommands.at(-1)).toMatchObject({
            id: OpenValidationPanelOperation.id,
            params: { ruleId: 'rule-list' },
        });
        expect((testBed.get(ISheetCellDropdownManagerService) as unknown as TestCellDropdownManagerService).hideCount).toBe(1);
    });

    it('keeps a multiple-list dropdown open after serializing selected values', async () => {
        testBed = createTestBed();
        (testBed.get(IEditorBridgeService) as unknown as TestEditorBridgeService).visible = false;
        setRule(testBed, {
            uid: 'rule-multiple',
            type: 'list',
        }, {
            dropdownType: DataValidatorDropdownType.MULTIPLE_LIST,
            getListWithColor: () => [
                { label: '1,2', color: '#00aa00' },
                { label: '3', color: '#ff0000' },
            ],
        });

        showDropdown(testBed, 1);

        const dropdown = getDropdown(testBed);
        await expect((dropdown.props as { onChange: (value: string[]) => Promise<boolean> }).onChange(['1,2', '3'])).resolves.toBe(false);
        expect(getSetRangeValue(testBed)).toEqual({
            v: serializeListOptions(['1,2', '3']),
            p: null,
            f: null,
            si: null,
        });
        expect(testBed.executedCommands.some((command) => command.id === SetCellEditVisibleOperation.id)).toBe(false);
    });

    it('saves cascader and color dropdown values with synchronous command flow', () => {
        testBed = createTestBed();
        setRule(testBed, {
            uid: 'rule-cascade',
            type: 'cascade',
            formula1: '[{"label":"East","value":"East","children":[{"label":"West","value":"West"}]}]',
        }, {
            dropdownType: DataValidatorDropdownType.CASCADE,
        });

        showDropdown(testBed, 2);
        let dropdown = getDropdown(testBed);
        expect(dropdown.type).toBe('cascader');
        expect(dropdown.props).toMatchObject({
            defaultValue: ['East', 'West'],
        });
        expect((dropdown.props as { onChange: (value: string[]) => boolean }).onChange(['North', 'South'])).toBe(true);
        expect(getSetRangeValue(testBed)).toMatchObject({ v: 'North/South' });

        setRule(testBed, {
            uid: 'rule-color',
            type: 'color',
        }, {
            dropdownType: DataValidatorDropdownType.COLOR,
        });

        showDropdown(testBed, 3);
        dropdown = getDropdown(testBed);
        expect(dropdown.type).toBe('color');
        expect(dropdown.props).toMatchObject({ defaultValue: '#ff0000' });
        expect((dropdown.props as { onChange: (value: string) => boolean }).onChange('#336699')).toBe(true);
        expect(testBed.executedCommands.at(-2)).toMatchObject({
            id: SetRangeValuesCommand.id,
            params: expect.objectContaining({
                value: expect.objectContaining({ v: '#336699' }),
            }),
        });
    });

    it('saves date-like dropdown values as serial numbers and closes cell editing', async () => {
        testBed = createTestBed();
        setRule(testBed, {
            uid: 'rule-date',
            type: 'date',
            errorStyle: DataValidationErrorStyle.STOP,
        }, {
            dropdownType: DataValidatorDropdownType.DATE,
            validator: () => true,
        });

        showDropdown(testBed, 4);

        const dropdown = getDropdown(testBed);
        expect(dropdown.type).toBe('datepicker');
        expect(dropdown.props).toMatchObject({
            showTime: false,
            patternType: 'date',
        });
        await expect((dropdown.props as { onChange: (value: ReturnType<typeof dateKit>) => Promise<boolean> }).onChange(dateKit('2026-06-17'))).resolves.toBe(true);
        expect(getSetRangeValue(testBed)).toEqual(expect.objectContaining({
            t: 2,
            s: {
                n: {
                    pattern: 'yyyy-MM-dd',
                },
            },
        }));
        expect(testBed.executedCommands.at(-1)?.id).toBe(SetCellEditVisibleOperation.id);

        setRule(testBed, {
            uid: 'rule-time',
            type: 'time',
            errorStyle: DataValidationErrorStyle.STOP,
        }, {
            dropdownType: DataValidatorDropdownType.TIME,
            validator: () => true,
        });

        showDropdown(testBed, 4);
        const timeDropdown = getDropdown(testBed);
        expect(timeDropdown.props).toMatchObject({ patternType: 'time' });
        await expect((timeDropdown.props as { onChange: (value: ReturnType<typeof dateKit>) => Promise<boolean> }).onChange(dateKit('2026-06-17 12:30:00'))).resolves.toBe(true);
        expect(testBed.executedCommands.at(-2)?.params).toMatchObject({
            value: expect.objectContaining({
                s: {
                    n: {
                        pattern: 'HH:mm:ss',
                    },
                },
            }),
        });
    });

    it('hides the active dropdown when selection leaves validation cells', () => {
        testBed = createTestBed();
        setRule(testBed, {
            uid: 'rule-list',
            type: 'list',
        }, {
            dropdownType: DataValidatorDropdownType.LIST,
            getListWithColor: () => [{ label: 'Open' }],
        });

        let hideCount = 0;
        testBed.get(DataValidationDropdownManagerService).showDataValidationDropdown('book-1', 'sheet-1', 1, 2, () => {
            hideCount++;
        });
        expect(testBed.get(DataValidationDropdownManagerService).activeDropdown).toMatchObject({
            location: expect.objectContaining({ row: 1, col: 2 }),
        });

        (testBed.get(SheetsSelectionsService) as unknown as TestSheetsSelectionsService).moveEnd([{
            primary: {
                unitId: 'book-1',
                sheetId: 'sheet-1',
                actualRow: 9,
                actualColumn: 9,
            },
        } as never]);

        expect(testBed.get(DataValidationDropdownManagerService).activeDropdown).toBeNull();
        expect(hideCount).toBe(1);
    });

    it('does not open a dropdown when workbook, rule, or validator dropdown type is unavailable', () => {
        testBed = createTestBed();
        const service = testBed.get(DataValidationDropdownManagerService);

        service.showDataValidationDropdown('missing-book', 'sheet-1', 1, 2);
        expect((testBed.get(ISheetCellDropdownManagerService) as unknown as TestCellDropdownManagerService).dropdownParam).toBeUndefined();

        service.showDataValidationDropdown('book-1', 'sheet-1', 1, 2);
        expect((testBed.get(ISheetCellDropdownManagerService) as unknown as TestCellDropdownManagerService).dropdownParam).toBeUndefined();

        setRule(testBed, {
            uid: 'rule-no-dropdown',
            type: 'unknown',
        }, {});
        service.showDataValidationDropdown('book-1', 'sheet-1', 1, 2);
        expect(service.activeDropdown).toBeUndefined();
    });
});
