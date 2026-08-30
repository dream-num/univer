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

import type { DocumentDataModel, IColumnGroup, ICustomBlock, ICustomColumnGroup, ICustomDecorationForInterceptor, ICustomRangeForInterceptor, ICustomTable, IDisposable, IParagraph, ISectionBreak, ITable, ITextRun, JSONXActions, JSONXPath, Nullable } from '@univerjs/core';
import {
    DataStreamTreeNodeType,
    DataStreamTreeTokenType,
    getRichTextEditPath,
    JSON1,
    TextX,
    TextXActionType,
    toDisposable,
} from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { DataStreamTreeNode } from './data-stream-tree-node';

interface ITableCache {
    table: DataStreamTreeNode;
    isFinished: boolean;
}

interface ITableNodeCache {
    table: DataStreamTreeNode;
}

interface ITextRunCacheBucket {
    runs: ITextRun[];
    isOrderedAndDisjoint: boolean;
}

interface IDataStreamMutationEdit {
    offset: number;
    deleteCount: number;
    insertText: string;
}

interface IStartIndexedItem {
    startIndex: number;
}

const NON_STRUCTURAL_ROOT_FIELDS = new Set<string>([
    'disabled',
    'documentStyle',
    'drawings',
    'drawingsOrder',
    'lists',
    'locale',
    'resources',
    'rev',
    'settings',
    'tableSource',
    'title',
]);

function getNonStructuralMutationRootFields(actions: JSONXActions): Set<string> | null {
    const cursor = JSON1.type.readCursor(actions);
    const rootFields = new Set<string>();
    let hasComponent = false;
    let isSupported = true;

    cursor.traverse(null, () => {
        hasComponent = true;
        const rootField = String(cursor.getPath()[0]);
        if (!NON_STRUCTURAL_ROOT_FIELDS.has(rootField)) {
            isSupported = false;
            return;
        }
        rootFields.add(rootField);
    });

    return hasComponent && isSupported ? rootFields : null;
}

function isOrderedByStartIndex(items: readonly IStartIndexedItem[]): boolean {
    for (let index = 1; index < items.length; index++) {
        if (items[index - 1].startIndex > items[index].startIndex) {
            return false;
        }
    }

    return true;
}

function findByStartIndex<T extends IStartIndexedItem>(
    items: readonly T[],
    startIndex: number,
    isOrdered: boolean
): T | undefined {
    if (!isOrdered) {
        return items.find((item) => item.startIndex === startIndex);
    }

    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const item = items[middle];
        if (startIndex < item.startIndex) {
            high = middle - 1;
        } else if (startIndex > item.startIndex) {
            low = middle + 1;
        } else {
            return item;
        }
    }
}

function findOrderedTextRun(textRuns: readonly ITextRun[], index: number): ITextRun | undefined {
    let low = 0;
    let high = textRuns.length - 1;
    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const textRun = textRuns[middle];
        if (index < textRun.st) {
            high = middle - 1;
        } else if (index >= textRun.ed) {
            low = middle + 1;
        } else {
            return textRun;
        }
    }
}

function findFirstNodeStartingAtOrAfter(nodes: readonly DataStreamTreeNode[], startIndex: number): number {
    let low = 0;
    let high = nodes.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (nodes[middle].startIndex < startIndex) {
            low = middle + 1;
        } else {
            high = middle;
        }
    }
    return low;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value != null && !Array.isArray(value);
}

function pathsEqual(left: JSONXPath, right: JSONXPath): boolean {
    return left.length === right.length && left.every((item, index) => item === right[index]);
}

const DATA_STREAM_TREE_TOKEN_PATTERN_SOURCE = `[${[
    DataStreamTreeTokenType.PARAGRAPH,
    DataStreamTreeTokenType.SECTION_BREAK,
    DataStreamTreeTokenType.TABLE_START,
    DataStreamTreeTokenType.TABLE_ROW_START,
    DataStreamTreeTokenType.TABLE_CELL_START,
    DataStreamTreeTokenType.TABLE_CELL_END,
    DataStreamTreeTokenType.TABLE_ROW_END,
    DataStreamTreeTokenType.TABLE_END,
    DataStreamTreeTokenType.COLUMN_GROUP_START,
    DataStreamTreeTokenType.COLUMN_START,
    DataStreamTreeTokenType.COLUMN_END,
    DataStreamTreeTokenType.COLUMN_GROUP_END,
    DataStreamTreeTokenType.BLOCK_START,
    DataStreamTreeTokenType.BLOCK_END,
    DataStreamTreeTokenType.CUSTOM_BLOCK,
].join('')}]`;

