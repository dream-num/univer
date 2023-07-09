import { IDocumentBody, ITextRun } from '../../Interfaces/IDocumentData';
import { Nullable, insertTextToContent } from '../../Shared';

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
                    this,
                    content
                );
                node.setIndexRange(i - content.length + 1, i);
                node.addBlocks(currentBlocks);
                nodeList.push(node);
                content = '';
                currentBlocks = [];
            } else if (char === DataStreamTreeTokenType.SECTION_BREAK) {
                const sectionTree = DataStreamTreeNode.create(
                    DataStreamTreeNodeType.SECTION_BREAK,
                    this
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
                    DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE, this)
                );
            } else if (char === DataStreamTreeTokenType.TABLE_ROW_START) {
                nodeList.push(
                    DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_ROW, this)
                );
            } else if (char === DataStreamTreeTokenType.TABLE_CELL_START) {
                nodeList.push(
                    DataStreamTreeNode.create(
                        DataStreamTreeNodeType.TABLE_CELL,
                        this
                    )
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
        const insertNode = this.getParagraphByTree(this.children, insertIndex);
        if (insertNode == null) {
            return;
        }

        if (dataStream[dataStream.length - 1] === '\n') {
            const newBodyModel = new DocumentBodyModelSimple(insertBody);
            dataStreamLen -= 1; // sectionBreak can not be inserted
        } else {
            insertNode.insertText(dataStream, insertIndex);

            insertNode.endIndex += dataStreamLen;

            this.foreachTop(insertNode.parent, (currentNode) => {
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

    update() {}

    delete() {}

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

    foreachTop(node: DataStreamTreeNode, func: (node: DataStreamTreeNode) => void) {
        let parent = node;
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

    resetCache() {
        this.sectionBreakCurrentIndex = 0;
        this.paragraphCurrentIndex = 0;
        this.textRunCurrentIndex = 0;
        this.customBlockCurrentIndex = 0;
        this.tableBlockCurrentIndex = 0;
        this.customRangeCurrentIndex = 0;
    }

    getSectionBreak(index: number) {
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

    getParagraph(index: number) {
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

    getTextRunRange(startIndex: number = 0, endIndex: number) {
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

    getTextRun(index: number) {
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

    getCustomBlock(index: number) {
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

    getTable(index: number) {
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

    getCustomRange(index: number) {
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

export class DataStreamTreeNode {
    children: DataStreamTreeNode[] = [];

    parent: DataStreamTreeNode;

    startIndex: number;

    endIndex: number;

    blocks: number[] = [];

    constructor(
        public nodeType: DataStreamTreeNodeType,
        public bodyModel: DocumentBodyModelOrSimple,
        public content?: string
    ) {}

    static create(
        nodeType: DataStreamTreeNodeType,
        bodyModel: DocumentBodyModelOrSimple,
        content?: string
    ) {
        return new DataStreamTreeNode(nodeType, bodyModel, content);
    }

    addBlocks(blocks: number[]) {
        this.blocks = this.blocks.concat(blocks);
    }

    setIndexRange(startIndex: number, endIndex: number) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
    }

    insertText(text: string, insertIndex: number) {
        this.content = insertTextToContent(
            this.content || '',
            insertIndex - this.startIndex + 1,
            text
        );
    }

    exclude(index: number) {
        return index < this.startIndex || index > this.endIndex;
    }

    plus(len: number) {
        this.startIndex += len;
        this.endIndex += len;
    }

    minus(len: number) {}

    moveTo(newParent: DataStreamTreeNode) {}
}

export enum DataStreamTreeNodeType {
    // COLUMN_BREAK, // \v 换列
    // PAGE_BREAK, // \f 换页
    // DOCS_END, // \0  文档结尾
    // TAB, // \t  制表符
    PARAGRAPH, // \r  段落
    SECTION_BREAK, // \n  章节
    TABLE,
    TABLE_ROW,
    TABLE_CELL,
    // CUSTOM_BLOCK, // \b  图片 mention等不参与文档流的场景
    // TABLE_START, // \x1A  表格开始
    // TABLE_ROW_START, // \x1B  表格开始
    // TABLE_CELL_START, // \x1C  表格开始
    // TABLE_CELL_END, //* \x1D 表格开始
    // TABLE_ROW_END, // \x1E  表格开始
    // TABLE_END, // \x1F  表格结束
    // CUSTOM_RANGE_START, // \x1F  自定义范围开始
    // CUSTOM_RANGE_END, // \x1E  自定义范围结束
}

export enum DataStreamTreeTokenType {
    PARAGRAPH = '\r', // 段落
    SECTION_BREAK = '\n', // 章节
    TABLE_START = '\x1A', // 表格开始
    TABLE_ROW_START = '\x1B', // 表格开始
    TABLE_CELL_START = '\x1C', // 表格开始
    TABLE_CELL_END = '\x1D', // 表格开始
    TABLE_ROW_END = '\x1E', // 表格开始
    TABLE_END = '\x1F', // 表格结束
    CUSTOM_RANGE_START = '\x1F', // 自定义范围开始
    CUSTOM_RANGE_END = '\x1E', // 自定义范围结束

    COLUMN_BREAK = '\v', // 换列
    PAGE_BREAK = '\f', // 换页
    DOCS_END = '\0', // 文档结尾
    TAB = '\t', // 制表符
    CUSTOM_BLOCK = '\b', // 图片 mention等不参与文档流的场景

    LETTER = '',
}
