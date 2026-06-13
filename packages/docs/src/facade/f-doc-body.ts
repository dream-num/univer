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

import type { DocumentDataModel, ICommandService, ICustomBlock, ICustomTable, IDocumentBlockRange, IDocumentBody, IParagraph, IParagraphStyle, ITextStyle } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { DocElementRegistry, FDocElementType } from './doc-element-registry';
import { getRichTextEditPath, JSONX, PresetListType, TextX, TextXActionType, UpdateDocsAttributeType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { DocElementStaleError } from './doc-element-registry';
import { buildPlainTextInsertBody } from './utils';
import { FDocElement } from './f-doc-element';
import { FDocParagraph } from './f-doc-paragraph';

/**
 * A text range in a document segment. Offsets are zero-based positions in the segment data stream.
 */
export interface IFDocTextRange {
    /** The inclusive start offset of the range. */
    startOffset: number;
    /** The exclusive end offset of the range. */
    endOffset: number;
    /** The header/footer segment id. Omit or use an empty string for the main body. */
    segmentId?: string;
}

/**
 * Resolved paragraph metadata in the current document body.
 */
export interface IFDocResolvedParagraph {
    /** The underlying paragraph snapshot object. */
    paragraph: IParagraph;
    /** The current paragraph index in the body paragraph list. */
    paragraphIndex: number;
    /** The inclusive start offset of the paragraph text. */
    startOffset: number;
    /** The exclusive end offset of the paragraph text, before the paragraph break. */
    endOffset: number;
}

/**
 * A stable facade element handle that can be resolved by type and key.
 */
export interface IFDocElementHandle {
    /**
     * Get the element type.
     * @returns {FDocElementType} The element type used by the facade resolver.
     */
    getType(): FDocElementType;
    /**
     * Get the persisted key used by the facade to resolve the element.
     * @returns {string} The facade key.
     */
    getKey(): string;
}

/**
 * A rich-text-like object, such as `RichTextValue` or `RichTextBuilder`, that can provide document body data.
 */
export interface IFDocRichTextLike {
    /**
     * Get rich text data that contains document body data.
     * @returns {{ body?: IDocumentBody }} The rich text data object.
     */
    getData(): { body?: IDocumentBody };
}

function isRichTextLike(value: unknown): value is IFDocRichTextLike {
    return typeof value === 'object' && value !== null && 'getData' in value && typeof (value as IFDocRichTextLike).getData === 'function';
}

interface IFDocChildInfo {
    type: FDocElementType;
    key: string;
    position: number;
    priority: number;
}

const FACADE_TRIGGER = 'doc-facade';
const RESTORE_INSERTED_PARAGRAPH_IDS = '__textXRestoreParagraphIds';

/**
 * A Facade API object bounded to a document body or header/footer segment.
 * It provides Google Docs-like element access and range editing methods.
 *
 * Paragraph elements use their persisted `paragraphId`. Tables, block ranges, and
 * custom blocks use their persisted ids.
 *
 * @hideconstructor
 */
export class FDocBody {
    constructor(
        private readonly _documentDataModel: DocumentDataModel,
        private readonly _commandService: ICommandService,
        _registry: DocElementRegistry,
        private readonly _segmentId = ''
    ) {}

    /**
     * Get the number of top-level child elements in the body.
     * @returns {number} The number of child elements.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * console.log(body.getNumChildren());
     * ```
     */
    getNumChildren(): number {
        return this._getChildren().length;
    }

    /**
     * Get a top-level child element by child index.
     * @param {number} index The zero-based child index.
     * @returns {FDocElement} The child element wrapper.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * const firstChild = body.getChild(0);
     * console.log(firstChild.getType());
     * ```
     */
    getChild(index: number): FDocElement {
        const child = this._getChildren()[index];
        if (!child) {
            throw new RangeError(`Child index ${index} is out of range.`);
        }

        return this._createElement(child.type, child.key);
    }

    /**
     * Get the current child index of an element handle.
     * The index is resolved from the element key, so a paragraph handle keeps pointing
     * to the same paragraph after facade edits insert content before it.
     * @param {IFDocElementHandle} element The element handle to locate.
     * @returns {number} The current zero-based child index.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * const paragraph = body.getChild(1).asParagraph();
     * body.insertParagraph(0, 'Intro');
     * console.log(body.getChildIndex(paragraph));
     * ```
     */
    getChildIndex(element: IFDocElementHandle): number {
        const resolved = this.resolveElement(element.getType(), element.getKey());
        const index = this._getChildren().findIndex((child) => child.type === resolved.type && child.key === resolved.key);

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
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * body.insertText(0, 'Hello ');
     * ```
     */
    insertText(index: number, text: string): boolean {
        return this._replaceBodyRange({ startOffset: index, endOffset: index }, buildPlainTextInsertBody(text));
    }

    /**
     * Insert a plain-text paragraph before the paragraph at the given paragraph index.
     * @param {number} index The zero-based paragraph insertion index.
     * @param {string} text The paragraph text. Defaults to an empty paragraph.
     * @returns {FDocParagraph} The inserted paragraph wrapper.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * const paragraph = body.insertParagraph(0, 'Document title');
     * paragraph.appendText(' suffix');
     * ```
     */
    insertParagraph(index: number, text = ''): FDocParagraph {
        const offset = this._getParagraphInsertOffset(index);
        const result = this._replaceBodyRange({ startOffset: offset, endOffset: offset }, buildPlainTextInsertBody(`${text}\r`));
        if (!result) {
            throw new Error('Failed to insert paragraph.');
        }

        const paragraphIndex = this._normalizeInsertedParagraphIndex(index);
        const paragraph = this._getBody().paragraphs?.[paragraphIndex];
        return new FDocParagraph(this, this._getParagraphId(paragraph, paragraphIndex));
    }

    /**
     * Append a plain-text paragraph at the end of the body.
     * @param {string} text The paragraph text. Defaults to an empty paragraph.
     * @returns {FDocParagraph} The appended paragraph wrapper.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * const paragraph = body.appendParagraph('Summary');
     * console.log(paragraph.getText());
     * ```
     */
    appendParagraph(text = ''): FDocParagraph {
        return this.insertParagraph(this._getBody().paragraphs?.length ?? 0, text);
    }

    /**
     * Delete a range from the body.
     * @param {IFDocTextRange} range The text range to delete.
     * @returns {boolean} `true` if the range was deleted.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * body.deleteRange({ startOffset: 0, endOffset: 5 });
     * ```
     */
    deleteRange(range: IFDocTextRange): boolean {
        return this._replaceBodyRange(range, { dataStream: '' });
    }

    /**
     * Replace a range with plain text or rich text body data.
     * @param {IFDocTextRange} range The text range to replace.
     * @param {string | IFDocRichTextLike | { body?: IDocumentBody }} value The replacement text or rich-text-like value.
     * @returns {boolean} `true` if the replacement was applied.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * body.replaceRange({ startOffset: 0, endOffset: 5 }, 'Hello');
     * ```
     */
    replaceRange(range: IFDocTextRange, value: string | IFDocRichTextLike | { body?: IDocumentBody }): boolean {
        let body: IDocumentBody;

        if (typeof value === 'string') {
            body = buildPlainTextInsertBody(value);
        } else if (isRichTextLike(value)) {
            body = value.getData().body ?? { dataStream: '' };
        } else {
            body = value.body ?? { dataStream: '' };
        }

        return this._replaceBodyRange(range, body);
    }

    /**
     * Apply text style to a body range.
     * @param {IFDocTextRange} range The range to style.
     * @param {ITextStyle} style The Univer text style patch.
     * @returns {boolean} `true` if the style was applied.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * body.setTextStyle({ startOffset: 0, endOffset: 5 }, { bl: 1 });
     * ```
     */
    setTextStyle(range: IFDocTextRange, style: ITextStyle): boolean {
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
     * Apply paragraph style to a paragraph handle or text range.
     * @param {FDocElement | FDocParagraph | IFDocTextRange} paragraph The paragraph handle or a range inside the paragraph.
     * @param {IParagraphStyle} style The Univer paragraph style patch.
     * @returns {boolean} `true` if the style was applied.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * const paragraph = body.getChild(0).asParagraph();
     * body.setParagraphStyle(paragraph, { horizontalAlign: 2 });
     * ```
     */
    setParagraphStyle(paragraph: FDocElement | FDocParagraph | IFDocTextRange, style: IParagraphStyle): boolean {
        const resolved = paragraph instanceof FDocElement || paragraph instanceof FDocParagraph
            ? this.resolveParagraph(paragraph.getKey())
            : this._findParagraphByRange(paragraph);

        const updateBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                ...resolved.paragraph,
                startIndex: 0,
                paragraphStyle: {
                    ...resolved.paragraph.paragraphStyle,
                    ...style,
                },
            }],
        };
        this._preserveExplicitParagraphIds(updateBody);

        return this._retainBodyRange(
            { startOffset: resolved.endOffset, endOffset: resolved.endOffset + 1 },
            updateBody,
            UpdateDocsAttributeType.REPLACE
        );
    }

    /**
     * Get the text content of a paragraph by paragraph id.
     * @param {string} key The paragraph id.
     * @returns {string} The paragraph text without the trailing paragraph break.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(doc.getBody().getParagraphText(paragraph.getKey()));
     * ```
     */
    getParagraphText(key: string): string {
        const resolved = this.resolveParagraph(key);
        return this._getBody().dataStream.slice(resolved.startOffset, resolved.endOffset);
    }

    /**
     * Replace the text content of a paragraph by paragraph id.
     * @param {string} key The paragraph id.
     * @param {string} text The replacement paragraph text.
     * @returns {boolean} `true` if the paragraph text was replaced.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * doc.getBody().setParagraphText(paragraph.getKey(), 'Updated text');
     * ```
     */
    setParagraphText(key: string, text: string): boolean {
        const resolved = this.resolveParagraph(key);
        return this.replaceRange({ startOffset: resolved.startOffset, endOffset: resolved.endOffset }, text);
    }

    /**
     * Append text to a paragraph by paragraph id.
     * @param {string} key The paragraph id.
     * @param {string} text The text to append before the paragraph break.
     * @returns {boolean} `true` if the text was appended.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * doc.getBody().appendParagraphText(paragraph.getKey(), ' suffix');
     * ```
     */
    appendParagraphText(key: string, text: string): boolean {
        const resolved = this.resolveParagraph(key);
        return this.insertText(resolved.endOffset, text);
    }

    /**
     * Remove a paragraph by paragraph id.
     * @param {string} key The paragraph id.
     * @returns {boolean} `true` if the paragraph was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * doc.getBody().removeParagraph(paragraph.getKey());
     * ```
     */
    removeParagraph(key: string): boolean {
        const resolved = this.resolveParagraph(key);
        return this.deleteRange({ startOffset: resolved.startOffset, endOffset: resolved.endOffset + 1 });
    }

    /**
     * Get a paragraph text range by paragraph id.
     * @param {string} key The paragraph id.
     * @returns {IFDocTextRange} The paragraph range excluding the trailing paragraph break.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * const range = doc.getBody().getParagraphRange(paragraph.getKey());
     * console.log(range.startOffset, range.endOffset);
     * ```
     */
    getParagraphRange(key: string): IFDocTextRange {
        const resolved = this.resolveParagraph(key);
        return { startOffset: resolved.startOffset, endOffset: resolved.endOffset, segmentId: this._segmentId };
    }

    /**
     * Check whether a paragraph has list metadata.
     * @param {string} key The paragraph id.
     * @returns {boolean} `true` if the paragraph is a list item.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(doc.getBody().isListParagraph(paragraph.getKey()));
     * ```
     */
    isListParagraph(key: string): boolean {
        return Boolean(this.resolveParagraph(key).paragraph.bullet);
    }

    /**
     * Check whether a paragraph is a task/checklist item.
     * @param {string} key The paragraph id.
     * @returns {boolean} `true` if the paragraph is an unchecked or checked task item.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(doc.getBody().isTaskParagraph(paragraph.getKey()));
     * ```
     */
    isTaskParagraph(key: string): boolean {
        const listType = this.resolveParagraph(key).paragraph.bullet?.listType;
        return listType === PresetListType.CHECK_LIST || listType === PresetListType.CHECK_LIST_CHECKED;
    }

    /**
     * Set the checked state of a task/checklist paragraph.
     * @param {string} key The paragraph id.
     * @param {boolean} checked Whether the task should be checked.
     * @returns {boolean} `true` if the task state was updated, or `false` if the paragraph is not a task item.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * doc.getBody().setTaskChecked(paragraph.getKey(), true);
     * ```
     */
    setTaskChecked(key: string, checked: boolean): boolean {
        const resolved = this.resolveParagraph(key);
        const bullet = resolved.paragraph.bullet;
        if (!bullet || !this.isTaskParagraph(key)) {
            return false;
        }

        const updateBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                ...resolved.paragraph,
                startIndex: 0,
                bullet: {
                    ...bullet,
                    listType: checked ? PresetListType.CHECK_LIST_CHECKED : PresetListType.CHECK_LIST,
                },
            }],
        };
        this._preserveExplicitParagraphIds(updateBody);

        return this._retainBodyRange(
            { startOffset: resolved.endOffset, endOffset: resolved.endOffset + 1 },
            updateBody,
            UpdateDocsAttributeType.REPLACE
        );
    }

    /**
     * Resolve a paragraph id to its current paragraph metadata.
     * @param {string} key The paragraph id.
     * @returns {IFDocResolvedParagraph} The current paragraph metadata.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * const resolved = doc.getBody().resolveParagraph(paragraph.getKey());
     * console.log(resolved.paragraphIndex);
     * ```
     */
    resolveParagraph(key: string): IFDocResolvedParagraph {
        const body = this._getBody();
        const paragraphs = body.paragraphs ?? [];
        const matches = paragraphs
            .map((paragraph, paragraphIndex) => ({ paragraph, paragraphIndex }))
            .filter(({ paragraph }) => paragraph.paragraphId === key);

        if (matches.length !== 1) {
            throw new DocElementStaleError(matches.length > 1
                ? `Doc paragraph id "${key}" is duplicated.`
                : `Doc paragraph id "${key}" is stale.`);
        }

        const { paragraph, paragraphIndex } = matches[0];
        const startOffset = paragraphIndex > 0 ? body.paragraphs![paragraphIndex - 1].startIndex + 1 : 0;

        return {
            paragraph,
            paragraphIndex,
            startOffset,
            endOffset: paragraph.startIndex,
        };
    }

    /**
     * Resolve an element key to its current child metadata.
     * @param {FDocElementType} type The element type.
     * @param {string} key The persisted element key.
     * @returns {object} The current child metadata used by the facade.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const element = doc.getBody().getChild(0);
     * const resolved = doc.getBody().resolveElement(element.getType(), element.getKey());
     * console.log(resolved.position);
     * ```
     */
    resolveElement(type: FDocElementType, key: string): IFDocChildInfo {
        if (type === 'paragraph') {
            const paragraph = this.resolveParagraph(key);
            return { type, key, position: paragraph.startOffset, priority: 3 };
        }

        const child = this._getChildren().find((item) => item.type === type && item.key === key);
        if (!child) {
            throw new Error('Doc element is stale');
        }

        return child;
    }

    /**
     * Get a callout, quote, or code block range by block id.
     * @param {string} key The persisted block range id.
     * @returns {IDocumentBlockRange} The matching block range snapshot.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const block = doc.getBody().getChild(0).asBlockRange();
     * console.log(doc.getBody().getBlockRange(block.getKey()).blockType);
     * ```
     */
    getBlockRange(key: string): IDocumentBlockRange {
        const blockRange = this._getBody().blockRanges?.find((item) => item.blockId === key);
        if (!blockRange) {
            throw new Error('Doc element is stale');
        }

        return blockRange;
    }

    /**
     * Get the text inside a callout, quote, or code block range.
     * @param {string} key The persisted block range id.
     * @returns {string} The block range text.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const block = doc.getBody().getChild(0).asBlockRange();
     * console.log(doc.getBody().getBlockRangeText(block.getKey()));
     * ```
     */
    getBlockRangeText(key: string): string {
        const blockRange = this.getBlockRange(key);
        return this._getBody().dataStream.slice(blockRange.startIndex, blockRange.endIndex);
    }

    /**
     * Replace the text inside a callout, quote, or code block range.
     * @param {string} key The persisted block range id.
     * @param {string} text The replacement text.
     * @returns {boolean} `true` if the text was replaced.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const block = doc.getBody().getChild(0).asBlockRange();
     * doc.getBody().setBlockRangeText(block.getKey(), 'Updated block');
     * ```
     */
    setBlockRangeText(key: string, text: string): boolean {
        const blockRange = this.getBlockRange(key);
        const body = buildPlainTextInsertBody(`${text}\r`);
        body.blockRanges = [{
            ...blockRange,
            startIndex: 0,
            endIndex: text.length,
        }];

        return this.replaceRange({ startOffset: blockRange.startIndex, endOffset: blockRange.endIndex + 1 }, { body });
    }

    /**
     * Remove a callout, quote, or code block range and its content.
     * @param {string} key The persisted block range id.
     * @returns {boolean} `true` if the block range content was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const block = doc.getBody().getChild(0).asBlockRange();
     * doc.getBody().removeBlockRange(block.getKey());
     * ```
     */
    removeBlockRange(key: string): boolean {
        const blockRange = this.getBlockRange(key);
        return this.deleteRange({ startOffset: blockRange.startIndex, endOffset: blockRange.endIndex + 1 });
    }

    /**
     * Get a table marker by table id.
     * @param {string} key The persisted table id.
     * @returns {ICustomTable} The matching table marker.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const table = doc.getBody().getChild(0).asTable();
     * console.log(doc.getBody().getTable(table.getTableId()));
     * ```
     */
    getTable(key: string): ICustomTable {
        const table = this._getBody().tables?.find((item) => item.tableId === key);
        if (!table) {
            throw new Error('Doc element is stale');
        }

        return table;
    }

    /**
     * Remove a table marker and its content range.
     * @param {string} key The persisted table id.
     * @returns {boolean} `true` if the table range was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const table = doc.getBody().getChild(0).asTable();
     * doc.getBody().removeTable(table.getTableId());
     * ```
     */
    removeTable(key: string): boolean {
        const table = this.getTable(key);
        return this.deleteRange({ startOffset: table.startIndex, endOffset: table.endIndex + 1 });
    }

    /**
     * Get a custom block marker by block id.
     * @param {string} key The persisted custom block id.
     * @returns {ICustomBlock} The matching custom block marker.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const customBlock = doc.getBody().getChild(0).asCustomBlock();
     * console.log(doc.getBody().getCustomBlock(customBlock.getBlockId()));
     * ```
     */
    getCustomBlock(key: string): ICustomBlock {
        const block = this._getBody().customBlocks?.find((item) => item.blockId === key);
        if (!block) {
            throw new Error('Doc element is stale');
        }

        return block;
    }

    /**
     * Remove a custom block marker and its placeholder character.
     * @param {string} key The persisted custom block id.
     * @returns {boolean} `true` if the custom block placeholder was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const customBlock = doc.getBody().getChild(0).asCustomBlock();
     * doc.getBody().removeCustomBlock(customBlock.getBlockId());
     * ```
     */
    removeCustomBlock(key: string): boolean {
        const block = this.getCustomBlock(key);
        return this.deleteRange({ startOffset: block.startIndex, endOffset: block.startIndex + 1 });
    }

    /**
     * Create a sibling element wrapper relative to the current element key.
     * @param {FDocElementType} type The current element type.
     * @param {string} key The current element key.
     * @param {-1 | 1} direction `-1` for previous sibling, `1` for next sibling.
     * @returns {FDocElement | null} The sibling wrapper, or `null` if none exists.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const element = doc.getBody().getChild(0);
     * const next = doc.getBody().createSibling(element.getType(), element.getKey(), 1);
     * console.log(next?.getType());
     * ```
     */
    createSibling(type: FDocElementType, key: string, direction: -1 | 1): FDocElement | null {
        const index = this.getChildIndex(this._createElement(type, key));
        const child = this._getChildren()[index + direction];
        return child ? this._createElement(child.type, child.key) : null;
    }

    private _getChildren(): IFDocChildInfo[] {
        const body = this._getBody();
        const children: IFDocChildInfo[] = [];

        for (let index = 0; index < (body.paragraphs?.length ?? 0); index++) {
            const paragraph = body.paragraphs![index];
            children.push({
                type: 'paragraph',
                key: this._getParagraphId(paragraph, index),
                position: index > 0 ? body.paragraphs![index - 1].startIndex + 1 : 0,
                priority: 3,
            });
        }

        body.blockRanges?.forEach((blockRange) => children.push({
            type: 'blockRange',
            key: blockRange.blockId,
            position: blockRange.startIndex,
            priority: 0,
        }));

        body.tables?.forEach((table) => children.push({
            type: 'table',
            key: table.tableId,
            position: table.startIndex,
            priority: 1,
        }));

        body.customBlocks?.forEach((customBlock) => children.push({
            type: 'customBlock',
            key: customBlock.blockId,
            position: customBlock.startIndex,
            priority: 2,
        }));

        return children.sort((a, b) => a.position - b.position || a.priority - b.priority);
    }

    private _createElement(type: FDocElementType, key: string): FDocElement {
        return new FDocElement(this, type, key);
    }

    private _getBody(): IDocumentBody {
        const body = this._documentDataModel.getSelfOrHeaderFooterModel(this._segmentId).getBody();
        if (!body) {
            throw new Error('The document body is empty');
        }

        return body;
    }

    private _getParagraphInsertOffset(index: number): number {
        const body = this._getBody();
        if (index <= 0) {
            return 0;
        }

        const paragraphs = body.paragraphs ?? [];
        if (paragraphs.length === 0) {
            return Math.max(0, body.dataStream.length - 1);
        }

        if (index >= paragraphs.length) {
            return paragraphs[paragraphs.length - 1].startIndex + 1;
        }

        return paragraphs[index - 1].startIndex + 1;
    }

    private _normalizeInsertedParagraphIndex(index: number): number {
        const paragraphs = this._getBody().paragraphs ?? [];
        return Math.max(0, Math.min(index, paragraphs.length - 1));
    }

    private _getParagraphId(paragraph: IParagraph | undefined, paragraphIndex: number): string {
        if (!paragraph) {
            throw new RangeError(`Paragraph index ${paragraphIndex} is out of range.`);
        }

        if (!paragraph.paragraphId) {
            throw new DocElementStaleError(`Paragraph at index ${paragraphIndex} is missing paragraphId.`);
        }

        return paragraph.paragraphId;
    }

    private _preserveExplicitParagraphIds(body: IDocumentBody): void {
        (body as IDocumentBody & Record<string, unknown>)[RESTORE_INSERTED_PARAGRAPH_IDS] = true;
    }

    private _findParagraphByRange(range: IFDocTextRange): IFDocResolvedParagraph {
        const paragraphs = this._getBody().paragraphs ?? [];
        const paragraphIndex = paragraphs.findIndex((paragraph, index) => {
            const startOffset = index > 0 ? paragraphs[index - 1].startIndex + 1 : 0;
            return startOffset <= range.startOffset && range.endOffset <= paragraph.startIndex;
        });

        if (paragraphIndex < 0) {
            throw new RangeError('Range does not resolve to a paragraph.');
        }

        const paragraph = paragraphs[paragraphIndex];
        return {
            paragraph,
            paragraphIndex,
            startOffset: paragraphIndex > 0 ? paragraphs[paragraphIndex - 1].startIndex + 1 : 0,
            endOffset: paragraph.startIndex,
        };
    }

    private _replaceBodyRange(range: IFDocTextRange, insertBody: IDocumentBody): boolean {
        const startOffset = range.startOffset;
        const endOffset = range.endOffset;
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

    private _retainBodyRange(range: IFDocTextRange, body: IDocumentBody, coverType: UpdateDocsAttributeType): boolean {
        if (body.textRuns?.length && this._getBody().textRuns == null) {
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
        const currentBody = this._getBody();
        if (currentBody.textRuns != null) {
            return;
        }

        const jsonX = JSONX.getInstance();
        const actions = jsonX.replaceOp(
            [...getRichTextEditPath(this._documentDataModel, this._segmentId), 'textRuns'],
            undefined,
            []
        );

        this._commandService.syncExecuteCommand<IRichTextEditingMutationParams>(
            RichTextEditingMutation.id,
            {
                unitId: this._documentDataModel.getUnitId(),
                segmentId: this._segmentId,
                actions,
                textRanges: [],
                trigger: FACADE_TRIGGER,
                isEditing: false,
            }
        );
    }

    private _executeTextX(textX: TextX): boolean {
        const jsonX = JSONX.getInstance();
        const actions = jsonX.editOp(textX.serialize(), getRichTextEditPath(this._documentDataModel, this._segmentId));
        const result = this._commandService.syncExecuteCommand<IRichTextEditingMutationParams>(
            RichTextEditingMutation.id,
            {
                unitId: this._documentDataModel.getUnitId(),
                segmentId: this._segmentId,
                actions,
                textRanges: [],
                trigger: FACADE_TRIGGER,
                isEditing: false,
            }
        );

        return Boolean(result);
    }
}
