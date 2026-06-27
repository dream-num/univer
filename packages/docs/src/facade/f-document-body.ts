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

import type { DocumentDataModel, IDocumentBody, Injector, IParagraph, ITextStyle } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { FDocumentBlockRange } from './f-document-block-range';
import type { FDocumentCustomBlock } from './f-document-custom-block';
import type { IFDocumentElementInfo } from './f-document-element';
import type { FDocumentTable } from './f-document-table';
import { DocumentBlockType, getRichTextEditPath, ICommandService, JSONX, TextX, TextXActionType, UpdateDocsAttributeType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { FDocumentElement } from './f-document-element';
import { FDocumentParagraph } from './f-document-paragraph';
import { buildPlainTextInsertBody } from './utils';

/**
 * A text range in a document segment. Offsets are zero-based positions in the segment data stream.
 */
export interface IFDocumentTextRange {
    /** The inclusive start offset of the range. */
    startOffset: number;
    /** The exclusive end offset of the range. */
    endOffset: number;
    /** The header/footer segment id. Omit or use an empty string for the main body. */
    segmentId?: string;
}

/**
 * A Facade API object bounded to a document body or header/footer segment.
 * It provides Google Docs-like element access and range editing methods.
 *
 * Paragraph elements use their persisted `paragraphId`. Tables, block ranges, and
 * custom blocks use their persisted ids.
 *
 * @hideconstructor
 */
export class FDocumentBody {
    constructor(
        private readonly _documentDataModel: DocumentDataModel,
        private readonly _injector: Injector,
        private readonly _segmentId = ''
    ) {}

    /**
     * Get the segment id of this document body facade.
     * The main body has an empty string segment id.
     * The header and footer FDocumentBody instances have their respective segment ids.
     * @returns {string} The segment id of this document body facade.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * console.log(fDocumentBody.getSegmentId());
     * ```
     */
    getSegmentId(): string {
        return this._segmentId;
    }

    /**
     * Get the underlying document body snapshot.
     * @returns {IDocumentBody} The document body snapshot.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * console.log(fDocumentBody.getBody());
     * ```
     */
    getBody(): IDocumentBody {
        const body = this._documentDataModel.getSelfOrHeaderFooterModel(this._segmentId).getBody();
        if (!body) {
            throw new Error('The document body is empty');
        }

        return body;
    }

    /**
     * Get a list of top-level child elements in the body.
     * @returns {FDocumentElement[]} The list of top-level document elements.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const elements = fDocumentBody.getElements();
     * console.log(elements);
     * ```
     */
    getElements(): FDocumentElement[] {
        const children = this._getChildren();
        return children.map((child) => {
            return this._injector.createInstance(FDocumentElement, this, child, this._injector);
        });
    }

    /**
     * Get a top-level child element by child index.
     * @param {number} index The zero-based child index.
     * @returns {FDocumentElement} The top-level child element wrapper.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element);
     * ```
     */
    getElement(index: number): FDocumentElement | null {
        return this.getElements()[index] ?? null;
    }

    /**
     * Get the current child index of an element handle.
     * The index is resolved from the element key, so a paragraph handle keeps pointing
     * to the same paragraph after facade edits insert content before it.
     * @param {FDocumentElement} element The element handle to locate.
     * @returns {number} The current zero-based child index.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(fDocumentBody.getElementIndex(element));
     * ```
     */
    getElementIndex(element: FDocumentElement): number {
        const { type, key } = element.getResolvedInfo();
        const index = this._getChildren().findIndex((child) => child.type === type && child.key === key);

        if (index < 0) {
            throw new Error('Doc element is stale');
        }

        return index;
    }

    /**
     * Insert plain text at a document body offset.
     * @param {number} index The zero-based insertion offset.
     * @param {string} text The plain text to insert.
     * @returns {boolean} `true` if the edit was applied.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * fDocumentBody.insertText(0, 'Hello ');
     * ```
     */
    insertText(index: number, text: string): boolean {
        return this._replaceBodyRange({ startOffset: index, endOffset: index }, buildPlainTextInsertBody(text));
    }

    /**
     * Apply text style to a body range.
     * @param {IFDocumentTextRange} range The range to style.
     * @param {ITextStyle} style The Univer text style patch.
     * @returns {boolean} `true` if the style was applied.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * fDocumentBody.setTextStyle({ startOffset: 0, endOffset: 5 }, { bl: 1 });
     * ```
     */
    setTextStyle(range: IFDocumentTextRange, style: ITextStyle): boolean {
        const len = range.endOffset - range.startOffset;
        const updateBody: IDocumentBody = {
            dataStream: '',
            textRuns: [{
                st: 0,
                ed: len,
                ts: style,
            }],
        };

        return this._retainBodyRange(range, updateBody, UpdateDocsAttributeType.COVER);
    }

    /**
     * Insert a plain-text paragraph before the paragraph at the given paragraph index.
     * @param {number} index The zero-based paragraph insertion index.
     * @param {string} text The paragraph text. Defaults to an empty paragraph.
     * @returns {FDocumentParagraph} The inserted paragraph wrapper.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const paragraph = fDocumentBody.insertParagraph(0, 'Document title');
     * paragraph.appendText(' suffix');
     * ```
     */
    insertParagraph(index: number, text = ''): FDocumentParagraph {
        const offset = this._getParagraphInsertOffset(index);
        const result = this._replaceBodyRange({ startOffset: offset, endOffset: offset }, buildPlainTextInsertBody(`${text}\r`));
        if (!result) {
            throw new Error('Failed to insert paragraph.');
        }

        const { paragraphs = [] } = this.getBody();
        const paragraph = paragraphs[index];
        if (!paragraph) {
            throw new Error('Failed to insert paragraph.');
        }

        const info = this._resolveParagraphInfo(paragraph, index, paragraphs[index - 1]?.startIndex);

        return this._injector.createInstance(FDocumentParagraph, this, info, this._injector);
    }

    /**
     * Append a plain-text paragraph at the end of the body.
     * @param {string} text The paragraph text. Defaults to an empty paragraph.
     * @returns {FDocumentParagraph} The appended paragraph wrapper.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const paragraph = fDocumentBody.appendParagraph('Summary');
     * console.log(paragraph.getText());
     * ```
     */
    appendParagraph(text = ''): FDocumentParagraph {
        const { paragraphs = [] } = this.getBody();
        return this.insertParagraph(paragraphs.length, text);
    }

    /**
     * Delete a range from the body.
     * @param {IFDocumentTextRange} range The text range to delete.
     * @returns {boolean} `true` if the range was deleted.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * fDocumentBody.deleteRange({ startOffset: 0, endOffset: 5 });
     * ```
     */
    deleteRange(range: IFDocumentTextRange): boolean {
        return this._replaceBodyRange(range, { dataStream: '' });
    }

    /**
     * Replace a range with plain text or rich text body data.
     * @param {IFDocumentTextRange} range The text range to replace.
     * @param {string | IDocumentBody | undefined} value The replacement text or rich text body data. If `undefined`, the range is deleted.
     * @returns {boolean} `true` if the replacement was applied.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     *
     * // Replace a range with plain text
     * fDocumentBody.replaceRange({ startOffset: 0, endOffset: 5 }, 'Hello');
     *
     * // Replace a range with rich text body data
     * const richText = univerAPI.newRichText().insertText(5, 'World', { ff: 'Arial', fs: 12 });
     * fDocumentBody.replaceRange({ startOffset: 5, endOffset: 10 }, richText);
     * ```
     */
    replaceRange(range: IFDocumentTextRange, value: string | IDocumentBody | undefined): boolean {
        let body: IDocumentBody = { dataStream: '' };

        if (typeof value === 'string') {
            body = buildPlainTextInsertBody(value);
        } else if (value) {
            body = value;
        }

        return this._replaceBodyRange(range, body);
    }

    /**
     * Retain a range with a new body and cover type.
     * @param {IFDocumentTextRange} range The text range to retain.
     * @param {IDocumentBody} body The new body data to retain.
     * @param {UpdateDocsAttributeType} coverType The cover type for the retained range.
     * @returns {boolean} `true` if the retention was applied.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     *
     * // Retain a range with a new body and cover type
     * const newBody = univerAPI.newRichText().insertText(0, 'Retained text', { bl: 1 });
     * fDocumentBody.retainRange({ startOffset: 0, endOffset: 5 }, newBody, univerAPI.Enum.UpdateDocsAttributeType.COVER);
     * ```
     */
    retainRange(range: IFDocumentTextRange, body: IDocumentBody, coverType: UpdateDocsAttributeType): boolean {
        return this._retainBodyRange(range, body, coverType);
    }

    /**
     * Remove a paragraph by paragraph id.
     * @param {FDocumentParagraph} paragraph The paragraph handle to remove.
     * @returns {boolean} `true` if the paragraph was removed.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   const removed = fDocumentBody.removeParagraph(paragraph);
     *   console.log(removed ? 'Paragraph removed' : 'Failed to remove paragraph');
     * }
     * ```
     */
    removeParagraph(paragraph: FDocumentParagraph): boolean {
        const { startOffset, endOffset } = paragraph.getResolvedParagraphInfo();
        return this.deleteRange({ startOffset, endOffset: endOffset + 1 });
    }

    /**
     * Remove a callout, quote, or code block range and its content.
     * @param {FDocumentBlockRange} blockRange The block range handle to remove.
     * @returns {boolean} `true` if the block range content was removed.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isBlockRange()) {
     *   const blockRange = element.asBlockRange();
     *   const removed = fDocumentBody.removeBlockRange(blockRange);
     *   console.log(removed ? 'Block range removed' : 'Failed to remove block range');
     * }
     * ```
     */
    removeBlockRange(blockRange: FDocumentBlockRange): boolean {
        const { startIndex, endIndex } = blockRange.getBlockRange();
        return this.deleteRange({ startOffset: startIndex, endOffset: endIndex + 1 });
    }

    /**
     * Remove a table marker and its content range.
     * @returns {boolean} `true` if the table range was removed.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isTable()) {
     *   const table = element.asTable();
     *   const removed = fDocumentBody.removeTable(table);
     *   console.log(removed ? 'Table removed' : 'Failed to remove table');
     * }
     * ```
     */
    removeTable(table: FDocumentTable): boolean {
        const { startIndex, endIndex } = table.getTable();
        return this.deleteRange({ startOffset: startIndex, endOffset: endIndex + 1 });
    }

    /**
     * Remove a custom block marker and its placeholder character.
     * @param {FDocumentCustomBlock} customBlock The custom block handle to remove.
     * @returns {boolean} `true` if the custom block placeholder was removed.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isCustomBlock()) {
     *   const customBlock = element.asCustomBlock();
     *   const removed = fDocumentBody.removeCustomBlock(customBlock);
     *   console.log(removed ? 'Custom block removed' : 'Failed to remove custom block');
     * }
     * ```
     */
    removeCustomBlock(customBlock: FDocumentCustomBlock): boolean {
        const { startIndex } = customBlock.getCustomBlock();
        return this.deleteRange({ startOffset: startIndex, endOffset: startIndex + 1 });
    }

    /**
     * Resolve an element key to its current child metadata.
     * @param {FDocumentElement} element The element handle to resolve.
     * @returns {IFDocumentElementInfo} The current child metadata used by the facade.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * const resolved = fDocumentBody.resolveElement(element);
     * console.log(resolved);
     * ```
     */
    resolveElement(element: FDocumentElement): IFDocumentElementInfo {
        const { type, key } = element.getResolvedInfo();
        const child = this._getChildren().find((item) => item.type === type && item.key === key);
        if (!child) {
            throw new Error('Doc element is stale');
        }
        return child;
    }

    private _getChildren(): IFDocumentElementInfo[] {
        const { paragraphs, blockRanges, tables, customBlocks } = this.getBody();
        const children: IFDocumentElementInfo[] = [];

        if (paragraphs) {
            for (let i = 0; i < paragraphs.length; i++) {
                const paragraph = paragraphs[i];
                const info = this._resolveParagraphInfo(paragraph, i, paragraphs[i - 1]?.startIndex);
                children.push(info);
            }
        }

        if (blockRanges) {
            for (let i = 0; i < blockRanges.length; i++) {
                const blockRange = blockRanges[i];
                children.push({
                    type: DocumentBlockType.BLOCK_RANGE,
                    key: blockRange.blockId,
                    position: blockRange.startIndex,
                    priority: 0,
                });
            }
        }

        if (tables) {
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                children.push({
                    type: DocumentBlockType.TABLE,
                    key: table.tableId,
                    position: table.startIndex,
                    priority: 1,
                });
            }
        }

        if (customBlocks) {
            for (let i = 0; i < customBlocks.length; i++) {
                const customBlock = customBlocks[i];
                children.push({
                    type: DocumentBlockType.CUSTOM_BLOCK,
                    key: customBlock.blockId,
                    position: customBlock.startIndex,
                    priority: 2,
                });
            }
        }

        return children.sort((a, b) => a.position - b.position || a.priority - b.priority);
    }

    private _resolveParagraphInfo(paragraph: IParagraph, paragraphIndex: number, previousParagraphStartIndex: number | undefined): IFDocumentElementInfo {
        return {
            type: DocumentBlockType.PARAGRAPH,
            key: this._getParagraphId(paragraph, paragraphIndex),
            position: paragraphIndex > 0 ? (previousParagraphStartIndex as number) + 1 : 0,
            priority: 3,
        };
    }

    private _getParagraphId(paragraph: IParagraph | undefined, paragraphIndex: number): string {
        if (!paragraph) {
            throw new Error(`Paragraph index ${paragraphIndex} is out of range.`);
        }

        if (!paragraph.paragraphId) {
            throw new Error(`Paragraph at index ${paragraphIndex} is missing paragraphId.`);
        }

        return paragraph.paragraphId;
    }

    private _getParagraphInsertOffset(index: number): number {
        if (index <= 0) {
            return 0;
        }

        const { dataStream, paragraphs = [] } = this.getBody();

        if (paragraphs.length === 0) {
            return Math.max(0, dataStream.length - 1);
        }

        if (index >= paragraphs.length) {
            return paragraphs[paragraphs.length - 1].startIndex + 1;
        }

        return paragraphs[index - 1].startIndex + 1;
    }

    private _replaceBodyRange(range: IFDocumentTextRange, insertBody: IDocumentBody): boolean {
        const { startOffset, endOffset } = range;
        const textX = new TextX();

        if (startOffset > 0) {
            textX.push({ t: TextXActionType.RETAIN, len: startOffset });
        }

        if (endOffset > startOffset) {
            textX.push({ t: TextXActionType.DELETE, len: endOffset - startOffset });
        }

        if (insertBody.dataStream.length > 0) {
            textX.push({
                t: TextXActionType.INSERT,
                body: insertBody,
                len: insertBody.dataStream.length,
            });
        }

        return this._executeTextX(textX);
    }

    private _retainBodyRange(range: IFDocumentTextRange, body: IDocumentBody, coverType: UpdateDocsAttributeType): boolean {
        if (body.textRuns?.length && this.getBody().textRuns == null) {
            this._ensureTextRuns();
        }

        const textX = new TextX();
        if (range.startOffset > 0) {
            textX.push({ t: TextXActionType.RETAIN, len: range.startOffset });
        }

        textX.push({
            t: TextXActionType.RETAIN,
            body,
            coverType,
            len: range.endOffset - range.startOffset,
        });

        return this._executeTextX(textX);
    }

    private _ensureTextRuns(): void {
        const jsonX = JSONX.getInstance();
        const actions = jsonX.replaceOp(
            [...getRichTextEditPath(this._documentDataModel, this._segmentId), 'textRuns'],
            undefined,
            []
        );

        const commandService = this._injector.get(ICommandService);
        commandService.syncExecuteCommand<IRichTextEditingMutationParams>(
            RichTextEditingMutation.id,
            {
                unitId: this._documentDataModel.getUnitId(),
                segmentId: this._segmentId,
                actions,
                textRanges: [],
                isEditing: false,
            }
        );
    }

    private _executeTextX(textX: TextX): boolean {
        const jsonX = JSONX.getInstance();
        const actions = jsonX.editOp(textX.serialize(), getRichTextEditPath(this._documentDataModel, this._segmentId));

        const commandService = this._injector.get(ICommandService);
        const result = commandService.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams | false>(
            RichTextEditingMutation.id,
            {
                unitId: this._documentDataModel.getUnitId(),
                segmentId: this._segmentId,
                actions,
                textRanges: [],
                isEditing: false,
            }
        );

        return result !== false;
    }
}
