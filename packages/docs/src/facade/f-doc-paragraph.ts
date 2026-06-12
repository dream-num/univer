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

import type { FDocBody, IFDocTextRange } from './f-doc-body';

/**
 * A paragraph facade wrapper.
 *
 * Paragraph identity is backed by a runtime temporary key. The key is stable for
 * the current `FDocument` facade lifecycle and is re-resolved before each method
 * call, so insertions before this paragraph made through the facade do not break
 * the wrapper.
 *
 * @hideconstructor
 */
export class FDocParagraph {
    constructor(
        protected readonly _body: FDocBody,
        protected readonly _key: string
    ) {}

    /**
     * Get the document element type.
     * @returns {'paragraph'} The literal paragraph element type.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(paragraph.getType());
     * ```
     */
    getType(): 'paragraph' {
        return 'paragraph';
    }

    /**
     * Get the runtime key used to resolve this paragraph.
     * @returns {string} The paragraph runtime key for the current `FDocument` facade lifecycle.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(paragraph.getKey());
     * ```
     */
    getKey(): string {
        return this._key;
    }

    /**
     * Get the parent body facade that owns this paragraph.
     * @returns {FDocBody} The document body facade.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(paragraph.getParent().getChildIndex(paragraph));
     * ```
     */
    getParent(): FDocBody {
        return this._body;
    }

    /**
     * Remove this paragraph from its parent body.
     * @returns {boolean} `true` if the paragraph was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * paragraph.removeFromParent();
     * ```
     */
    removeFromParent(): boolean {
        return this._body.removeParagraph(this._key);
    }

    /**
     * Get this paragraph's plain text.
     * @returns {string} The paragraph text without the trailing paragraph break.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(paragraph.getText());
     * ```
     */
    getText(): string {
        return this._body.getParagraphText(this._key);
    }

    /**
     * Replace this paragraph's plain text.
     * @param {string} text The replacement text. Do not include the paragraph break.
     * @returns {boolean} `true` if the paragraph text was replaced.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * paragraph.setText('Updated title');
     * ```
     */
    setText(text: string): boolean {
        return this._body.setParagraphText(this._key, text);
    }

    /**
     * Append plain text before this paragraph's trailing paragraph break.
     * @param {string} text The plain text to append.
     * @returns {boolean} `true` if the text was appended.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * paragraph.appendText(' suffix');
     * ```
     */
    appendText(text: string): boolean {
        return this._body.appendParagraphText(this._key, text);
    }

    /**
     * Get the current text range occupied by this paragraph.
     * @returns {IFDocTextRange} The paragraph text range, excluding the trailing paragraph break.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * const range = paragraph.getRange();
     * doc.getBody().setTextStyle(range, { bl: 1 });
     * ```
     */
    getRange(): IFDocTextRange {
        return this._body.getParagraphRange(this._key);
    }

    /**
     * Check whether this paragraph is a bullet, ordered, or checklist item.
     * @returns {boolean} `true` if the paragraph has list metadata.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(paragraph.isListItem());
     * ```
     */
    isListItem(): boolean {
        return this._body.isListParagraph(this._key);
    }

    /**
     * Check whether this paragraph is a task/checklist item.
     * @returns {boolean} `true` if this paragraph is an unchecked or checked task item.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * if (paragraph.isTask()) {
     *     paragraph.setTaskChecked(true);
     * }
     * ```
     */
    isTask(): boolean {
        return this._body.isTaskParagraph(this._key);
    }

    /**
     * Set the checked state of this task/checklist paragraph.
     * @param {boolean} checked Whether the task item should be checked.
     * @returns {boolean} `true` if the task state was updated, or `false` if this paragraph is not a task item.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * if (paragraph.isTask()) {
     *     paragraph.setTaskChecked(false);
     * }
     * ```
     */
    setTaskChecked(checked: boolean): boolean {
        return this._body.setTaskChecked(this._key, checked);
    }
}
