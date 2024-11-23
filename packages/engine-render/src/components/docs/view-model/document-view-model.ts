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

import type { ICustomDecorationForInterceptor, ICustomRangeForInterceptor, ICustomTable, IDisposable, IDocumentBody, ITextRun, Nullable } from '@univerjs/core';
import { DataStreamTreeNodeType, DataStreamTreeTokenType, DocumentDataModel, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { DataStreamTreeNode } from './data-stream-tree-node';

interface ITableCache {
    table: DataStreamTreeNode;
    isFinished: boolean;
}

interface ITableNodeCache {
    table: DataStreamTreeNode;
}

export interface ICustomRangeInterceptor {
    getCustomRange: (index: number) => Nullable<ICustomRangeForInterceptor>;
    getCustomDecoration: (index: number) => Nullable<ICustomDecorationForInterceptor>;
}

export enum DocumentEditArea {
    BODY = 'BODY',
    HEADER = 'HEADER',
    FOOTER = 'FOOTER',
}

function batchParent(
    parent: DataStreamTreeNode,
    children: DataStreamTreeNode[],
    nodeType = DataStreamTreeNodeType.SECTION_BREAK
) {
    if (children.length === 0) {
        throw new Error('Missing `paragraphs` or `sectionBreaks` fields, or doesn\'t correspond to the location in `dataStream`.');
    }

    for (const child of children) {
        child.parent = parent;
        parent.children.push(child);
    }

    const startOffset = nodeType === DataStreamTreeNodeType.SECTION_BREAK ? 0 : 1;
    const allChildren = parent.children;

    parent.setIndexRange(allChildren[0].startIndex - startOffset, allChildren[allChildren.length - 1].endIndex + 1);
}

export function parseDataStreamToTree(dataStream: string, tables?: ICustomTable[]) {
    let content = '';
    const dataStreamLen = dataStream.length;
    const sectionList: DataStreamTreeNode[] = [];
    const tableNodeCache: Map<string, ITableNodeCache> = new Map();
    // Only use to cache the outer paragraphs.
    const paragraphList: DataStreamTreeNode[] = [];
    // Use to cache paragraphs in cell.
    const cellParagraphList: DataStreamTreeNode[] = [];
    const tableList: ITableCache[] = [];
    const tableRowList: DataStreamTreeNode[] = [];
    const tableCellList: DataStreamTreeNode[] = [];
    const currentBlocks: number[] = [];

    for (let i = 0; i < dataStreamLen; i++) {
        const char = dataStream[i];

        if (char === DataStreamTreeTokenType.PARAGRAPH) {
            content += DataStreamTreeTokenType.PARAGRAPH;

            const paragraphNode = DataStreamTreeNode.create(DataStreamTreeNodeType.PARAGRAPH, content);

            const lastTableCache = tableList[tableList.length - 1];
            if (lastTableCache && lastTableCache.isFinished) {
                // Paragraph Node will only has one table node.
                batchParent(paragraphNode, [lastTableCache.table], DataStreamTreeNodeType.PARAGRAPH);

                if (tables) {
                    const table = tables.find((table) => table.startIndex === lastTableCache.table.startIndex && table.endIndex === lastTableCache.table.endIndex + 1);
                    if (table) {
                        tableNodeCache.set(table.tableId, { table: lastTableCache.table });
                    }
                }

                tableList.pop();
            }

            // Paragraph start and end index is from the first char of the paragraph to the last char of the paragraph. not include the Table content.
            paragraphNode.setIndexRange(i - content.length + 1, i);
            paragraphNode.addBlocks(currentBlocks);
            currentBlocks.length = 0;
            content = '';

            if (tableCellList.length > 0) {
                cellParagraphList.push(paragraphNode);
            } else {
                paragraphList.push(paragraphNode);
            }
        } else if (char === DataStreamTreeTokenType.SECTION_BREAK) {
            const sectionNode = DataStreamTreeNode.create(DataStreamTreeNodeType.SECTION_BREAK);
            const tempParagraphList = tableCellList.length > 0 ? cellParagraphList : paragraphList;

            batchParent(sectionNode, tempParagraphList);

            const lastNode = tempParagraphList[tempParagraphList.length - 1];

            if (lastNode && lastNode.content) {
                lastNode.content += DataStreamTreeTokenType.SECTION_BREAK;
            }

            if (tableCellList.length > 0) {
                const lastCell = tableCellList[tableCellList.length - 1];

                batchParent(lastCell, [sectionNode], DataStreamTreeNodeType.TABLE_CELL);
            } else {
                sectionList.push(sectionNode);
            }

            tempParagraphList.length = 0;
        } else if (char === DataStreamTreeTokenType.TABLE_START) {
            const tableNode = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE);

            tableList.push({
                table: tableNode,
                isFinished: false,
            });
        } else if (char === DataStreamTreeTokenType.TABLE_ROW_START) {
            const rowNode = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_ROW);

            tableRowList.push(rowNode);
        } else if (char === DataStreamTreeTokenType.TABLE_CELL_START) {
            const cellNode = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_CELL);

            tableCellList.push(cellNode);
        } else if (char === DataStreamTreeTokenType.TABLE_END) {
            const lastTable = tableList[tableList.length - 1];
            lastTable.isFinished = true;
            content = '';
        } else if (char === DataStreamTreeTokenType.TABLE_ROW_END) {
            const rowNode = tableRowList.pop();
            const lastTableCache = tableList[tableList.length - 1];

            batchParent(lastTableCache.table, [rowNode!], DataStreamTreeNodeType.TABLE);
        } else if (char === DataStreamTreeTokenType.TABLE_CELL_END) {
            const cellNode = tableCellList.pop();

            const lastRow = tableRowList[tableRowList.length - 1];

            batchParent(lastRow, [cellNode!], DataStreamTreeNodeType.TABLE_ROW);
        } else if (char === DataStreamTreeTokenType.CUSTOM_BLOCK) {
            currentBlocks.push(i);
            content += char;
        } else {
            content += char;
        }
    }

    return { sectionList, tableNodeCache };
}

