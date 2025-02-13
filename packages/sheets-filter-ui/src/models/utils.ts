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

import type { IFilterByValueWithTreeItem } from '../services/sheets-filter-panel.service';

export function statisticFilterByValueItems(items: IFilterByValueWithTreeItem[]): {
    checked: number;
    unchecked: number;
    checkedItems: IFilterByValueWithTreeItem[];
    uncheckedItems: IFilterByValueWithTreeItem[];
} {
    const checkedItems: IFilterByValueWithTreeItem[] = [];
    const uncheckedItems: IFilterByValueWithTreeItem[] = [];
    let checked = 0;
    let unchecked = 0;

    function traverse(node: IFilterByValueWithTreeItem) {
        if (node.leaf) {
            if (node.checked) {
                checkedItems.push(node);
                checked += node.count;
            } else {
                uncheckedItems.push(node);
                unchecked += node.count;
            }
        }

        if (node.children) {
            node.children.forEach(traverse);
        }
    }

    items.forEach(traverse);

    return {
        checkedItems,
        uncheckedItems,
        checked,
        unchecked,
    };
}
