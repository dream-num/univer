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

import type { Injector, ITextRun, ITextStyle } from '@univerjs/core';
import type { FDocument } from './f-document';
import type { IFDocumentTextRange } from './utils';
import { getTextChangeRange, ICommandService, Tools, UpdateDocsAttributeType } from '@univerjs/core';
import { FBaseInitialable } from '@univerjs/core/facade';
import { buildPlainTextInsertBody, normalizePlainTextDataStream, replaceBodyRange, retainBodyRange } from './utils';

/** Options for replacing text in a Doc paragraph or range. */
export interface IFDocumentSetTextOptions {
    /** Keep explicit character formatting. The default writes plain text. */
    preserveStyles?: boolean;
}

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
}

/**
 * Facade wrapper for reading and styling a fixed document text range.
 *
 * Offsets are fixed when the wrapper is created. Create a new range after edits
 * that insert or remove content before it.
 * @hideconstructor
 */
export class FDocumentTextRange extends FBaseInitialable {
    constructor(
        protected readonly _document: FDocument,
        protected readonly _startOffset: number,
        protected readonly _endOffset: number,
        protected readonly _segmentId: string,
        protected override readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super(_injector);
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
        };
    }

    /**
     * Merges a text-style patch into every character in the range.
     * Existing text-run splitting, merging, and normalization are handled by
     * the document mutation pipeline.
     * `style.fs` is a font size in points (pt), not CSS pixels.
     * @param {ITextStyle} style Text-style properties to merge into the range.
     * @returns {boolean} Whether the style update succeeded; `false` for an empty range.
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
     * Replaces the range with plain text. With `preserveStyles`, equal leading and trailing text
     * stays in place. Replacement characters inherit the corresponding changed characters' runs.
     * Extra characters inherit the last replaced character's style. A pure insertion uses the
     * preceding character in the range, or its first character when inserting at its start.
     * An empty range supplies no explicit style.
     * @param {string} text Replacement text. An empty string deletes the range.
     * @param {IFDocumentSetTextOptions} [options] Character-formatting behavior.
     * @returns {boolean} Whether the replacement succeeded.
     * @example
     * ```ts
     * const paragraph = univerAPI.getActiveDocument()?.getParagraphs()[0];
     * paragraph?.findText('30%')?.setText('32%', { preserveStyles: true });
     * ```
     */
    setText(text: string, options: IFDocumentSetTextOptions = {}): boolean {
        const range = this.getRange();
        const model = this._document.getDocumentDataModel();
        if (!options.preserveStyles) {
            return replaceBodyRange(range, buildPlainTextInsertBody(text), model, this._commandService);
        }

        this._validateRange();
        const original = this.getText();
        const normalized = normalizePlainTextDataStream(text);
        if (original === normalized) {
            return true;
        }

        // Diff code points so an edit can never retain half of a surrogate pair.
        const before = Array.from(original);
        const after = Array.from(normalized);
        const { start, deleteLength, insertLength } = getTextChangeRange(before, after);
        const startOffset = range.startOffset + before.slice(0, start).join('').length;
        const removed = before.slice(start, start + deleteLength);
        const inserted = after.slice(start, start + insertLength);
        const body = buildPlainTextInsertBody(inserted.join(''));
        if (before.length && inserted.length) {
            const anchor = deleteLength > 0 || start === 0 ? startOffset : startOffset - 1;
            const { textRuns = [] } = this._document.getBody(range.segmentId);
            body.textRuns = mapReplacementRuns(textRuns, anchor, removed, inserted);
        }

        return replaceBodyRange(
            { ...range, startOffset, endOffset: startOffset + removed.join('').length },
            body,
            model,
            this._commandService
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

function mapReplacementRuns(runs: ITextRun[], sourceOffset: number, removed: string[], inserted: string[]): ITextRun[] {
    const result: ITextRun[] = [];
    let runIndex = 0;
    let previous: ITextRun | undefined;
    let offset = 0;
    for (let i = 0; i < inserted.length; i++) {
        while (runIndex < runs.length && runs[runIndex].ed <= sourceOffset) {
            runIndex++;
        }
        const run = runs[runIndex];
        const end = offset + inserted[i].length;
        if (run && run.st <= sourceOffset) {
            if (run === previous) {
                result[result.length - 1].ed = end;
            } else {
                result.push({ ...Tools.deepClone(run), st: offset, ed: end });
            }
            previous = run;
        } else {
            previous = undefined;
        }
        offset = end;
        if (i + 1 < removed.length) {
            sourceOffset += removed[i].length;
        }
    }
    return result;
}

function isDeepEqual(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}
