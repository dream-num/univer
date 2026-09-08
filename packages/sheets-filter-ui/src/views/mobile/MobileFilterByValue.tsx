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

import type { LocaleKey } from '../../locale/types';
import type { ByValuesModel, IFilterByValueWithTreeItem } from '../../services/sheets-filter-panel.service';
import { LocaleService } from '@univerjs/core';
import { Checkbox, Input, resetButtonClassName, Tree } from '@univerjs/design';
import { CloseIcon, SearchIcon } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { statisticFilterByValueItems } from '../../models/utils';

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

export function MobileFilterByValue(props: { model: ByValuesModel }) {
    const { model } = props;
    const localeService = useDependency(LocaleService);
    const [searching, setSearching] = useState(false);
    const searchText = useObservable(model.searchString$, '', true);
    const items = useObservable(model.filterItems$, [], true);
    const stat = statisticFilterByValueItems(items);
    const allChecked = stat.checked > 0 && stat.unchecked === 0;
    const indeterminate = stat.checked > 0 && stat.unchecked > 0;
    const searchLabel = localeService.t<LocaleKey>('sheets-filter-ui.panel.search-placeholder');

    return (
        <div data-u-comp="mobile-sheets-filter-by-values" className="univer-flex univer-min-h-full univer-flex-col">
            <div
                className="
                  univer-flex univer-min-h-14 univer-items-center univer-border-0 univer-border-b univer-border-solid
                  univer-border-gray-200 univer-px-2
                  dark:!univer-border-gray-700
                "
            >
                {searching
                    ? (
                        <>
                            <Input
                                autoFocus
                                className="univer-flex-1"
                                value={searchText}
                                placeholder={searchLabel}
                                onChange={(value) => model.setSearchString(value)}
                            />
                            <button
                                type="button"
                                aria-label={localeService.t<LocaleKey>('sheets-filter-ui.panel.cancel')}
                                className={`
                                  ${resetButtonClassName}
                                  univer-ml-2 univer-flex univer-size-10 univer-items-center univer-justify-center
                                `}
                                onClick={() => {
                                    model.setSearchString('');
                                    setSearching(false);
                                }}
                            >
                                <CloseIcon className="univer-size-5" />
                            </button>
                        </>
                    )
                    : (
                        <>
                            <Checkbox
                                className="univer-min-h-12 univer-flex-1 univer-text-base"
                                contentClassName="univer-flex univer-items-center univer-gap-1"
                                indeterminate={indeterminate}
                                disabled={items.length === 0}
                                checked={allChecked}
                                onChange={() => model.onCheckAllToggled(!allChecked)}
                            >
                                <span>{localeService.t<LocaleKey>('sheets-filter-ui.panel.select-all')}</span>
                                <span className="univer-text-sm univer-text-gray-500">
                                    {`(${stat.checked}/${stat.checked + stat.unchecked})`}
                                </span>
                            </Checkbox>
                            <button
                                type="button"
                                aria-label={searchLabel}
                                className={`
                                  ${resetButtonClassName}
                                  univer-flex univer-size-12 univer-items-center univer-justify-center
                                `}
                                onClick={() => setSearching(true)}
                            >
                                <SearchIcon className="univer-size-6" />
                            </button>
                        </>
                    )}
            </div>
            <div className="univer-min-h-0 univer-flex-1 univer-py-2">
                <Tree
                    data={items}
                    defaultExpandAll={false}
                    valueGroup={extractCheckedKeys(items)}
                    onChange={(node) => model.onFilterCheckToggled(node as IFilterByValueWithTreeItem)}
                    defaultCache={model.treeMapCache}
                    itemHeight={48}
                    treeNodeClassName="univer-h-full univer-pr-2 univer-text-base univer-text-gray-900 dark:!univer-text-gray-0"
                    attachRender={(item) => (
                        <span className="univer-ml-auto univer-text-sm univer-text-gray-500">{`(${item.count})`}</span>
                    )}
                />
            </div>
        </div>
    );
}
