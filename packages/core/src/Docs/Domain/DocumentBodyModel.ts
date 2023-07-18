import { IDocumentBody, ITextRun } from '../../Types/Interfaces/IDocumentData';

import { Nullable } from '../../Shared/Types';
import { DataStreamTreeNode } from './DataStreamTreeNode';
import { DataStreamTreeNodeType, DataStreamTreeTokenType } from './Types';

export type DocumentBodyModelOrSimple = DocumentBodyModelSimple | DocumentBodyModel;

export class DocumentBodyModelSimple {
    children: DataStreamTreeNode[] = [];

    constructor(public body: IDocumentBody) {
        if (this.body == null) {
            return;
        }
        this.children = this.transformToTree(this.body.dataStream);
    }

    resetCache() {}

    getSectionBreak(index: number) {
        return this.body.sectionBreaks?.[0];
    }

    getParagraph(index: number) {}

    getTextRun(index: number) {}

    getTextRunRange(startIndex: number = 0, endIndex: number) {
        return [
            {
                st: startIndex,
                ed: endIndex,
            },
        ] as ITextRun[];
    }

    getCustomBlock(index: number) {}

    getTable(index: number) {}

    getCustomRange(index: number) {}

    private transformToTree(dataStream: string) {
        const dataStreamLen = dataStream.length;

        let content = '';
        let sectionList: DataStreamTreeNode[] = [];
        let nodeList: DataStreamTreeNode[] = [];
        let currentBlocks: number[] = [];

        for (let i = 0; i < dataStreamLen; i++) {
            const char = dataStream[i];
            if (char === DataStreamTreeTokenType.PARAGRAPH) {
                content += DataStreamTreeTokenType.PARAGRAPH;
                const node = DataStreamTreeNode.create(
                    DataStreamTreeNodeType.PARAGRAPH,

                    content
                );
                node.setIndexRange(i - content.length + 1, i);
                node.addBlocks(currentBlocks);
                nodeList.push(node);
                content = '';
                currentBlocks = [];
            } else if (char === DataStreamTreeTokenType.SECTION_BREAK) {
                const sectionTree = DataStreamTreeNode.create(
                    DataStreamTreeNodeType.SECTION_BREAK
                );
                this.batchParent(sectionTree, nodeList);
                let lastNode = nodeList[nodeList.length - 1];
                if (lastNode && lastNode.content) {
                    lastNode.content += DataStreamTreeTokenType.SECTION_BREAK;
                }
                sectionList.push(sectionTree);
                nodeList = [];
            } else if (char === DataStreamTreeTokenType.TABLE_START) {
                nodeList.push(
                    DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE)
                );
            } else if (char === DataStreamTreeTokenType.TABLE_ROW_START) {
                nodeList.push(
                    DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_ROW)
                );
            } else if (char === DataStreamTreeTokenType.TABLE_CELL_START) {
                nodeList.push(
                    DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_CELL)
                );
            } else if (char === DataStreamTreeTokenType.TABLE_END) {
                this.processPreviousNodesUntil(
                    nodeList,
                    DataStreamTreeNodeType.TABLE
                );
            } else if (char === DataStreamTreeTokenType.TABLE_ROW_END) {
                this.processPreviousNodesUntil(
                    nodeList,
                    DataStreamTreeNodeType.TABLE_ROW
                );
            } else if (char === DataStreamTreeTokenType.TABLE_CELL_END) {
                this.processPreviousNodesUntil(
                    nodeList,
                    DataStreamTreeNodeType.TABLE_CELL
                );
            } else if (char === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                currentBlocks.push(i);
                content += char;
            } else {
                content += char;
            }
        }

        return sectionList;
    }

    private processPreviousNodesUntil(
        nodeList: DataStreamTreeNode[],
        untilNodeType: DataStreamTreeNodeType
    ) {
        const nodeCollection: DataStreamTreeNode[] = [];
        let node = nodeList.pop();
        while (node) {
            if (node.nodeType === untilNodeType) {
                break;
            }

            nodeCollection.push(node);

            node = nodeList.pop();
        }

        const recentTree = nodeList[nodeList.length - 1];
        this.batchParent(recentTree, nodeCollection, DataStreamTreeNodeType.TABLE);

        if (untilNodeType === DataStreamTreeNodeType.TABLE_CELL) {
            const firstNode = nodeCollection[0];
            const lastNode = nodeCollection[nodeCollection.length];
            firstNode.content =
                DataStreamTreeTokenType.TABLE_CELL_START + firstNode.content || '';
            firstNode.startIndex -= 1;
            lastNode.content += DataStreamTreeTokenType.TABLE_CELL_END;
            lastNode.endIndex += 1;
        } else if (untilNodeType === DataStreamTreeNodeType.TABLE_ROW) {
            const firstNode = nodeCollection[0].children[0];
            let lastNode = nodeCollection[nodeCollection.length];
            lastNode = lastNode.children[lastNode.children.length - 1];
            firstNode.content =
                DataStreamTreeTokenType.TABLE_ROW_START + firstNode.content || '';
            firstNode.startIndex -= 1;
            lastNode.content += DataStreamTreeTokenType.TABLE_ROW_END;
            lastNode.endIndex += 1;
        } else if (untilNodeType === DataStreamTreeNodeType.TABLE) {
            const firstNode = nodeCollection[0].children[0].children[0];
            let lastNode = nodeCollection[nodeCollection.length];
            lastNode = lastNode.children[lastNode.children.length - 1];
            lastNode = lastNode.children[lastNode.children.length - 1];
            firstNode.content =
                DataStreamTreeTokenType.TABLE_START + firstNode.content || '';
            firstNode.startIndex -= 1;
            lastNode.content += DataStreamTreeTokenType.TABLE_END;
            lastNode.endIndex += 1;
        }
    }

    private batchParent(
        parent: DataStreamTreeNode,
        children: DataStreamTreeNode[],
        nodeType = DataStreamTreeNodeType.SECTION_BREAK
    ) {
        for (let child of children) {
            child.parent = parent;
            parent.children.push(child);
        }

        const startOffset =
            nodeType === DataStreamTreeNodeType.SECTION_BREAK ? 0 : 1;

        parent.setIndexRange(
            children[0].startIndex - startOffset,
            children[children.length - 1].endIndex + 1
        );
    }
}

