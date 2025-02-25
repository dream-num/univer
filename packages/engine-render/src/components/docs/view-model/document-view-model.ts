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

import type { DocumentDataModel, ICustomBlock, ICustomDecorationForInterceptor, ICustomRangeForInterceptor, ICustomTable, IDisposable, IParagraph, ISectionBreak, ITable, ITextRun, Nullable } from '@univerjs/core';
import { DataStreamTreeNodeType, DataStreamTreeTokenType, toDisposable } from '@univerjs/core';
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

interface ITableCoupleCache {
    table: ICustomTable;
    tableSource: ITable;
}

export class DocumentViewModel implements IDisposable {
    private _interceptor: Nullable<ICustomRangeInterceptor> = null;

    private _cacheSize = 1000;

    private _textRunsCache: Map<number, Map<number, ITextRun>> = new Map();

    private _paragraphCache: Map<number, IParagraph> = new Map();

    private _sectionBreakCache: Map<number, ISectionBreak> = new Map();

    private _customBlockCache: Map<number, ICustomBlock> = new Map();

    private _tableCache: Map<number, ITableCoupleCache> = new Map();

    private _tableNodeCache: Map<string, ITableNodeCache> = new Map();

    private _children: DataStreamTreeNode[] = [];

    private _editArea: DocumentEditArea = DocumentEditArea.BODY;

    private readonly _editAreaChange$ = new BehaviorSubject<Nullable<DocumentEditArea>>(null);
    readonly editAreaChange$ = this._editAreaChange$.asObservable();

    private _headerTreeMap: Map<string, DocumentViewModel> = new Map();
    private _footerTreeMap: Map<string, DocumentViewModel> = new Map();

    private readonly _segmentViewModels$ = new BehaviorSubject<DocumentViewModel[]>([]);
    readonly segmentViewModels$ = this._segmentViewModels$.asObservable();

    constructor(private _documentDataModel: DocumentDataModel) {
        if (_documentDataModel.getBody() == null) {
            return;
        }

        const body = _documentDataModel.getBody()!;

        const { sectionList, tableNodeCache } = parseDataStreamToTree(body.dataStream, body.tables);
        this._buildAllCache();

        this._children = sectionList;
        this._tableNodeCache = tableNodeCache;

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
        this._tableNodeCache.clear();
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
        this._documentDataModel = documentDataModel;

        const body = documentDataModel.getBody()!;

        const { sectionList, tableNodeCache } = parseDataStreamToTree(body.dataStream, body.tables);

        this._children = sectionList;

        this._tableNodeCache = tableNodeCache;
        this._buildAllCache();

        this._buildHeaderFooterViewModel();
    }

    getSectionBreak(index: number) {
        return this._sectionBreakCache.get(index);
    }

    getParagraph(index: number) {
        return this._paragraphCache.get(index);
    }

    getTextRun(index: number): Nullable<ITextRun> {
        const cacheIndex = Math.floor(index / this._cacheSize);
        const textRunsCache = this._textRunsCache.get(cacheIndex);

        return textRunsCache?.get(index % this._cacheSize);
    }

    getCustomBlock(index: number) {
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
        return this._tableCache.get(index);
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
        this._buildTextRunsCache();
        this._buildParagraphCache();
        this._buildSectionBreakCache();
        this._buildCustomBlockCache();
        this._buildTableCache();
    }

    private _buildParagraphCache() {
        this._paragraphCache.clear();

        const paragraphs = this.getBody()?.paragraphs ?? [];

        for (const paragraph of paragraphs) {
            const { startIndex } = paragraph;
            this._paragraphCache.set(startIndex, paragraph);
        }
    }

    private _buildSectionBreakCache() {
        this._sectionBreakCache.clear();
        const sectionBreaks = this.getBody()?.sectionBreaks ?? [];

        for (const sectionBreak of sectionBreaks) {
            const { startIndex } = sectionBreak;
            this._sectionBreakCache.set(startIndex, sectionBreak);
        }
    }

    private _buildCustomBlockCache() {
        this._customBlockCache.clear();
        const customBlocks = this.getBody()?.customBlocks ?? [];

        for (const customBlock of customBlocks) {
            const { startIndex } = customBlock;
            this._customBlockCache.set(startIndex, customBlock);
        }
    }

    private _buildTableCache() {
        this._tableCache.clear();

        const tables = this.getBody()?.tables;
        const tableConfig = this.getSnapshot().tableSource;
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
            this._headerTreeMap.set(headerId, new DocumentViewModel(headerModel));
            viewModels.push(this._headerTreeMap.get(headerId)!);
        }

        for (const [footerId, footerModel] of footerModelMap) {
            this._footerTreeMap.set(footerId, new DocumentViewModel(footerModel));
            viewModels.push(this._footerTreeMap.get(footerId)!);
        }

        this._segmentViewModels$.next(viewModels);
    }
}
