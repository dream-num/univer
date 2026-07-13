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

import type { Injector, ITextStyle } from '@univerjs/core';
import type { FDocument } from './f-document';
import type { IFDocumentTextRange } from './utils';
import { Tools, UpdateDocsAttributeType } from '@univerjs/core';
import { buildPlainTextInsertBody, replaceBodyRange, retainBodyRange } from './utils';

/** A clipped text-style run in document offsets. */
export interface IFDocumentTextStyleRun {
    /** Inclusive start offset in the document segment. */
    startOffset: number;
    /** Exclusive end offset in the document segment. */
    endOffset: number;
    /** Explicit text style stored on this run. */
    textStyle: ITextStyle;
}

/** Agent-friendly summary of a document text range. */
export interface IFDocumentTextRangeDescription extends IFDocumentTextRange {
    text: string;
    length: number;
    /** Explicit styles stored directly in text runs. */
    explicitTextStyleRuns: IFDocumentTextStyleRun[];
    /** Top-level explicit style properties common to the complete range. */
    commonExplicitTextStyle: ITextStyle;
    /** @deprecated Use `explicitTextStyleRuns`. */
    textStyleRuns: IFDocumentTextStyleRun[];
    /** @deprecated Use `commonExplicitTextStyle`. */
    commonTextStyle: ITextStyle;
}

/**
 * Facade wrapper for reading and styling a fixed document text range.
 *
 * Offsets are fixed when the wrapper is created. Create a new range after edits
 * that insert or remove content before it.
 * @hideconstructor
 */
export class FDocumentTextRange {
    constructor(
        private readonly _document: FDocument,
        private readonly _startOffset: number,
        private readonly _endOffset: number,
        private readonly _segmentId: string,
        private readonly _injector: Injector
    ) {
        this._validateRange();
    }

    /**
     * Returns the serializable document range.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const range = fDocument?.findParagraphByText('Launch')?.getTextRange();
     * console.log(range?.getRange());
     * ```
     */
    getRange(): IFDocumentTextRange {
        return {
            startOffset: this._startOffset,
            endOffset: this._endOffset,
            segmentId: this._segmentId,
        };
    }

    /**
     * Returns the plain data-stream text in this range.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const range = fDocument?.findParagraphByText('Launch')?.getTextRange();
     * console.log(range?.getText());
     * ```
     */
    getText(): string {
        return this._document.getBody(this._segmentId).dataStream.slice(this._startOffset, this._endOffset);
    }

    /**
     * Returns explicit text-style runs intersecting this range.
     * Returned offsets are clipped to the range and remain document-relative.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const range = fDocument?.findParagraphByText('Launch')?.getTextRange();
     * console.log(range?.getExplicitTextStyleRuns());
     * ```
     */
    getExplicitTextStyleRuns(): IFDocumentTextStyleRun[] {
        const { textRuns = [] } = this._document.getBody(this._segmentId);
        return textRuns
            .filter((run) => run.st < this._endOffset && run.ed > this._startOffset)
            .map((run) => ({
                startOffset: Math.max(run.st, this._startOffset),
                endOffset: Math.min(run.ed, this._endOffset),
                textStyle: Tools.deepClone(run.ts ?? {}),
            }));
    }

    /** @deprecated Use `getExplicitTextStyleRuns()` to distinguish stored styles from effective styles. */
    getTextStyleRuns(): IFDocumentTextStyleRun[] {
        return this.getExplicitTextStyleRuns();
    }

    /**
     * Returns top-level style properties that have the same explicit value
     * across the complete range. Unstyled gaps make a property non-common.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const range = fDocument?.findParagraphByText('Launch')?.getTextRange();
     * console.log(range?.getCommonExplicitTextStyle());
     * ```
     */
    getCommonExplicitTextStyle(): ITextStyle {
        if (this._startOffset === this._endOffset) {
            return {};
        }

        const runs = this._getStyleSegments();
        const [first, ...rest] = runs;
        const common = Tools.deepClone(first.textStyle);

        for (const key of Object.keys(common) as Array<keyof ITextStyle>) {
            if (rest.some((run) => !isDeepEqual(run.textStyle[key], common[key]))) {
                delete common[key];
            }
        }

        return common;
    }

    /** @deprecated Use `getCommonExplicitTextStyle()` to distinguish stored styles from effective styles. */
    getCommonTextStyle(): ITextStyle {
        return this.getCommonExplicitTextStyle();
    }

    /**
     * Returns a serializable summary suitable for an agent/tool response.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const range = fDocument?.findParagraphByText('Launch')?.getTextRange();
     * console.log(range?.describe());
     * ```
     */
    describe(): IFDocumentTextRangeDescription {
        const explicitTextStyleRuns = this.getExplicitTextStyleRuns();
        const commonExplicitTextStyle = this.getCommonExplicitTextStyle();
        return {
            ...this.getRange(),
            text: this.getText(),
            length: this._endOffset - this._startOffset,
            explicitTextStyleRuns,
            commonExplicitTextStyle,
            textStyleRuns: explicitTextStyleRuns,
            commonTextStyle: commonExplicitTextStyle,
        };
    }

    /**
     * Merges a text-style patch into every character in the range.
     * Existing text-run splitting, merging, and normalization are handled by
     * the document mutation pipeline.
     * `style.fs` is a font size in points (pt), not CSS pixels.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const range = fDocument?.findParagraphByText('Launch')?.getTextRange();
     * range?.setTextStyle({ fs: 10.5, bl: univerAPI.Enum.BooleanNumber.TRUE });
     * ```
     */
    setTextStyle(style: ITextStyle): boolean {
        if (this._startOffset === this._endOffset) {
            return false;
        }

        return retainBodyRange(
            this.getRange(),
            {
                dataStream: '',
                textRuns: [{
                    st: 0,
                    ed: this._endOffset - this._startOffset,
                    ts: Tools.deepClone(style),
                }],
            },
            UpdateDocsAttributeType.COVER,
            this._document.getDocumentDataModel(),
            this._injector
        );
    }

    /**
     * Replaces the range with plain text while preserving document mutation semantics.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const range = fDocument?.findParagraphByText('Draft')?.getTextRange();
     * range?.setText('Final');
     * ```
     */
    setText(text: string): boolean {
        return replaceBodyRange(
            this.getRange(),
            buildPlainTextInsertBody(text),
            this._document.getDocumentDataModel(),
            this._injector
        );
    }

    private _validateRange(): void {
        const bodyLength = this._document.getBody(this._segmentId).dataStream.length;
        if (
            !Number.isInteger(this._startOffset) ||
            !Number.isInteger(this._endOffset) ||
            this._startOffset < 0 ||
            this._endOffset < this._startOffset ||
            this._endOffset > bodyLength
        ) {
            throw new RangeError(`Invalid document text range [${this._startOffset}, ${this._endOffset}) for body length ${bodyLength}.`);
        }
    }

    private _getStyleSegments(): IFDocumentTextStyleRun[] {
        const explicitRuns = this.getExplicitTextStyleRuns();
        const segments: IFDocumentTextStyleRun[] = [];
        let offset = this._startOffset;

        for (const run of explicitRuns) {
            if (offset < run.startOffset) {
                segments.push({ startOffset: offset, endOffset: run.startOffset, textStyle: {} });
            }
            segments.push(run);
            offset = run.endOffset;
        }

        if (offset < this._endOffset) {
            segments.push({ startOffset: offset, endOffset: this._endOffset, textStyle: {} });
        }

        return segments;
    }
}

function isDeepEqual(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}
