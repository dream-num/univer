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

import type { IResolvedSectionHeaderFooterReference, ISectionBreak, ISectionColumnProperties, SectionHeaderFooterKind, SectionHeaderFooterVariant } from '@univerjs/core';
import type { IEffectiveSectionPageSetup, IHeaderFooterProps } from '@univerjs/docs';
import type { FDocument } from './f-document';
import type { IFDocumentTextRange } from './utils';
import { ColumnSeparatorType, DocumentFlavor, generateRandomId, getSectionHeaderFooterReferenceKey, ICommandService, PageOrientType, resolveSectionHeaderFooterReference, SectionType, Tools } from '@univerjs/core';
import { CreateHeaderFooterCommand, createSectionColumnProperties, DeleteDocumentSectionBreakCommand, getEffectiveSectionPageSetup, getSectionContentWidth, getTopLevelSectionBreaks, HeaderFooterType, SetSectionHeaderFooterLinkCommand, UpdateDocumentSectionCommand } from '@univerjs/docs';

export interface IFDocumentSectionColumnOptions {
    /** Gap after each column except the last, in 96-DPI layout pixels. */
    gap?: number;
    /** Optional explicit column widths in 96-DPI layout pixels. Length must equal `columnCount`. */
    widths?: number[];
    /** Whether to draw separators, or the exact separator enum value. */
    separator?: boolean | ColumnSeparatorType;
}

export type FDocumentSectionPageSetup = Pick<
    ISectionBreak,
    'pageNumberStart' | 'pageSize' | 'pageOrient' | 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight'
>;

export interface IFDocumentSectionDescription {
    sectionId: string;
    index: number;
    range: IFDocumentTextRange;
    columnCount: number;
    columns: ISectionColumnProperties[];
    columnSeparatorType: ColumnSeparatorType;
    sectionType: SectionType;
    headerFooter: Record<`${SectionHeaderFooterVariant}${Capitalize<SectionHeaderFooterKind>}`, {
        segmentId: string | null;
        linkedToPrevious: boolean;
    }>;
    config: ISectionBreak;
}

function validatePageSetup(pageSetup: FDocumentSectionPageSetup): void {
    const { pageNumberStart, pageSize, pageOrient, marginTop, marginBottom, marginLeft, marginRight } = pageSetup;
    if (pageNumberStart != null && (!Number.isInteger(pageNumberStart) || pageNumberStart < 1)) {
        throw new RangeError('Section page number start must be a positive integer.');
    }
    if (pageSize && [pageSize.width, pageSize.height]
        .some((size) => size != null && (!Number.isFinite(size) || size <= 0))) {
        throw new RangeError('Section page size must be finite and positive.');
    }
    if (pageOrient != null && !Object.values(PageOrientType).includes(pageOrient)) {
        throw new RangeError('Invalid section page orientation.');
    }
    if ([marginTop, marginBottom, marginLeft, marginRight]
        .some((margin) => margin != null && (!Number.isFinite(margin) || margin < 0))) {
        throw new RangeError('Section page margins must be finite and non-negative.');
    }
}

/** Error thrown when a Traditional-only section API is used with another document flavor. */
export class DocsSectionUnsupportedDocumentFlavorError extends Error {
    constructor() {
        super('Section column APIs are supported only in traditional documents. Use ColumnGroup APIs for modern documents, or resolve an unspecified document flavor first.');
        this.name = 'DocsSectionUnsupportedDocumentFlavorError';
    }
}

/**
 * Facade wrapper for an OOXML-compatible traditional document section.
 * Modern documents use ColumnGroup APIs. Unspecified documents must resolve
 * their flavor before using this facade.
 * @example
 * ```ts
 * const fDocument = univerAPI.getActiveDocument();
 * if (fDocument?.isTraditional()) {
 *   console.log(fDocument.getSection(0)?.describe());
 * }
 * ```
 */
export class FDocumentSection {
    constructor(
        private readonly _document: FDocument,
        private readonly _sectionId: string,
        @ICommandService private readonly _commandService: ICommandService
    ) {}

    /**
     * Returns the persisted section id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.getId());
     * ```
     */
    getId(): string {
        return this._sectionId;
    }

    /**
     * Returns the current zero-based section index.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.getIndex());
     * ```
     */
    getIndex(): number {
        return this._resolve().index;
    }

    /**
     * Returns the section break snapshot that terminates this section.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.getConfig());
     * ```
     */
    getConfig(): ISectionBreak {
        return this._getConfigSnapshot();
    }