export class DocumentBodyModel extends DocumentBodyModelSimple {
    private sectionBreakCurrentIndex = 0;

    private paragraphCurrentIndex = 0;

    private textRunCurrentIndex = 0;

    private customBlockCurrentIndex = 0;

    private tableBlockCurrentIndex = 0;

    private customRangeCurrentIndex = 0;

    static create(body: IDocumentBody) {
        return new DocumentBodyModel(body);
    }

    insert(insertBody: IDocumentBody, insertIndex = 0) {
        const dataStream = insertBody.dataStream;
        let dataStreamLen = dataStream.length;
        const insertedNode = this.getParagraphByTree(this.children, insertIndex);
        if (insertedNode == null) {
            return;
        }

        if (dataStream[dataStream.length - 1] === '\n') {
            const insertBodyModel = new DocumentBodyModelSimple(insertBody);
            dataStreamLen -= 1; // sectionBreak can not be inserted

            const insertNodes = insertBodyModel.children;

            for (let node of insertNodes) {
                this.foreachDown(node, (newNode) => {
                    newNode.plus(insertIndex);
                });
            }

            const insertedNodeSplit = insertedNode.split(insertIndex);

            if (insertedNodeSplit == null) {
                return;
            }

            const { firstNode: insertedFirstNode, lastNode: insertedLastNode } =
                insertedNodeSplit;

            insertedNode.parent?.children.splice(
                insertedNode.getPositionInParent(),
                1,
                insertedFirstNode,
                ...insertNodes,
                insertedLastNode
            );

            this.foreachTop(insertedNode.parent, (currentNode) => {
                currentNode.endIndex += dataStreamLen;
                const children = currentNode.children;
                let isStartFix = false;
                for (let node of children) {
                    if (node === insertedLastNode) {
                        isStartFix = true;
                    }

                    if (!isStartFix) {
                        continue;
                    }

                    this.foreachDown(node, (newNode) => {
                        newNode.plus(dataStreamLen);
                    });
                }
            });
        } else {
            insertedNode.insertText(dataStream, insertIndex);

            insertedNode.endIndex += dataStreamLen;

            this.foreachTop(insertedNode.parent, (currentNode) => {
                currentNode.endIndex += dataStreamLen;
                const children = currentNode.children;
                let isStartFix = false;
                for (let node of children) {
                    if (node === currentNode) {
                        isStartFix = true;
                    }

                    if (!isStartFix) {
                        continue;
                    }

                    this.foreachDown(node, (newNode) => {
                        newNode.plus(dataStreamLen);
                    });
                }
            });
        }
    }

