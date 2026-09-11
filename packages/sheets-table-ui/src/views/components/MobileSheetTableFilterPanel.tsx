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
import type { MobileDrawerSnap } from '@univerjs/ui';
import type { ITableFilterPanelInfo } from '../../controllers/sheet-table-component.controller';
import type { LocaleKey } from '../../locale/types';
import type { ITableFilterColorList } from '../../types';
import type { IConditionInfo } from './type';
import { generateRandomId, ICommandService, IPermissionService, IUndoRedoService, LocaleService } from '@univerjs/core';
import { Button, MobileActionRow, MobileActionRowGroup, resetButtonClassName } from '@univerjs/design';
import {
    AscendingIcon,
    DeleteColumnDoubleIcon,
    DescendingIcon,
    LeftInsertColumnDoubleIcon,
    MoreLeftIcon,
    MoreRightIcon,
    RightInsertColumnDoubleIcon,
} from '@univerjs/icons';
import { WorkbookEditablePermission } from '@univerjs/sheets';
import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import {
    SetSheetTableSortStateCommand,
    SheetsTableSortStateEnum,
    SheetTableInsertColumnAtCommand,
    SheetTableRemoveColumnAtCommand,
    TABLE_FILTER_EMPTY_VALUE,
    TableColumnFilterTypeEnum,
    TableDateCompareTypeEnum,
    TableManager,
} from '@univerjs/sheets-table';
import { MobileDrawer, useDependency } from '@univerjs/ui';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SheetsTableMobileComponentController } from '../../controllers/mobile/sheet-table-component.controller';
import { SheetsTableUiService } from '../../services/sheets-table-ui.service';
import { FilterByEnum } from '../../types';
import { MobileSheetTableColorFilterPanel } from './MobileSheetTableColorFilterPanel';
import { MobileSheetTableConditionPanel } from './MobileSheetTableConditionPanel';
import { MobileSheetTableItemsFilterPanel } from './MobileSheetTableItemsFilterPanel';
import { getInitConditionInfo } from './util';

const FILTER_BY_OPTIONS: Array<{ label: LocaleKey; value: FilterByEnum }> = [
    { label: 'sheets-table-ui.filter.by-values', value: FilterByEnum.Items },
    { label: 'sheets-table-ui.filter.by-colors', value: FilterByEnum.Color },
    { label: 'sheets-table-ui.filter.by-conditions', value: FilterByEnum.Condition },
];

export function MobileSheetTableFilterPanel() {
    const sheetsTableComponentController = useDependency(SheetsTableMobileComponentController);
    const tableFilterPanelInfo = sheetsTableComponentController.getCurrentTableFilterInfo();
    if (!tableFilterPanelInfo) {
        return null;
    }

    return <MobileSheetTableFilterPanelContent tableFilterPanelInfo={tableFilterPanelInfo} />;
}

interface IMobileSheetTableFilterPanelContentProps {
    tableFilterPanelInfo: ITableFilterPanelInfo;
}