    /**
     * Returns the section content range, excluding its terminating section-break token.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.getRange());
     * ```
     */
    getRange(): IFDocumentTextRange {
        return this._getRange(this._resolve().index);
    }

    /**
     * Returns the explicit columns. An empty array means the normal single-column layout.
     * Column widths and trailing spaces are in 96-DPI layout pixels.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.getColumns());
     * ```
     */
    getColumns(): ISectionColumnProperties[] {
        return Tools.deepClone(this._getConfigSnapshot().columnProperties ?? []);
    }

    /**
     * Returns a compact serializable section summary.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.describe());
     * ```
     */
    describe(): IFDocumentSectionDescription {
        const { index } = this._resolve();
        const config = this._getConfigSnapshot();
        const columns = config.columnProperties ?? [];
        const headerFooter = {
            defaultHeader: this._describeHeaderFooterReference('header', 'default'),
            defaultFooter: this._describeHeaderFooterReference('footer', 'default'),
            firstHeader: this._describeHeaderFooterReference('header', 'first'),
            firstFooter: this._describeHeaderFooterReference('footer', 'first'),
            evenHeader: this._describeHeaderFooterReference('header', 'even'),
            evenFooter: this._describeHeaderFooterReference('footer', 'even'),
        };
        return {
            sectionId: this._sectionId,
            index,
            range: this._getRange(index),
            columnCount: columns.length || 1,
            columns: Tools.deepClone(columns),
            columnSeparatorType: config.columnSeparatorType ?? ColumnSeparatorType.NONE,
            sectionType: config.sectionType ?? SectionType.SECTION_TYPE_UNSPECIFIED,
            headerFooter,
            config,
        };
    }

    /**
     * Sets equal or explicitly sized columns for this traditional section.
     * Use `columnCount = 1` to restore normal single-column layout.
     * `gap` and `widths` are in 96-DPI layout pixels.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   fDocument.getSection(0)?.setColumns(2, { gap: 18, separator: true });
     * }
     * ```
     */
    setColumns(columnCount: number, options: IFDocumentSectionColumnOptions = {}): boolean {
        this._assertTraditionalDocument();
        if (!Number.isInteger(columnCount) || columnCount < 1) {
            throw new RangeError('Section column count must be a positive integer.');
        }
        if (options.widths && options.widths.length !== columnCount) {
            throw new RangeError('Section column widths must match the column count.');
        }
        if (options.gap != null && (!Number.isFinite(options.gap) || options.gap < 0)) {
            throw new RangeError('Section column gap must be finite and non-negative.');
        }

        const gap = Math.max(0, options.gap ?? 18);
        const config = this._getConfigSnapshot();
        const columns = createSectionColumnProperties(
            this._document.getDocumentDataModel().getSnapshot().documentStyle,
            config,
            columnCount,
            gap,
            options.widths
        );
        const separator = typeof options.separator === 'boolean'
            ? options.separator ? ColumnSeparatorType.BETWEEN_EACH_COLUMN : ColumnSeparatorType.NONE
            : options.separator ?? ColumnSeparatorType.NONE;
        if (!Object.values(ColumnSeparatorType).includes(separator)) {
            throw new RangeError('Invalid section column separator type.');
        }

        return this._update({
            columnProperties: columns,
            columnSeparatorType: separator,
        });
    }

    /**
     * Sets explicit OOXML-compatible column width and trailing-space values in 96-DPI layout pixels.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   fDocument.getSection(0)?.setColumnProperties([
     *     { width: 240, paddingEnd: 18 },
     *     { width: 240, paddingEnd: 0 },
     *   ], univerAPI.Enum.ColumnSeparatorType.BETWEEN_EACH_COLUMN);
     * }
     * ```
     */
    setColumnProperties(columns: ISectionColumnProperties[], separator = ColumnSeparatorType.NONE): boolean {
        this._assertTraditionalDocument();
        if (!Object.values(ColumnSeparatorType).includes(separator)) {
            throw new RangeError('Invalid section column separator type.');
        }
        if (columns.some(({ width, paddingEnd }) => !Number.isFinite(width) || !Number.isFinite(paddingEnd) || width < 0 || paddingEnd < 0)) {
            throw new RangeError('Section column widths and padding must be finite and non-negative.');
        }
        const contentWidth = getSectionContentWidth(
            this._document.getDocumentDataModel().getSnapshot().documentStyle,
            this._getConfigSnapshot()
        );
        if (columns.reduce((sum, { width, paddingEnd }) => sum + width + paddingEnd, 0) > contentWidth) {
            throw new RangeError('Section columns exceed the available page content width.');
        }
        return this._update({
            columnProperties: Tools.deepClone(columns),
            columnSeparatorType: separator,
        });
    }

