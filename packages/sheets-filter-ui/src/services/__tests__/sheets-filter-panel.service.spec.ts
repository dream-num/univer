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

import type { Dependency, IOperation, IWorkbookData, Workbook } from '@univerjs/core';
import type { IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import type { IOpenFilterPanelOperationParams } from '../../commands/operations/sheets-filter.operation';
import type { IFilterConditionFormParams } from '../../models/conditions';
import type { IFilterByValueWithTreeItem } from '../sheets-filter-panel.service';
import { CommandType, ICommandService, Inject, Injector, LocaleService, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { ActiveDirtyManagerService, IActiveDirtyManagerService, ISheetRowFilteredService, SheetRowFilteredService } from '@univerjs/engine-formula';
import { RefRangeService, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { CustomFilterOperator, SheetsFilterService, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter/commands/commands/sheets-filter.command.js';
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest';
import { E_ITEMS, ITEMS, ITEMS_WITH_EMPTY, WithCustomFilterModelFactory, WithMergedCellFilterFactory, WithMultiEmptyCellsModelFactory, WithTwoFilterColumnsFactory, WithValuesAndEmptyFilterModelFactory, WithValuesFilterModelFactory } from '../../__testing__/data';
import { CloseFilterPanelOperation, OpenFilterPanelOperation } from '../../commands/operations/sheets-filter.operation';
import { FilterConditionItems } from '../../models/conditions';
import { ExtendCustomFilterOperator } from '../../models/extended-operators';
import { ByConditionsModel, ByValuesModel, FilterBy, SheetsFilterPanelService } from '../sheets-filter-panel.service';

const SetCellEditVisibleOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit-visible',
    type: CommandType.OPERATION,
    handler: () => {
        return true;
    },
};

function countLeafNodesByCheckedStatus(
    items: IFilterByValueWithTreeItem[],
    checkedStatus: boolean
): number {
    let count = 0;

    function traverse(node: IFilterByValueWithTreeItem) {
        if (node.leaf && node.checked === checkedStatus) {
            count++;
        }
        if (node.children) {
            node.children.forEach(traverse);
        }
    }

    items.forEach(traverse);
    return count;
}

function getAllLeafNodes(
    items: IFilterByValueWithTreeItem[]
): IFilterByValueWithTreeItem[] {
    const leafNodes: IFilterByValueWithTreeItem[] = [];

    function traverse(node: IFilterByValueWithTreeItem) {
        if (node.leaf) {
            leafNodes.push(node);
        }
        if (node.children) {
            node.children.forEach(traverse);
        }
    }

    items.forEach(traverse);
    return leafNodes;
}

function createSheetsFilterPanelServiceTestBed(workbookData: IWorkbookData) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class SheetsFilterPanelTestPlugin extends Plugin {
        static override type = UniverInstanceType.UNIVER_SHEET;
        static override pluginName = 'sheets-filter-panel-test';

        constructor(_config: unknown, @Inject(Injector) protected readonly _injector: Injector) {
            super();
        }

        override onStarting(): void {
            ([
                [RefRangeService],
                [SheetsSelectionsService],
                [SheetInterceptorService],
                [SheetsFilterPanelService],
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
            ] as Dependency[]).forEach((d) => this._injector.add(d));
        }
    }

    get(LocaleService).load({});

    univer.registerPlugin(UniverSheetsFilterPlugin);
    univer.registerPlugin(SheetsFilterPanelTestPlugin);

    univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);

    const commandService = get(ICommandService);

    [
        OpenFilterPanelOperation,
        CloseFilterPanelOperation,
        SetSheetsFilterCriteriaCommand,
        SetCellEditVisibleOperation,
    ].forEach((command) => commandService.registerCommand(command));

    return { univer, get };
}

describe('test "SheetsFilterPanelService"', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetsFilterService: SheetsFilterService;
    let sheetsFilterPanelService: SheetsFilterPanelService;

    function prepare(workbookData: IWorkbookData) {
        const testBed = createSheetsFilterPanelServiceTestBed(workbookData);

        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        sheetsFilterService = get(SheetsFilterService);
        sheetsFilterPanelService = get(SheetsFilterPanelService);
    }

    afterEach(() => {
        univer.dispose();
    });

    describe('test filter by conditions', () => {
        describe('test initialization behavior', () => {
            it('should initialize by conditional model when the filter column is by custom filters', () => {
                prepare(WithCustomFilterModelFactory());

                expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    col: 0,
                } as IOpenFilterPanelOperationParams)).toBe(true);

                expect(sheetsFilterPanelService.filterBy).toBe(FilterBy.CONDITIONS);
                const filterByModel = sheetsFilterPanelService.filterByModel as ByConditionsModel;
                expect(filterByModel instanceof ByConditionsModel).toBeTruthy();
                expect(filterByModel.conditionItem.operator).toBe(FilterConditionItems.GREATER_THAN.operator);
                expect(filterByModel.filterConditionFormParams).toEqual({ operator1: CustomFilterOperator.GREATER_THAN, val1: '123' });
            });
        });

        describe('test behavior when changing the primary operator', () => {
            it('should update the filter condition item when the primary operator changes', () => {
                prepare(WithCustomFilterModelFactory());

                expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    col: 0,
                } as IOpenFilterPanelOperationParams)).toBe(true);

                const filterByModel = sheetsFilterPanelService.filterByModel as ByConditionsModel;

                filterByModel.onPrimaryConditionChange(ExtendCustomFilterOperator.BETWEEN);
                expect(filterByModel.conditionItem.operator).toBe(FilterConditionItems.BETWEEN.operator);
                expect(filterByModel.filterConditionFormParams).toEqual({
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    val1: '',
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: '',
                } as IFilterConditionFormParams);

                filterByModel.onPrimaryConditionChange(ExtendCustomFilterOperator.ENDS_WITH);
                expect(filterByModel.conditionItem.operator).toBe(FilterConditionItems.ENDS_WITH.operator);
                expect(filterByModel.filterConditionFormParams).toEqual({
                    operator1: ExtendCustomFilterOperator.ENDS_WITH,
                    val1: '',
                } as IFilterConditionFormParams);
            });
        });

        describe('test behavior when changing the secondary operators', () => {
            it('should update primary operator when the secondary operator changes (in some conditions)', () => {
                prepare(WithCustomFilterModelFactory());

                expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    col: 0,
                } as IOpenFilterPanelOperationParams)).toBe(true);

                const filterByModel = sheetsFilterPanelService.filterByModel as ByConditionsModel;

                filterByModel.onConditionFormChange({ operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN });
                expect(filterByModel.conditionItem.operator).toBe(FilterConditionItems.DOES_NOT_CONTAIN.operator);
                expect(filterByModel.filterConditionFormParams).toEqual({
                    operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN,
                    val1: '123',
                } as IFilterConditionFormParams);

                filterByModel.onPrimaryConditionChange(ExtendCustomFilterOperator.BETWEEN);
                filterByModel.onConditionFormChange({ operator1: ExtendCustomFilterOperator.ENDS_WITH });
                expect(filterByModel.conditionItem.operator).toBe(FilterConditionItems.CUSTOM.operator);
                expect(filterByModel.filterConditionFormParams).toEqual({
                    and: true,
                    operator1: ExtendCustomFilterOperator.ENDS_WITH,
                    val1: '',
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: '',
                } as IFilterConditionFormParams);
            });
        });

        it('should execute command when "apply" is called', async () => {
            prepare(WithCustomFilterModelFactory());

            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
            } as IOpenFilterPanelOperationParams)).toBe(true);

            const filterByModel = sheetsFilterPanelService.filterByModel as ByConditionsModel;
            filterByModel.onConditionFormChange({ val1: '5' });
            expect(await filterByModel.apply());

            const filterModel = sheetsFilterService.activeFilterModel;
            expect(filterModel!.filteredOutRows).toEqual(new Set([1, 2, 3, 4, 5]));
        });
    });

    describe('test filter by values', () => {
        beforeEach(() => {
            vitest.useFakeTimers();
        });

        afterEach(() => {
            vitest.useRealTimers();
        });

        it('should initialize by filters when the filter column holds "filters"', async () => {
            prepare(WithValuesFilterModelFactory());

            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
            } as IOpenFilterPanelOperationParams)).toBeTruthy();
            await await tick();

            expect(sheetsFilterPanelService.filterBy).toBe(FilterBy.VALUES);
            const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;
            expect(filterByModel instanceof ByValuesModel).toBeTruthy();
            expect(filterByModel.filterItems).toEqual(ITEMS);
        });

        it('should initialize with blank content', async () => {
            prepare(WithValuesAndEmptyFilterModelFactory());

            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
            } as IOpenFilterPanelOperationParams)).toBeTruthy();
            await tick();

            expect(sheetsFilterPanelService.filterBy).toBe(FilterBy.VALUES);
            const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;
            expect(filterByModel instanceof ByValuesModel).toBeTruthy();
            expect(filterByModel.filterItems).toEqual(ITEMS_WITH_EMPTY);
        });

        it('should count empty cells', async () => {
            prepare(WithMultiEmptyCellsModelFactory());

            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
            } as IOpenFilterPanelOperationParams)).toBeTruthy();
            await tick();

            expect(sheetsFilterPanelService.filterBy).toBe(FilterBy.VALUES);
            const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;
            expect(filterByModel instanceof ByValuesModel).toBeTruthy();
            const filterItems = filterByModel.filterItems;
            const emptyItem = filterItems.find((item) => item.key === 'empty');
            expect(emptyItem).toEqual({
                title: 'sheets-filter.panel.empty',
                count: 4,
                leaf: true,
                checked: true,
                key: 'empty',
            });
        });

        it('should filter out the items from the panel if its row is already filtered out by other column', async () => {
            prepare(WithTwoFilterColumnsFactory());

            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 1,
            } as IOpenFilterPanelOperationParams)).toBeTruthy();
            await tick();

            expect(sheetsFilterPanelService.filterBy).toBe(FilterBy.VALUES);
            const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;
            expect(filterByModel instanceof ByValuesModel).toBeTruthy();
            const filterItems = filterByModel.filterItems;
            expect(filterItems).toEqual([
                {
                    title: 'a',
                    leaf: true,
                    checked: true,
                    key: 'a',
                    count: 1,
                },
                {
                    title: 'b',
                    leaf: true,
                    checked: true,
                    key: 'b',
                    count: 1,
                },
                {
                    title: 'c',
                    leaf: true,
                    checked: true,
                    key: 'c',
                    count: 1,
                },
                {
                    title: 'sheets-filter.panel.empty',
                    count: 3,
                    leaf: true,
                    checked: true,
                    key: 'empty',
                },
            ]);
        });

        it('merged cell should use value of the top left corner', async () => {
            prepare(WithMergedCellFilterFactory());

            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 1,
            } as IOpenFilterPanelOperationParams)).toBeTruthy();
            await tick();

            expect(sheetsFilterPanelService.filterBy).toBe(FilterBy.VALUES);
            const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;
            expect(filterByModel instanceof ByValuesModel).toBeTruthy();
            const filterItems = filterByModel.filterItems;
            expect(filterItems).toEqual([
                {
                    title: '3',
                    leaf: true,
                    checked: true,
                    key: '3',
                    count: 2,
                },
                {
                    title: 'e',
                    leaf: true,
                    checked: true,
                    key: 'e',
                    count: 1,
                },
                {
                    title: 'sheets-filter.panel.empty',
                    count: 3,
                    leaf: true,
                    checked: true,
                    key: 'empty',
                },
            ]);
        });

        it('should update the filter items when toggle checked status', async () => {
            prepare(WithValuesFilterModelFactory());

            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
            } as IOpenFilterPanelOperationParams)).toBe(true);
            await tick();

            const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;
            filterByModel.onFilterOnly([ITEMS[5].key]);
            expect(filterByModel.filterItems[0].checked).toBeFalsy();
            expect(filterByModel.filterItems[1].checked).toBeFalsy();
            expect(filterByModel.filterItems[5].checked).toBeTruthy();

            filterByModel.onCheckAllToggled(true);
            expect(countLeafNodesByCheckedStatus(filterByModel.filterItems, true)).toBe(10);

            filterByModel.onCheckAllToggled(false);
            expect(countLeafNodesByCheckedStatus(filterByModel.filterItems, true)).toBe(0);
        });

        it('should execute command when "apply" is called', async () => {
            prepare(WithValuesFilterModelFactory());

            expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                col: 0,
            } as IOpenFilterPanelOperationParams)).toBe(true);
            await tick();

            const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;
            filterByModel.onFilterCheckToggled(ITEMS[0]);
            expect(filterByModel.filterItems[0].checked).toBeFalsy();

            filterByModel.onFilterOnly([ITEMS[5].key]);
            expect(await filterByModel.apply()).toBeTruthy();

            const filterModel = sheetsFilterService.activeFilterModel;
            expect(filterModel!.filteredOutRows).toEqual(new Set([1, 10, 2, 4, 5, 6, 7, 8, 9, 10]));
        });

        describe('with searching', async () => {
            // use fake timers
            // for performance reasons, search string are throttled to change the search results
            beforeEach(() => {
                vitest.useFakeTimers();
            });

            afterEach(() => {
                vitest.useRealTimers();
            });

            it('should update the filter items when searching', async () => {
                prepare(WithValuesFilterModelFactory());

                expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    col: 0,
                } as IOpenFilterPanelOperationParams)).toBe(true);
                await tick();

                const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;

                filterByModel.setSearchString('e');
                vitest.advanceTimersByTime(600);
                expect(filterByModel.filterItems).toEqual(E_ITEMS);
            });

            it('should toggle all applied to searched results', async () => {
                prepare(WithValuesFilterModelFactory());

                expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    col: 0,
                } as IOpenFilterPanelOperationParams)).toBe(true);
                await tick();

                const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;

                filterByModel.setSearchString('e');
                vitest.advanceTimersByTime(600);
                expect(filterByModel.filterItems.length).toBe(3);
                expect(getAllLeafNodes(filterByModel.filterItems).length).toBe(7);
                filterByModel.onCheckAllToggled(true);
                expect(countLeafNodesByCheckedStatus(filterByModel.filterItems, true)).toBe(7); // the original "1" should be checked as well
            });

            it('should filter only applied to searched results', async () => {
                prepare(WithValuesFilterModelFactory());

                expect(commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    col: 0,
                } as IOpenFilterPanelOperationParams)).toBe(true);
                await tick();

                const filterByModel = sheetsFilterPanelService.filterByModel as ByValuesModel;

                filterByModel.setSearchString('e');
                vitest.advanceTimersByTime(600);
                expect(filterByModel.filterItems.length).toBe(3);
                filterByModel.onFilterOnly([filterByModel.filterItems[2].key]);
                expect(countLeafNodesByCheckedStatus(filterByModel.filterItems, true)).toBe(1); // the original "1" should be checked as well
            });
        });
    });

    describe('test behavior when filter range or filter column changes', () => {
        it('should close the panel when the filter removed or the column in not in the filter range', () => {
            // TODO@wzhudev
        });

        it('should close the panel when the active sheet changes', () => {
            // TODO@wzhudev
        });
    });
});

function tick(milliseconds: number = 0): Promise<void> {
    const result = new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
    vitest.advanceTimersByTime(milliseconds + 1);
    return result;
}
