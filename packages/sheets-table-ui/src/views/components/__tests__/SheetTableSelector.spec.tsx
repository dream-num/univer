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

import { IUniverInstanceService, LocaleService } from '@univerjs/core';
import { TableManager } from '@univerjs/sheets-table';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetTableSelector } from '../SheetTableSelector';

const mocks = vi.hoisted(() => ({
    useDependency: vi.fn(),
    getSheetCommandTarget: vi.fn(),
    stateValues: [] as any[],
    stateCursor: 0,
}));

vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react');
    return {
        ...actual,
        useState: (initialValue: unknown) => {
            const index = mocks.stateCursor++;
            if (!(index in mocks.stateValues)) {
                mocks.stateValues[index] = initialValue;
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

vi.mock('@univerjs/sheets-formula-ui', () => ({
    RangeSelector: (props: any) => React.createElement('range-selector', props),
}));

vi.mock('@univerjs/design', () => ({
    Button: (props: any) => React.createElement('button', props, props.children),
}));

vi.mock('@univerjs/sheets', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/sheets')>('@univerjs/sheets');
    return {
        ...actual,
        getSheetCommandTarget: mocks.getSheetCommandTarget,
    };
});

function renderSelector(props: Parameters<typeof SheetTableSelector>[0]) {
    mocks.stateCursor = 0;
    return SheetTableSelector(props) as any;
}

function getRangeSelector(tree: any) {
    return tree.props.children[0];
}

function getErrorText(tree: any) {
    const errorNode = tree.props.children[1];
    return errorNode && errorNode !== false ? errorNode.props.children : null;
}

function getButtons(tree: any) {
    return tree.props.children[2].props.children;
}

describe('SheetTableSelector', () => {
    const localeService = { t: (key: string) => key };

    const buildDependencies = (tableManagerOverrides: Record<string, unknown> = {}) => {
        const tableManager = {
            getTablesBySubunitId: () => [],
            getTableById: () => null,
            ...tableManagerOverrides,
        };

        mocks.useDependency.mockImplementation((token: unknown) => {
            if (token === TableManager) {
                return tableManager;
            }
            if (token === LocaleService) {
                return localeService;
            }
            if (token === IUniverInstanceService) {
                return { getCurrentUnitForType: vi.fn() };
            }
            return null;
        });
    };

    beforeEach(() => {
        mocks.stateValues = [];
        mocks.stateCursor = 0;
        vi.clearAllMocks();
    });

    it('should block selecting a range that overlaps merged cells or other tables', () => {
        const onConfirm = vi.fn();
        const props = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 1 },
            onConfirm,
            onCancel: vi.fn(),
        };

        buildDependencies({
            getTablesBySubunitId: () => [{ getId: () => 'table-2', getRange: () => ({ startRow: 5, endRow: 8, startColumn: 0, endColumn: 2 }) }],
        });
        mocks.getSheetCommandTarget.mockReturnValue({
            worksheet: { getMergeData: () => [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }] },
        });

        let tree = renderSelector(props);
        getRangeSelector(tree).props.onChange(undefined, 'B2:C4');
        tree = renderSelector(props);
        expect(getErrorText(tree)).toBe('sheets-table.tableRangeWithMergeError');

        getRangeSelector(tree).props.onChange(undefined, 'A6:C9');
        tree = renderSelector(props);
        expect(getErrorText(tree)).toBe('sheets-table.tableRangeWithOtherTableError');

        getButtons(tree)[1].props.onClick();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should reject invalid single-row ranges and confirm valid ranges for a new table', () => {
        const onConfirm = vi.fn();
        const onCancel = vi.fn();
        const props = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            onConfirm,
            onCancel,
        };

        buildDependencies();
        mocks.getSheetCommandTarget.mockReturnValue({ worksheet: { getMergeData: () => [] } });

        let tree = renderSelector(props);
        getRangeSelector(tree).props.onChange(undefined, 'A2:B2');
        tree = renderSelector(props);
        expect(getErrorText(tree)).toBe('sheets-table.tableRangeSingleRowError');

        getRangeSelector(tree).props.onChange(undefined, 'A2:B5');
        tree = renderSelector(props);
        getButtons(tree)[1].props.onClick();
        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: expect.objectContaining({ startRow: 1, endRow: 4, startColumn: 0, endColumn: 1 }),
        }));

        getButtons(tree)[0].props.onClick();
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should allow in-place table range updates only when keeping the header row aligned', () => {
        const onConfirm = vi.fn();
        const props = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            tableId: 'table-1',
            range: { startRow: 2, endRow: 5, startColumn: 0, endColumn: 1 },
            onConfirm,
            onCancel: vi.fn(),
        };

        buildDependencies({
            getTableById: () => ({ getRange: () => ({ startRow: 2, endRow: 5, startColumn: 0, endColumn: 1 }) }),
        });
        mocks.getSheetCommandTarget.mockReturnValue({ worksheet: { getMergeData: () => [] } });

        let tree = renderSelector(props);
        getRangeSelector(tree).props.onChange(undefined, 'A4:B8');
        tree = renderSelector(props);
        expect(getErrorText(tree)).toBe('sheets-table.updateError');

        getRangeSelector(tree).props.onChange(undefined, 'A3:B7');
        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: expect.objectContaining({ startRow: 2, endRow: 6, startColumn: 0, endColumn: 1 }),
        }));
    });
});