function getDataStreamMutationEdits(
    actions: JSONXActions,
    expectedPath: JSONXPath
): IDataStreamMutationEdit[] | null {
    const cursor = JSON1.type.readCursor(actions);
    const edits: IDataStreamMutationEdit[] = [];
    let currentOffset = 0;
    let componentCount = 0;
    let isSupported = true;

    cursor.traverse(null, (component) => {
        componentCount++;
        if (
            componentCount !== 1 ||
            component.et !== TextX.id ||
            !pathsEqual(cursor.getPath(), expectedPath) ||
            !Array.isArray(component.e)
        ) {
            isSupported = false;
            return;
        }

        for (const action of component.e) {
            if (!isRecord(action) || typeof action.len !== 'number' || !Number.isFinite(action.len) || action.len < 0) {
                isSupported = false;
                return;
            }

            if (action.t === TextXActionType.RETAIN) {
                currentOffset += action.len;
            } else if (action.t === TextXActionType.DELETE) {
                edits.push({ offset: currentOffset, deleteCount: action.len, insertText: '' });
            } else if (action.t === TextXActionType.INSERT) {
                const dataStream = isRecord(action.body) ? action.body.dataStream : undefined;
                if (
                    typeof dataStream !== 'string' ||
                    dataStream.length !== action.len ||
                    new RegExp(DATA_STREAM_TREE_TOKEN_PATTERN_SOURCE).test(dataStream)
                ) {
                    isSupported = false;
                    return;
                }
                edits.push({ offset: currentOffset, deleteCount: 0, insertText: dataStream });
                currentOffset += action.len;
            } else {
                isSupported = false;
                return;
            }
        }
    });

    return isSupported && componentCount === 1 ? edits : null;
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
    let contentStartIndex = 0;
    const sectionList: DataStreamTreeNode[] = [];
    const tableNodeCache: Map<string, ITableNodeCache> = new Map();
    const tablesByRange = new Map<number, Map<number, ICustomTable>>();
    for (const table of tables ?? []) {
        let tablesByEnd = tablesByRange.get(table.startIndex);
        if (tablesByEnd == null) {
            tablesByEnd = new Map();
            tablesByRange.set(table.startIndex, tablesByEnd);
        }
        tablesByEnd.set(table.endIndex, table);
    }
    // Only use to cache the outer paragraphs.
    const paragraphList: DataStreamTreeNode[] = [];
    // Each open table cell owns its paragraphs. A single shared list makes an
    // inner table consume the paragraphs that precede it in the outer cell.
    const cellParagraphLists: DataStreamTreeNode[][] = [];
    const tableList: ITableCache[] = [];
    const tableRowList: DataStreamTreeNode[] = [];
    const tableCellList: DataStreamTreeNode[] = [];
    const columnGroupList: DataStreamTreeNode[] = [];
    const columnList: DataStreamTreeNode[] = [];
    const columnParagraphList: DataStreamTreeNode[] = [];
    const columnSectionList: DataStreamTreeNode[] = [];
    const currentBlocks: number[] = [];

    const getParagraphList = () => {
        if (tableCellList.length > 0) {
            return cellParagraphLists[cellParagraphLists.length - 1];
        }

        if (columnGroupList.length > 0) {
            return columnParagraphList;
        }

        return paragraphList;
    };
    const appendToPreviousParagraph = (char: string) => {
        const tempParagraphList = getParagraphList();
        const lastParagraph = tempParagraphList[tempParagraphList.length - 1];
        if (lastParagraph) {
            lastParagraph.content = `${lastParagraph.content ?? ''}${char}`;
            return true;
        }

        return false;
    };

    const tokenPattern = new RegExp(DATA_STREAM_TREE_TOKEN_PATTERN_SOURCE, 'g');
    for (const match of dataStream.matchAll(tokenPattern)) {
        const i = match.index;
        const char = match[0];

        if (char === DataStreamTreeTokenType.PARAGRAPH) {
            const content = dataStream.slice(contentStartIndex, i + 1);

            const paragraphNode = DataStreamTreeNode.create(DataStreamTreeNodeType.PARAGRAPH, content);
            let wrappedTableStartIndex: number | undefined;

            const lastTableCache = tableList[tableList.length - 1];
            if (lastTableCache && lastTableCache.isFinished) {
                // Paragraph Node will only has one table node.
                batchParent(paragraphNode, [lastTableCache.table], DataStreamTreeNodeType.PARAGRAPH);
                wrappedTableStartIndex = lastTableCache.table.startIndex;

                const table = tablesByRange
                    .get(lastTableCache.table.startIndex)
                    ?.get(lastTableCache.table.endIndex + 1);
                if (table) {
                    tableNodeCache.set(table.tableId, { table: lastTableCache.table });
                }

                tableList.pop();
            }

            // Paragraph start and end index is from the first char of the paragraph to the last char of the paragraph. not include the Table content.
            paragraphNode.setIndexRange(wrappedTableStartIndex ?? contentStartIndex, i);
            paragraphNode.addBlocks(currentBlocks);
            currentBlocks.length = 0;
            contentStartIndex = i + 1;

            if (tableCellList.length > 0) {
                cellParagraphLists[cellParagraphLists.length - 1].push(paragraphNode);
            } else if (columnGroupList.length > 0) {
                columnParagraphList.push(paragraphNode);
            } else {
                paragraphList.push(paragraphNode);
            }
        } else if (char === DataStreamTreeTokenType.SECTION_BREAK) {
            const sectionNode = DataStreamTreeNode.create(DataStreamTreeNodeType.SECTION_BREAK);
            const content = dataStream.slice(contentStartIndex, i);
            const tempParagraphList = tableCellList.length > 0
                ? cellParagraphLists[cellParagraphLists.length - 1]
                : columnGroupList.length > 0
                    ? columnParagraphList
                    : paragraphList;

            if (
                tempParagraphList.length > 0 &&
                currentBlocks.length > 0 &&
                content === DataStreamTreeTokenType.CUSTOM_BLOCK.repeat(currentBlocks.length)
            ) {
                // Older drawing insertion could leave custom blocks between a paragraph terminator and section break.
                // Project them as a synthetic paragraph without changing the persisted snapshot.
                const blockParagraph = DataStreamTreeNode.create(DataStreamTreeNodeType.PARAGRAPH, content);
                blockParagraph.setIndexRange(i - content.length, i - 1);
                blockParagraph.addBlocks(currentBlocks);
                tempParagraphList.push(blockParagraph);
                currentBlocks.length = 0;
            }

            if (tempParagraphList.length === 0) {
                const emptyParagraph = DataStreamTreeNode.create(DataStreamTreeNodeType.PARAGRAPH, '');
                emptyParagraph.setIndexRange(i, i - 1);
                tempParagraphList.push(emptyParagraph);
            }

            batchParent(sectionNode, tempParagraphList);

            const lastNode = tempParagraphList[tempParagraphList.length - 1];

            if (lastNode && lastNode.content) {
                lastNode.content += DataStreamTreeTokenType.SECTION_BREAK;
            }

            if (tableCellList.length > 0) {
                const lastCell = tableCellList[tableCellList.length - 1];

                batchParent(lastCell, [sectionNode], DataStreamTreeNodeType.TABLE_CELL);
            } else if (columnGroupList.length > 0) {
                columnSectionList.push(sectionNode);
            } else {
                sectionList.push(sectionNode);
            }

            tempParagraphList.length = 0;
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.TABLE_START) {
            const tableNode = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE);

            tableList.push({
                table: tableNode,
                isFinished: false,
            });
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.TABLE_ROW_START) {
            const rowNode = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_ROW);

            tableRowList.push(rowNode);
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.TABLE_CELL_START) {
            const cellNode = DataStreamTreeNode.create(DataStreamTreeNodeType.TABLE_CELL);

            tableCellList.push(cellNode);
            cellParagraphLists.push([]);
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.TABLE_END) {
            const lastTable = tableList[tableList.length - 1];
            lastTable.isFinished = true;
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.TABLE_ROW_END) {
            const rowNode = tableRowList.pop();
            const lastTableCache = tableList[tableList.length - 1];

            batchParent(lastTableCache.table, [rowNode!], DataStreamTreeNodeType.TABLE);
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.TABLE_CELL_END) {
            const cellNode = tableCellList.pop();
            cellParagraphLists.pop();

            const lastRow = tableRowList[tableRowList.length - 1];

            batchParent(lastRow, [cellNode!], DataStreamTreeNodeType.TABLE_ROW);
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.COLUMN_GROUP_START) {
            const columnGroupNode = DataStreamTreeNode.create(DataStreamTreeNodeType.COLUMN_GROUP);
            columnGroupNode.setIndexRange(i, i);

            columnGroupList.push(columnGroupNode);
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.COLUMN_START) {
            const columnNode = DataStreamTreeNode.create(DataStreamTreeNodeType.COLUMN);
            columnNode.setIndexRange(i, i);

            columnList.push(columnNode);
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.COLUMN_END) {
            const columnNode = columnList[columnList.length - 1];
            const columnChildren = columnSectionList.length > 0 ? columnSectionList : columnParagraphList;
            const columnStartIndex = columnNode.startIndex;

            batchParent(columnNode, columnChildren, DataStreamTreeNodeType.COLUMN);
            columnNode.setIndexRange(columnStartIndex, i);
            columnParagraphList.length = 0;
            columnSectionList.length = 0;
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.COLUMN_GROUP_END) {
            const columnGroupNode = columnGroupList.pop();
            const columnGroupStartIndex = columnGroupNode!.startIndex;

            batchParent(columnGroupNode!, columnList, DataStreamTreeNodeType.COLUMN_GROUP);
            columnGroupNode!.setIndexRange(columnGroupStartIndex, i);
            paragraphList.push(columnGroupNode!);
            columnList.length = 0;
            columnParagraphList.length = 0;
            columnSectionList.length = 0;
            contentStartIndex = i + 1;
        } else if (char === DataStreamTreeTokenType.BLOCK_END) {
            if (contentStartIndex === i && appendToPreviousParagraph(char)) {
                contentStartIndex = i + 1;
            }
        } else if (char === DataStreamTreeTokenType.CUSTOM_BLOCK) {
            currentBlocks.push(i);
        }
    }

    return { sectionList, tableNodeCache };
}