    /**
     * Sets how this section begins relative to the previous section.
     *
     * The first section has no preceding boundary, so setting its type does not
     * create an initial blank page. Prefer `FDocument.insertSectionBreak` with
     * `nextSectionType` when creating a new boundary; use this method when
     * updating an existing section after resolving it again from the document.
     *
     * @param {SectionType} sectionType How this section begins.
     * @returns {boolean} `true` when the section command was applied.
     * @example
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * if (!document?.isTraditional()) {
     *   throw new Error('A Traditional document is required');
     * }
     *
     * const secondSection = document.getSection(1);
     * if (!secondSection) {
     *   throw new Error('The second section does not exist');
     * }
     * if (!secondSection.setSectionType(univerAPI.Enum.SectionType.NEXT_PAGE)) {
     *   throw new Error('Failed to update the second section');
     * }
     * ```
     */
    setSectionType(sectionType: SectionType): boolean {
        this._assertTraditionalDocument();
        if (!Object.values(SectionType).includes(sectionType)) {
            throw new RangeError('Invalid section type.');
        }
        return this._update({ sectionType });
    }

    /**
     * Returns this section's explicit page setup overrides.
     * Missing values inherit from the document style. Geometry values use 96-DPI layout pixels.
     *
     * Use `getEffectivePageSetup()` when an agent needs resolved page and content
     * dimensions rather than only the overrides stored on this section.
     *
     * @returns {FDocumentSectionPageSetup} A cloned object containing only explicit section overrides.
     * @example
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * const section = document?.getSection(0);
     * console.log(section?.getPageSetup());
     * ```
     */
    getPageSetup(): FDocumentSectionPageSetup {
        const {
            pageNumberStart,
            pageSize,
            pageOrient,
            marginTop,
            marginBottom,
            marginLeft,
            marginRight,
        } = this._getConfigSnapshot();
        return Tools.deepClone({
            pageNumberStart,
            pageSize,
            pageOrient,
            marginTop,
            marginBottom,
            marginLeft,
            marginRight,
        });
    }

    /**
     * Returns nominal page geometry after resolving this section's overrides
     * against document defaults. All geometry values use 96-DPI layout pixels.
     *
     * This synchronous model-only API works without `engine-render`. It does not
     * report physical page count, remaining page space, or final coordinates.
     *
     * @returns {IEffectiveSectionPageSetup} A cloned, serializable page setup.
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
     * const section = document.getSection(0);
     * if (!section) {
     *   throw new Error('The document has no traditional section');
     * }
     *
     * const layout = section.getEffectivePageSetup();
     * console.log({
     *   pageWidth: layout.pageSize.width,
     *   pageHeight: layout.pageSize.height,
     *   contentWidth: layout.contentSize.width,
     *   contentHeight: layout.contentSize.height,
     *   margins: layout.margins,
     * });
     * ```
     */
    getEffectivePageSetup(): IEffectiveSectionPageSetup {
        this._assertTraditionalDocument();
        const documentStyle = this._document.getDocumentDataModel().getSnapshot().documentStyle;
        return Tools.deepClone(getEffectiveSectionPageSetup(documentStyle, this._getConfigSnapshot()));
    }

    /**
     * Updates this section's page setup through the document section command.
     * Geometry values use 96-DPI layout pixels.
     *
     * This method changes static page geometry; it does not choose where the
     * section begins. Use `setSectionType()` for an existing boundary, or
     * `insertSectionBreak(..., { nextSectionType })` while creating one.
     *
     * @param {FDocumentSectionPageSetup} pageSetup Explicit section overrides to patch.
     * @returns {boolean} `true` when the section command was applied.
     * @example
     * ```ts
     * const document = univerAPI.getActiveDocument();
     * if (!document?.isTraditional()) {
     *   throw new Error('A Traditional document is required');
     * }
     *
     * const section = document.getSection(1);
     * if (!section) {
     *   throw new Error('The second section does not exist');
     * }
     * const updated = section.setPageSetup({
     *   pageSize: { width: 816, height: 1056 },
     *   marginTop: 96,
     *   marginBottom: 96,
     *   marginLeft: 96,
     *   marginRight: 96,
     * });
     * if (!updated) {
     *   throw new Error('Failed to update section page setup');
     * }
     * console.log(section.getEffectivePageSetup());
     * ```
     */
    setPageSetup(pageSetup: FDocumentSectionPageSetup): boolean {
        this._assertTraditionalDocument();
        validatePageSetup(pageSetup);
        const definedPageSetup = Tools.deepClone(pageSetup);
        Tools.removeNull(definedPageSetup);
        const documentStyle = this._document.getDocumentDataModel().getSnapshot().documentStyle;
        getEffectiveSectionPageSetup(documentStyle, {
            ...this._getConfigSnapshot(),
            ...definedPageSetup,
        });
        return this._update(definedPageSetup);
    }

