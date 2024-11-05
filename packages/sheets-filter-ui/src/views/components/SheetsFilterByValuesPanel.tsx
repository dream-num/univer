/**
 * Copyright 2023-present DreamNum Inc.
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
import { LocaleService, useDependency } from '@univerjs/core';
import { Button, Checkbox, Input, Tree } from '@univerjs/design';
import { useObservable } from '@univerjs/ui';
import React, { useCallback } from 'react';
import { statisticFilterByValueItems } from '../../models/utils';
import styles from './index.module.less';

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
        <div className={styles.sheetsFilterPanelValuesContainer}>
            <Input autoFocus value={searchText} placeholder={localeService.t('sheets-filter.panel.search-placeholder')} onChange={onSearchValueChange} />
            <div className={styles.sheetsFilterPanelValuesList}>
                {/* The on-top select all button */}
                <div className={styles.sheetsFilterPanelValuesItem}>
                    <div className={styles.sheetsFilterPanelValuesItemInner}>
                        <Checkbox
                            indeterminate={indeterminate}
                            disabled={items.length === 0}
                            checked={allChecked}
                            onChange={onCheckAllToggled}
                        >
                        </Checkbox>
                        <span className={styles.sheetsFilterPanelValuesItemText}>{`${localeService.t('sheets-filter.panel.select-all')}`}</span>
                        <span className={styles.sheetsFilterPanelValuesItemCount}>{`(${stat.checked}/${stat.checked + stat.unchecked})`}</span>
                    </div>
                </div>
                <div className={styles.sheetsFilterPanelValuesVirtual}>
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
                        treeNodeClassName={styles.sheetsFilterTreeNode}
                        attachRender={(item) => (
                            <div className={styles.sheetsFilterTreeNodeAttach}>
                                <span className={styles.sheetsFilterPanelValuesItemCount}>{`(${item.count})`}</span>
                                <Button
                                    className={styles.sheetsFilterTreeNodeFilterOnly}

                                    size="small"
                                    type="link"
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
                                </Button>
                            </div>
                        )}
                    >
                    </Tree>
                </div>
            </div>
        </div>

    );
}
