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

import type { ByValuesModel, IFilterByValueWithTreeItem } from '../../services/sheets-filter-panel.service';
import { LocaleService } from '@univerjs/core';
import { borderClassName, Checkbox, clsx, Input, Tree } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import React, { useCallback } from 'react';
import { statisticFilterByValueItems } from '../../models/utils';

/**
 * Filter by values.
 */
export function FilterByValue(props: { model: ByValuesModel }) {
    const { model } = props;

    const localeService = useDependency(LocaleService);

    const searchText = useObservable(model.searchString$, '', true);
    const items = useObservable(model.filterItems$, undefined, true);
    const filterOnly = localeService.t('sheets-filter.panel.filter-only');

    const stat = statisticFilterByValueItems(items);
    const allChecked = stat.checked > 0 && stat.unchecked === 0;
    const indeterminate = stat.checked > 0 && stat.unchecked > 0;

    const treeMap = model.treeMapCache;

    const onCheckAllToggled = useCallback(() => {
        model.onCheckAllToggled(!allChecked);
    }, [model, allChecked]);

    const onSearchValueChange = useCallback((str: string) => {
        model.setSearchString(str);
    }, [model]);

    function extractCheckedKeys(items: IFilterByValueWithTreeItem[]): string[] {
        let checkedKeys: string[] = [];
        items.forEach((item) => {
            if (item.checked) {
                checkedKeys.push(item.key);
            }
            if (item.children) {
                checkedKeys = checkedKeys.concat(extractCheckedKeys(item.children));
            }
        });
        return checkedKeys;
    }

    return (
        <div
            data-u-comp="sheets-filter-panel-values-container"
            className="univer-flex univer-h-full univer-flex-col"
        >
            <Input
                autoFocus
                value={searchText}
                placeholder={localeService.t('sheets-filter.panel.search-placeholder')}
                onChange={onSearchValueChange}
            />
            <div
                data-u-comp="sheets-filter-panel"
                className={clsx(`
                  univer-mt-2 univer-box-border univer-flex univer-flex-grow univer-flex-col univer-overflow-hidden
                  univer-rounded-md univer-px-2 univer-py-2.5
                `, borderClassName)}
            >
                {/* The on-top "Select All" button */}
                <div
                    data-u-comp="sheets-filter-panel-values-item"
                    className="univer-box-border univer-h-8 univer-w-full univer-py-0.5"
                >
                    <div
                        data-u-comp="sheets-filter-panel-values-item-inner"
                        className={`
                          univer-box-border univer-flex univer-h-7 univer-items-center univer-rounded-md univer-pb-0
                          univer-pl-5 univer-pr-0.5 univer-pt-0 univer-text-sm
                        `}
                    >
                        <Checkbox
                            indeterminate={indeterminate}
                            disabled={items.length === 0}
                            checked={allChecked}
                            onChange={onCheckAllToggled}
                        />
                        <span
                            data-u-comp="sheets-filter-panel-values-item-text"
                            className={`
                              univer-mx-1 univer-inline-block univer-flex-shrink univer-overflow-hidden
                              univer-text-ellipsis univer-whitespace-nowrap univer-text-gray-900
                              dark:univer-text-white
                            `}
                        >
                            {`${localeService.t('sheets-filter.panel.select-all')}`}
                        </span>
                        <span
                            data-u-comp="sheets-filter-panel-values-item-count"
                            className={`
                              univer-text-gray-400
                              dark:univer-text-gray-500
                            `}
                        >
                            {`(${stat.checked}/${stat.checked + stat.unchecked})`}
                        </span>
                    </div>
                </div>
                <div data-u-comp="sheets-filter-panel-values-virtual" className="univer-flex-grow">
                    <Tree
                        data={items}
                        defaultExpandAll={false}
                        valueGroup={extractCheckedKeys(items)}
                        height={180}
                        onChange={(node) => {
                            model.onFilterCheckToggled(node as IFilterByValueWithTreeItem);
                        }}
                        defaultCache={treeMap}
                        itemHeight={28}
                        treeNodeClassName={`
                          univer-pr-2 univer-border-box univer-max-w-[245px] univer-rounded-md
                          [&:hover_a]:univer-inline-block
                          hover:univer-bg-gray-50 univer-h-full
                          univer-text-gray-900 dark:hover:univer-bg-gray-900
                          dark:univer-text-white
                        `}
                        attachRender={(item) => (
                            <div
                                className={`
                                  univer-ml-1 univer-flex univer-h-5 univer-flex-1 univer-cursor-pointer
                                  univer-items-center univer-justify-between univer-text-sm univer-text-primary-500
                                `}
                            >
                                <span
                                    data-u-comp="sheets-filter-panel-values-item-count"
                                    className={`
                                      univer-text-gray-400
                                      dark:univer-text-gray-500
                                    `}
                                >
                                    {`(${item.count})`}
                                </span>
                                <a
                                    className={`
                                      univer-box-border univer-hidden univer-h-4 univer-whitespace-nowrap univer-px-1.5
                                    `}
                                    onClick={() => {
                                        const filterValues = [];
                                        if (item.children) {
                                            item.children.forEach((child) => {
                                                if (child.children) {
                                                    child.children.forEach((subChild) => {
                                                        filterValues.push(subChild.key);
                                                    });
                                                } else {
                                                    filterValues.push(child.key);
                                                }
                                            });
                                        } else {
                                            filterValues.push(item.key);
                                        }
                                        model.onFilterOnly(filterValues);
                                    }}
                                >
                                    {filterOnly}
                                </a>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
