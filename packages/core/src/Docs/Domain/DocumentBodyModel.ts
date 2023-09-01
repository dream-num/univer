import { IDocumentBody, ITextRun } from '../../Types/Interfaces/IDocumentData';

import { checkParagraphHasBullet } from '../../Shared/DocTool';

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
        this.children = this._transformToTree(this.body.dataStream);
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

    selfPlus(len: number, index: number) {}

    getPositionInParent() {
        return 0;
    }

    private _transformToTree(dataStream: string) {
        const dataStreamLen = dataStream.length;

        let content = '';
        const sectionList: DataStreamTreeNode[] = [];
        let nodeList: DataStreamTreeNode[] = [];
        let currentBlocks: number[] = [];
        let paragraphIndex = 0;
        for (let i = 0; i < dataStreamLen; i++) {
            const char = dataStream[i];
            if (char === DataStreamTreeTokenType.PARAGRAPH) {
                content += DataStreamTreeTokenType.PARAGRAPH;
                const node = DataStreamTreeNode.create(
                    DataStreamTreeNodeType.PARAGRAPH,

                    content
                );
                const isBullet = this._checkParagraphBullet(paragraphIndex++);
                node.setIndexRange(i - content.length + 1, i);
                node.addBlocks(currentBlocks);
                node.isBullet = isBullet;
                nodeList.push(node);
                content = '';
                currentBlocks = [];
            } else if (char === DataStreamTreeTokenType.SECTION_BREAK) {
                const sectionTree = DataStreamTreeNode.create(DataStreamTreeNodeType.SECTION_BREAK);
                this._batchParent(sectionTree, nodeList);
                const lastNode = nodeList[nodeList.length - 1];
                if (lastNode && lastNode.content) {
                    lastNode.content += DataStreamTreeTokenType.SECTION_BREAK;
                }
                sectionList.push(sectionTree);
                nodeList = [];
            } else if (char === DataStreamTreeTokenType.TABLE_START) {
                nodeList.push(DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE));
            } else if (char === DataStreamTreeTokenType.TABLE_ROW_START) {
                nodeList.push(DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_ROW));
            } else if (char === DataStreamTreeTokenType.TABLE_CELL_START) {
                nodeList.push(DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_CELL));
            } else if (char === DataStreamTreeTokenType.TABLE_END) {
                this._processPreviousNodesUntil(nodeList, DataStreamTreeNodeType.TABLE);
            } else if (char === DataStreamTreeTokenType.TABLE_ROW_END) {
                this._processPreviousNodesUntil(nodeList, DataStreamTreeNodeType.TABLE_ROW);
            } else if (char === DataStreamTreeTokenType.TABLE_CELL_END) {
                this._processPreviousNodesUntil(nodeList, DataStreamTreeNodeType.TABLE_CELL);
            } else if (char === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                currentBlocks.push(i);
                content += char;
            } else {
                content += char;
            }
        }

        return sectionList;
    }

    private _processPreviousNodesUntil(nodeList: DataStreamTreeNode[], untilNodeType: DataStreamTreeNodeType) {
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
        this._batchParent(recentTree, nodeCollection, DataStreamTreeNodeType.TABLE);

        if (untilNodeType === DataStreamTreeNodeType.TABLE_CELL) {
            const firstNode = nodeCollection[0];
            const lastNode = nodeCollection[nodeCollection.length];
            firstNode.content = DataStreamTreeTokenType.TABLE_CELL_START + firstNode.content || '';
            firstNode.startIndex -= 1;
            lastNode.content += DataStreamTreeTokenType.TABLE_CELL_END;
            lastNode.endIndex += 1;
        } else if (untilNodeType === DataStreamTreeNodeType.TABLE_ROW) {
            const firstNode = nodeCollection[0].children[0];
            let lastNode = nodeCollection[nodeCollection.length];
            lastNode = lastNode.children[lastNode.children.length - 1];
            firstNode.content = DataStreamTreeTokenType.TABLE_ROW_START + firstNode.content || '';
            firstNode.startIndex -= 1;
            lastNode.content += DataStreamTreeTokenType.TABLE_ROW_END;
            lastNode.endIndex += 1;
        } else if (untilNodeType === DataStreamTreeNodeType.TABLE) {
            const firstNode = nodeCollection[0].children[0].children[0];
            let lastNode = nodeCollection[nodeCollection.length];
            lastNode = lastNode.children[lastNode.children.length - 1];
            lastNode = lastNode.children[lastNode.children.length - 1];
            firstNode.content = DataStreamTreeTokenType.TABLE_START + firstNode.content || '';
            firstNode.startIndex -= 1;
            lastNode.content += DataStreamTreeTokenType.TABLE_END;
            lastNode.endIndex += 1;
        }
    }

    private _batchParent(parent: DataStreamTreeNode, children: DataStreamTreeNode[], nodeType = DataStreamTreeNodeType.SECTION_BREAK) {
        for (const child of children) {
            child.parent = parent;
            parent.children.push(child);
        }

        const startOffset = nodeType === DataStreamTreeNodeType.SECTION_BREAK ? 0 : 1;

        parent.setIndexRange(children[0].startIndex - startOffset, children[children.length - 1].endIndex + 1);
    }

    private _checkParagraphBullet(index: number) {
        const { paragraphs } = this.body;
        if (paragraphs == null) {
            return false;
        }

        return checkParagraphHasBullet(paragraphs[index]);
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

        if (dataStream[dataStreamLen - 1] === DataStreamTreeTokenType.SECTION_BREAK) {
            const insertBodyModel = new DocumentBodyModelSimple(insertBody);
            dataStreamLen -= 1; // sectionBreak can not be inserted

            const insertNodes = insertBodyModel.children;

            for (const node of insertNodes) {
                this.foreachDown(node, (newNode) => {
                    newNode.plus(insertIndex);
                });
            }

            const insertedNodeSplit = insertedNode.split(insertIndex);

            if (insertedNodeSplit == null) {
                return;
            }

            const { firstNode: insertedFirstNode, lastNode: insertedLastNode } = insertedNodeSplit;

            insertedNode.parent?.children.splice(insertedNode.getPositionInParent(), 1, insertedFirstNode, ...insertNodes, insertedLastNode);

            this.foreachTop(insertedNode.parent, (currentNode) => {
                // currentNode.endIndex += dataStreamLen;
                currentNode.selfPlus(dataStreamLen, currentNode.getPositionInParent());
                const children = currentNode.children;
                let isStartFix = false;
                for (const node of children) {
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
        } else if (dataStreamLen === 1 && dataStream[dataStreamLen - 1] === DataStreamTreeTokenType.PARAGRAPH) {
            this._insertParagraph(insertedNode, insertIndex);
        } else {
            insertedNode.insertText(dataStream, insertIndex);

            // insertedNode.endIndex += dataStreamLen;
            insertedNode.selfPlus(dataStreamLen, insertIndex);

            this.foreachTop(insertedNode.parent, (currentNode) => {
                // currentNode.endIndex += dataStreamLen;
                currentNode.selfPlus(dataStreamLen, currentNode.getPositionInParent());
                const children = currentNode.children;
                let isStartFix = false;
                for (const node of children) {
                    if (node.startIndex > insertIndex) {
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

    deleteTree(nodes: DataStreamTreeNode[], currentIndex: number, textLength: number) {
        const startIndex = currentIndex;
        const endIndex = currentIndex + textLength - 1;
        let mergeNode: Nullable<DataStreamTreeNode> = null;
        let nodeCount = nodes.length;
        let i = 0;
        while (i < nodeCount) {
            const node = nodes[i];
            const { startIndex: st, endIndex: ed, children } = node;

            this.deleteTree(children, currentIndex, textLength);

            if (startIndex === endIndex && endIndex === ed) {
                // The cursor is at the dividing point between two paragraphs,
                // and it is necessary to determine whether to delete elements
                // such as paragraphs, chapters, and tables
                if (node.nodeType === DataStreamTreeNodeType.PARAGRAPH) {
                    const nextNode = this._getNextNode(node);
                    if (nextNode == null) {
                        i++;
                        continue;
                    }

                    if (nextNode.isBullet) {
                        i++;
                        continue;
                    } else {
                        node.minus(startIndex, endIndex);
                        node.merge(nextNode);
                        nodeCount--;
                    }
                }
                // else if (node.nodeType === DataStreamTreeNodeType.SECTION_BREAK) {
                // } else if (node.nodeType === DataStreamTreeNodeType.TABLE) {
                // } else if (node.nodeType === DataStreamTreeNodeType.TABLE_ROW) {
                // } else if (node.nodeType === DataStreamTreeNodeType.TABLE_CELL) {
                // }
            } else if (startIndex <= st && endIndex >= ed) {
                // The first case.  The selection range of the text box
                // is larger than the current node
                node.remove();
                nodeCount--;
                continue;
            } else if (st <= startIndex && ed >= endIndex) {
                // The second case. The selection range of
                // the text box is smaller than the current node
                node.minus(startIndex, endIndex);
            } else if (endIndex > st && endIndex < ed) {
                // The third case.
                // The text selection left contains the current node
                node.minus(st, endIndex);
                if (mergeNode) {
                    mergeNode.merge(node);
                    mergeNode = null;
                }
                nodeCount--;
                continue;
            } else if (startIndex > st && startIndex < ed) {
                // The fourth case.
                // The text selection right contains the current node
                node.minus(startIndex, ed);
                mergeNode = node;
            } else if (st > endIndex) {
                // The current node is not on the right side of
                // the selection area and needs to be moved as a whole
                node.plus(-textLength);
            }
            i++;
        }
    }

    getParagraphByTree(nodes: DataStreamTreeNode[], insertIndex: number): Nullable<DataStreamTreeNode> {
        for (const node of nodes) {
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

    foreachTop(node: Nullable<DataStreamTreeNode>, func: (node: DataStreamTreeNode | DocumentBodyModelOrSimple) => void) {
        let parent: Nullable<DataStreamTreeNode> = node;
        while (parent) {
            func(parent);
            parent = parent.parent;
        }

        func(this);
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

        for (let i = this.textRunCurrentIndex, textRunsLen = textRuns.length; i < textRunsLen; i++) {
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

        for (let i = this.textRunCurrentIndex, textRunsLen = textRuns.length; i < textRunsLen; i++) {
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
        for (let i = 0, customRangesLen = customRanges.length; i < customRangesLen; i++) {
            const customRange = customRanges[i];
            if (index >= customRange.startIndex && index <= customRange.endIndex) {
                return customRange;
            }
        }
    }

    private _getNextNode(node: DataStreamTreeNode): DataStreamTreeNode {
        const currentIndex = node.getPositionInParent();
        const children = node.parent?.children;
        return children?.[currentIndex + 1] as DataStreamTreeNode;
    }

    private _insertParagraph(insertedNode: DataStreamTreeNode, insertIndex = 0) {
        const insertStartIndex = insertedNode.startIndex;

        const insertEndIndex = insertedNode.endIndex;

        const insertedNodeSplit = insertedNode.split(insertIndex);

        if (insertedNodeSplit == null) {
            return;
        }

        const { firstNode: insertedFirstNode, lastNode: insertedLastNode } = insertedNodeSplit;

        insertedFirstNode.content += DataStreamTreeTokenType.PARAGRAPH;

        insertedFirstNode.selfPlus(1);

        insertedFirstNode.plus(insertStartIndex);

        this.foreachDown(insertedLastNode, (newNode) => {
            newNode.plus(insertStartIndex + 1);
        });

        insertedNode.parent?.children.splice(insertedNode.getPositionInParent(), 1, insertedFirstNode, insertedLastNode);

        this.foreachTop(insertedNode.parent, (currentNode) => {
            // currentNode.endIndex += dataStreamLen;
            currentNode.selfPlus(1, currentNode.getPositionInParent());
            const children = currentNode.children;
            let isStartFix = false;
            for (const node of children) {
                if (node.startIndex >= insertEndIndex + 1) {
                    isStartFix = true;
                }

                if (!isStartFix) {
                    continue;
                }

                this.foreachDown(node, (newNode) => {
                    newNode.plus(1);
                });
            }
        });
    }

    private move() {}

    private split() {}

    private merge() {}
}
