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

import { LocaleService } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetsTableUiService } from '../../../services/sheets-table-ui-service';
import { SheetTableItemsFilterPanel } from '../SheetTableItemsFilterPanel';

const mocks = vi.hoisted(() => ({
    useDependency: vi.fn(),
    stateValues: [] as any[],
    stateCursor: 0,
}));

const design = vi.hoisted(() => ({
    Input: (_props: any) => null,
    Checkbox: (_props: any) => null,
}));

vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react');
    return {
        ...actual,
        useCallback: (fn: any) => fn,
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
    borderClassName: 'border',
    scrollbarClassName: 'scrollbar',
    clsx: (...args: any[]) => args.filter(Boolean).join(' '),
    Input: design.Input,
    Checkbox: design.Checkbox,
}));

function renderPanel(props: Parameters<typeof SheetTableItemsFilterPanel>[0]) {
    mocks.stateCursor = 0;
    return SheetTableItemsFilterPanel(props) as any;
}

function findAllByComponent(root: any, component: unknown): any[] {
    const found: any[] = [];
    const visit = (node: any) => {
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (!node || typeof node !== 'object') return;
        if (node.type === component) found.push(node);
        const children = node.props?.children;
        if (Array.isArray(children)) children.forEach(visit);
        else visit(children);
    };
    visit(root);
    return found;
}

describe('SheetTableItemsFilterPanel', () => {
    const localeService = {
        t: (key: string) => key,
    };

    beforeEach(() => {
        mocks.stateValues = [];
        mocks.stateCursor = 0;
        vi.clearAllMocks();
    });

    it('should toggle all items selection and support searching', () => {
        const items = [
            { key: '0', title: 'A' },
            { key: '1', title: 'B' },
            { key: '2', title: 'C' },
        ];
        const itemsCountMap = new Map<string, number>([
            ['A', 2],
            ['B', 1],
            ['C', 3],
        ]);
        const allItemsCount = 6;

        mocks.useDependency.mockImplementation((token: unknown) => {
            if (token === LocaleService) return localeService;
            if (token === SheetsTableUiService) {
                return {
                    getTableFilterItems: () => ({ data: items, itemsCountMap, allItemsCount }),
                };
            }
            return null;
        });

        const checkedItemSet = new Set<string>(['A', 'B', 'C']);
        const setCheckedItemSet = vi.fn();

        let tree = renderPanel({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            columnIndex: 0,
            tableFilter: undefined,
            checkedItemSet,
            setCheckedItemSet,
        });

        const [searchInput] = findAllByComponent(tree, design.Input);
        const [checkAllBox] = findAllByComponent(tree, design.Checkbox);
        expect(checkAllBox.props.checked).toBe(true);

        checkAllBox.props.onChange();
        tree = renderPanel({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            columnIndex: 0,
            tableFilter: undefined,
            checkedItemSet,
            setCheckedItemSet,
        });
        const [checkAllAfterClear] = findAllByComponent(tree, design.Checkbox);
        expect(checkAllAfterClear.props.checked).toBe(false);
        expect(setCheckedItemSet).toHaveBeenCalledWith(expect.any(Set));

        searchInput.props.onChange('b');
        tree = renderPanel({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            columnIndex: 0,
            tableFilter: undefined,
            checkedItemSet,
            setCheckedItemSet,
        });

        const checkboxesAfterSearch = findAllByComponent(tree, design.Checkbox);
        expect(checkboxesAfterSearch).toHaveLength(2);

        checkboxesAfterSearch[0].props.onChange();
        tree = renderPanel({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            columnIndex: 0,
            tableFilter: undefined,
            checkedItemSet,
            setCheckedItemSet,
        });
        const checkboxesAfterSelectAll = findAllByComponent(tree, design.Checkbox);
        expect(checkboxesAfterSelectAll[0].props.checked).toBe(true);

        searchInput.props.onChange('');
        tree = renderPanel({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            columnIndex: 0,
            tableFilter: undefined,
            checkedItemSet,
            setCheckedItemSet,
        });
        const checkboxesAfterReset = findAllByComponent(tree, design.Checkbox);
        expect(checkboxesAfterReset[0].props.checked).toBe(true);
        expect(checkboxesAfterReset).toHaveLength(4);
    });

    it('should toggle an item when partially selected', () => {
        const items = [
            { key: '0', title: 'A' },
            { key: '1', title: 'B' },
        ];
        const itemsCountMap = new Map<string, number>([
            ['A', 1],
            ['B', 2],
        ]);

        mocks.useDependency.mockImplementation((token: unknown) => {
            if (token === LocaleService) return localeService;
            if (token === SheetsTableUiService) {
                return {
                    getTableFilterItems: () => ({ data: items, itemsCountMap, allItemsCount: 3 }),
                };
            }
            return null;
        });

        const checkedItemSet = new Set<string>(['A']);
        const setCheckedItemSet = vi.fn();

        let tree = renderPanel({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            columnIndex: 0,
            tableFilter: { filterType: 1 } as any,
            checkedItemSet,
            setCheckedItemSet,
        });

        const checkboxes = findAllByComponent(tree, design.Checkbox);
        const itemB = checkboxes[2];
        expect(itemB.props.checked).toBe(false);

        itemB.props.onChange();
        tree = renderPanel({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            columnIndex: 0,
            tableFilter: { filterType: 1 } as any,
            checkedItemSet,
            setCheckedItemSet,
        });

        const checkboxesAfterToggle = findAllByComponent(tree, design.Checkbox);
        expect(checkboxesAfterToggle[2].props.checked).toBe(true);
    });
});