    delete(currentIndex: number, textLength: number) {
        const nodes = this.children;
        this.deleteTree(nodes, currentIndex, textLength);
    }

    deleteTree(
        nodes: DataStreamTreeNode[],
        currentIndex: number,
        textLength: number
    ) {
        const startIndex = currentIndex;
        const endIndex = currentIndex + textLength - 1;
        let mergeNode: Nullable<DataStreamTreeNode> = null;
        for (let node of nodes) {
            const { startIndex: st, endIndex: ed, children } = node;

            this.deleteTree(children, currentIndex, textLength);

            if (startIndex <= st && endIndex >= ed) {
                node.remove();
            } else if (st <= startIndex && ed >= endIndex) {
                node.minus(startIndex, ed);
            } else if (startIndex >= st && startIndex <= ed) {
                node.minus(startIndex, ed);
                mergeNode = node;
            } else if (endIndex >= st && endIndex <= ed) {
                node.minus(st, endIndex);
                if (mergeNode) {
                    mergeNode.merge(node);
                }
            } else if (st > endIndex) {
                node.plus(-textLength);
            }
        }
    }

    getParagraphByTree(
        nodes: DataStreamTreeNode[],
        insertIndex: number
    ): Nullable<DataStreamTreeNode> {
        for (let node of nodes) {
            const { startIndex, endIndex, children } = node;
            if (node.exclude(insertIndex)) {
                continue;
            }
            if (node.nodeType === DataStreamTreeNodeType.PARAGRAPH) {
                return node;
            }
            return this.getParagraphByTree(children, insertIndex);
        }
        return null;
    }

    foreachTop(
        node: Nullable<DataStreamTreeNode>,
        func: (node: DataStreamTreeNode) => void
    ) {
        let parent: Nullable<DataStreamTreeNode> = node;
        while (parent) {
            func(parent);
            parent = parent.parent;
        }
    }

    foreachDown(node: DataStreamTreeNode, func: (node: DataStreamTreeNode) => void) {
        func(node);
        const children = node.children;
        for (node of children) {
            this.foreachDown(node, func);
        }
    }

    override resetCache() {
        this.sectionBreakCurrentIndex = 0;
        this.paragraphCurrentIndex = 0;
        this.textRunCurrentIndex = 0;
        this.customBlockCurrentIndex = 0;
        this.tableBlockCurrentIndex = 0;
        this.customRangeCurrentIndex = 0;
    }

    override getSectionBreak(index: number) {
        if (index == null) {
            return;
        }
        const sectionBreaks = this.body.sectionBreaks;
        if (sectionBreaks == null) {
            return;
        }

        for (let i = this.sectionBreakCurrentIndex; i < sectionBreaks.length; i++) {
            const sectionBreak = sectionBreaks[i];
            if (sectionBreak.startIndex === index) {
                this.sectionBreakCurrentIndex = i;
                return sectionBreak;
            }
        }
    }

