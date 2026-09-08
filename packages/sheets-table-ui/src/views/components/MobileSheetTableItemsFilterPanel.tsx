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

import type { Dispatch, SetStateAction } from 'react';
import type { LocaleKey } from '../../locale/types';
import type { ITableFilterItemList } from '../../types';
import { LocaleService } from '@univerjs/core';
import { Checkbox, Input } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useMemo, useState } from 'react';

interface IMobileSheetTableItemsFilterPanelProps {
    items: ITableFilterItemList;
    checkedItemSet: Set<string>;
    setCheckedItemSet: Dispatch<SetStateAction<Set<string>>>;
}

export function MobileSheetTableItemsFilterPanel(props: IMobileSheetTableItemsFilterPanelProps) {
    const { items, checkedItemSet, setCheckedItemSet } = props;
    const localeService = useDependency(LocaleService);
    const [searchText, setSearchText] = useState('');
    const displayItems = useMemo(() => {
        const normalizedSearchText = searchText.toLowerCase();
        return normalizedSearchText
            ? items.data.filter((item) => String(item.title).toLowerCase().includes(normalizedSearchText))
            : items.data;
    }, [items.data, searchText]);
    const allDisplayedChecked = displayItems.length > 0
        && displayItems.every((item) => checkedItemSet.has(item.title));
    const someDisplayedChecked = displayItems.some((item) => checkedItemSet.has(item.title));

    function toggleAllDisplayed() {
        setCheckedItemSet((current) => {
            const next = new Set(current);
            for (const item of displayItems) {
                if (allDisplayedChecked) {
                    next.delete(item.title);
                } else {
                    next.add(item.title);
                }
            }
            return next;
        });
    }

    function toggleItem(title: string) {
        setCheckedItemSet((current) => {
            const next = new Set(current);
            if (next.has(title)) {
                next.delete(title);
            } else {
                next.add(title);
            }
            return next;
        });
    }

    return (
        <div data-u-comp="mobile-sheet-table-filter-by-values" className="univer-grid univer-gap-3">
            <Input
                value={searchText}
                placeholder={localeService.t<LocaleKey>('sheets-table-ui.filter.search-placeholder')}
                onChange={setSearchText}
            />
            <div
                className="
                  univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                  dark:!univer-bg-gray-800
                "
            >
                <div
                    className="
                      univer-border-0 univer-border-b univer-border-solid univer-border-gray-200 univer-px-4
                      dark:!univer-border-gray-700
                    "
                >
                    <Checkbox
                        className="univer-flex univer-min-h-12 univer-items-center"
                        checked={allDisplayedChecked}
                        indeterminate={!allDisplayedChecked && someDisplayedChecked}
                        disabled={displayItems.length === 0}
                        onChange={toggleAllDisplayed}
                    >
                        {localeService.t<LocaleKey>('sheets-table-ui.filter.select-all')}
                    </Checkbox>
                </div>
                {displayItems.map((item) => (
                    <div
                        key={item.key}
                        className="
                          univer-border-0 univer-border-b univer-border-solid univer-border-gray-200 univer-px-4
                          last:univer-border-b-0
                          dark:!univer-border-gray-700
                        "
                    >
                        <Checkbox
                            className="univer-flex univer-min-h-12 univer-items-center"
                            checked={checkedItemSet.has(item.title)}
                            onChange={() => toggleItem(item.title)}
                        >
                            <span className="univer-flex univer-min-w-0 univer-flex-1 univer-items-center univer-gap-2">
                                <span className="univer-min-w-0 univer-flex-1 univer-truncate">{item.title}</span>
                                <span className="univer-shrink-0 univer-text-gray-400">
                                    {`(${items.itemsCountMap.get(item.title) ?? 0})`}
                                </span>
                            </span>
                        </Checkbox>
                    </div>
                ))}
            </div>
        </div>
    );
}