export class DocumentViewModel implements IDisposable {
    private _cacheSize = 1000;

    private _textRunsCache: Map<number, Map<number, ITextRun>> = new Map();

    private _interceptor: Nullable<ICustomRangeInterceptor> = null;

    private _tableNodeCache: Map<string, ITableNodeCache> = new Map();

    children: DataStreamTreeNode[] = [];
    private _sectionBreakCurrentIndex = 0;
    private _paragraphCurrentIndex = 0;
    private _textRunCurrentIndex = 0;
    private _customBlockCurrentIndex = 0;
    private _tableBlockCurrentIndex = 0;
    private _editArea: DocumentEditArea = DocumentEditArea.BODY;

    private readonly _editAreaChange$ = new BehaviorSubject<Nullable<DocumentEditArea>>(null);
    readonly editAreaChange$ = this._editAreaChange$.asObservable();

    headerTreeMap: Map<string, DocumentViewModel> = new Map();
    footerTreeMap: Map<string, DocumentViewModel> = new Map();

    private readonly _segmentViewModels$ = new BehaviorSubject<DocumentViewModel[]>([]);
    readonly segmentViewModels$ = this._segmentViewModels$.asObservable();

    constructor(private _documentDataModel: DocumentDataModel) {
        if (_documentDataModel.getBody() == null) {
            return;
        }

        const body = _documentDataModel.getBody()!;

        const { sectionList, tableNodeCache } = parseDataStreamToTree(body.dataStream, body.tables);
        this._buildTextRunsCache();

        this.children = sectionList;
        this._tableNodeCache = tableNodeCache;

        this._buildHeaderFooterViewModel();
    }

    registerCustomRangeInterceptor(interceptor: ICustomRangeInterceptor): IDisposable {
        this._interceptor = interceptor;
        return toDisposable(() => this._interceptor = null);
    }

    dispose(): void {
        this.children.forEach((child) => {
            child.dispose();
        });

        this._textRunsCache.clear();
    }