    /**
     * Ensures a header segment linked specifically to this section.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   const segmentId = fDocument.getSection(0)?.ensureHeader();
     *   if (segmentId) {
     *     fDocument.insertText(0, 'Quarterly report', segmentId);
     *   }
     * }
     * ```
     */
    ensureHeader(variant: SectionHeaderFooterVariant = 'default'): string {
        return this._ensureHeaderFooter('header', variant);
    }

    /**
     * Ensures a footer segment linked specifically to this section.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   const segmentId = fDocument.getSection(0)?.ensureFooter('first');
     *   if (segmentId) {
     *     fDocument.insertText(0, 'Confidential', segmentId);
     *   }
     * }
     * ```
     */
    ensureFooter(variant: SectionHeaderFooterVariant = 'default'): string {
        return this._ensureHeaderFooter('footer', variant);
    }

    /**
     * Returns the effective header id after resolving links to previous sections.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.getHeaderId('default'));
     * ```
     */
    getHeaderId(variant: SectionHeaderFooterVariant = 'default'): string | null {
        return this._getHeaderFooterReference('header', variant).segmentId ?? null;
    }

    /**
     * Returns the effective footer id after resolving links to previous sections.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.getFooterId('first'));
     * ```
     */
    getFooterId(variant: SectionHeaderFooterVariant = 'default'): string | null {
        return this._getHeaderFooterReference('footer', variant).segmentId ?? null;
    }

    /**
     * Whether this header variant inherits the previous section's reference.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(1)?.isHeaderLinkedToPrevious());
     * ```
     */
    isHeaderLinkedToPrevious(variant: SectionHeaderFooterVariant = 'default'): boolean {
        return this._getHeaderFooterReference('header', variant).linkedToPrevious;
    }

    /**
     * Whether this footer variant inherits the previous section's reference.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(1)?.isFooterLinkedToPrevious('even'));
     * ```
     */
    isFooterLinkedToPrevious(variant: SectionHeaderFooterVariant = 'default'): boolean {
        return this._getHeaderFooterReference('footer', variant).linkedToPrevious;
    }

    /**
     * Links or unlinks this header variant. Unlinking clones the inherited header.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   fDocument.getSection(1)?.setHeaderLinkedToPrevious(false, 'default');
     * }
     * ```
     */
    setHeaderLinkedToPrevious(linkedToPrevious: boolean, variant: SectionHeaderFooterVariant = 'default'): boolean {
        return this._setHeaderFooterLinkedToPrevious('header', variant, linkedToPrevious);
    }

    /**
     * Links or unlinks this footer variant. Unlinking clones the inherited footer.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   fDocument.getSection(1)?.setFooterLinkedToPrevious(true, 'even');
     * }
     * ```
     */
    setFooterLinkedToPrevious(linkedToPrevious: boolean, variant: SectionHeaderFooterVariant = 'default'): boolean {
        return this._setHeaderFooterLinkedToPrevious('footer', variant, linkedToPrevious);
    }

    /**
     * Updates header/footer switches and margins on this section break.
     * `marginHeader` and `marginFooter` are in 96-DPI layout pixels.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   fDocument.getSection(0)?.setHeaderFooterOptions({
     *     marginHeader: 36,
     *     marginFooter: 36,
     *     useFirstPageHeaderFooter: univerAPI.Enum.BooleanNumber.TRUE,
     *   });
     * }
     * ```
     */
    setHeaderFooterOptions(options: IHeaderFooterProps): boolean {
        this._assertTraditionalDocument();
        return this._update(options);
    }

    /**
     * Deletes this section break. The final top-level section break cannot be removed.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument?.isTraditional()) {
     *   const sections = fDocument.getSections();
     *   if (sections.length > 1) {
     *     sections[0].remove();
     *   }
     * }
     * ```
     */
    remove(): boolean {
        this._assertTraditionalDocument();
        return this._commandService.syncExecuteCommand(DeleteDocumentSectionBreakCommand.id, {
            unitId: this._document.getId(),
            sectionId: this._sectionId,
        });
    }

