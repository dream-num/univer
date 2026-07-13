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

import type { IDocumentBody, Injector, IParagraph, IParagraphStyle } from '@univerjs/core';
import type { FDocument } from './f-document';
import type { IFDocumentTextRange } from './utils';
import { getParagraphContentStartOffset, PresetListType, RESTORE_INSERTED_PARAGRAPH_IDS, UpdateDocsAttributeType } from '@univerjs/core';
import { FDocumentTextRange } from './f-document-text-range';
import { buildPlainTextInsertBody, replaceBodyRange, retainBodyRange } from './utils';

/**
 * Resolved paragraph metadata in the the document body.
 */
export interface IFDocumentParagraphInfo {
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
 * A paragraph facade wrapper.
 *
 * Paragraph identity is backed by the persisted `paragraphId`. The id is
 * re-resolved before each method call, so insertions before this paragraph do
 * not break the wrapper.
 *
 * @hideconstructor
 */
export class FDocumentParagraph {
    constructor(
        private readonly _document: FDocument,
        private readonly _paragraphId: string,
        private readonly _segmentId = '',
        private readonly _injector: Injector
    ) {}

    /**
     * Get the persisted paragraph id.
     * @returns {string} The paragraph id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * console.log(paragraph?.getId());
     * ```
     */
    getId(): string {
        return this._paragraphId;
    }

    /**
     * Get the segment id of this paragraph.
     * The main body paragraphs have an empty string segment id.
     * The header and footer paragraphs have a non-empty string segment id.
     * @returns {string} The segment id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * console.log(paragraph?.getSegmentId());
     * ```
     */
    getSegmentId(): string {
        return this._segmentId;
    }

    /**
     * Get this paragraph's metadata.
     * @returns {IFDocumentParagraphInfo} The paragraph info.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * console.log(paragraph?.getInfo());
     * ```
     */
    getInfo(): IFDocumentParagraphInfo {
        const body = this._document.getBody(this._segmentId);
        const { paragraphs = [] } = body;
        const matches = paragraphs
            .map((paragraph, paragraphIndex) => ({ paragraph, paragraphIndex }))
            .filter(({ paragraph }) => paragraph.paragraphId === this._paragraphId);

        if (matches.length === 0) {
            throw new Error(`Document paragraph with id ${this._paragraphId} not found`);
        }

        if (matches.length > 1) {
            throw new Error(`Multiple document paragraphs with id ${this._paragraphId} found`);
        }

        const { paragraph, paragraphIndex } = matches[0];
        const startOffset = getParagraphContentStartOffset(body, paragraph);

        return {
            paragraph,
            paragraphIndex,
            startOffset,
            endOffset: paragraph.startIndex,
        };
    }

    /**
     * Get the current text range occupied by this paragraph.
     * @returns {IFDocumentTextRange} The paragraph text range, excluding the trailing paragraph break.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * console.log(paragraph?.getRange());
     * ```
     */
    getRange(): IFDocumentTextRange {
        const { startOffset, endOffset } = this.getInfo();
        return { startOffset, endOffset, segmentId: this._segmentId };
    }

    /**
     * Returns an agent-friendly facade for reading and styling this paragraph's text.
     * @returns {FDocumentTextRange} The paragraph text range, excluding the trailing paragraph break.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument?.findParagraphByText('Launch');
     * const range = paragraph?.getTextRange();
     * console.log(range?.describe());
     * ```
     */
    getTextRange(): FDocumentTextRange {
        const { startOffset, endOffset } = this.getInfo();
        return this._injector.createInstance(FDocumentTextRange, this._document, startOffset, endOffset, this._segmentId, this._injector);
    }

    /**
     * Get this paragraph's plain text.
     * @returns {string} The paragraph text without the trailing paragraph break.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * console.log(paragraph?.getText());
     * ```
     */
    getText(): string {
        const { dataStream } = this._document.getBody(this._segmentId);
        const { startOffset, endOffset } = this.getInfo();
        return dataStream.slice(startOffset, endOffset);
    }

    /**
     * Replace this paragraph's plain text.
     * @param {string} text The replacement text. Do not include the paragraph break.
     * @returns {boolean} `true` if the paragraph text was replaced.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * paragraph?.setText('New text');
     * console.log(paragraph?.getText());
     * ```
     */
    setText(text: string): boolean {
        const { startOffset, endOffset } = this.getInfo();
        return replaceBodyRange(
            {
                startOffset,
                endOffset,
                segmentId: this._segmentId,
            },
            buildPlainTextInsertBody(text),
            this._document.getDocumentDataModel(),
            this._injector
        );
    }

    /**
     * Append plain text before this paragraph's trailing paragraph break.
     * @param {string} text The plain text to append.
     * @returns {boolean} `true` if the text was appended.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * paragraph?.appendText(' Appended text');
     * console.log(paragraph?.getText());
     * ```
     */
    appendText(text: string): boolean {
        const { endOffset } = this.getInfo();
        return this._document.insertText(endOffset, text, this._segmentId);
    }

