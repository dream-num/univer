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
import type { ITableConditionFilterItem, ITableManualFilterItem } from '@univerjs/sheets-table';
import type { LocaleKey } from '../../locale/types';
import type { IConditionInfo } from './type';
import { ICommandService, IPermissionService, LocaleService } from '@univerjs/core';
import { Button, ButtonGroup, Segmented } from '@univerjs/design';
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
import { SheetTableConditionPanel } from './SheetTableConditionPanel';
import { SheetTableItemsFilterPanel } from './SheetTableItemsFilterPanel';
import { getInitConditionInfo } from './util';

const FILTER_BY_OPTIONS: Array<{ label: LocaleKey; value: FilterByEnum }> = [
    { label: 'sheets-table-ui.filter.by-values', value: FilterByEnum.Items },
    { label: 'sheets-table-ui.filter.by-conditions', value: FilterByEnum.Condition },
];

export function SheetTableFilterPanel() {
    const localeService = useDependency(LocaleService);
    const filterByItems = FILTER_BY_OPTIONS.map((option) => ({ ...option, label: localeService.t(option.label) }));
    const tableUiService = useDependency(SheetsTableUiService);
    const tableManager = useDependency(TableManager);
    const commandService = useDependency(ICommandService);
    const permissionService = useDependency(IPermissionService);
    const sheetsTableComponentController = useDependency(SheetsTableComponentController);

    const tableFilterPanelInfo = sheetsTableComponentController.getCurrentTableFilterInfo()!;
    const props = tableUiService.getTableFilterPanelInitProps(
        tableFilterPanelInfo.unitId,
        tableFilterPanelInfo.subUnitId,
        tableFilterPanelInfo.tableId,
        tableFilterPanelInfo.column
    );

    const { unitId, subUnitId, tableId, tableFilter, currentFilterBy, columnIndex } = props;

    const { data } = tableUiService.getTableFilterItems(unitId, subUnitId, tableId, columnIndex);
    const checkedItems = tableUiService.getTableFilterCheckedItems(unitId, tableId, columnIndex);

    const [checkedItemSet, setCheckedItemSet] = useState<Set<string>>(() => new Set<string>(checkedItems));
    const [filterBy, setFilterBy] = useState(currentFilterBy || FilterByEnum.Items);

    const [conditionInfo, setConditionInfo] = useState<IConditionInfo>(() => {
        const tableFilter = props.tableFilter;
        return getInitConditionInfo(tableFilter) as IConditionInfo;
    });

    const table = tableManager.getTable(unitId, tableId);
    if (!table) return null;

    const tableFilters = table.getTableFilters();
    const tableRange = table.getRange();
    const sortState = tableFilters.getSortState();
    const isAsc = sortState.columnIndex === columnIndex && sortState.sortState === SheetsTableSortStateEnum.Asc;
    const isDesc = sortState.columnIndex === columnIndex && sortState.sortState === SheetsTableSortStateEnum.Desc;
    const absoluteColumn = tableFilterPanelInfo.column;
    const canDeleteColumn = tableRange.endColumn > tableRange.startColumn;

    const closeDialog = (): void => {
        sheetsTableComponentController.closeFilterPanel();
    };
    const onCancel = () => {
        closeDialog();
    };

    const applySort = (asc: boolean) => {
        const range = table.getTableFilterRange();

        commandService.executeCommand<ISortRangeCommandParams>(SortRangeCommand.id, {
            unitId,
            subUnitId,
            range,
            orderRules: [{ colIndex: columnIndex + range.startColumn, type: asc ? SortType.ASC : SortType.DESC }],
            hasTitle: false,
        });

        tableFilters.setSortState(columnIndex, asc ? SheetsTableSortStateEnum.Asc : SheetsTableSortStateEnum.Desc);
        closeDialog();
    };

    const insertColumn = (side: 'left' | 'right') => {
        commandService.executeCommand(SheetTableInsertColumnAtCommand.id, {
            unitId,
            subUnitId,
            tableId,
            index: side === 'left' ? absoluteColumn : absoluteColumn + 1,
            count: 1,
        });
        closeDialog();
    };

    const deleteColumn = () => {
        if (!canDeleteColumn) {
            return;
        }

        commandService.executeCommand(SheetTableRemoveColumnAtCommand.id, {
            unitId,
            subUnitId,
            tableId,
            index: absoluteColumn,
            count: 1,
        });
        closeDialog();
    };

    const onApply = () => {
        if (filterBy === FilterByEnum.Items) {
            // do items
            const filteredItems: string[] = [];
            const emptyLabel = localeService.t<LocaleKey>('sheets-table-ui.condition.empty');
            for (const itemInfo of data) {
                if (checkedItemSet.has(itemInfo.title)) {
                    filteredItems.push(itemInfo.title === emptyLabel ? TABLE_FILTER_EMPTY_VALUE : itemInfo.title);
                }
            }
            const originFilter = table.getTableFilterColumn(columnIndex) as ITableManualFilterItem | undefined;
            if (originFilter) {
                const originValue = originFilter.values;
                if (originValue.join(',') === filteredItems.join(',')) {
                    closeDialog();
                    return;
                }
            } else if (filteredItems.length === 0) {
                closeDialog();
                return;
            }
            const tableFilter: ITableManualFilterItem = {
                filterType: TableColumnFilterTypeEnum.manual,
                values: filteredItems,
            };
            tableUiService.setTableFilter(unitId, tableId, columnIndex, tableFilter);
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
            const tableFilter: ITableConditionFilterItem = {
                filterType: TableColumnFilterTypeEnum.condition,
                // @ts-ignore
                filterInfo,
            };
            tableUiService.setTableFilter(unitId, tableId, columnIndex, tableFilter);
        }
        closeDialog();
    };
    const onClearFilter = () => {
        tableUiService.setTableFilter(unitId, tableId, columnIndex, undefined);
        closeDialog();
    };

    const workbookEditableId = new WorkbookEditablePermission(unitId).id;
    const editable = permissionService.getPermissionPoint(workbookEditableId)?.value;

    return (
        <div
            className={`
              univer-box-border univer-flex univer-w-[400px] univer-flex-col univer-rounded-[10px] univer-bg-white
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
                              dark:!univer-text-white
                              dark:hover:!univer-bg-gray-600
                            `}
                            onClick={() => insertColumn('left')}
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
                              dark:!univer-text-white
                              dark:hover:!univer-bg-gray-600
                            `}
                            onClick={() => insertColumn('right')}
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
                              dark:!univer-text-white
                              dark:hover:!univer-bg-gray-600
                            `}
                            disabled={!canDeleteColumn}
                            onClick={deleteColumn}
                        >
                            <DeleteColumnDoubleIcon className="univer-size-5" extend={{ colorChannel1: 'var(--univer-primary-600)' }} />
                            <span>{localeService.t<LocaleKey>('sheets-table-ui.columnMenu.delete')}</span>
                        </button>
                    </div>
                    <div className="univer-mb-3 univer-flex">
                        <ButtonGroup className="univer-mb-3 !univer-flex univer-w-full">
                            <Button className="univer-w-1/2" onClick={() => applySort(true)}>
                                <AscendingIcon className="univer-mr-1" />
                                {localeService.t<LocaleKey>('sheets-table-ui.sort.sort-asc')}
                            </Button>
                            <Button className="univer-w-1/2" onClick={() => applySort(false)}>
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
                    {filterBy === FilterByEnum.Items
                        ? (
                            <SheetTableItemsFilterPanel
                                tableFilter={tableFilter}
                                unitId={unitId}
                                subUnitId={subUnitId}
                                tableId={tableId}
                                columnIndex={columnIndex}
                                checkedItemSet={checkedItemSet}
                                setCheckedItemSet={setCheckedItemSet}
                            />
                        )
                        : (
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
            <div
                className={`
                  univer-flex-wrap-nowrap univer-mt-4 univer-inline-flex univer-flex-shrink-0 univer-flex-grow-0
                  univer-justify-between univer-gap-6 univer-overflow-hidden
                `}
            >
                <Button
                    disabled={tableFilter === undefined}
                    onClick={onClearFilter}
                >
                    {localeService.t<LocaleKey>('sheets-table-ui.filter.clear-filter')}
                </Button>
                <div>
                    <Button className="univer-mr-2" onClick={onCancel}>{localeService.t<LocaleKey>('sheets-table-ui.filter.cancel')}</Button>
                    <Button variant="primary" onClick={onApply}>{localeService.t<LocaleKey>('sheets-table-ui.filter.confirm')}</Button>
                </div>
            </div>
        </div>
    );
}
