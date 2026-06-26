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
import type { FDocumentBody, IFDocumentTextRange } from './f-document-body';
import type { IFDocumentElementInfo } from './f-document-element';
import { DocumentBlockType, PresetListType, RESTORE_INSERTED_PARAGRAPH_IDS, UpdateDocsAttributeType } from '@univerjs/core';
import { FDocumentElement } from './f-document-element';

interface IFDocumentParagraphMixin {
    asParagraph(): FDocumentParagraph;
}

/**
 * Resolved paragraph metadata in the the document body.
 */
export interface IFDocumentResolvedParagraph {
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
export class FDocumentParagraph extends FDocumentElement {
    constructor(
        protected readonly body: FDocumentBody,
        protected readonly info: IFDocumentElementInfo,
        protected readonly injector: Injector
    ) {
        super(body, info, injector);

        if (this.getType() !== DocumentBlockType.PARAGRAPH) {
            throw new Error(`Element type is not a paragraph: ${this.getType()}`);
        }
    }

    /**
     * Get the persisted paragraph id.
     * @returns {string} The paragraph id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   console.log(paragraph.getParagraphId());
     * }
     * ```
     */
    getParagraphId(): string {
        return this.getKey();
    }

    /**
     * Get the resolved paragraph info for this wrapper.
     * @returns {IFDocumentResolvedParagraph} The resolved paragraph info, including the paragraph object, its index, and its text range.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   console.log(paragraph.getResolvedParagraphInfo());
     * }
     * ```
     */
    getResolvedParagraphInfo(): IFDocumentResolvedParagraph {
        const { paragraphs = [] } = this._body.getBody();
        const matches = paragraphs
            .map((paragraph, paragraphIndex) => ({ paragraph, paragraphIndex }))
            .filter(({ paragraph }) => paragraph.paragraphId === this.getKey());

        if (matches.length === 0) {
            throw new Error(`Document paragraph with id ${this.getKey()} not found`);
        }

        if (matches.length > 1) {
            throw new Error(`Multiple document paragraphs with id ${this.getKey()} found`);
        }

        const { paragraph, paragraphIndex } = matches[0];
        const startOffset = paragraphIndex > 0 ? paragraphs[paragraphIndex - 1].startIndex + 1 : 0;

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
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   const range = paragraph.getRange();
     *   fDocumentBody.setTextStyle(range, { bl: 1 });
     * }
     * ```
     */
    getRange(): IFDocumentTextRange {
        const { startOffset, endOffset } = this.getResolvedParagraphInfo();
        return { startOffset, endOffset, segmentId: this._body.getSegmentId() };
    }

    /**
     * Get this paragraph's plain text.
     * @returns {string} The paragraph text without the trailing paragraph break.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   console.log(paragraph.getText());
     * }
     * ```
     */
    getText(): string {
        const { dataStream } = this._body.getBody();
        const { startOffset, endOffset } = this.getResolvedParagraphInfo();
        return dataStream.slice(startOffset, endOffset);
    }

    /**
     * Replace this paragraph's plain text.
     * @param {string} text The replacement text. Do not include the paragraph break.
     * @returns {boolean} `true` if the paragraph text was replaced.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   const success = paragraph.setText('Updated title');
     *   console.log(success ? 'Text updated' : 'Failed to update text');
     * }
     * ```
     */
    setText(text: string): boolean {
        const { startOffset, endOffset } = this.getResolvedParagraphInfo();
        return this._body.replaceRange({ startOffset, endOffset }, text);
    }

    /**
     * Append plain text before this paragraph's trailing paragraph break.
     * @param {string} text The plain text to append.
     * @returns {boolean} `true` if the text was appended.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   const success = paragraph.appendText(' Appended text');
     *   console.log(success ? 'Text appended' : 'Failed to append text');
     * }
     * ```
     */
    appendText(text: string): boolean {
        const { endOffset } = this.getResolvedParagraphInfo();
        return this._body.insertText(endOffset, text);
    }

    /**
     * Apply paragraph style to a paragraph handle or text range.
     * @param {IParagraphStyle} style The Univer paragraph style patch.
     * @returns {boolean} `true` if the style was applied.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   paragraph.setStyle({ horizontalAlign: 2 });
     * }
     * ```
     */
    setStyle(style: IParagraphStyle): boolean {
        const { paragraph, endOffset } = this.getResolvedParagraphInfo();

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

        return this._body.retainRange(
            { startOffset: endOffset, endOffset: endOffset + 1 },
            updateBody,
            UpdateDocsAttributeType.REPLACE
        );
    }

    /**
     * Check whether this paragraph is a bullet, ordered, or checklist item.
     * @returns {boolean} `true` if the paragraph has list metadata.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   console.log(paragraph.isListItem() ? 'This is a list item' : 'This is not a list item');
     * }
     * ```
     */
    isListItem(): boolean {
        const { paragraph } = this.getResolvedParagraphInfo();
        return Boolean(paragraph.bullet);
    }

    /**
     * Check whether this paragraph is a task/checklist item.
     * @returns {boolean} `true` if this paragraph is an unchecked or checked task item.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *   console.log(paragraph.isTask() ? 'This is a task item' : 'This is not a task item');
     * }
     * ```
     */
    isTask(): boolean {
        const { paragraph } = this.getResolvedParagraphInfo();
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
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isParagraph()) {
     *   const paragraph = element.asParagraph();
     *
     *   if (paragraph.isTask()) {
     *     const success = paragraph.setTaskChecked(true);
     *     console.log(success ? 'Task checked' : 'Failed to check task');
     *   }
     * }
     * ```
     */
    setTaskChecked(checked: boolean): boolean {
        if (!this.isTask()) {
            return false;
        }

        const { paragraph, endOffset } = this.getResolvedParagraphInfo();
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

        return this._body.retainRange(
            { startOffset: endOffset, endOffset: endOffset + 1 },
            updateBody,
            UpdateDocsAttributeType.REPLACE
        );
    }

    private _preserveExplicitParagraphIds(body: IDocumentBody): void {
        (body as IDocumentBody & Record<string, unknown>)[RESTORE_INSERTED_PARAGRAPH_IDS] = true;
    }
}

export class FDocumentParagraphMixin extends FDocumentElement {
    override asParagraph(): FDocumentParagraph {
        if (this.getType() !== DocumentBlockType.PARAGRAPH) {
            throw new Error(`Element type is not a paragraph: ${this.getType()}`);
        }
        return this._injector.createInstance(FDocumentParagraph, this._body, this.getResolvedInfo(), this._injector);
    }
}

FDocumentElement.extend(FDocumentParagraphMixin);
declare module '@univerjs/docs/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FDocumentElement extends IFDocumentParagraphMixin { }
}
