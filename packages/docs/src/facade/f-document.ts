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

import type { DocumentDataModel, IDocumentBody, IDocumentData, IParagraphBorder, ISectionBreak, SectionHeaderFooterKind, SectionType } from '@univerjs/core';
import type { IHeaderFooterProps } from '@univerjs/docs';
import type { IFDocumentTextRange } from './utils';
import {
    BooleanNumber,
    createSectionId,
    DashStyleType,
    DataStreamTreeTokenType,
    DocumentFlavor,
    generateRandomId,
    getParagraphContentStartOffset,
    ICommandService,
    Inject,
    Injector,
    IResourceLoaderService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { FBaseInitialable } from '@univerjs/core/facade';
import { CreateHeaderFooterCommand, generateParagraphs, getTopLevelSectionBreaks, HeaderFooterType, InsertDocumentColumnBreakCommand, InsertDocumentSectionBreakCommand, SetDocumentNameCommand } from '@univerjs/docs';
import { FDocumentParagraph } from './f-document-paragraph';
import { DocsSectionUnsupportedDocumentFlavorError, FDocumentSection } from './f-document-section';
import { FDocumentTextRange } from './f-document-text-range';
import { buildPlainTextInsertBody, replaceBodyRange } from './utils';

export interface IFDocumentParagraphQuery {
    text?: string;
    paragraphId?: string;
    segmentId?: string;
}

export interface IDocumentCustomBlockLayoutItem {
    blockId: string;
    startIndex: number;
    index: number;
}

/**
 * Structural custom-block layout from the document model.
 *
 * This intentionally excludes rendered pixel positions and pagination.
 */
export interface IDocumentCustomBlockLayout {
    blocks: IDocumentCustomBlockLayoutItem[];
}

/**
 * Options for inserting a section break in a traditional document.
 *
 * Section properties such as margins and page size describe the section created
 * before the inserted break. `nextSectionType` controls how the existing section
 * after the break begins relative to that newly created section.
 */
export type IFDocumentInsertSectionBreakOptions = Partial<Omit<ISectionBreak, 'sectionId' | 'startIndex'>> & {
    /**
     * How the existing section after the inserted boundary begins relative to
     * the newly created section. Prefer this atomic option to inserting a break
     * and then resolving and updating the following section separately.
     */
    nextSectionType?: SectionType;
};

/**
 * Facade API object bounded to a document. It provides a set of methods to interact with the document.
 * @hideconstructor
 */
export class FDocument extends FBaseInitialable {
    readonly id: string;

    constructor(
        private readonly _documentDataModel: DocumentDataModel,
        @Inject(Injector) protected override readonly _injector: Injector,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @Inject(IResourceLoaderService) protected readonly _resourceLoaderService: IResourceLoaderService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super(_injector);

        this.id = this._documentDataModel.getUnitId();
    }

    /**
     * Get the document data model of the document.
     * @param {string} segmentId The segment id used to get the header/footer data model. Defaults to an empty string for the document data model of the document.
     * @returns {DocumentDataModel} The document data model.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument.getDocumentDataModel());
     *
     * const headerSegmentId = fDocument.ensurePageHeader();
     * console.log(fDocument.getDocumentDataModel(headerSegmentId));
     * ```
     */
    getDocumentDataModel(segmentId: string = ''): DocumentDataModel {
        const documentDataModel = this._documentDataModel.getSelfOrHeaderFooterModel(segmentId);
        if (!documentDataModel) {
            throw new Error(segmentId === '' ? 'Document data model is not found.' : `Document data model is not found in the segment: ${segmentId}`);
        }
        return documentDataModel;
    }

    /**
     * Returns the document's custom blocks in stable model order.
     *
     * This method is available in Node/headless environments and does not
     * perform font measurement, line wrapping, pagination, or rendering.
     *
     * @returns {IDocumentCustomBlockLayout} Custom block identifiers and model positions.
     * @example
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * const layout = document?.getCustomBlockLayout();
     * console.log(layout?.blocks);
     * ```
     */
    getCustomBlockLayout(): IDocumentCustomBlockLayout {
        const blocks = this._documentDataModel.getBody()?.customBlocks ?? [];
        return {
            blocks: blocks.map(({ blockId, startIndex }, index) => ({
                blockId,
                startIndex,
                index,
            })),
        };
    }

    /**
     * Get the document body or header/footer body by the segment id.
     * The main body has an empty segment id.
     * The header and footer body have their respective segment ids.
     * @param {string} segmentId The segment id of the body. Defaults to an empty string for the main body.
     * @returns {IDocumentBody} The document body.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument.getBody()); // Get the main body
     *
     * const footerSegmentId = fDocument.ensurePageFooter();
     * console.log(fDocument.getBody(footerSegmentId)); // Get the footer body
     * ```
     */
    getBody(segmentId: string = ''): IDocumentBody {
        const body = this._documentDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (!body) {
            throw new Error(segmentId === '' ? 'Body is not found in the document.' : `Body is not found in the segment: ${segmentId}`);
        }
        return body;
    }

    override dispose(): void {
        super.dispose();
    }

    /**
     * Get the document id.
     * @returns {string} The document id.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument.getId());
     * ```
     */
    getId(): string {
        return this.id;
    }

    /**
     * Get the document name.
     * @returns {string} The document name.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument.getName());
     * ```
     */
    getName(): string {
        return this._documentDataModel.getTitle() || '';
    }

    /**
     * Set the document name.
     * @param {string} name The new document name.
     * @returns {FDocument} The current document for chaining.
     *
     * @example
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * document?.setName('Quarterly Report');
     * ```
     */
    setName(name: string): this {
        this._commandService.syncExecuteCommand(SetDocumentNameCommand.id, {
            unitId: this.id,
            name,
        });
        return this;
    }

    /**
     * Returns the document's explicit layout flavor.
     *
     * Use this method when all three states matter. Do not infer a Traditional
     * document from `!isModern()`: that expression is also true for
     * `DocumentFlavor.UNSPECIFIED`.
     *
     * @returns {DocumentFlavor} `TRADITIONAL`, `MODERN`, or `UNSPECIFIED`.
     * @example
     * ```typescript
     * const document = univerAPI.getActiveDocument();
     * if (!document) {
     *   throw new Error('No active document');
     * }
     *
     * switch (document.getDocumentFlavor()) {
     *   case univerAPI.Enum.DocumentFlavor.TRADITIONAL:
     *     console.log('Word-compatible physical pagination is available');
     *     break;
     *   case univerAPI.Enum.DocumentFlavor.MODERN:
     *     console.log('Use Modern Doc layout APIs such as ColumnGroup');
     *     break;
     *   default:
     *     console.log('Resolve the unspecified flavor before using flavor-specific APIs');
     * }
     * ```
     */
    getDocumentFlavor(): DocumentFlavor {
        return this._resolveDocumentFlavor();
    }

    /**
     * Whether this is a Traditional document with Word-compatible physical pagination.
     *
     * Prefer this positive guard before calling section, column-break, page-setup,
     * or paragraph-pagination APIs.
     *
     * @returns {boolean} `true` only for `DocumentFlavor.TRADITIONAL`.
     * @example
     * ```typescript
     * const document = univerAPI.getActiveDocument();
     * if (document?.isTraditional()) {
     *   console.log(document.getSection(0)?.getEffectivePageSetup());
     * }
     * ```
     */
    isTraditional(): boolean {
        return this._resolveDocumentFlavor() === DocumentFlavor.TRADITIONAL;
    }

    /**
     * Whether this is a Modern document.
     *
     * A `false` result can mean either Traditional or Unspecified. Use
     * `isTraditional()` before Traditional-only APIs, or `getDocumentFlavor()`
     * when all three states matter.
     *
     * @returns {boolean} `true` only for `DocumentFlavor.MODERN`.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.isModern());
     * ```
     */
    isModern(): boolean {
        return this._resolveDocumentFlavor() === DocumentFlavor.MODERN;
    }

    private _resolveDocumentFlavor(): DocumentFlavor {
        return this._documentDataModel.getSnapshot().documentStyle.documentFlavor ?? DocumentFlavor.UNSPECIFIED;
    }

    /**
     * Save the document snapshot data, including the document content and resource data, etc.
     * @returns {IDocumentData} The document snapshot data.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const snapshot = fDocument.save();
     * console.log(snapshot);
     * ```
     */
    save(): IDocumentData {
        return this._resourceLoaderService.saveUnit<IDocumentData>(this._documentDataModel.getUnitId())!;
    }

    /**
     * Undo the last operation in the document.
     * @returns {boolean} `true` if the undo operation was successful, or `false` if it failed.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const success = fDocument.undo();
     * console.log(success);
     * ```
     */
    undo(): boolean {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.syncExecuteCommand(UndoCommand.id);
    }

    /**
     * Redo the last undone operation in the document.
     * @returns {boolean} `true` if the redo operation was successful, or `false` if it failed.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * const success = fDocument.redo();
     * console.log(success);
     * ```
     */
    redo(): boolean {
        this._univerInstanceService.focusUnit(this.id);
        return this._commandService.syncExecuteCommand(RedoCommand.id);
    }

    /**
     * Ensure the page header segment exists and return its segment id.
     * @param {number} pageIndex The zero-based page index. Defaults to the first page.
     * @returns {string} The header segment id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const headerSegmentId = fDocument.ensurePageHeader();
     * fDocument.insertText(0, 'Header text', headerSegmentId);
     * ```
     */
    ensurePageHeader(pageIndex: number = 0): string {
        return this._ensureHeaderFooter('header', pageIndex);
    }

    /**
     * Ensure the page footer segment exists and return its segment id.
     * @param {number} pageIndex The zero-based page index. Defaults to the first page.
     * @returns {string} The footer segment id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const footerSegmentId = fDocument.ensurePageFooter();
     * fDocument.insertText(0, 'Footer text', footerSegmentId);
     * ```
     */
    ensurePageFooter(pageIndex: number = 0): string {
        return this._ensureHeaderFooter('footer', pageIndex);
    }

    /**
     * Insert plain text at a document body offset.
     * @param {number} index The zero-based insertion offset.
     * @param {string} text The plain text to insert.
     * @param {string} segmentId The segment id of the body. Defaults to an empty string for the main body.
     * @returns {boolean} `true` if the edit was applied.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * fDocument.insertText(0, 'Hello ');
     *
     * const headerSegmentId = fDocument.ensurePageHeader();
     * fDocument.insertText(0, 'Header text', headerSegmentId);
     * ```
     */
    insertText(index: number, text: string, segmentId: string = ''): boolean {
        return replaceBodyRange(
            {
                startOffset: index,
                endOffset: index,
                segmentId,
            },
            buildPlainTextInsertBody(text),
            this._documentDataModel,
            this._commandService
        );
    }

    /**
     * Returns document-level header/footer switches and margins. Margin values use 96-DPI layout pixels.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getHeaderFooterOptions());
     * ```
     */
    getHeaderFooterOptions(): IHeaderFooterProps {
        const style = this._documentDataModel.getSnapshot().documentStyle;
        return {
            marginHeader: style.marginHeader,
            marginFooter: style.marginFooter,
            useFirstPageHeaderFooter: style.useFirstPageHeaderFooter,
            evenAndOddHeaders: style.evenAndOddHeaders,
        };
    }

    /**
     * Updates document-level header/footer switches and margins.
     *
     * Traditional and Unspecified documents keep the legacy header/footer
     * behavior. Modern documents reject this API. `marginHeader` and
     * `marginFooter` use 96-DPI layout pixels.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (
     *   fDocument &&
     *   fDocument.getDocumentFlavor() !== univerAPI.Enum.DocumentFlavor.MODERN
     * ) {
     *   fDocument.setHeaderFooterOptions({ marginHeader: 36, marginFooter: 36 });
     * }
     * ```
     */
    setHeaderFooterOptions(options: IHeaderFooterProps): boolean {
        if (this.isModern()) {
            throw new Error('The document is a modern document, header/footer is not supported.');
        }
        return this._commandService.syncExecuteCommand(CreateHeaderFooterCommand.id, {
            unitId: this.getId(),
            headerFooterProps: options,
        });
    }

    /**
     * Creates a facade for reading and styling a document text range.
     * The end offset is exclusive, and offsets are scoped to the selected body segment.
     * @param {number} startOffset The inclusive start offset.
     * @param {number} endOffset The exclusive end offset.
     * @param {string} segmentId The header/footer segment id, or an empty string for the main body.
     * @returns {FDocumentTextRange} A fixed text-range facade.
     * @example
     * ```ts
     * const range = univerAPI.getActiveDocument()?.getTextRange(0, 5);
     * console.log(range?.describe());
     * range?.setTextStyle({ bl: 1 });
     * ```
     */
    getTextRange(startOffset: number, endOffset: number, segmentId: string = ''): FDocumentTextRange {
        return this._injector.createInstance(FDocumentTextRange, this, startOffset, endOffset, segmentId, this._injector);
    }

    /**
     * Returns traditional document sections backed by persisted SectionBreak ids.
     * Modern documents use ColumnGroup instead and return an empty array from this read API.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const sections = fDocument?.getSections() ?? [];
     * console.log(sections.map((section) => section.describe()));
     * ```
     */
    getSections(): FDocumentSection[] {
        if (this._documentDataModel.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL) {
            return [];
        }
        return getTopLevelSectionBreaks(this.getBody()).map((sectionBreak) =>
            this._injector.createInstance(FDocumentSection, this, sectionBreak.sectionId));
    }

    /**
     * Returns a traditional section by zero-based index, or `null` in modern documents.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const firstSection = fDocument?.getSection(0);
     * console.log(firstSection?.describe());
     * ```
     */
    getSection(index: number): FDocumentSection | null {
        return this.getSections()[index] ?? null;
    }

    /**
     * Returns the traditional section containing a data-stream offset, or `null` in modern documents.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument?.findParagraphByText('Launch');
     * const offset = paragraph?.getInfo().startOffset;
     * const section = offset == null ? null : fDocument?.getSectionAt(offset);
     * console.log(section?.getId());
     * ```
     */
    getSectionAt(offset: number): FDocumentSection | null {
        return this.getSections().find((section) => {
            const range = section.getRange();
            return offset >= range.startOffset && offset < range.endOffset;
        }) ?? null;
    }

    /**
     * Inserts a traditional document section break and returns its stable facade.
     *
     * `options` configures the section created before the inserted break.
     * Set `options.nextSectionType` to control how the existing section after the
     * break begins. For example, use `SectionType.NEXT_PAGE` to start a chapter on
     * a new physical page. Both changes are executed by one command and are
     * undone or redone together.
     *
     * The offset must be a top-level document position. To insert a break before
     * a table or block such as a callout, use that object's start offset instead
     * of an offset inside the object.
     *
     * Modern documents must use ColumnGroup. Unspecified documents must resolve
     * their flavor first. Both throw `DocsSectionUnsupportedDocumentFlavorError`.
     * Numeric layout values in `options` are in 96-DPI layout pixels.
     *
     * @param {number} offset Top-level data-stream offset where the section break is inserted.
     * @param {IFDocumentInsertSectionBreakOptions} [options] Section properties and the optional type of the following section.
     * @returns {FDocumentSection | null} The section created before the break, or `null` when the command rejects the insertion.
     * @example
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * if (!document) {
     *   throw new Error('No active document');
     * }
     * if (!document.isTraditional()) {
     *   throw new Error('Traditional document sections are required');
     * }
     *
     * const chapter = document.findParagraphByText('Chapter 2');
     * if (!chapter) {
     *   throw new Error('Chapter heading not found');
     * }
     *
     * // Insert the boundary immediately before the chapter heading. The command
     * // also marks the following section as NEXT_PAGE, so the two model changes
     * // share one undo/redo step.
     * const sectionBeforeChapter = document.insertSectionBreak(
     *   chapter.getInfo().startOffset,
     *   { nextSectionType: univerAPI.Enum.SectionType.NEXT_PAGE }
     * );
     * if (!sectionBeforeChapter) {
     *   throw new Error('The chapter heading is not at a valid top-level offset');
     * }
     *
     * console.log({
     *   insertedSection: sectionBeforeChapter.describe(),
     *   chapterSection: document.getSectionAt(chapter.getInfo().startOffset)?.describe(),
     * });
     * ```
     */
    insertSectionBreak(offset: number, options: IFDocumentInsertSectionBreakOptions = {}): FDocumentSection | null {
        if (this._documentDataModel.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL) {
            throw new DocsSectionUnsupportedDocumentFlavorError();
        }
        const { nextSectionType, ...config } = options;
        const sectionId = createSectionId(new Set((this.getBody().sectionBreaks ?? []).map((section) => section.sectionId)));
        const success = this._commandService.syncExecuteCommand(InsertDocumentSectionBreakCommand.id, {
            unitId: this.getId(),
            offset,
            sectionId,
            config,
            nextSectionType,
        });
        return success ? this._injector.createInstance(FDocumentSection, this, sectionId) : null;
    }

    /**
     * Inserts a column-break token in a traditional document.
     * In a single-column section, the traditional renderer advances to the next physical page.
     * Modern documents must use ColumnGroup. Unspecified documents must resolve
     * their flavor first. Both throw `DocsSectionUnsupportedDocumentFlavorError`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   const paragraph = fDocument.findParagraphByText('Continue in next column');
     *   const offset = paragraph?.getInfo().startOffset;
     *   if (offset != null) {
     *     fDocument.insertColumnBreak(offset);
     *   }
     * }
     * ```
     */
    insertColumnBreak(offset: number): boolean {
        if (this._documentDataModel.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL) {
            throw new DocsSectionUnsupportedDocumentFlavorError();
        }
        return this._commandService.syncExecuteCommand(InsertDocumentColumnBreakCommand.id, {
            unitId: this.getId(),
            offset,
        });
    }

    /**
     * Inserts a horizontal rule using the existing paragraph `borderBottom` mechanism.
     * The returned paragraph can be inspected or removed with normal paragraph APIs.
     * Border width and padding are in points (pt).
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument?.findParagraphByText('Summary');
     * const offset = paragraph?.getInfo().startOffset;
     * const rule = offset == null ? null : fDocument?.insertHorizontalRule(offset);
     * console.log(rule?.getId());
     * ```
     */
    insertHorizontalRule(
        offset: number,
        border: IParagraphBorder = {
            padding: 5,
            color: { rgb: '#CDD0D8' },
            width: 1,
            dashStyle: DashStyleType.SOLID,
        },
        segmentId: string = ''
    ): FDocumentParagraph | null {
        const body = this.getBody(segmentId);
        const paragraphs = generateParagraphs(
            DataStreamTreeTokenType.PARAGRAPH,
            undefined,
            border,
            body.paragraphs?.map((paragraph) => paragraph.paragraphId)
        );
        const paragraphId = paragraphs[0].paragraphId;
        const success = replaceBodyRange(
            { startOffset: offset, endOffset: offset, segmentId },
            {
                dataStream: DataStreamTreeTokenType.PARAGRAPH,
                paragraphs,
            },
            this._documentDataModel,
            this._commandService
        );

        return success ? this.getParagraph(paragraphId, segmentId) : null;
    }

    /**
     * Get all paragraphs in the document body or header/footer body by the segment id.
     * @param {string} segmentId The segment id of the body. Defaults to an empty string for the main body.
     * @returns {FDocumentParagraph[]} An array of paragraph facade instances.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraphs = fDocument.getParagraphs();
     * console.log(paragraphs);
     *
     * const headerSegmentId = fDocument.ensurePageHeader();
     * const headerParagraphs = fDocument.getParagraphs(headerSegmentId);
     * console.log(headerParagraphs);
     * ```
     */
    getParagraphs(segmentId: string = ''): FDocumentParagraph[] {
        const { paragraphs = [] } = this.getBody(segmentId);
        return paragraphs.map((paragraph) => this._createFDocumentParagraph(paragraph.paragraphId, segmentId));
    }

    /**
     * Get a paragraph by its paragraph id and segment id.
     * @param {string} paragraphId The paragraph id.
     * @param {string} segmentId The segment id of the body. Defaults to an empty string for the main body.
     * @returns {FDocumentParagraph | null} The paragraph facade instance, or `null` if the paragraph is not found.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.getParagraph('paragraph-01');
     * console.log(paragraph);
     *
     * const headerSegmentId = fDocument.ensurePageHeader();
     * const headerParagraph = fDocument.getParagraph('header-paragraph-01', headerSegmentId);
     * console.log(headerParagraph);
     * ```
     */
    getParagraph(paragraphId: string, segmentId: string = ''): FDocumentParagraph | null {
        const { paragraphs = [] } = this.getBody(segmentId);
        const paragraph = paragraphs.find((paragraph) => paragraph.paragraphId === paragraphId);
        if (!paragraph) {
            return null;
        }
        return this._createFDocumentParagraph(paragraphId, segmentId);
    }

    /**
     * Find a paragraph by its text content and segment id.
     * @param {string} text The text content to search for.
     * @param {string} segmentId The segment id of the body. Defaults to an empty string for the main body.
     * @returns {FDocumentParagraph | null} The paragraph facade instance, or `null` if the paragraph is not found.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.findParagraphByText('Hello');
     * console.log(paragraph);
     *
     * const footerSegmentId = fDocument.ensurePageFooter();
     * const footerParagraph = fDocument.findParagraphByText('Page', footerSegmentId);
     * console.log(footerParagraph);
     * ```
     */
    findParagraphByText(text: string, segmentId: string = ''): FDocumentParagraph | null {
        return this.findParagraphs({ text, segmentId })[0] || null;
    }

    /**
     * Find paragraphs by a query object, which can include text content, paragraph id, and segment id.
     * @param {string | IFDocumentParagraphQuery} query The query object or text content to search for.
     * @returns {FDocumentParagraph[]} An array of paragraph facade instances that match the query.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraphsWithText = fDocument.findParagraphs('Hello');
     * console.log(paragraphsWithText);
     *
     * const paragraphsWithId = fDocument.findParagraphs({ paragraphId: 'paragraph-01' });
     * console.log(paragraphsWithId);
     *
     * const headerSegmentId = fDocument.ensurePageHeader();
     * const paragraphsWithSegment = fDocument.findParagraphs({ segmentId: headerSegmentId });
     * console.log(paragraphsWithSegment);
     * ```
     */
    findParagraphs(query: string | IFDocumentParagraphQuery): FDocumentParagraph[] {
        const normalized = typeof query === 'string' ? { text: query } : query;
        const { text, paragraphId, segmentId = '' } = normalized;

        return this.getParagraphs(segmentId).filter((paragraph) => {
            if (paragraphId && paragraph.getId() !== paragraphId) {
                return false;
            }

            if (text && !paragraph.getText().includes(text)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Insert a plain-text paragraph before the paragraph at the given paragraph index.
     * @param {number} index The zero-based paragraph insertion index.
     * @param {string} text The paragraph text. Defaults to an empty paragraph.
     * @param {string} segmentId The segment id of the body. Defaults to an empty string for the main body.
     * @returns {FDocumentParagraph} The inserted paragraph facade instance.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.insertParagraph(0, 'Document title');
     * paragraph.appendText(' suffix');
     *
     * const headerSegmentId = fDocument.ensurePageHeader();
     * const headerParagraph = fDocument.insertParagraph(0, 'Header title', headerSegmentId);
     * headerParagraph.appendText(' suffix');
     * ```
     */
    insertParagraph(index: number, text: string = '', segmentId: string = ''): FDocumentParagraph {
        const offset = this._getParagraphInsertOffset(index, segmentId);
        const result = replaceBodyRange(
            {
                startOffset: offset,
                endOffset: offset,
                segmentId,
            },
            buildPlainTextInsertBody(`${text}\r`),
            this._documentDataModel,
            this._commandService
        );

        if (!result) {
            throw new Error('Failed to insert paragraph.');
        }

        const { paragraphs = [] } = this.getBody(segmentId);
        const paragraph = paragraphs[index];
        if (!paragraph) {
            throw new Error('Failed to insert paragraph.');
        }

        return this._createFDocumentParagraph(paragraph.paragraphId, segmentId);
    }

    /**
     * Append a plain-text paragraph at the end of the body.
     * @param {string} text The paragraph text. Defaults to an empty paragraph.
     * @param {string} segmentId The segment id of the body. Defaults to an empty string for the main body.
     * @returns {FDocumentParagraph} The appended paragraph wrapper.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const paragraph = fDocument.appendParagraph('Summary');
     * console.log(paragraph.getText());
     *
     * const footerSegmentId = fDocument.ensurePageFooter();
     * const footerParagraph = fDocument.appendParagraph('Confidential', footerSegmentId);
     * console.log(footerParagraph.getText());
     * ```
     */
    appendParagraph(text: string = '', segmentId: string = ''): FDocumentParagraph {
        const { paragraphs = [] } = this.getBody(segmentId);
        return this.insertParagraph(paragraphs.length, text, segmentId);
    }

    /**
     * Delete a range from the body.
     * @param {IFDocumentTextRange} range The text range to delete.
     * @returns {boolean} `true` if the range was deleted.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * fDocument.deleteRange({ startOffset: 0, endOffset: 5 });
     *
     * const headerSegmentId = fDocument.ensurePageHeader();
     * fDocument.deleteRange({ startOffset: 0, endOffset: 5, segmentId: headerSegmentId });
     * ```
     */
    deleteRange(range: IFDocumentTextRange): boolean {
        const normalizedRange = this._normalizeDeleteRange(range);
        if (normalizedRange.startOffset >= normalizedRange.endOffset) {
            return false;
        }

        return replaceBodyRange(
            normalizedRange,
            {
                dataStream: '',
            },
            this._documentDataModel,
            this._commandService
        );
    }

    private _createFDocumentParagraph(paragraphId: string, segmentId: string = ''): FDocumentParagraph {
        return this._injector.createInstance(
            FDocumentParagraph,
            this,
            paragraphId,
            segmentId,
            this._injector
        );
    }

    private _normalizeDeleteRange(range: IFDocumentTextRange): IFDocumentTextRange {
        const body = this.getBody(range.segmentId);
        const protectedEndOffset = body.dataStream.endsWith('\r\n')
            ? Math.max(0, body.dataStream.length - 2)
            : body.dataStream.length;
        const endOffset = Math.min(Math.max(range.endOffset, 0), protectedEndOffset);

        return {
            ...range,
            startOffset: Math.min(Math.max(range.startOffset, 0), endOffset),
            endOffset,
        };
    }

    private _getParagraphInsertOffset(index: number, segmentId: string = ''): number {
        if (index <= 0) {
            return 0;
        }

        const body = this.getBody(segmentId);
        const { dataStream, paragraphs = [] } = body;

        if (paragraphs.length === 0) {
            return Math.max(0, dataStream.length - 1);
        }

        if (index >= paragraphs.length) {
            return paragraphs[paragraphs.length - 1].startIndex + 1;
        }

        return getParagraphContentStartOffset(body, paragraphs[index]);
    }

    private _ensureHeaderFooter(kind: SectionHeaderFooterKind, pageIndex: number): string {
        if (this.isModern()) {
            throw new Error('The document is a modern document, header/footer is not supported.');
        }

        const { createType, segmentId: existingSegmentId } = this._getHeaderFooterCreateInfo(kind, pageIndex);
        if (existingSegmentId) {
            return existingSegmentId;
        }

        const segmentId = generateRandomId(6);
        const result = this._commandService.syncExecuteCommand(CreateHeaderFooterCommand.id, {
            unitId: this.getId(),
            segmentId,
            createType,
        });

        if (!result) {
            throw new Error(`Failed to create page ${kind}.`);
        }

        return segmentId;
    }

    private _getHeaderFooterCreateInfo(kind: SectionHeaderFooterKind, pageIndex: number): {
        createType: HeaderFooterType;
        segmentId: string;
    } {
        const { documentStyle } = this._documentDataModel.getSnapshot();
        const isFirstPage = pageIndex === 0;
        const isEvenPage = (pageIndex + 1) % 2 === 0;

        if (isFirstPage && documentStyle.useFirstPageHeaderFooter === BooleanNumber.TRUE) {
            return kind === 'header'
                ? {
                    createType: HeaderFooterType.FIRST_PAGE_HEADER,
                    segmentId: documentStyle.firstPageHeaderId ?? '',
                }
                : {
                    createType: HeaderFooterType.FIRST_PAGE_FOOTER,
                    segmentId: documentStyle.firstPageFooterId ?? '',
                };
        }

        if (isEvenPage && documentStyle.evenAndOddHeaders === BooleanNumber.TRUE) {
            return kind === 'header'
                ? {
                    createType: HeaderFooterType.EVEN_PAGE_HEADER,
                    segmentId: documentStyle.evenPageHeaderId ?? '',
                }
                : {
                    createType: HeaderFooterType.EVEN_PAGE_FOOTER,
                    segmentId: documentStyle.evenPageFooterId ?? '',
                };
        }

        return kind === 'header'
            ? {
                createType: HeaderFooterType.DEFAULT_HEADER,
                segmentId: documentStyle.defaultHeaderId ?? '',
            }
            : {
                createType: HeaderFooterType.DEFAULT_FOOTER,
                segmentId: documentStyle.defaultFooterId ?? '',
            };
    }
}
