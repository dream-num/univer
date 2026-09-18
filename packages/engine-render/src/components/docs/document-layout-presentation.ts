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

import type {
    BooleanNumber,
    DocumentDataModel,
    IColumn,
    IColumnGroup,
    ICustomColumnGroup,
    IDisposable,
    IDocTextOutline,
    IDocumentBody,
    IDocumentData,
    IDocumentRenderConfig,
    IDocumentStyle,
    IParagraph,
    IParagraphStyle,
    ISectionBreak,
    ITextDecoration,
    ITextRun,
    ITextStyle,
    JSONXActions,
} from '@univerjs/core';
import { toDisposable } from '@univerjs/core';

/** Transient layout data. These fields are never part of a document model or snapshot. */
export interface IDocumentLayoutTextDecoration extends ITextDecoration {
    offset?: number;
    offsetReference?: 'line-bottom' | 'baseline';
}

export interface IDocumentLayoutTextStyle extends ITextStyle {
    fontRenderScale?: number;
    textSkewX?: number;
    textAdvance?: number;
    customGlyphKey?: string;
    customGlyphGroup?: string;
    lineAscent?: number;
    lineDescent?: number;
    textPaintOffsets?: Array<{ x: number; y: number }>;
    textOutline?: IDocTextOutline & {
        lineCap?: 'butt' | 'round' | 'square';
        lineJoin?: 'bevel' | 'miter' | 'round';
        miterLimit?: number;
    };
    ul?: IDocumentLayoutTextDecoration;
    st?: IDocumentLayoutTextDecoration;
    ol?: IDocumentLayoutTextDecoration;
}

export interface IDocumentLayoutRenderConfig extends IDocumentRenderConfig {
    topAlignExactLineSpacing?: BooleanNumber;
    useTextInkForHitTesting?: BooleanNumber;
    preservePunctuationSpacing?: BooleanNumber;
    applyTextPosition?: BooleanNumber;
    paintTextOutline?: BooleanNumber;
}

export interface IDocumentLayoutParagraphStyle extends IParagraphStyle {
    fixedTabStops?: BooleanNumber;
    textStyle?: IDocumentLayoutTextStyle;
    paragraphMarkTextStyle?: IDocumentLayoutTextStyle;
}

export interface IDocumentLayoutParagraph extends IParagraph {
    paragraphStyle?: IDocumentLayoutParagraphStyle;
}

export interface IDocumentLayoutTextRun extends ITextRun {
    ts?: IDocumentLayoutTextStyle;
}

export interface IDocumentLayoutColumn extends IColumn {
    topOffset?: IColumn['minWidth'];
}

export interface IDocumentLayoutColumnGroup extends IColumnGroup {
    horizontalPadding?: IColumnGroup['gap'];
    minHeight?: IColumnGroup['gap'];
    clipContent?: BooleanNumber;
    columns: IDocumentLayoutColumn[];
}

export interface IDocumentLayoutCustomColumnGroup extends ICustomColumnGroup {
    horizontalPadding?: IColumnGroup['gap'];
    minHeight?: IColumnGroup['gap'];
    clipContent?: BooleanNumber;
    columns?: IDocumentLayoutColumn[];
}

export interface IDocumentLayoutSectionBreak extends ISectionBreak {
    renderConfig?: IDocumentLayoutRenderConfig;
}

export interface IDocumentLayoutStyle extends IDocumentStyle {
    fontMetricScaleEnabled?: BooleanNumber;
    textStyle?: IDocumentLayoutTextStyle;
    renderConfig?: IDocumentLayoutRenderConfig;
}

export interface IDocumentLayoutBody extends IDocumentBody {
    textRuns?: IDocumentLayoutTextRun[];
    paragraphs?: IDocumentLayoutParagraph[];
    sectionBreaks?: IDocumentLayoutSectionBreak[];
    columnGroups?: IDocumentLayoutCustomColumnGroup[];
}

/** A read-only layout projection owned by an external host, not a persisted Doc snapshot. */
export interface IDocumentLayoutSnapshot extends IDocumentData {
    documentStyle: IDocumentLayoutStyle;
    body?: IDocumentLayoutBody;
}

/** Synchronous, model-only hooks for host layout metadata and its local undo history. */
export interface IDocumentLayoutPresentation {
    getSnapshot(document: IDocumentData): IDocumentLayoutSnapshot;
    captureState(): unknown;
    applyActions(actions: JSONXActions, document: IDocumentData): void;
    restoreState(state: unknown): void;
}

const presentations = new WeakMap<DocumentDataModel, { presentation: IDocumentLayoutPresentation }>();

export function registerDocumentLayoutPresentation(
    model: DocumentDataModel,
    presentation: IDocumentLayoutPresentation
): IDisposable {
    const registration = { presentation };
    presentations.set(model, registration);
    return toDisposable(() => {
        if (presentations.get(model) === registration) {
            presentations.delete(model);
        }
    });
}

export function getDocumentLayoutPresentation(model: DocumentDataModel): IDocumentLayoutPresentation | undefined {
    return presentations.get(model)?.presentation;
}