    /**
     * Apply paragraph style to a paragraph handle or text range.
     * `style.textStyle.fs` is a font size in points (pt), not CSS pixels.
     * @param {IParagraphStyle} style The Univer paragraph style patch.
     * @returns {boolean} `true` if the style was applied.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * paragraph?.setText('Styled text');
     * paragraph?.setStyle({
     *   textStyle: {
     *     cl: {
     *       rgb: '#FF0000',
     *     },
     *     fs: 14,
     *   },
     *   horizontalAlign: 2,
     * });
     * console.log(paragraph?.getInfo().paragraph.paragraphStyle);
     * ```
     */
    setStyle(style: IParagraphStyle): boolean {
        const { paragraph, startOffset, endOffset } = this.getInfo();
        let result = true;

        if (style.textStyle && startOffset < endOffset) {
            result = retainBodyRange(
                {
                    startOffset,
                    endOffset,
                    segmentId: this._segmentId,
                },
                {
                    dataStream: '',
                    textRuns: [{
                        st: 0,
                        ed: endOffset - startOffset,
                        ts: style.textStyle,
                    }],
                },
                UpdateDocsAttributeType.COVER,
                this._document.getDocumentDataModel(),
                this._injector
            );
        }

        const updateBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                ...paragraph,
                startIndex: 0,
                paragraphStyle: {
                    ...paragraph.paragraphStyle,
                    ...style,
                },
            }],
        };

        this._preserveExplicitParagraphIds(updateBody);

        return retainBodyRange(
            {
                startOffset: endOffset,
                endOffset: endOffset + 1,
                segmentId: this._segmentId,
            },
            updateBody,
            UpdateDocsAttributeType.REPLACE,
            this._document.getDocumentDataModel(),
            this._injector
        ) && result;
    }

    /**
     * Check whether this paragraph is a bullet, ordered, or checklist item.
     * @returns {boolean} `true` if the paragraph has list metadata.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * console.log(paragraph?.isListItem());
     * ```
     */
    isListItem(): boolean {
        const { paragraph } = this.getInfo();
        return Boolean(paragraph.bullet);
    }

    /**
     * Check whether this paragraph is a task/checklist item.
     * @returns {boolean} `true` if this paragraph is an unchecked or checked task item.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * console.log(paragraph?.isTask());
     * ```
     */
    isTask(): boolean {
        const { paragraph } = this.getInfo();
        const listType = paragraph.bullet?.listType;
        return listType === PresetListType.CHECK_LIST || listType === PresetListType.CHECK_LIST_CHECKED;
    }

    /**
     * Set the checked state of this task/checklist paragraph.
     * @param {boolean} checked Whether the task item should be checked.
     * @returns {boolean} `true` if the task state was updated, or `false` if this paragraph is not a task item.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     *
     * if (paragraph.isTask()) {
     *   const success = paragraph.setTaskChecked(true);
     *   console.log(success ? 'Task checked' : 'Failed to check task');
     * }
     * ```
     */
    setTaskChecked(checked: boolean): boolean {
        if (!this.isTask()) {
            return false;
        }

        const { paragraph, endOffset } = this.getInfo();
        const bullet = paragraph.bullet!;

        const updateBody: IDocumentBody = {
            dataStream: '',
            paragraphs: [{
                ...paragraph,
                startIndex: 0,
                bullet: {
                    ...bullet,
                    listType: checked ? PresetListType.CHECK_LIST_CHECKED : PresetListType.CHECK_LIST,
                },
            }],
        };

        this._preserveExplicitParagraphIds(updateBody);

        return retainBodyRange(
            {
                startOffset: endOffset,
                endOffset: endOffset + 1,
                segmentId: this._segmentId,
            },
            updateBody,
            UpdateDocsAttributeType.REPLACE,
            this._document.getDocumentDataModel(),
            this._injector
        );
    }

    /**
     * Remove this paragraph.
     * @returns {boolean} `true` if the paragraph was removed.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraphs()[0];
     * const success = paragraph?.remove();
     * console.log(success ? 'Paragraph removed' : 'Failed to remove paragraph');
     * ```
     */
    remove(): boolean {
        const { startOffset, endOffset } = this.getInfo();
        return this._document.deleteRange({
            startOffset,
            endOffset: endOffset + 1,
            segmentId: this._segmentId,
        });
    }

    private _preserveExplicitParagraphIds(body: IDocumentBody): void {
        (body as IDocumentBody & Record<string, unknown>)[RESTORE_INSERTED_PARAGRAPH_IDS] = true;
    }
}

export function isParagraphFacade(value: unknown): value is FDocumentParagraph {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    return typeof (value as FDocumentParagraph).getId === 'function' &&
        typeof (value as FDocumentParagraph).getSegmentId === 'function' &&
        typeof (value as FDocumentParagraph).getInfo === 'function' &&
        typeof (value as FDocumentParagraph).getRange === 'function';
}
