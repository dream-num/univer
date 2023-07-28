import { deleteContent, horizontalLineSegmentsSubtraction, insertTextToContent } from '../../Shared/Common';
import { Nullable } from '../../Shared/Types';
import { DataStreamTreeNodeType } from '../Domain/Types';

export class DataStreamTreeNode {
    children: DataStreamTreeNode[] = [];

    parent: Nullable<DataStreamTreeNode>;

    startIndex: number;

    endIndex: number;

    blocks: number[] = [];

    constructor(public nodeType: DataStreamTreeNodeType, public content?: string) {}

    static create(nodeType: DataStreamTreeNodeType, content?: string) {
        return new DataStreamTreeNode(nodeType, content);
    }

    getProps() {
        return {
            children: this.children,
            parent: this.parent,
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            nodeType: this.nodeType,

            content: this.content,
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
        this.content = insertTextToContent(this.content || '', insertIndex - this.startIndex + 1, text);
    }

    exclude(index: number) {
        return index < this.startIndex || index > this.endIndex;
    }

    plus(len: number) {
        this.startIndex += len;
        this.endIndex += len;
    }

    split(index: number) {
        const { children, parent, startIndex, endIndex, nodeType, content = '' } = this.getProps();

        if (this.exclude(index)) {
            return;
        }

        const firstStartIndex = 0;
        const firstEndIndex = index - startIndex;

        const lastStartIndex = index - startIndex + 1;
        const lastEndIndex = endIndex;

        const firstNode = DataStreamTreeNode.create(
            nodeType,

            content.slice(firstStartIndex, firstEndIndex)
        );

        firstNode.parent = parent;
        firstNode.setIndexRange(firstStartIndex, firstEndIndex);

        const lastNode = DataStreamTreeNode.create(
            nodeType,

            content.slice(lastStartIndex, lastEndIndex)
        );

        lastNode.parent = parent;
        lastNode.setIndexRange(lastStartIndex, lastEndIndex);

        const firstChildNodes: DataStreamTreeNode[] = [];
        const lastChildNodes: DataStreamTreeNode[] = [];

        for (let node of children) {
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

        return {
            firstNode,
            lastNode,
        };
    }

    getPositionInParent() {
        return this.parent?.children.indexOf(this) || -1;
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

        if (segments.length > 2) {
            const seg1 = segments[0];
            const seg2 = segments[1];
            this.startIndex = seg1[0];
            this.endIndex = seg1[1] + seg2[1] - seg2[0] + 1;
        } else {
            this.startIndex = segments[0][0];
            this.endIndex = segments[0][1];
        }

        this.content = deleteContent(this.content || '', startIndex, endIndex);
    }

    merge(node: DataStreamTreeNode) {
        const { endIndex, children } = node;
        this.endIndex = endIndex;
        this.children.push(...children);
        node.remove();
    }
}
