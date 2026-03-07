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

import { DataStreamTreeNodeType, DataStreamTreeTokenType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DataStreamTreeNode } from '../data-stream-tree-node';

describe('data stream tree node', () => {
    it('supports index/content/block updates', () => {
        const node = DataStreamTreeNode.create(DataStreamTreeNodeType.PARAGRAPH, 'abcd');
        node.setIndexRange(10, 13);
        node.addBlocks([11, 13]);
        node.insertText('X', 12);

        expect(node.content).toBe('abXcd');
        expect(node.exclude(9)).toBe(true);
        expect(node.exclude(10)).toBe(false);

        node.plus(2);
        expect(node.startIndex).toBe(12);
        expect(node.endIndex).toBe(15);
        expect(node.blocks).toEqual([13, 15]);

        node.selfPlus(3, 14);
        expect(node.endIndex).toBe(18);
        expect(node.blocks).toEqual([13, 18]);
        expect(node.getProps().nodeType).toBe(DataStreamTreeNodeType.PARAGRAPH);
    });

    it('splits paragraph node and resets custom blocks', () => {
        const customBlockText = `A${DataStreamTreeTokenType.CUSTOM_BLOCK}BC`;
        const parent = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE);
        const paragraph = DataStreamTreeNode.create(DataStreamTreeNodeType.PARAGRAPH, customBlockText);
        paragraph.parent = parent;
        paragraph.setIndexRange(0, customBlockText.length - 1);
        paragraph.blocks = [1];

        const child1 = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_CELL, 'ab');
        child1.setIndexRange(0, 1);
        child1.parent = paragraph;
        const child2 = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_CELL, 'cd');
        child2.setIndexRange(2, 3);
        child2.parent = paragraph;
        paragraph.children = [child1, child2];

        const splitData = paragraph.split(2)!;
        expect(splitData.firstNode.content).toBe(`A${DataStreamTreeTokenType.CUSTOM_BLOCK}`);
        expect(splitData.lastNode.content).toBe('BC');
        expect(splitData.firstNode.blocks).toContain(splitData.firstNode.startIndex + 1);

        const outOfRange = paragraph.split(99);
        expect(outOfRange).toBeUndefined();
    });

    it('supports minus/merge/remove/dispose workflows', () => {
        const parent = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE);
        const left = DataStreamTreeNode.create(DataStreamTreeNodeType.PARAGRAPH, 'abcdef');
        left.setIndexRange(0, 5);
        left.parent = parent;

        const right = DataStreamTreeNode.create(DataStreamTreeNodeType.PARAGRAPH, 'XYZ');
        right.setIndexRange(6, 8);
        right.parent = parent;

        parent.children = [left, right];
        expect(left.getPositionInParent()).toBe(0);
        expect(right.getPositionInParent()).toBe(1);

        left.minus(1, 2);
        expect(left.content).toBe('adef');
        expect(left.startIndex).toBe(0);
        expect(left.endIndex).toBe(3);

        const child = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_CELL, 's');
        child.parent = right;
        right.children = [child];
        left.merge(right);
        expect(left.content).toBe('adefXYZ');
        expect(parent.children).toHaveLength(1);

        left.remove();
        expect(left.parent).toBeNull();
        expect(left.children).toEqual([]);

        parent.dispose();
        expect(parent.blocks).toEqual([]);
        expect(parent.parent).toBeNull();
    });
});