interface ITableCoupleCache {
    table: ICustomTable;
    tableSource: ITable;
}

interface IColumnGroupCoupleCache {
    columnGroup: ICustomColumnGroup;
    columnGroupSource: IColumnGroup;
}

export class DocumentViewModel implements IDisposable {
    private _interceptor: Nullable<ICustomRangeInterceptor> = null;

    private _cacheSize = 1000;

    private _textRunsCache: Map<number, ITextRunCacheBucket> = new Map();

    private _paragraphCache: Map<number, IParagraph> = new Map();

    private _sectionBreakCache: Map<number, ISectionBreak> = new Map();

    private _customBlockCache: Map<number, ICustomBlock> = new Map();

    private _tableCache: Map<number, ITableCoupleCache> = new Map();

    private _columnGroupCache: Map<number, IColumnGroupCoupleCache> = new Map();

    private _tableNodeCache: Map<string, ITableNodeCache> = new Map();

    private _children: DataStreamTreeNode[] = [];

    private _treeNodes: DataStreamTreeNode[] = [];

    private _treeNodesByStartIndex: DataStreamTreeNode[] = [];

    private _plainTopLevelParagraphNodes: DataStreamTreeNode[] = [];

    private _metadataCachesDirty = false;

    private _textRunsOrderedAndDisjoint = true;