function MobileSheetTableFilterPanelContent(props: IMobileSheetTableFilterPanelContentProps) {
    const { tableFilterPanelInfo } = props;
    const localeService = useDependency(LocaleService);
    const tableUiService = useDependency(SheetsTableUiService);
    const tableManager = useDependency(TableManager);
    const commandService = useDependency(ICommandService);
    const permissionService = useDependency(IPermissionService);
    const undoRedoService = useDependency(IUndoRedoService);
    const sheetsTableComponentController = useDependency(SheetsTableMobileComponentController);
    const [detailFilterBy, setDetailFilterBy] = useState<FilterByEnum | null>(null);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('expanded');
    const layerRef = useRef<HTMLDivElement>(null);

    const panelProps = tableUiService.getTableFilterPanelInitProps(
        tableFilterPanelInfo.unitId,
        tableFilterPanelInfo.subUnitId,
        tableFilterPanelInfo.tableId,
        tableFilterPanelInfo.column
    );
    const { unitId, subUnitId, tableId, tableFilter, columnIndex } = panelProps;
    const currentTable = tableManager.getTable(unitId, tableId)!;

    const items = tableUiService.getTableFilterItems(unitId, subUnitId, tableId, columnIndex);
    const checkedItems = tableUiService.getTableFilterCheckedItems(unitId, tableId, columnIndex);
    const [checkedItemSet, setCheckedItemSet] = useState<Set<string>>(() => new Set(
        tableFilter?.filterType === TableColumnFilterTypeEnum.manual
            ? checkedItems
            : items.data.map((item) => item.title)
    ));
    const [conditionInfo, setConditionInfo] = useState<IConditionInfo>(
        () => getInitConditionInfo(tableFilter) as IConditionInfo
    );
    const [colors, setColors] = useState<ITableFilterColorList>(
        () => tableUiService.getTableFilterColors(unitId, subUnitId, tableId, columnIndex)
    );
    const tableRange = currentTable.getRange();
    const canDeleteColumn = tableRange.endColumn > tableRange.startColumn;
    const absoluteColumn = tableFilterPanelInfo.column;
    const editable = permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value;

    function closePanel() {
        sheetsTableComponentController.closeFilterPanel();
    }

    async function applySort(ascending: boolean) {
        const range = currentTable.getTableFilterRange();
        const undoRedoGroup = undoRedoService.beginUndoRedoGroup(unitId, generateRandomId(), 'append');
        try {
            const success = await commandService.executeCommand<ISortRangeCommandParams>(SortRangeCommand.id, {
                unitId,
                subUnitId,
                range,
                orderRules: [{ colIndex: columnIndex + range.startColumn, type: ascending ? SortType.ASC : SortType.DESC }],
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
                    sortState: ascending ? SheetsTableSortStateEnum.Asc : SheetsTableSortStateEnum.Desc,
                },
            });
            if (sortStateSet) {
                closePanel();
            }
        } finally {
            undoRedoGroup.dispose();
        }
    }

    async function insertColumn(side: 'left' | 'right') {
        const success = await commandService.executeCommand(SheetTableInsertColumnAtCommand.id, {
            unitId,
            subUnitId,
            tableId,
            index: side === 'left' ? absoluteColumn : absoluteColumn + 1,
            count: 1,
        });
        if (success) {
            closePanel();
        }
    }

    async function deleteColumn() {
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
            closePanel();
        }
    }

    async function applyFilter() {
        let filter: ITableColorFilterItem | ITableConditionFilterItem | ITableManualFilterItem | undefined;
        if (detailFilterBy === FilterByEnum.Items) {
            const emptyLabel = localeService.t<LocaleKey>('sheets-table-ui.condition.empty');
            const values = items.data
                .filter((item) => checkedItemSet.has(item.title))
                .map((item) => item.title === emptyLabel ? TABLE_FILTER_EMPTY_VALUE : item.title);
            filter = values.length === items.data.length
                ? undefined
                : { filterType: TableColumnFilterTypeEnum.manual, values } satisfies ITableManualFilterItem;
        } else if (detailFilterBy === FilterByEnum.Color) {
            const cellFillColors = colors.cellFillColors.filter((item) => item.checked).map((item) => item.color);
            const cellTextColors = colors.cellTextColors.filter((item) => item.checked).map((item) => item.color);
            if (cellFillColors.length) {
                filter = { filterType: TableColumnFilterTypeEnum.color, cellFillColors } satisfies ITableColorFilterItem;
            } else if (cellTextColors.length) {
                filter = { filterType: TableColumnFilterTypeEnum.color, cellTextColors } satisfies ITableColorFilterItem;
            }
        } else if (detailFilterBy === FilterByEnum.Condition) {
            const dynamicCompare = conditionInfo.compare === TableDateCompareTypeEnum.Quarter
                || conditionInfo.compare === TableDateCompareTypeEnum.Month;
            filter = {
                filterType: TableColumnFilterTypeEnum.condition,
                filterInfo: {
                    conditionType: conditionInfo.type,
                    compareType: dynamicCompare
                        ? Object.values(conditionInfo.info)[0] as IConditionInfo['compare']
                        : conditionInfo.compare,
                    expectedValue: dynamicCompare ? undefined : Object.values(conditionInfo.info)[0],
                } as ITableConditionFilterItem['filterInfo'],
            } satisfies ITableConditionFilterItem;
        } else {
            return;
        }

        const success = await tableUiService.setTableFilter(unitId, tableId, columnIndex, filter);
        if (success) {
            closePanel();
        }
    }

    async function clearFilter() {
        const success = await tableUiService.setTableFilter(unitId, tableId, columnIndex, undefined);
        if (success) {
            closePanel();
        }
    }

    function openDetail(filterBy: FilterByEnum) {
        if (filterBy === FilterByEnum.Items) {
            setCheckedItemSet(new Set(
                tableFilter?.filterType === TableColumnFilterTypeEnum.manual
                    ? checkedItems
                    : items.data.map((item) => item.title)
            ));
        } else if (filterBy === FilterByEnum.Color) {
            setColors(tableUiService.getTableFilterColors(unitId, subUnitId, tableId, columnIndex));
        } else if (filterBy === FilterByEnum.Condition) {
            setConditionInfo(getInitConditionInfo(tableFilter) as IConditionInfo);
        }
        setDetailFilterBy(filterBy);
        setDrawerSnap('expanded');
    }

    function closeDetail() {
        setDetailFilterBy(null);
    }

    const detailOption = FILTER_BY_OPTIONS.find((option) => option.value === detailFilterBy);
    const detailTitle = detailOption ? localeService.t<LocaleKey>(detailOption.label) : '';
    const detailDrawer = detailFilterBy
        ? createPortal(
            <div ref={layerRef} className="univer-pointer-events-none univer-fixed univer-inset-0 univer-z-[1300]">
                <MobileDrawer
                    layerRef={layerRef}
                    componentName="mobile-sheet-table-filter-detail"
                    openMode="push"
                    snap={drawerSnap}
                    expandLabel={localeService.t<LocaleKey>('sheets-table-ui.filter.resize')}
                    collapseLabel={localeService.t<LocaleKey>('sheets-table-ui.filter.resize')}
                    onSnapChange={setDrawerSnap}
                    onClose={closeDetail}
                    role="dialog"
                    ariaLabel={detailTitle}
                    panelClassName="univer-pointer-events-auto"
                    contentClassName="univer-min-h-0 univer-px-4 univer-pb-4"
                    header={(
                        <header
                            className="
                              univer-grid univer-h-12 univer-flex-1 univer-grid-cols-[48px_1fr_48px] univer-items-center
                            "
                        >
                            <button
                                type="button"
                                aria-label={localeService.t<LocaleKey>('sheets-table-ui.filter.back')}
                                className={`
                                  ${resetButtonClassName}
                                  univer-flex univer-size-12 univer-items-center univer-justify-center
                                `}
                                onClick={closeDetail}
                            >
                                <MoreLeftIcon className="univer-size-6" />
                            </button>
                            <div className="univer-truncate univer-text-center univer-text-base univer-font-semibold">
                                {detailTitle}
                            </div>
                        </header>
                    )}
                    footer={(
                        <footer
                            className="
                              univer-shrink-0 univer-border-0 univer-border-t univer-border-solid univer-border-gray-200
                              univer-p-4
                              dark:!univer-border-gray-700
                            "
                        >
                            <MobileActionRowGroup>
                                <Button onClick={closeDetail}>
                                    {localeService.t<LocaleKey>('sheets-table-ui.filter.cancel')}
                                </Button>
                                <Button variant="primary" onClick={() => applyFilter().catch(() => undefined)}>
                                    {localeService.t<LocaleKey>('sheets-table-ui.filter.confirm')}
                                </Button>
                            </MobileActionRowGroup>
                        </footer>
                    )}
                >
                    {detailFilterBy === FilterByEnum.Items && (
                        <MobileSheetTableItemsFilterPanel
                            items={items}
                            checkedItemSet={checkedItemSet}
                            setCheckedItemSet={setCheckedItemSet}
                        />
                    )}
                    {detailFilterBy === FilterByEnum.Color && (
                        <MobileSheetTableColorFilterPanel colors={colors} onChange={setColors} />
                    )}
                    {detailFilterBy === FilterByEnum.Condition && (
                        <MobileSheetTableConditionPanel
                            tableFilter={tableFilter}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            tableId={tableId}
                            columnIndex={columnIndex}
                            conditionInfo={conditionInfo}
                            onChange={setConditionInfo}
                        />
                    )}
                </MobileDrawer>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <div className="univer-flex univer-flex-col univer-gap-2">
                {editable && (
                    <>
                        <MobileActionRow
                            variant="subtle"
                            icon={<LeftInsertColumnDoubleIcon />}
                            title={localeService.t<LocaleKey>('sheets-table-ui.columnMenu.insert-left')}
                            onClick={() => insertColumn('left').catch(() => undefined)}
                        />
                        <MobileActionRow
                            variant="subtle"
                            icon={<RightInsertColumnDoubleIcon />}
                            title={localeService.t<LocaleKey>('sheets-table-ui.columnMenu.insert-right')}
                            onClick={() => insertColumn('right').catch(() => undefined)}
                        />
                        <MobileActionRow
                            variant="subtle"
                            icon={<DeleteColumnDoubleIcon />}
                            title={localeService.t<LocaleKey>('sheets-table-ui.columnMenu.delete')}
                            disabled={!canDeleteColumn}
                            onClick={() => deleteColumn().catch(() => undefined)}
                        />
                        <MobileActionRow
                            variant="subtle"
                            icon={<AscendingIcon />}
                            title={localeService.t<LocaleKey>('sheets-table-ui.sort.sort-asc')}
                            onClick={() => applySort(true).catch(() => undefined)}
                        />
                        <MobileActionRow
                            variant="subtle"
                            icon={<DescendingIcon />}
                            title={localeService.t<LocaleKey>('sheets-table-ui.sort.sort-desc')}
                            onClick={() => applySort(false).catch(() => undefined)}
                        />
                    </>
                )}
                {FILTER_BY_OPTIONS.map((option) => (
                    <MobileActionRow
                        key={option.value}
                        variant="subtle"
                        title={localeService.t<LocaleKey>(option.label)}
                        trailing={<MoreRightIcon className="univer-size-5 univer-text-gray-400" />}
                        onClick={() => openDetail(option.value)}
                    />
                ))}
                <MobileActionRow
                    variant="subtle"
                    title={localeService.t<LocaleKey>('sheets-table-ui.filter.clear-filter')}
                    disabled={!tableFilter}
                    onClick={() => clearFilter().catch(() => undefined)}
                />
            </div>
            {detailDrawer}
        </>
    );
}