    selfPlus(_len: number, _index: number) {
        // empty
    }

    getEditArea() {
        return this._editArea;
    }

    setEditArea(editArea: DocumentEditArea) {
        if (editArea !== this._editArea) {
            this._editArea = editArea;
            this._editAreaChange$.next(editArea);
        }
    }

    getPositionInParent() {
        return 0;
    }

    getLastIndex() {
        return this.children[this.children.length - 1].endIndex;
    }

    getBody() {
        return this._documentDataModel.getBody();
    }

    getSnapshot() {
        return this._documentDataModel.getSnapshot();
    }

    getDataModel() {
        return this._documentDataModel;
    }

    getSelfOrHeaderFooterViewModel(segmentId?: string) {
        if (segmentId == null) {
            return this as DocumentViewModel;
        }

        if (this.headerTreeMap.has(segmentId)) {
            return this.headerTreeMap.get(segmentId)!;
        }

        if (this.footerTreeMap.has(segmentId)) {
            return this.footerTreeMap.get(segmentId)!;
        }

        return this as DocumentViewModel;
    }

    reset(documentDataModel: DocumentDataModel) {
        this._documentDataModel = documentDataModel;

        const body = documentDataModel.getBody()!;

        const { sectionList, tableNodeCache } = parseDataStreamToTree(body.dataStream, body.tables);

        this.children = sectionList;

        this._tableNodeCache = tableNodeCache;
        this._buildTextRunsCache();

        this._buildHeaderFooterViewModel();
    }