    private _paragraphsOrdered = true;

    private _sectionBreaksOrdered = true;

    private _customBlocksOrdered = true;

    private _tablesOrdered = true;

    private _columnGroupsOrdered = true;

    private _lastTextRun: Nullable<ITextRun> = null;

    private _editArea: DocumentEditArea = DocumentEditArea.BODY;

    private readonly _editAreaChange$ = new BehaviorSubject<Nullable<DocumentEditArea>>(null);
    readonly editAreaChange$ = this._editAreaChange$.asObservable();

    private _headerTreeMap: Map<string, DocumentViewModel> = new Map();
    private _footerTreeMap: Map<string, DocumentViewModel> = new Map();

    private readonly _segmentViewModels$ = new BehaviorSubject<DocumentViewModel[]>([]);
    readonly segmentViewModels$ = this._segmentViewModels$.asObservable();

    constructor(private _documentDataModel: DocumentDataModel, private _tableSource?: Record<string, ITable>) {
        if (_documentDataModel.getBody() == null) {
            return;
        }

        const body = _documentDataModel.getBody()!;

        const { sectionList, tableNodeCache } = parseDataStreamToTree(body.dataStream, body.tables);
        this._children = sectionList;
        this._tableNodeCache = tableNodeCache;
        this._rebuildTreeNodes();
        this._buildAllCache();

        this._buildHeaderFooterViewModel();
    }

