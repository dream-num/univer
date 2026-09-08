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

import type { ISortRangeCommandParams } from '@univerjs/sheets-sort';
import type {
    ITableColorFilterItem,
    ITableConditionFilterItem,
    ITableManualFilterItem,
} from '@univerjs/sheets-table';
import type { LocaleKey } from '../../locale/types';
import type { ITableFilterColorList } from '../../types';
import type { IConditionInfo } from './type';
import { generateRandomId, ICommandService, IPermissionService, IUndoRedoService, LocaleService } from '@univerjs/core';
import { ActionRow, Button, ButtonGroup, Segmented } from '@univerjs/design';
import {
    AscendingIcon,
    DeleteColumnDoubleIcon,
    DescendingIcon,
    LeftInsertColumnDoubleIcon,
    RightInsertColumnDoubleIcon,
} from '@univerjs/icons';
import { WorkbookEditablePermission } from '@univerjs/sheets';
import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import {
    isManualTableFilter,
    SetSheetTableSortStateCommand,
    SheetsTableSortStateEnum,
    SheetTableInsertColumnAtCommand,
    SheetTableRemoveColumnAtCommand,
    TABLE_FILTER_EMPTY_VALUE,
    TableColumnFilterTypeEnum,
    TableDateCompareTypeEnum,
    TableManager,
} from '@univerjs/sheets-table';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';
import { SheetsTableComponentController } from '../../controllers/sheet-table-component.controller';
import { SheetsTableUiService } from '../../services/sheets-table-ui.service';
import { FilterByEnum } from '../../types';
import { SheetTableColorFilterPanel } from './SheetTableColorFilterPanel';
import { SheetTableConditionPanel } from './SheetTableConditionPanel';
import { SheetTableItemsFilterPanel } from './SheetTableItemsFilterPanel';
import { getInitConditionInfo } from './util';

const FILTER_BY_OPTIONS: Array<{ label: LocaleKey; value: FilterByEnum }> = [
    { label: 'sheets-table-ui.filter.by-values', value: FilterByEnum.Items },
    { label: 'sheets-table-ui.filter.by-colors', value: FilterByEnum.Color },
    { label: 'sheets-table-ui.filter.by-conditions', value: FilterByEnum.Condition },
];

