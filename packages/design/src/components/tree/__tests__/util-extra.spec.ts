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

import { describe, expect, it } from 'vitest';
import {
    createCacheWithFindNodePathFromTree,
    filterLeafNode,
    isIntermediated,
    mergeTreeSelected,
} from '../util';

const treeData = [
    {
        key: 'root',
        title: 'root',
        children: [
            {
                key: 'a',
                title: 'a',
                children: [
                    { key: 'a-1', title: 'a-1' },
                    { key: 'a-2', title: 'a-2' },
                ],
            },
            {
                key: 'b',
                title: 'b',
                children: [
                    { key: 'b-1', title: 'b-1' },
                ],
            },
        ],
    },
];

describe('tree util extra', () => {
    it('should cache paths and support reset with new tree', () => {
        const find = createCacheWithFindNodePathFromTree(treeData);

        expect(find.findNodePathFromTreeWithCache('a-2')).toEqual(['root', 'a', 'a-2']);
        expect(find.findNodePathFromTreeWithCache('a')).toEqual(['root', 'a']);

        const newTree = [
            {
                key: 'new-root',
                title: 'new-root',
                children: [{ key: 'new-leaf', title: 'new-leaf' }],
            },
        ];

        find.reset(newTree);
        expect(find.findNodePathFromTreeWithCache('new-leaf')).toEqual(['new-root', 'new-leaf']);
    });

    it('should remove current branch and clear parent when deselecting', () => {
        const selected = ['root', 'a', 'a-1', 'a-2'];
        const result = mergeTreeSelected(treeData, selected, ['root', 'a']);
        expect(result).toEqual([]);
    });

    it('should keep parent selected when sibling branch still selected', () => {
        const selected = ['root', 'a', 'a-1', 'a-2', 'b', 'b-1'];
        const result = mergeTreeSelected(treeData, selected, ['root', 'a']);
        expect(result.sort()).toEqual(['b', 'b-1', 'root'].sort());
    });

    it('should detect intermediated state and leaf filtering', () => {
        const notAllChecked = isIntermediated(new Set(['a-1']), treeData[0]);
        const allChecked = isIntermediated(new Set(['a-1', 'a-2', 'b-1']), treeData[0]);
        expect(notAllChecked).toBe(true);
        expect(allChecked).toBe(false);

        const onlyLeafNodes = filterLeafNode(treeData, ['root', 'a', 'a-2', 'missing', 'b-1']);
        expect(onlyLeafNodes.map((item) => item.key).sort()).toEqual(['a-2', 'b-1']);
    });
});
