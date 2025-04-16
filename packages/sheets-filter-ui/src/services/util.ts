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

import type { IFilterByValueWithTreeItem } from './sheets-filter-panel.service';

export function findObjectByKey(data: IFilterByValueWithTreeItem[], targetKey: string): IFilterByValueWithTreeItem | null {
    for (const node of data) {
        if (node.key === targetKey) {
            return node;
        }
        if (node.children) {
            const result = findObjectByKey(node.children, targetKey);
            if (result) {
                return result;
            }
        }
    }
    return null;
}

export function areAllLeafNodesChecked(node: IFilterByValueWithTreeItem): boolean {
    if (node.leaf) {
        return node.checked;
    }
    return node.children ? node.children.every((child) => areAllLeafNodesChecked(child)) : true;
}

export function updateLeafNodesCheckedStatus(node: IFilterByValueWithTreeItem, status?: boolean) {
    if (node.leaf) {
        if (status !== undefined) {
            node.checked = status;
        } else {
            node.checked = !node.checked;
        }
    }

    if (node.children) {
        node.children.forEach((child) => updateLeafNodesCheckedStatus(child, status));
    }
}

export function searchTree(items: IFilterByValueWithTreeItem[], searchKeywords: string[]): IFilterByValueWithTreeItem[] {
    const result: IFilterByValueWithTreeItem[] = [];

    items.forEach((item) => {
        const originMatches = item.originValues
            ? searchKeywords.some((keyword) =>
                Array.from(item.originValues!).some((value) =>
                    value.toLowerCase().includes(keyword.toLowerCase())
                )
            )
            : false;

        const titleMatches = !originMatches
            && searchKeywords.some((keyword) =>
                item.title.toLowerCase().includes(keyword.toLowerCase())
            );

        const matches = originMatches || titleMatches;

        if (matches) {
            result.push({ ...item });
        } else if (item.children) {
            const filteredChildren = searchTree(item.children, searchKeywords);

            if (filteredChildren.length > 0) {
                const aggregatedCount = filteredChildren.reduce((sum, child) => sum + child.count, 0);
                result.push({ ...item, count: aggregatedCount, children: filteredChildren });
            }
        }
    });

    return result;
}
