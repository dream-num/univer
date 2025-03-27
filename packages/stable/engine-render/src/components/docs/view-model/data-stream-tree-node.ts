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

import type { Nullable } from '@univerjs/core';
import {
    DataStreamTreeNodeType,
    DataStreamTreeTokenType,
    deleteContent,
    horizontalLineSegmentsSubtraction,
    insertTextToContent,
} from '@univerjs/core';

export class DataStreamTreeNode {
    children: DataStreamTreeNode[] = [];
    parent: Nullable<DataStreamTreeNode>;
    startIndex: number = -1;
    endIndex: number = -1;
    // isBullet: boolean = false;
    // isIndent: boolean = false;
    blocks: number[] = [];

    constructor(
        public nodeType: DataStreamTreeNodeType,
        public content?: string
    ) {
        // empty
    }

    static create(nodeType: DataStreamTreeNodeType, content?: string) {
        return new DataStreamTreeNode(nodeType, content);
    }

    dispose() {
        this.children.forEach((child) => {
            child.dispose();
        });
        this.parent = null;
        this.blocks = [];
    }

    getProps() {
        const { children, parent, startIndex, endIndex, nodeType, content } = this;

        return {
            children,
            parent,
            startIndex,
            endIndex,
            nodeType,
            content,
        };
    }

    addBlocks(blocks: number[]) {
        this.blocks = this.blocks.concat(blocks);
    }

    setIndexRange(startIndex: number, endIndex: number) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
    }

    insertText(text: string, insertIndex: number) {
        this.content = insertTextToContent(this.content || '', insertIndex - this.startIndex, text);
    }

    exclude(index: number) {
        const { startIndex, endIndex } = this;

        return index < startIndex || index > endIndex;
    }

    plus(len: number) {
        this.startIndex += len;
        this.endIndex += len;

        this._addIndexForBlock(len);
    }

    selfPlus(len: number, index?: number) {
        this.endIndex += len;

        if (index == null) {
            index = this.startIndex;
        }

        this._addIndexForBlock(len, index);
    }

    split(index: number) {
        const { children, parent, startIndex, nodeType, content = '' } = this.getProps();

        if (this.exclude(index)) {
            return;
        }

        const firstStartIndex = 0;
        const firstEndIndex = index - startIndex;

        const lastStartIndex = firstEndIndex;

        const firstNodeContent = content.slice(firstStartIndex, firstEndIndex);

        const firstNode = DataStreamTreeNode.create(nodeType, firstNodeContent);

        firstNode.parent = parent;
        firstNode.setIndexRange(firstStartIndex, firstEndIndex - 1);

        const lastNodeContent = content.slice(lastStartIndex);

        const lastNode = DataStreamTreeNode.create(nodeType, lastNodeContent);

        lastNode.parent = parent;
        lastNode.setIndexRange(lastStartIndex, lastStartIndex + lastNodeContent.length - 1);

        const firstChildNodes: DataStreamTreeNode[] = [];
        const lastChildNodes: DataStreamTreeNode[] = [];

        for (const node of children) {
            const { startIndex: childStartIndex } = node;

            if (node.exclude(index)) {
                if (index < childStartIndex) {
                    firstChildNodes.push(node);
                } else {
                    lastChildNodes.push(node);
                }
            } else {
                const splitData = node.split(index);
                if (splitData == null) {
                    firstChildNodes.push(node);
                    continue;
                }
                const { firstNode, lastNode } = splitData;
                firstChildNodes.push(firstNode);
                firstChildNodes.push(lastNode);
            }
        }

        firstNode.children = firstChildNodes;

        lastNode.children = lastChildNodes;

        firstNode._resetBlocks();

        lastNode._resetBlocks();

        return {
            firstNode,
            lastNode,
        };
    }

    getPositionInParent() {
        const index = this.parent?.children.indexOf(this) as number;
        if (index == null) {
            return -1;
        }

        return index;
    }

    remove() {
        this.children = [];

        if (this.parent == null) {
            return;
        }

        this.parent.children.splice(this.getPositionInParent(), 1);
        this.parent = null;
    }

    minus(startIndex: number, endIndex: number) {
        const segments = horizontalLineSegmentsSubtraction(this.startIndex, this.endIndex, startIndex, endIndex);

        if (segments.length === 0) {
            return;
        }

        const originStartIndex = this.startIndex;

        this.startIndex = segments[0];
        this.endIndex = segments[1];

        if (this.content != null) {
            this.content = deleteContent(
                this.content || '',
                startIndex - originStartIndex,
                endIndex - originStartIndex + 1
            );
        }
    }

    merge(node: DataStreamTreeNode) {
        const { startIndex, endIndex, children } = node;
        this.endIndex += endIndex - startIndex + 1;
        this.children.push(...children);
        this.content += node.content || '';
        node.remove();
    }

    private _addIndexForBlock(addLen: number, index: number = Number.NEGATIVE_INFINITY) {
        for (let i = 0, len = this.blocks.length; i < len; i++) {
            const block = this.blocks[i];

            if (block >= index) {
                this.blocks[i] = block + addLen;
            }
        }
    }

    private _resetBlocks() {
        if (this.nodeType !== DataStreamTreeNodeType.PARAGRAPH) {
            return;
        }

        if (this.content == null) {
            return;
        }

        if (this.content.length === 0) {
            return;
        }

        this.blocks = [];

        for (let i = 0, len = this.content.length; i < len; i++) {
            const char = this.content[i];

            if (char === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                this.blocks.push(this.startIndex + i);
            }
        }
    }
}