export function SheetTableFilterPanel() {
    const localeService = useDependency(LocaleService);
    const filterByItems = FILTER_BY_OPTIONS.map((option) => ({ ...option, label: localeService.t(option.label) }));
    const tableUiService = useDependency(SheetsTableUiService);
    const tableManager = useDependency(TableManager);
    const commandService = useDependency(ICommandService);
    const permissionService = useDependency(IPermissionService);
    const undoRedoService = useDependency(IUndoRedoService);
    const sheetsTableComponentController = useDependency(SheetsTableComponentController);

    const tableFilterPanelInfo = sheetsTableComponentController.getCurrentTableFilterInfo()!;
    const panelProps = tableUiService.getTableFilterPanelInitProps(
        tableFilterPanelInfo.unitId,
        tableFilterPanelInfo.subUnitId,
        tableFilterPanelInfo.tableId,
        tableFilterPanelInfo.column
    );

    const { unitId, subUnitId, tableId, tableFilter, currentFilterBy, columnIndex } = panelProps;

    const { data } = tableUiService.getTableFilterItems(unitId, subUnitId, tableId, columnIndex);
    const checkedItems = tableUiService.getTableFilterCheckedItems(unitId, tableId, columnIndex);

    const [checkedItemSet, setCheckedItemSet] = useState<Set<string>>(() => new Set<string>(
        isManualTableFilter(tableFilter) ? checkedItems : data.map((item) => item.title)
    ));
    const [filterBy, setFilterBy] = useState(currentFilterBy || FilterByEnum.Items);

    const [conditionInfo, setConditionInfo] = useState<IConditionInfo>(() => {
        const tableFilter = panelProps.tableFilter;
        return getInitConditionInfo(tableFilter) as IConditionInfo;
    });
    const [colors, setColors] = useState<ITableFilterColorList>(
        () => tableUiService.getTableFilterColors(unitId, subUnitId, tableId, columnIndex)
    );

    const table = tableManager.getTable(unitId, tableId);
    if (!table) return null;

    const tableRange = table.getRange();
    const absoluteColumn = tableFilterPanelInfo.column;
    const canDeleteColumn = tableRange.endColumn > tableRange.startColumn;

    const closeDialog = (): void => {
        sheetsTableComponentController.closeFilterPanel();
    };
    const onCancel = () => {
        closeDialog();
    };

    const applySort = async (asc: boolean) => {
        const range = table.getTableFilterRange();
        const undoRedoGroup = undoRedoService.beginUndoRedoGroup(unitId, generateRandomId(), 'append');
        try {
            const success = await commandService.executeCommand<ISortRangeCommandParams>(SortRangeCommand.id, {
                unitId,
                subUnitId,
                range,
                orderRules: [{ colIndex: columnIndex + range.startColumn, type: asc ? SortType.ASC : SortType.DESC }],
                hasTitle: false,
            });
            if (!success) {
                return;
            }

            const sortStateSet = await commandService.executeCommand(SetSheetTableSortStateCommand.id, {
                unitId,
                tableId,
                sortInfo: {
                    columnIndex,
                    sortState: asc ? SheetsTableSortStateEnum.Asc : SheetsTableSortStateEnum.Desc,
                },
            });
            if (sortStateSet) {
                closeDialog();
            }
        } finally {
            undoRedoGroup.dispose();
        }
    };

    const insertColumn = async (side: 'left' | 'right') => {
        const success = await commandService.executeCommand(SheetTableInsertColumnAtCommand.id, {
            unitId,
            subUnitId,
            tableId,
            index: side === 'left' ? absoluteColumn : absoluteColumn + 1,
            count: 1,
        });
        if (success) {
            closeDialog();
        }
    };

    const deleteColumn = async () => {
        if (!canDeleteColumn) {
            return;
        }

        const success = await commandService.executeCommand(SheetTableRemoveColumnAtCommand.id, {
            unitId,
            subUnitId,
            tableId,
            index: absoluteColumn,
            count: 1,
        });
        if (success) {
            closeDialog();
        }
    };

    const onApply = async () => {
        let filter: ITableColorFilterItem | ITableConditionFilterItem | ITableManualFilterItem | undefined;
        if (filterBy === FilterByEnum.Items) {
            // do items
            const filteredItems: string[] = [];
            const emptyLabel = localeService.t<LocaleKey>('sheets-table-ui.condition.empty');
            for (const itemInfo of data) {
                if (checkedItemSet.has(itemInfo.title)) {
                    filteredItems.push(itemInfo.title === emptyLabel ? TABLE_FILTER_EMPTY_VALUE : itemInfo.title);
                }
            }
            const originFilter = table.getTableFilterColumn(columnIndex);
            if (isManualTableFilter(originFilter)) {
                const originValue = originFilter.values;
                if (originValue.join(',') === filteredItems.join(',')) {
                    closeDialog();
                    return;
                }
            } else if (filteredItems.length === data.length && !originFilter) {
                closeDialog();
                return;
            }
            filter = filteredItems.length === data.length
                ? undefined
                : {
                    filterType: TableColumnFilterTypeEnum.manual,
                    values: filteredItems,
                };
        } else if (filterBy === FilterByEnum.Color) {
            const cellFillColors = colors.cellFillColors.filter((item) => item.checked).map((item) => item.color);
            const cellTextColors = colors.cellTextColors.filter((item) => item.checked).map((item) => item.color);
            if (cellFillColors.length) {
                filter = { filterType: TableColumnFilterTypeEnum.color, cellFillColors };
            } else if (cellTextColors.length) {
                filter = { filterType: TableColumnFilterTypeEnum.color, cellTextColors };
            }
        } else {
            let filterInfo;
            if (conditionInfo.compare === TableDateCompareTypeEnum.Quarter || conditionInfo.compare === TableDateCompareTypeEnum.Month) {
                filterInfo = {
                    conditionType: conditionInfo.type,
                    compareType: Object.values(conditionInfo.info)[0],
                };
            } else {
                filterInfo = {
                    conditionType: conditionInfo.type,
                    compareType: conditionInfo.compare,
                    expectedValue: Object.values(conditionInfo.info)[0],
                };
            }
            filter = {
                filterType: TableColumnFilterTypeEnum.condition,
                // @ts-ignore
                filterInfo,
            };
        }
        const success = await tableUiService.setTableFilter(unitId, tableId, columnIndex, filter);
        if (success) {
            closeDialog();
        }
    };
    const onClearFilter = async () => {
        const success = await tableUiService.setTableFilter(unitId, tableId, columnIndex, undefined);
        if (success) {
            closeDialog();
        }
    };

    const workbookEditableId = new WorkbookEditablePermission(unitId).id;
    const editable = permissionService.getPermissionPoint(workbookEditableId)?.value;

    return (
        <div
            className={`
              univer-box-border univer-flex univer-w-[400px] univer-flex-col univer-rounded-[10px] univer-bg-gray-0
              univer-p-4 univer-shadow-lg
              dark:!univer-border-gray-600 dark:!univer-bg-gray-700
            `}
        >
            {editable && (
                <>
                    <div
                        className={`
                          -univer-mx-4 -univer-mt-2 univer-mb-3 univer-border-0 univer-border-b univer-border-solid
                          univer-border-gray-200 univer-py-1
                        `}
                    >
                        <button
                            type="button"
                            className={`
                              univer-box-border univer-flex univer-h-10 univer-w-full univer-cursor-pointer
                              univer-items-center univer-gap-3 univer-border-none univer-bg-transparent univer-px-4
                              univer-text-left univer-text-sm univer-text-gray-900
                              hover:univer-bg-gray-100
                              disabled:univer-cursor-not-allowed disabled:univer-text-gray-400
                              dark:!univer-text-gray-0
                              dark:hover:!univer-bg-gray-600
                            `}
                            onClick={() => insertColumn('left').catch(() => undefined)}
                        >
                            <LeftInsertColumnDoubleIcon className="univer-size-5" extend={{ colorChannel1: 'var(--univer-primary-600)' }} />
                            <span>{localeService.t<LocaleKey>('sheets-table-ui.columnMenu.insert-left')}</span>
                        </button>
                        <button
                            type="button"
                            className={`
                              univer-box-border univer-flex univer-h-10 univer-w-full univer-cursor-pointer
                              univer-items-center univer-gap-3 univer-border-none univer-bg-transparent univer-px-4
                              univer-text-left univer-text-sm univer-text-gray-900
                              hover:univer-bg-gray-100
                              disabled:univer-cursor-not-allowed disabled:univer-text-gray-400
                              dark:!univer-text-gray-0
                              dark:hover:!univer-bg-gray-600
                            `}
                            onClick={() => insertColumn('right').catch(() => undefined)}
                        >
                            <RightInsertColumnDoubleIcon className="univer-size-5" extend={{ colorChannel1: 'var(--univer-primary-600)' }} />
                            <span>{localeService.t<LocaleKey>('sheets-table-ui.columnMenu.insert-right')}</span>
                        </button>
                        <button
                            type="button"
                            className={`
                              univer-box-border univer-flex univer-h-10 univer-w-full univer-cursor-pointer
                              univer-items-center univer-gap-3 univer-border-none univer-bg-transparent univer-px-4
                              univer-text-left univer-text-sm univer-text-gray-900
                              hover:univer-bg-gray-100
                              disabled:univer-cursor-not-allowed disabled:univer-text-gray-400
                              dark:!univer-text-gray-0
                              dark:hover:!univer-bg-gray-600
                            `}
                            disabled={!canDeleteColumn}
                            onClick={() => deleteColumn().catch(() => undefined)}
                        >
                            <DeleteColumnDoubleIcon className="univer-size-5" extend={{ colorChannel1: 'var(--univer-primary-600)' }} />
                            <span>{localeService.t<LocaleKey>('sheets-table-ui.columnMenu.delete')}</span>
                        </button>
                    </div>
                    <div className="univer-mb-3 univer-flex">
                        <ButtonGroup className="univer-mb-3 !univer-flex univer-w-full">
                            <Button className="univer-w-1/2" onClick={() => applySort(true).catch(() => undefined)}>
                                <AscendingIcon className="univer-mr-1" />
                                {localeService.t<LocaleKey>('sheets-table-ui.sort.sort-asc')}
                            </Button>
                            <Button className="univer-w-1/2" onClick={() => applySort(false).catch(() => undefined)}>
                                <DescendingIcon className="univer-mr-1" />
                                {localeService.t<LocaleKey>('sheets-table-ui.sort.sort-desc')}
                            </Button>
                        </ButtonGroup>
                    </div>
                </>
            )}
            <div className="univer-w-full">
                <Segmented
                    value={filterBy}
                    items={filterByItems}
                    onChange={(value) => setFilterBy(value as FilterByEnum)}
                />
            </div>
            <div className="univer-z-10 univer-h-60">
                <div className="univer-mt-3 univer-size-full">
                    {filterBy === FilterByEnum.Items && (
                        <SheetTableItemsFilterPanel
                            tableFilter={tableFilter}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            tableId={tableId}
                            columnIndex={columnIndex}
                            checkedItemSet={checkedItemSet}
                            setCheckedItemSet={setCheckedItemSet}
                        />
                    )}
                    {filterBy === FilterByEnum.Color && (
                        <SheetTableColorFilterPanel colors={colors} onChange={setColors} />
                    )}
                    {filterBy === FilterByEnum.Condition && (
                        <SheetTableConditionPanel
                            tableFilter={tableFilter}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            tableId={tableId}
                            columnIndex={columnIndex}
                            conditionInfo={conditionInfo}
                            onChange={setConditionInfo}
                        />
                    )}
                </div>
            </div>
            <ActionRow
                className={`
                  univer-flex-wrap-nowrap univer-mt-4 univer-inline-flex univer-flex-shrink-0 univer-flex-grow-0
                  univer-justify-between univer-gap-6 univer-overflow-hidden
                `}
            >
                <Button
                    disabled={tableFilter === undefined}
                    onClick={() => onClearFilter().catch(() => undefined)}
                >
                    {localeService.t<LocaleKey>('sheets-table-ui.filter.clear-filter')}
                </Button>
                <ActionRow className="univer-flex univer-flex-1 univer-gap-x-2">
                    <Button onClick={onCancel}>{localeService.t<LocaleKey>('sheets-table-ui.filter.cancel')}</Button>
                    <Button variant="primary" onClick={() => onApply().catch(() => undefined)}>
                        {localeService.t<LocaleKey>('sheets-table-ui.filter.confirm')}
                    </Button>
                </ActionRow>
            </ActionRow>
        </div>
    );
}