    registerCustomRangeInterceptor(interceptor: ICustomRangeInterceptor): IDisposable {
        this._interceptor = interceptor;

        return toDisposable(() => this._interceptor = null);
    }

    dispose(): void {
        this._children.forEach((child) => {
            child.dispose();
        });

        this._textRunsCache.clear();
        this._paragraphCache.clear();
        this._sectionBreakCache.clear();
        this._customBlockCache.clear();
        this._tableCache.clear();
        this._columnGroupCache.clear();
        this._tableNodeCache.clear();
        this._treeNodes = [];
        this._treeNodesByStartIndex = [];
        this._plainTopLevelParagraphNodes = [];
        this._lastTextRun = null;
        // this._headerTreeMap.clear();
        // this._footerTreeMap.clear();
        this._segmentViewModels$.complete();
        this._editAreaChange$.complete();
    }

    getHeaderFooterTreeMap() {
        return {
            headerTreeMap: this._headerTreeMap,
            footerTreeMap: this._footerTreeMap,
        };
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

    getChildren() {
        return this._children;
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

        if (this._headerTreeMap.has(segmentId)) {
            return this._headerTreeMap.get(segmentId)!;
        }

        if (this._footerTreeMap.has(segmentId)) {
            return this._footerTreeMap.get(segmentId)!;
        }

        return this as DocumentViewModel;
    }

    reset(documentDataModel: DocumentDataModel) {
        this._children.forEach((child) => child.dispose());
        this._textRunsCache.clear();
        this._paragraphCache.clear();
        this._sectionBreakCache.clear();
        this._customBlockCache.clear();
        this._tableCache.clear();
        this._columnGroupCache.clear();
        this._tableNodeCache.clear();

        this._documentDataModel = documentDataModel;

        const body = documentDataModel.getBody()!;

        const { sectionList, tableNodeCache } = parseDataStreamToTree(body.dataStream, body.tables);

        this._children = sectionList;

        this._tableNodeCache = tableNodeCache;
        this._rebuildTreeNodes();
        this._buildAllCache();

        this._buildHeaderFooterViewModel();
    }

    resetByValidatedTextMutation(documentDataModel: DocumentDataModel, actions: JSONXActions): boolean {
        const edits = getDataStreamMutationEdits(actions, getRichTextEditPath(documentDataModel));
        if (edits == null) {
            return false;
        }

        for (const edit of edits) {
            if (edit.deleteCount > 0 && !this._deletePlainText(edit.offset, edit.deleteCount)) {
                return false;
            }
            if (edit.insertText.length > 0 && !this._insertPlainText(edit.offset, edit.insertText)) {
                return false;
            }
        }

        this._documentDataModel = documentDataModel;
        this._metadataCachesDirty = true;
        this._lastTextRun = null;
        if (!this._textRunsOrderedAndDisjoint) {
            this._buildTextRunsCache();
        }
        return true;
    }

    resetByValidatedMetadataMutation(documentDataModel: DocumentDataModel, actions: JSONXActions): boolean {
        const rootFields = getNonStructuralMutationRootFields(actions);
        if (rootFields == null) {
            return false;
        }

        this._documentDataModel = documentDataModel;
        this._metadataCachesDirty = true;
        this._lastTextRun = null;

        if (rootFields.has('tableSource')) {
            const rootTableSource = documentDataModel.getSnapshot().tableSource;
            for (const [headerId, viewModel] of this._headerTreeMap) {
                const headerModel = documentDataModel.headerModelMap.get(headerId);
                viewModel._tableSource = {
                    ...rootTableSource,
                    ...headerModel?.getSnapshot().tableSource,
                };
                viewModel._metadataCachesDirty = true;
            }
            for (const [footerId, viewModel] of this._footerTreeMap) {
                const footerModel = documentDataModel.footerModelMap.get(footerId);
                viewModel._tableSource = {
                    ...rootTableSource,
                    ...footerModel?.getSnapshot().tableSource,
                };
                viewModel._metadataCachesDirty = true;
            }
        }

        return true;
    }

    getSectionBreak(index: number) {
        if (this._metadataCachesDirty) {
            return findByStartIndex(this.getBody()?.sectionBreaks ?? [], index, this._sectionBreaksOrdered);
        }
        return this._sectionBreakCache.get(index);
    }

    getParagraph(index: number) {
        if (this._metadataCachesDirty) {
            return findByStartIndex(this.getBody()?.paragraphs ?? [], index, this._paragraphsOrdered);
        }
        return this._paragraphCache.get(index);
    }

    getTextRun(index: number): Nullable<ITextRun> {
        if (this._metadataCachesDirty && this._textRunsOrderedAndDisjoint) {
            if (this._lastTextRun != null && index >= this._lastTextRun.st && index < this._lastTextRun.ed) {
                return this._lastTextRun;
            }

            const textRun = findOrderedTextRun(this.getBody()?.textRuns ?? [], index);
            this._lastTextRun = textRun ?? null;
            return textRun;
        }

        const cacheIndex = Math.floor(index / this._cacheSize);
        const bucket = this._textRunsCache.get(cacheIndex);
        if (bucket == null) {
            return;
        }

        if (bucket.isOrderedAndDisjoint) {
            let low = 0;
            let high = bucket.runs.length - 1;
            while (low <= high) {
                const middle = Math.floor((low + high) / 2);
                const textRun = bucket.runs[middle];
                if (index < textRun.st) {
                    high = middle - 1;
                } else if (index >= textRun.ed) {
                    low = middle + 1;
                } else {
                    return textRun;
                }
            }

            return;
        }

        // The previous per-character cache assigned runs in source order, so an
        // overlapping later run won. Preserve that behavior without materializing
        // one Map entry for every styled character in a large document.
        for (let runIndex = bucket.runs.length - 1; runIndex >= 0; runIndex--) {
            const textRun = bucket.runs[runIndex];
            if (index >= textRun.st && index < textRun.ed) {
                return textRun;
            }
        }
    }

    getCustomBlock(index: number) {
        if (this._metadataCachesDirty) {
            return findByStartIndex(this.getBody()?.customBlocks ?? [], index, this._customBlocksOrdered);
        }
        return this._customBlockCache.get(index);
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

    getTableByStartIndex(index: number) {
        if (this._metadataCachesDirty) {
            const table = findByStartIndex(this.getBody()?.tables ?? [], index, this._tablesOrdered);
            const tableSource = table == null
                ? undefined
                : (this._tableSource ?? this.getSnapshot().tableSource)?.[table.tableId];
            if (table == null || tableSource == null) {
                return;
            }

            return { table, tableSource };
        }
        return this._tableCache.get(index);
    }

    getColumnGroupByStartIndex(index: number) {
        if (this._metadataCachesDirty) {
            const columnGroup = findByStartIndex(
                this.getBody()?.columnGroups ?? [],
                index,
                this._columnGroupsOrdered
            );
            if (columnGroup?.columns == null) {
                return;
            }

            const cachedColumnGroup = Array.from(this._columnGroupCache.values()).find(
                (value) => value.columnGroup.columnGroupId === columnGroup.columnGroupId
            );
            if (cachedColumnGroup == null) {
                return;
            }

            return {
                columnGroup,
                columnGroupSource: cachedColumnGroup.columnGroupSource,
            };
        }
        return this._columnGroupCache.get(index);
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

    private _buildAllCache() {
        this._metadataCachesDirty = false;
        this._lastTextRun = null;
        this._buildTextRunsCache();
        this._buildParagraphCache();
        this._buildSectionBreakCache();
        this._buildCustomBlockCache();
        this._buildTableCache();
        this._buildColumnGroupCache();
    }

    private _insertPlainText(offset: number, text: string): boolean {
        const target = this._findParagraphNode(offset, offset);
        if (target == null) {
            return false;
        }

        const nodePath = this._collectNodePath(target);

        target.insertText(text, offset);
        const suffixStart = findFirstNodeStartingAtOrAfter(this._treeNodesByStartIndex, offset);
        for (let index = suffixStart; index < this._treeNodesByStartIndex.length; index++) {
            this._treeNodesByStartIndex[index].plus(text.length);
        }
        for (const { node, startIndex } of nodePath) {
            if (startIndex < offset) {
                node.selfPlus(text.length, offset);
            } else if (startIndex === offset) {
                // The suffix shift already updated the end and block offsets.
                // A containing node keeps its start when text is inserted at its
                // boundary, so restore only that coordinate.
                node.startIndex -= text.length;
            }
        }
        return true;
    }

    private _deletePlainText(offset: number, deleteCount: number): boolean {
        const endOffset = offset + deleteCount;
        const target = this._findParagraphNode(offset, endOffset);
        if (target == null) {
            return false;
        }

        const nodePath = this._collectNodePath(target);

        target.minus(offset, endOffset - 1);
        target.blocks = target.blocks
            .filter((blockOffset) => blockOffset < offset || blockOffset >= endOffset)
            .map((blockOffset) => blockOffset >= endOffset ? blockOffset - deleteCount : blockOffset);
        const suffixStart = findFirstNodeStartingAtOrAfter(this._treeNodesByStartIndex, endOffset);
        for (let index = suffixStart; index < this._treeNodesByStartIndex.length; index++) {
            this._treeNodesByStartIndex[index].plus(-deleteCount);
        }
        for (const { node, startIndex } of nodePath.slice(1)) {
            if (startIndex < endOffset) {
                node.selfPlus(-deleteCount, endOffset);
            }
        }
        return true;
    }

    private _findParagraphNode(startOffset: number, endOffset: number): DataStreamTreeNode | null {
        let low = 0;
        let high = this._plainTopLevelParagraphNodes.length - 1;
        while (low <= high) {
            const middle = Math.floor((low + high) / 2);
            const node = this._plainTopLevelParagraphNodes[middle];
            const containsEmptyPosition = node.startIndex === startOffset && node.endIndex === startOffset - 1;
            if (startOffset < node.startIndex) {
                high = middle - 1;
            } else if (startOffset > node.endIndex && !containsEmptyPosition) {
                low = middle + 1;
            } else if (endOffset <= startOffset || endOffset - 1 <= node.endIndex) {
                return node;
            } else {
                break;
            }
        }

        let match: DataStreamTreeNode | null = null;
        for (const node of this._treeNodes) {
            if (node.nodeType !== DataStreamTreeNodeType.PARAGRAPH) {
                continue;
            }

            const containsStart = node.startIndex <= startOffset && startOffset <= node.endIndex;
            const containsEmptyPosition = node.startIndex === startOffset && node.endIndex === startOffset - 1;
            const containsEnd = endOffset <= startOffset || endOffset - 1 <= node.endIndex;
            if ((!containsStart && !containsEmptyPosition) || !containsEnd) {
                continue;
            }

            if (match == null || node.endIndex - node.startIndex < match.endIndex - match.startIndex) {
                match = node;
            }
        }
        return match;
    }

    private _rebuildTreeNodes(): void {
        const nodes: DataStreamTreeNode[] = [];
        const visit = (node: DataStreamTreeNode): void => {
            nodes.push(node);
            node.children.forEach(visit);
        };
        this._children.forEach(visit);
        this._treeNodes = nodes;
        this._treeNodesByStartIndex = nodes.toSorted((left, right) => left.startIndex - right.startIndex);
        this._plainTopLevelParagraphNodes = this._children.flatMap((section) =>
            section.children.filter(
                (node) => node.nodeType === DataStreamTreeNodeType.PARAGRAPH && node.children.length === 0
            )
        );
    }

    private _collectNodePath(node: DataStreamTreeNode): Array<{ node: DataStreamTreeNode; startIndex: number }> {
        const nodePath: Array<{ node: DataStreamTreeNode; startIndex: number }> = [];
        let current: Nullable<DataStreamTreeNode> = node;
        while (current != null) {
            nodePath.push({ node: current, startIndex: current.startIndex });
            current = current.parent;
        }
        return nodePath;
    }

    private _buildParagraphCache() {
        this._paragraphCache.clear();

        const paragraphs = this.getBody()?.paragraphs ?? [];
        this._paragraphsOrdered = isOrderedByStartIndex(paragraphs);

        for (const paragraph of paragraphs) {
            const { startIndex } = paragraph;
            this._paragraphCache.set(startIndex, paragraph);
        }
    }

    private _buildSectionBreakCache() {
        this._sectionBreakCache.clear();
        const sectionBreaks = this.getBody()?.sectionBreaks ?? [];
        this._sectionBreaksOrdered = isOrderedByStartIndex(sectionBreaks);

        for (const sectionBreak of sectionBreaks) {
            const { startIndex } = sectionBreak;
            this._sectionBreakCache.set(startIndex, sectionBreak);
        }
    }

    private _buildCustomBlockCache() {
        this._customBlockCache.clear();
        const customBlocks = this.getBody()?.customBlocks ?? [];
        this._customBlocksOrdered = isOrderedByStartIndex(customBlocks);

        for (const customBlock of customBlocks) {
            const { startIndex } = customBlock;
            this._customBlockCache.set(startIndex, customBlock);
        }
    }

    private _buildTableCache() {
        this._tableCache.clear();

        const tables = this.getBody()?.tables;
        this._tablesOrdered = isOrderedByStartIndex(tables ?? []);
        const tableConfig = this._tableSource ?? this.getSnapshot().tableSource;
        if (tables == null || tableConfig == null) {
            return;
        }

        for (const table of tables) {
            const { startIndex, tableId } = table;
            const tableSource = tableConfig[tableId];

            if (tableSource == null) {
                continue;
            }

            this._tableCache.set(startIndex, {
                table,
                tableSource,
            });
        }
    }

    private _buildColumnGroupCache() {
        this._columnGroupCache.clear();

        const columnGroups = this.getBody()?.columnGroups;
        this._columnGroupsOrdered = isOrderedByStartIndex(columnGroups ?? []);
        if (columnGroups == null) {
            return;
        }

        for (const columnGroup of columnGroups) {
            const { startIndex } = columnGroup;
            if (!columnGroup.columns) {
                continue;
            }

            this._columnGroupCache.set(startIndex, {
                columnGroup,
                columnGroupSource: columnGroup as IColumnGroup,
            });
        }
    }

    private _buildTextRunsCache() {
        const textRuns = this.getBody()?.textRuns ?? [];
        this._textRunsCache.clear();
        this._textRunsOrderedAndDisjoint = true;
        let previousStart = Number.NEGATIVE_INFINITY;
        let furthestEnd = Number.NEGATIVE_INFINITY;

        for (const textRun of textRuns) {
            const { st, ed } = textRun;
            if (previousStart > st || furthestEnd > st) {
                this._textRunsOrderedAndDisjoint = false;
            }
            previousStart = st;
            furthestEnd = Math.max(furthestEnd, ed);
            if (ed <= st) {
                continue;
            }

            const startCacheIndex = Math.floor(st / this._cacheSize);
            const endCacheIndex = Math.floor((ed - 1) / this._cacheSize);
            for (let cacheIndex = startCacheIndex; cacheIndex <= endCacheIndex; cacheIndex++) {
                let bucket = this._textRunsCache.get(cacheIndex);
                if (bucket == null) {
                    bucket = { runs: [], isOrderedAndDisjoint: true };
                    this._textRunsCache.set(cacheIndex, bucket);
                }

                bucket.runs.push(textRun);
            }
        }

        for (const bucket of this._textRunsCache.values()) {
            for (let runIndex = 1; runIndex < bucket.runs.length; runIndex++) {
                if (bucket.runs[runIndex - 1].ed > bucket.runs[runIndex].st) {
                    bucket.isOrderedAndDisjoint = false;
                    break;
                }
            }
        }
    }

    private _buildHeaderFooterViewModel() {
        const { headerModelMap, footerModelMap } = this._documentDataModel;
        const viewModels = [];
        const rootTableSource = this.getSnapshot().tableSource;
        for (const [headerId, headerModel] of headerModelMap) {
            this._headerTreeMap.set(headerId, new DocumentViewModel(headerModel, {
                ...rootTableSource,
                ...headerModel.getSnapshot().tableSource,
            }));
            viewModels.push(this._headerTreeMap.get(headerId)!);
        }

        for (const [footerId, footerModel] of footerModelMap) {
            this._footerTreeMap.set(footerId, new DocumentViewModel(footerModel, {
                ...rootTableSource,
                ...footerModel.getSnapshot().tableSource,
            }));
            viewModels.push(this._footerTreeMap.get(footerId)!);
        }

        this._segmentViewModels$.next(viewModels);
    }
}
