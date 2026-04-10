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

/* eslint-disable ts/no-explicit-any */

import { ICommandService, IPermissionService, LocaleService } from '@univerjs/core';
import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import { SheetsTableSortStateEnum, TableColumnFilterTypeEnum, TableConditionTypeEnum, TableDateCompareTypeEnum, TableManager } from '@univerjs/sheets-table';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetsTableComponentController } from '../../../controllers/sheet-table-component.controller';
import { SheetsTableUiService } from '../../../services/sheets-table-ui-service';
import { FilterByEnum } from '../../../types';
import { SheetTableFilterPanel } from '../SheetTableFilterPanel';

const mocks = vi.hoisted(() => ({
    useDependency: vi.fn(),
    stateValues: [] as any[],
    stateCursor: 0,
}));

const design = vi.hoisted(() => ({
    Button: (_props: any) => null,
    ButtonGroup: (_props: any) => null,
    Segmented: (_props: any) => null,
}));

vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react');
    return {
        ...actual,
        useMemo: (fn: any) => fn(),
        useState: (initialValue: unknown) => {
            const index = mocks.stateCursor++;
            if (!(index in mocks.stateValues)) {
                mocks.stateValues[index] = typeof initialValue === 'function'
                    ? (initialValue as () => unknown)()
                    : initialValue;
            }
            return [
                mocks.stateValues[index],
                (value: unknown) => {
                    mocks.stateValues[index] = typeof value === 'function'
                        ? (value as (prev: unknown) => unknown)(mocks.stateValues[index])
                        : value;
                },
            ];
        },
    };
});

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        useDependency: mocks.useDependency,
    };
});

vi.mock('@univerjs/design', () => ({
    Button: design.Button,
    ButtonGroup: design.ButtonGroup,
    Segmented: design.Segmented,
    borderClassName: 'border',
    clsx: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@univerjs/icons', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/icons')>('@univerjs/icons');
    return {
        ...actual,
        AscendingIcon: () => null,
        DescendingIcon: () => null,
    };
});

vi.mock('../SheetTableItemsFilterPanel', () => ({
    SheetTableItemsFilterPanel: (props: any) => createElement('items-filter-panel', props),
}));

vi.mock('../SheetTableConditionPanel', () => ({
    SheetTableConditionPanel: (props: any) => createElement('condition-panel', props),
}));

function renderPanel() {
    mocks.stateCursor = 0;
    return SheetTableFilterPanel() as any;
}

function findAll(root: any, predicate: (node: any) => boolean): any[] {
    const found: any[] = [];
    const visit = (node: any) => {
        if (!node) return;
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (typeof node !== 'object') return;
        if (predicate(node)) found.push(node);
        const children = node.props?.children;
        if (Array.isArray(children)) children.forEach(visit);
        else visit(children);
    };
    visit(root);
    return found;
}