    private _update(patch: Partial<ISectionBreak>): boolean {
        const { sectionId: _sectionId, startIndex: _startIndex, ...config } = patch;
        return this._commandService.syncExecuteCommand(UpdateDocumentSectionCommand.id, {
            unitId: this._document.getId(),
            updates: [{ sectionId: this._sectionId, config }],
        });
    }

    private _ensureHeaderFooter(kind: SectionHeaderFooterKind, variant: SectionHeaderFooterVariant): string {
        this._assertTraditionalDocument();
        const { index } = this._resolve();
        const config = this._getConfigSnapshot();
        const key = getSectionHeaderFooterReferenceKey(kind, variant);
        const existing = config[key];
        if (typeof existing === 'string' && existing) {
            return existing;
        }

        if (index > 0) {
            const segmentId = generateRandomId(6);
            const success = this._commandService.syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
                unitId: this._document.getId(),
                sectionId: this._sectionId,
                kind,
                variant,
                linkedToPrevious: false,
                segmentId,
            });
            if (!success) {
                throw new Error(`Failed to create section ${kind}.`);
            }
            return segmentId;
        }

        const types = {
            default: kind === 'header' ? HeaderFooterType.DEFAULT_HEADER : HeaderFooterType.DEFAULT_FOOTER,
            first: kind === 'header' ? HeaderFooterType.FIRST_PAGE_HEADER : HeaderFooterType.FIRST_PAGE_FOOTER,
            even: kind === 'header' ? HeaderFooterType.EVEN_PAGE_HEADER : HeaderFooterType.EVEN_PAGE_FOOTER,
        };
        const segmentId = generateRandomId(6);
        const success = this._commandService.syncExecuteCommand(CreateHeaderFooterCommand.id, {
            unitId: this._document.getId(),
            segmentId,
            createType: types[variant],
            sectionId: this._sectionId,
        });
        if (!success) {
            throw new Error(`Failed to create section ${kind}.`);
        }
        return segmentId;
    }

    private _getHeaderFooterReference(
        kind: SectionHeaderFooterKind,
        variant: SectionHeaderFooterVariant
    ): IResolvedSectionHeaderFooterReference {
        const { index } = this._resolve();
        const snapshot = this._document.getDocumentDataModel().getSnapshot();
        return resolveSectionHeaderFooterReference(
            snapshot.documentStyle,
            getTopLevelSectionBreaks(this._document.getBody()),
            index,
            getSectionHeaderFooterReferenceKey(kind, variant)
        );
    }

    private _describeHeaderFooterReference(
        kind: SectionHeaderFooterKind,
        variant: SectionHeaderFooterVariant
    ): { segmentId: string | null; linkedToPrevious: boolean } {
        const reference = this._getHeaderFooterReference(kind, variant);
        return {
            segmentId: reference.segmentId ?? null,
            linkedToPrevious: reference.linkedToPrevious,
        };
    }

    private _setHeaderFooterLinkedToPrevious(
        kind: SectionHeaderFooterKind,
        variant: SectionHeaderFooterVariant,
        linkedToPrevious: boolean
    ): boolean {
        this._assertTraditionalDocument();
        return this._commandService.syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
            unitId: this._document.getId(),
            sectionId: this._sectionId,
            kind,
            variant,
            linkedToPrevious,
            ...(linkedToPrevious ? {} : { segmentId: generateRandomId(6) }),
        });
    }

    private _assertTraditionalDocument(): void {
        if (this._document.getDocumentDataModel().getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL) {
            throw new DocsSectionUnsupportedDocumentFlavorError();
        }
    }

    private _getConfigSnapshot(): ISectionBreak {
        return Tools.deepClone(this._resolve().sectionBreak);
    }

    private _getRange(index: number): IFDocumentTextRange {
        const sectionBreaks = getTopLevelSectionBreaks(this._document.getBody());
        return {
            startOffset: index === 0 ? 0 : sectionBreaks[index - 1].startIndex + 1,
            endOffset: sectionBreaks[index].startIndex,
            segmentId: '',
        };
    }

    private _resolve(): { index: number; sectionBreak: ISectionBreak } {
        this._assertTraditionalDocument();
        const sectionBreaks = getTopLevelSectionBreaks(this._document.getBody());
        const index = sectionBreaks.findIndex((section) => section.sectionId === this._sectionId);
        if (index < 0) {
            throw new Error(`Document section with id ${this._sectionId} not found.`);
        }
        return { index, sectionBreak: sectionBreaks[index] };
    }
}
