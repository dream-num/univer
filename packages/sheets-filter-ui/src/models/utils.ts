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

import type { IFilterByValueItem } from '../services/sheets-filter-panel.service';

export function statisticFilterByValueItems(items: IFilterByValueItem[]): {
    checked: number;
    unchecked: number;
    checkedItems: IFilterByValueItem[];
    uncheckedItems: IFilterByValueItem[];
} {
    const checkedItems: IFilterByValueItem[] = [];
    const uncheckedItems: IFilterByValueItem[] = [];

    for (const item of items) {
        if (item.checked) {
            checkedItems.push(item);
        } else {
            uncheckedItems.push(item);
        }
    }

    return {
        checkedItems,
        uncheckedItems,
        checked: checkedItems.length,
        unchecked: uncheckedItems.length,
    };
}