describe('SheetTableFilterPanel', () => {
    const localeService = {
        t: (key: string) => key,
        getCurrentLocale: () => 'en',
    };

    beforeEach(() => {
        mocks.stateValues = [];
        mocks.stateCursor = 0;
        vi.clearAllMocks();
    });

    it('should apply a manual filter and close panel', () => {
        const closeFilterPanel = vi.fn();
        const setTableFilter = vi.fn();

        mocks.useDependency.mockImplementation((token: unknown) => {
            if (token === LocaleService) return localeService;
            if (token === SheetsTableUiService) {
                return {
                    getTableFilterPanelInitProps: () => ({
                        unitId: 'u1',
                        subUnitId: 's1',
                        tableId: 't1',
                        columnIndex: 0,
                        tableFilter: undefined,
                        currentFilterBy: FilterByEnum.Items,
                    }),
                    getTableFilterItems: () => ({
                        data: [{ title: 'A' }, { title: 'B' }],
                    }),
                    getTableFilterCheckedItems: () => ['A'],
                    setTableFilter,
                };
            }
            if (token === TableManager) {
                return {
                    getTable: () => ({
                        getTableFilters: () => ({
                            getSortState: () => ({ columnIndex: -1, sortState: SheetsTableSortStateEnum.None }),
                            setSortState: vi.fn(),
                        }),
                        getTableFilterColumn: () => undefined,
                    }),
                };
            }
            if (token === ICommandService) return { executeCommand: vi.fn() };
            if (token === IPermissionService) return { getPermissionPoint: () => ({ value: false }) };
            if (token === SheetsTableComponentController) {
                return {
                    getCurrentTableFilterInfo: () => ({ unitId: 'u1', subUnitId: 's1', tableId: 't1', column: 0 }),
                    closeFilterPanel,
                };
            }
            return null;
        });

        const tree = renderPanel();
        const [confirm] = findAll(tree, (n) => n.type === design.Button && n.props?.children === 'sheets-table.filter.confirm');

        confirm.props.onClick();

        expect(setTableFilter).toHaveBeenCalledWith('u1', 't1', 0, {
            filterType: TableColumnFilterTypeEnum.manual,
            values: ['A'],
        });
        expect(closeFilterPanel).toHaveBeenCalledTimes(1);
    });

    it('should apply sort and update table sort state', () => {
        const closeFilterPanel = vi.fn();
        const setSortState = vi.fn();
        const executeCommand = vi.fn();

        mocks.useDependency.mockImplementation((token: unknown) => {
            if (token === LocaleService) return localeService;
            if (token === SheetsTableUiService) {
                return {
                    getTableFilterPanelInitProps: () => ({
                        unitId: 'u1',
                        subUnitId: 's1',
                        tableId: 't1',
                        columnIndex: 2,
                        tableFilter: undefined,
                        currentFilterBy: FilterByEnum.Items,
                    }),
                    getTableFilterItems: () => ({ data: [] }),
                    getTableFilterCheckedItems: () => [],
                    setTableFilter: vi.fn(),
                };
            }
            if (token === TableManager) {
                return {
                    getTable: () => ({
                        getTableFilters: () => ({
                            getSortState: () => ({ columnIndex: 2, sortState: SheetsTableSortStateEnum.Desc }),
                            setSortState,
                        }),
                        getTableFilterRange: () => ({ startRow: 0, endRow: 5, startColumn: 5, endColumn: 6 }),
                        getTableFilterColumn: () => undefined,
                    }),
                };
            }
            if (token === ICommandService) return { executeCommand };
            if (token === IPermissionService) return { getPermissionPoint: () => ({ value: true }) };
            if (token === SheetsTableComponentController) {
                return {
                    getCurrentTableFilterInfo: () => ({ unitId: 'u1', subUnitId: 's1', tableId: 't1', column: 0 }),
                    closeFilterPanel,
                };
            }
            return null;
        });

        const tree = renderPanel();
        const [sortAsc] = findAll(tree, (n) => n.type === design.Button && n.props?.children?.includes?.('sheets-sort.general.sort-asc'));

        sortAsc.props.onClick();

        expect(executeCommand).toHaveBeenCalledWith(SortRangeCommand.id, expect.objectContaining({
            unitId: 'u1',
            subUnitId: 's1',
            range: expect.objectContaining({ startColumn: 5 }),
            orderRules: [{ colIndex: 7, type: SortType.ASC }],
            hasTitle: false,
        }));
        expect(setSortState).toHaveBeenCalledWith(2, SheetsTableSortStateEnum.Asc);
        expect(closeFilterPanel).toHaveBeenCalledTimes(1);
    });

    it('should apply condition filter for quarter compare', () => {
        const closeFilterPanel = vi.fn();
        const setTableFilter = vi.fn();

        mocks.useDependency.mockImplementation((token: unknown) => {
            if (token === LocaleService) return localeService;
            if (token === SheetsTableUiService) {
                return {
                    getTableFilterPanelInitProps: () => ({
                        unitId: 'u1',
                        subUnitId: 's1',
                        tableId: 't1',
                        columnIndex: 0,
                        tableFilter: {
                            filterType: 'condition',
                            filterInfo: {
                                conditionType: TableConditionTypeEnum.Date,
                                compareType: TableDateCompareTypeEnum.Q2,
                            },
                        },
                        currentFilterBy: FilterByEnum.Condition,
                    }),
                    getTableFilterItems: () => ({ data: [] }),
                    getTableFilterCheckedItems: () => [],
                    setTableFilter,
                };
            }
            if (token === TableManager) {
                return {
                    getTable: () => ({
                        getTableFilters: () => ({
                            getSortState: () => ({ columnIndex: -1, sortState: SheetsTableSortStateEnum.None }),
                            setSortState: vi.fn(),
                        }),
                        getTableFilterColumn: () => undefined,
                    }),
                };
            }
            if (token === ICommandService) return { executeCommand: vi.fn() };
            if (token === IPermissionService) return { getPermissionPoint: () => ({ value: false }) };
            if (token === SheetsTableComponentController) {
                return {
                    getCurrentTableFilterInfo: () => ({ unitId: 'u1', subUnitId: 's1', tableId: 't1', column: 0 }),
                    closeFilterPanel,
                };
            }
            return null;
        });

        const tree = renderPanel();
        const [confirm] = findAll(tree, (n) => n.type === design.Button && n.props?.children === 'sheets-table.filter.confirm');

        confirm.props.onClick();

        expect(setTableFilter).toHaveBeenCalledWith('u1', 't1', 0, expect.objectContaining({
            filterType: TableColumnFilterTypeEnum.condition,
            filterInfo: expect.objectContaining({
                conditionType: TableConditionTypeEnum.Date,
                compareType: TableDateCompareTypeEnum.Q2,
            }),
        }));
        expect(closeFilterPanel).toHaveBeenCalledTimes(1);
    });
});
