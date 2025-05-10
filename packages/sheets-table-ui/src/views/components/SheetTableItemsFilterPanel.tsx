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

import type { ITableFilterItem } from '@univerjs/sheets-table';
import { LocaleService } from '@univerjs/core';
import { borderClassName, Checkbox, clsx, Input, scrollbarClassName } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import React, { useCallback, useMemo, useState } from 'react';
import { SheetsTableUiService } from '../../services/sheets-table-ui-service';

interface ISheetTableItemsFilterPanelProps {
    unitId: string;
    subUnitId: string;
    tableFilter: ITableFilterItem | undefined;
    tableId: string;
    columnIndex: number;
    checkedItemSet: Set<string>;
    setCheckedItemSet: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const getCheckedCount = (map: Map<string, number>) => {
    let count = 0;
    map.forEach((value) => {
        count += value;
    });
    return count;
};

export function SheetTableItemsFilterPanel(props: ISheetTableItemsFilterPanelProps) {
    const { unitId, tableId, subUnitId, columnIndex, checkedItemSet, setCheckedItemSet, tableFilter } = props;
    const localeService = useDependency(LocaleService);
    const tableService = useDependency(SheetsTableUiService);

    const { data: items, itemsCountMap, allItemsCount } = tableService.getTableFilterItems(unitId, subUnitId, tableId, columnIndex);

    // const allChecked = tableFilter === undefined ? true : checkedItemSet.size === itemsCountMap.size;
    const [allChecked, setAllChecked] = useState<boolean>(tableFilter === undefined ? true : checkedItemSet.size === itemsCountMap.size);

    const [checkedCount, setCheckedCount] = useState<number>(allChecked ? allItemsCount : getCheckedCount(itemsCountMap));

    const indeterminate = !allChecked && checkedItemSet.size > 0;
    const [searchText, setSearchText] = useState('');

    const displayItems = useMemo(() => {
        return searchText
            ? items.filter((item: { title: string }) => {
                return String(item.title).toLowerCase().includes(searchText.toLowerCase());
            })
            : items;
    }, [searchText, items]);

    const onCheckAllToggled = useCallback(() => {
        if (allChecked) {
            checkedItemSet.clear();
            setCheckedItemSet(new Set(checkedItemSet));
            setAllChecked(false);
        } else {
            displayItems.forEach((item) => {
                checkedItemSet.add(item.title);
            });
            setCheckedItemSet(new Set(checkedItemSet));
            setAllChecked(true);
        }
    }, [allChecked]);

    const onSearchValueChange = useCallback((str: string) => {
        if (str === '') {
            setAllChecked(true);
            items.forEach((item) => {
                checkedItemSet.add(item.title);
            });
            setCheckedCount(allItemsCount);
        } else {
            checkedItemSet.clear();
            setAllChecked(false);
            setCheckedCount(0);
        }
        setSearchText(str);
    }, []);

    const onCheckItemToggled = (key: string) => {
        if (allChecked) {
            setAllChecked(false);
            const newSet = new Set<string>();
            for (const { title } of items) {
                if (key !== title) {
                    newSet.add(title);
                }
            }
            setCheckedCount(allItemsCount - itemsCountMap.get(key)!);
            setCheckedItemSet(newSet);
        } else {
            if (checkedItemSet.has(key)) {
                checkedItemSet.delete(key);
                setCheckedCount(checkedCount - itemsCountMap.get(key)!);
            } else {
                checkedItemSet.add(key);
                setCheckedCount(checkedCount + itemsCountMap.get(key)!);
            }
            setCheckedItemSet(new Set(checkedItemSet));
        }
    };

    return (
        <div className="univer-flex univer-h-full univer-flex-col">
            <Input autoFocus value={searchText} placeholder={localeService.t('sheets-filter.panel.search-placeholder')} onChange={onSearchValueChange} />
            <div
                className={clsx(`
                  univer-mt-2 univer-box-border univer-flex univer-h-[180px] univer-max-h-[180px] univer-flex-grow
                  univer-flex-col univer-overflow-hidden univer-rounded-md univer-py-1.5 univer-pl-2
                `, borderClassName)}
            >
                <div
                    className={clsx('univer-h-40 univer-overflow-y-auto univer-py-1 univer-pl-2', scrollbarClassName)}
                >
                    <div className="univer-h-full">
                        <div className="univer-flex univer-items-center univer-px-2 univer-py-1">
                            <Checkbox
                                indeterminate={indeterminate}
                                disabled={items.length === 0}
                                checked={allChecked}
                                onChange={onCheckAllToggled}
                            >
                                <div className="univer-flex univer-h-5 univer-flex-1 univer-items-center univer-text-sm">
                                    <span className="univer-inline-block univer-truncate">{`${localeService.t('sheets-filter.panel.select-all')}`}</span>
                                    <span className="univer-ml univer-text-gray-400">{`(${checkedCount}/${searchText ? displayItems.length : allItemsCount})`}</span>
                                </div>
                            </Checkbox>
                        </div>
                        {displayItems.map((item) => {
                            return (
                                <div
                                    key={item.key}
                                    className="univer-flex univer-items-center univer-px-2 univer-py-1"
                                >
                                    <Checkbox
                                        checked={allChecked || checkedItemSet.has(item.title)}
                                        onChange={() => { onCheckItemToggled(item.title); }}
                                    >
                                        <div className="univer-flex univer-h-5 univer-flex-1 univer-text-sm">
                                            <span className="univer-inline-block univer-truncate">{item.title}</span>
                                            <span className="univer-ml-1 univer-text-gray-400">{`(${itemsCountMap.get(item.title) || 0})`}</span>
                                        </div>
                                    </Checkbox>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>

    );
}