    override getParagraph(index: number) {
        const paragraphs = this.body.paragraphs;
        if (paragraphs == null) {
            return;
        }

        for (let i = this.paragraphCurrentIndex; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            if (paragraph.startIndex === index) {
                this.paragraphCurrentIndex = i;
                return paragraph;
            }
        }
    }

    override getTextRunRange(startIndex: number = 0, endIndex: number) {
        const textRuns = this.body.textRuns;
        if (textRuns == null) {
            return [
                {
                    st: startIndex,
                    ed: endIndex,
                },
            ];
        }

        const trRange: ITextRun[] = [];

        for (
            let i = this.textRunCurrentIndex, textRunsLen = textRuns.length;
            i < textRunsLen;
            i++
        ) {
            const textRun = textRuns[i];
            if (textRun.st > endIndex) {
                this.textRunCurrentIndex = i;
                break;
            } else if (textRun.ed < startIndex) {
                this.textRunCurrentIndex = i;
                continue;
            } else {
                trRange.push({
                    st: textRun.st < startIndex ? startIndex : textRun.st,
                    ed: textRun.ed > endIndex ? endIndex : textRun.ed,
                    sId: textRun.sId,
                    ts: textRun.ts,
                });
                this.textRunCurrentIndex = i;
            }
        }

        const firstTr = trRange[0] || { st: endIndex + 1 };
        if (firstTr.st > startIndex) {
            trRange.push({
                st: startIndex,
                ed: firstTr.st - 1,
            });
        }

        const lastTr = trRange[trRange.length - 1] || { ed: startIndex - 1 };
        if (lastTr.ed < endIndex) {
            trRange.push({
                st: lastTr.ed + 1,
                ed: endIndex,
            });
        }

        return trRange;
    }

    override getTextRun(index: number) {
        const textRuns = this.body.textRuns;
        if (textRuns == null) {
            return;
        }

        const curTextRun = textRuns[this.textRunCurrentIndex];
        if (curTextRun != null) {
            if (index >= curTextRun.st && index <= curTextRun.ed) {
                return curTextRun;
            }

            if (index < curTextRun.st) {
                return;
            }
        }

        for (
            let i = this.textRunCurrentIndex, textRunsLen = textRuns.length;
            i < textRunsLen;
            i++
        ) {
            const textRun = textRuns[i];
            if (index >= textRun.st && index <= textRun.ed) {
                this.textRunCurrentIndex = i;
                return textRun;
            }
        }
    }

    override getCustomBlock(index: number) {
        const customBlocks = this.body.customBlocks;
        if (customBlocks == null) {
            return;
        }

        for (let i = this.customBlockCurrentIndex; i < customBlocks.length; i++) {
            const customBlock = customBlocks[i];
            if (customBlock.startIndex === index) {
                this.customBlockCurrentIndex = i;
                return customBlock;
            }
        }
    }

    override getTable(index: number) {
        const tables = this.body.tables;
        if (tables == null) {
            return;
        }

        for (let i = this.tableBlockCurrentIndex; i < tables.length; i++) {
            const table = tables[i];
            if (table.startIndex === index) {
                this.tableBlockCurrentIndex = i;
                return table;
            }
        }
    }

    override getCustomRange(index: number) {
        const customRanges = this.body.customRanges;
        if (customRanges == null) {
            return;
        }
        for (
            let i = 0, customRangesLen = customRanges.length;
            i < customRangesLen;
            i++
        ) {
            const customRange = customRanges[i];
            if (index >= customRange.startIndex && index <= customRange.endIndex) {
                return customRange;
            }
        }
    }

    private move() {}

    private split() {}

    private merge() {}
}
