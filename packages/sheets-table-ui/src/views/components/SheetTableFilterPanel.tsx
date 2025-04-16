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
import type { IConditionInfo } from './type';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Button, Segmented } from '@univerjs/design';
import { AscendingSingle, DescendingSingle } from '@univerjs/icons';
import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import { SheetsTableSortStateEnum, TableColumnFilterTypeEnum, TableDateCompareTypeEnum, TableManager } from '@univerjs/sheets-table';
import { useDependency } from '@univerjs/ui';
import { useMemo, useState } from 'react';
import { SheetsTableComponentController } from '../../controllers/sheet-table-component.controller';
import { SheetsTableUiService } from '../../services/sheets-table-ui-service';
import { FilterByEnum } from '../../types';
import { SheetTableConditionPanel } from './SheetTableConditionPanel';
import { SheetTableItemsFilterPanel } from './SheetTableItemsFilterPanel';
import { getInitConditionInfo } from './util';

export function SheetTableFilterPanel() {
    const localeService = useDependency(LocaleService);
    const filterByItems = useFilterByOptions(localeService);
    const tableUiService = useDependency(SheetsTableUiService);
    const tableManager = useDependency(TableManager);
    const commandService = useDependency(ICommandService);
    const sheetsTableComponentController = useDependency(SheetsTableComponentController);

    const tableFilterPanelInfo = sheetsTableComponentController.getCurrentTableFilterInfo()!;
    const props = tableUiService.getTableFilterPanelInitProps(tableFilterPanelInfo.unitId, tableFilterPanelInfo.subUnitId, tableFilterPanelInfo.tableId, tableFilterPanelInfo.column);

    const { unitId, subUnitId, tableId, tableFilter, currentFilterBy, columnIndex } = props;

    const { data } = tableUiService.getTableFilterItems(unitId, subUnitId, tableId, columnIndex);
    const checkedItems = tableUiService.getTableFilterCheckedItems(unitId, tableId, columnIndex);

    const [checkedItemSet, setCheckedItemSet] = useState<Set<string>>(new Set<string>(checkedItems));
    const [filterBy, setFilterBy] = useState(currentFilterBy || FilterByEnum.Items);

    const [conditionInfo, setConditionInfo] = useState<IConditionInfo>(() => {
        const tableFilter = props.tableFilter;
        return getInitConditionInfo(tableFilter) as IConditionInfo;
    });

    const table = tableManager.getTable(unitId, tableId);
    if (!table) return null;

    const tableFilters = table.getTableFilters();
    const sortState = tableFilters.getSortState();
    const isAsc = sortState.columnIndex === columnIndex && sortState.sortState === SheetsTableSortStateEnum.Asc;
    const isDesc = sortState.columnIndex === columnIndex && sortState.sortState === SheetsTableSortStateEnum.Desc;

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

    const onApply = () => {
        if (filterBy === FilterByEnum.Items) {
            // do items
            const filteredItems: string[] = [];
            for (const itemInfo of data) {
                if (checkedItemSet.has(itemInfo.title)) {
                    filteredItems.push(itemInfo.title);
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

    return (
        <div
            className={`
              univer-box-border univer-flex univer-w-[312px] univer-flex-col univer-rounded-[10px] univer-bg-white
              univer-p-[16px] univer-shadow-lg
            `}
        >
            <div className="univer-mb-3 univer-flex">
                <div
                    className={`
                      univer-flex univer-w-[140px] univer-flex-1 univer-cursor-default univer-items-center
                      univer-justify-center univer-gap-[4px] univer-rounded-l-md univer-border univer-border-solid
                      univer-border-gray-200 univer-py-1.5 univer-text-[13px] univer-font-normal
                      hover:univer-cursor-pointer hover:univer-bg-gray-100
                      ${isAsc
            ? 'univer-bg-gray-100'
            : ''}
                    `}
                    onClick={() => applySort(true)}
                >
                    <AscendingSingle className="univer-text-base univer-text-color-[#1e222b] univer-mr-1" />
                    {localeService.t('sheets-sort.general.sort-asc')}
                </div>
                <div
                    className={`
                      univer-flex univer-w-[140px] univer-flex-1 univer-cursor-default univer-items-center
                      univer-justify-center univer-gap-[4px] univer-rounded-r-md univer-border univer-border-solid
                      univer-border-gray-200 univer-py-1.5 univer-text-[13px] univer-font-normal
                      hover:univer-cursor-pointer hover:univer-bg-gray-100
                      ${isDesc
            ? 'univer-bg-gray-100'
            : ''}
                    `}
                    onClick={() => applySort(false)}
                >
                    <DescendingSingle className="univer-text-base univer-text-color-[#1e222b] univer-mr-1" />
                    {localeService.t('sheets-sort.general.sort-desc')}
                </div>

            </div>
            <div className="univer-table-filter-panel-header">
                <Segmented
                    value={filterBy}
                    items={filterByItems}
                    onChange={(value) => setFilterBy(value as FilterByEnum)}
                />
            </div>
            <div className="univer-table-filter-panel-body univer-z-10">
                <div className="univer-table-filter-panel-body-content univer-mt-3 univer-h-60">
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
                  univer-mt-4 univer-inline-flex univer-flex-shrink-0 univer-flex-grow-0 univer-flex-wrap-nowrap
                  univer-justify-between univer-overflow-hidden
                `}
            >
                <Button
                    type="link"
                    disabled={tableFilter === undefined}
                    onClick={onClearFilter}
                >
                    {localeService.t('sheets-filter.panel.clear-filter')}
                </Button>
                <span>
                    <Button type="default" onClick={onCancel}>{localeService.t('sheets-filter.panel.cancel')}</Button>
                    <Button className="univer-ml-2" type="primary" onClick={onApply}>{localeService.t('sheets-filter.panel.confirm')}</Button>
                </span>
            </div>
        </div>
    );
}

function useFilterByOptions(localeService: LocaleService) {
    const locale = localeService.getCurrentLocale();
    return useMemo(() => [
        { label: localeService.t('sheets-filter.panel.by-values'), value: FilterByEnum.Items },
        { label: localeService.t('sheets-filter.panel.by-conditions'), value: FilterByEnum.Condition },
    ], [locale, localeService]);
}
