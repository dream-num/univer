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

import React, { useCallback } from 'react';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { LocaleService } from '@univerjs/core';
import { useObservable } from '@univerjs/ui';
import List from 'rc-virtual-list';
import { Button, Checkbox, Input, Tooltip } from '@univerjs/design';
import type { ByValuesModel, IFilterByValueItem } from '../../services/sheets-filter-panel.service';
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

    const onFilterCheckToggled = useCallback((item: IFilterByValueItem, checked: boolean) => {
        model.onFilterCheckToggled(item, checked);
    }, [model]);
    const onFilterOnlyClicked = useCallback((item: IFilterByValueItem) => {
        model.onFilterOnly(item);
    }, [model]);
    const onCheckAllToggled = useCallback(() => {
        model.onCheckAllToggled(!allChecked);
    }, [model, allChecked]);
    const onSearchValueChange = useCallback((str: string) => {
        model.setSearchString(str);
    }, [model]);

    return (
        <div className={styles.sheetsFilterPanelValuesContainer}>
            <Input value={searchText} placeholder={localeService.t('sheets-filter.panel.search-placeholder')} onChange={onSearchValueChange} />
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
                    <List style={{ paddingRight: 8 }} data={items} height={190} itemHeight={32} itemKey={(item) => `${item.value}----${item.checked}`}>
                        {(item) => (
                            <div className={styles.sheetsFilterPanelValuesItem}>
                                <div className={styles.sheetsFilterPanelValuesItemInner}>
                                    <Checkbox checked={item.checked} onChange={() => onFilterCheckToggled(item, !item.checked)}></Checkbox>
                                    <Tooltip showIfEllipsis placement="top" title={item.value}>
                                        <span className={styles.sheetsFilterPanelValuesItemText}>{item.value}</span>
                                    </Tooltip>
                                    <span className={styles.sheetsFilterPanelValuesItemCount}>{`(${item.count})`}</span>
                                    <Button
                                        className={styles.sheetsFilterPanelValuesItemExcludeButton}
                                        size="small"
                                        type="link"
                                        onClick={() => onFilterOnlyClicked(item)}
                                    >
                                        {filterOnly}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </List>
                </div>
            </div>
        </div>
    );
}