    insert(insertBody: IDocumentBody, insertIndex = 0) {
        const dataStream = insertBody.dataStream;
        let dataStreamLen = dataStream.length;
        const insertedNode = this._getParagraphByIndex(this.children, insertIndex);

        if (insertedNode == null) {
            return;
        }

        if (dataStream[dataStreamLen - 1] === DataStreamTreeTokenType.SECTION_BREAK) {
            const docDataModel = new DocumentDataModel({ body: insertBody });
            const insertBodyModel = new DocumentViewModel(docDataModel);

            dataStreamLen -= 1; // sectionBreak can not be inserted

            const insertNodes = insertBodyModel.children;

            for (const node of insertNodes) {
                this._forEachDown(node, (newNode) => {
                    newNode.plus(insertIndex);
                });
            }

            const insertedNodeSplit = insertedNode.split(insertIndex);

            if (insertedNodeSplit == null) {
                return;
            }

            const { firstNode: insertedFirstNode, lastNode: insertedLastNode } = insertedNodeSplit;

            insertedNode.parent?.children.splice(
                insertedNode.getPositionInParent(),
                1,
                insertedFirstNode,
                ...insertNodes,
                insertedLastNode
            );

            this._forEachTop(insertedNode.parent, (currentNode) => {
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

                    this._forEachDown(node, (newNode) => {
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

            this._forEachTop(insertedNode.parent, (currentNode) => {
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

                    this._forEachDown(node, (newNode) => {
                        newNode.plus(dataStreamLen);
                    });
                }
            });
        }
    }

    delete(currentIndex: number, textLength: number) {
        const nodes = this.children;

        this._deleteTree(nodes, currentIndex, textLength);
    }

    /** Get pure text content in the given range. */
    getText(): string {
        // Basically this is a DFS traversal of the tree to get the `content` and append it to the result.
        // TODO: implement
        const pieces: string[] = [];

        function traverseTreeNode(node: DataStreamTreeNode) {
            if (node.content) {
                pieces.push(node.content);
            }

            node.children.forEach(traverseTreeNode);
        }

        this.children.forEach((n) => traverseTreeNode(n));

        return pieces.join('');
    }

    resetCache() {
        this._sectionBreakCurrentIndex = 0;
        this._paragraphCurrentIndex = 0;
        this._customBlockCurrentIndex = 0;
        this._tableBlockCurrentIndex = 0;

        if (this.headerTreeMap.size > 0) {
            for (const header of this.headerTreeMap.values()) {
                header.resetCache();
            }
        }

        if (this.footerTreeMap.size > 0) {
            for (const footer of this.footerTreeMap.values()) {
                footer.resetCache();
            }
        }
    }

    getSectionBreak(index: number) {
        if (index == null) {
            return;
        }
        const sectionBreaks = this.getBody()!.sectionBreaks;
        if (sectionBreaks == null) {
            return;
        }

        for (let i = this._sectionBreakCurrentIndex; i < sectionBreaks.length; i++) {
            const sectionBreak = sectionBreaks[i];
            if (sectionBreak.startIndex === index) {
                this._sectionBreakCurrentIndex = i;

                return sectionBreak;
            }
        }
    }

    // TODO: @jocs, Use hash map to instead of array.
    getParagraph(index: number, fromStart = false) {
        const paragraphs = this.getBody()!.paragraphs;
        if (paragraphs == null) {
            return;
        }

        for (let i = fromStart ? 0 : this._paragraphCurrentIndex; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            if (paragraph.startIndex === index) {
                if (!fromStart) {
                    this._paragraphCurrentIndex = i;
                }

                return paragraph;
            }
        }
    }

    /**
     * textRun matches according to the selection. If the text length is 10, then the range of textRun is from 0 to 11.
     */
    getTextRun(index: number): Nullable<ITextRun> {
        const cacheIndex = Math.floor(index / this._cacheSize);
        const textRunsCache = this._textRunsCache.get(cacheIndex);

        return textRunsCache?.get(index % this._cacheSize);
    }

    getCustomBlock(index: number) {
        const customBlocks = this.getBody()!.customBlocks;
        if (customBlocks == null) {
            return;
        }

        for (let i = this._customBlockCurrentIndex; i < customBlocks.length; i++) {
            const customBlock = customBlocks[i];
            if (customBlock.startIndex === index) {
                this._customBlockCurrentIndex = i;

                return customBlock;
            }
        }
    }

    getCustomBlockWithoutSetCurrentIndex(index: number) {
        const customBlocks = this.getBody()!.customBlocks;
        if (customBlocks == null) {
            return;
        }
        for (let i = 0; i < customBlocks.length; i++) {
            const customBlock = customBlocks[i];
            if (customBlock.startIndex === index) {
                return customBlock;
            }
        }
    }

    getTable(index: number) {
        const tables = this.getBody()?.tables;
        const tableSource = this.getSnapshot().tableSource;
        if (tables == null || tableSource == null) {
            return;
        }

        let tableId: Nullable<string> = null;

        for (let i = this._tableBlockCurrentIndex; i < tables.length; i++) {
            const table = tables[i];
            if (table.startIndex === index) {
                this._tableBlockCurrentIndex = i;
                tableId = table.tableId;
                break;
            }
        }

        if (tableId != null && tableSource[tableId] != null) {
            return tableSource[tableId];
        }
    }

    findTableNodeById(id: string) {
        return this._tableNodeCache.get(id)?.table;
    }

    getCustomRangeRaw(index: number) {
        const customRanges = this.getBody()!.customRanges;
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

    getCustomRange(index: number): Nullable<ICustomRangeForInterceptor> {
        if (this._interceptor) {
            return this._interceptor.getCustomRange(index);
        }

        return this.getCustomRangeRaw(index);
    }

    getCustomDecorationRaw(index: number) {
        const customDecorations = this.getBody()!.customDecorations;
        if (customDecorations == null) {
            return;
        }

        for (let i = 0, customDecorationsLen = customDecorations.length; i < customDecorationsLen; i++) {
            const customDecoration = customDecorations[i];
            if (index >= customDecoration.startIndex && index <= customDecoration.endIndex) {
                return customDecoration;
            }
        }
    }

    getCustomDecoration(index: number): Nullable<ICustomDecorationForInterceptor> {
        if (this._interceptor) {
            return this._interceptor.getCustomDecoration(index);
        }

        return this.getCustomDecorationRaw(index);
    }

    private _buildTextRunsCache() {
        const textRuns = this.getBody()?.textRuns ?? [];
        this._textRunsCache.clear();

        for (const textRun of textRuns) {
            const { st, ed } = textRun;

            for (let i = st; i < ed; i++) {
                const cacheIndex = Math.floor(i / this._cacheSize);

                if (!this._textRunsCache.has(cacheIndex)) {
                    this._textRunsCache.set(cacheIndex, new Map());
                }

                this._textRunsCache.get(cacheIndex)!.set(i % this._cacheSize, textRun);
            }
        }
    }

    private _buildHeaderFooterViewModel() {
        const { headerModelMap, footerModelMap } = this._documentDataModel;
        const viewModels = [];
        for (const [headerId, headerModel] of headerModelMap) {
            this.headerTreeMap.set(headerId, new DocumentViewModel(headerModel));
            viewModels.push(this.headerTreeMap.get(headerId)!);
        }

        for (const [footerId, footerModel] of footerModelMap) {
            this.footerTreeMap.set(footerId, new DocumentViewModel(footerModel));
            viewModels.push(this.footerTreeMap.get(footerId)!);
        }

        this._segmentViewModels$.next(viewModels);
    }

    private _getParagraphByIndex(nodes: DataStreamTreeNode[], insertIndex: number): Nullable<DataStreamTreeNode> {
        for (const node of nodes) {
            const { children } = node;

            if (node.exclude(insertIndex)) {
                continue;
            }

            if (node.nodeType === DataStreamTreeNodeType.PARAGRAPH) {
                return node;
            }

            return this._getParagraphByIndex(children, insertIndex);
        }

        return null;
    }

    private _forEachTop(
        node: Nullable<DataStreamTreeNode>,
        func: (node: DataStreamTreeNode | DocumentViewModel) => void
    ) {
        let parent: Nullable<DataStreamTreeNode> = node;

        while (parent) {
            func(parent);
            parent = parent.parent;
        }

        func(this);
    }

    private _forEachDown(node: DataStreamTreeNode, func: (node: DataStreamTreeNode) => void) {
        func(node);

        const children = node.children;

        for (node of children) {
            this._forEachDown(node, func);
        }
    }

    private _deleteTree(nodes: DataStreamTreeNode[], currentIndex: number, textLength: number) {
        const startIndex = currentIndex;
        const endIndex = currentIndex + textLength - 1;
        let mergeNode: Nullable<DataStreamTreeNode> = null;
        let nodeCount = nodes.length;
        let i = 0;

        while (i < nodeCount) {
            const node = nodes[i];
            const { startIndex: st, endIndex: ed, children } = node;

            this._deleteTree(children, currentIndex, textLength);

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

                    // if (nextNode.isBullet || nextNode.isIndent) {
                    //     i++;
                    //     continue;
                    // } else {
                    node.minus(startIndex, endIndex);
                    node.merge(nextNode);
                    nodeCount--;
                    // }
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
                if (mergeNode != null) {
                    mergeNode.merge(node);
                    mergeNode = null;
                    nodeCount--;
                    continue;
                }
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

        this._forEachDown(insertedLastNode, (newNode) => {
            newNode.plus(insertStartIndex + 1);
        });

        insertedNode.parent?.children.splice(
            insertedNode.getPositionInParent(),
            1,
            insertedFirstNode,
            insertedLastNode
        );

        this._forEachTop(insertedNode.parent, (currentNode) => {
            // currentNode.endIndex += dataStreamLen;
            currentNode.selfPlus(1, currentNode.getPositionInParent());
            const children = currentNode.children;
            let isStartFix = false;

            for (const node of children) {
                // `insertedLastNode` no need to fix, because it already add 1.
                if (node === insertedLastNode) {
                    continue;
                }

                if (node.startIndex >= insertEndIndex + 1) {
                    isStartFix = true;
                }

                if (!isStartFix) {
                    continue;
                }

                this._forEachDown(node, (newNode) => {
                    newNode.plus(1);
                });
            }
        });
    }
}
