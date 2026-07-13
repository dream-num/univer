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

import type { Injector, IResolvedSectionHeaderFooterReference, ISectionBreak, ISectionColumnProperties, SectionHeaderFooterKind, SectionHeaderFooterVariant } from '@univerjs/core';
import type { IHeaderFooterProps } from '@univerjs/docs';
import type { FDocument } from './f-document';
import type { IFDocumentTextRange } from './utils';
import { ColumnSeparatorType, DocumentFlavor, generateRandomId, getSectionHeaderFooterReferenceKey, ICommandService, resolveSectionHeaderFooterReference, SectionType, Tools } from '@univerjs/core';
import { CreateHeaderFooterCommand, createSectionColumnProperties, DeleteDocumentSectionBreakCommand, getTopLevelSectionBreaks, HeaderFooterType, SetSectionHeaderFooterLinkCommand, UpdateDocumentSectionCommand } from '@univerjs/docs';

export interface IFDocumentSectionColumnOptions {
    /** Gap after each column except the last, in points (pt). */
    gap?: number;
    /** Optional explicit column widths in points (pt). Length must equal `columnCount`. */
    widths?: number[];
    /** Whether to draw separators, or the exact separator enum value. */
    separator?: boolean | ColumnSeparatorType;
    /** How the following section starts. */
    sectionType?: SectionType;
}

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

/** Error thrown when traditional section APIs are used to mutate a modern document. */
export class DocsSectionUnsupportedDocumentFlavorError extends Error {
    constructor() {
        super('Section column APIs are supported only in traditional documents. Use ColumnGroup APIs for modern documents.');
        this.name = 'DocsSectionUnsupportedDocumentFlavorError';
    }
}

/**
 * Facade wrapper for an OOXML-compatible traditional document section.
 * Modern documents use ColumnGroup APIs and cannot mutate this facade.
 * @example
 * ```ts
 * const fDocument = univerAPI.getActiveDocument();
 * if (fDocument && !fDocument.isModern()) {
 *   console.log(fDocument.getSection(0)?.describe());
 * }
 * ```
 */
export class FDocumentSection {
    constructor(
        private readonly _document: FDocument,
        private readonly _sectionId: string,
        private readonly _injector: Injector
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
        const { sectionBreak } = this._resolve();
        return Tools.deepClone(sectionBreak);
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
        const sectionBreaks = getTopLevelSectionBreaks(this._document.getBody());
        const { index, sectionBreak } = this._resolve();

        return {
            startOffset: index === 0 ? 0 : sectionBreaks[index - 1].startIndex + 1,
            endOffset: sectionBreak.startIndex,
            segmentId: '',
        };
    }

    /**
     * Returns the explicit columns. An empty array means the normal single-column layout.
     * Column widths and trailing spaces are in points (pt).
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument?.getSection(0)?.getColumns());
     * ```
     */
    getColumns(): ISectionColumnProperties[] {
        return Tools.deepClone(this.getConfig().columnProperties ?? []);
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
        const config = this.getConfig();
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
            index: this.getIndex(),
            range: this.getRange(),
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
     * `gap` and `widths` are in points (pt).
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument && !fDocument.isModern()) {
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

        const gap = Math.max(0, options.gap ?? 18);
        const config = this.getConfig();
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

        return this._update({
            columnProperties: columns,
            columnSeparatorType: separator,
            ...(options.sectionType == null ? {} : { sectionType: options.sectionType }),
        });
    }

    /**
     * Sets explicit OOXML-compatible column width and trailing-space values in points (pt).
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument && !fDocument.isModern()) {
     *   fDocument.getSection(0)?.setColumnProperties([
     *     { width: 240, paddingEnd: 18 },
     *     { width: 240, paddingEnd: 0 },
     *   ], univerAPI.Enum.ColumnSeparatorType.BETWEEN_EACH_COLUMN);
     * }
     * ```
     */
    setColumnProperties(columns: ISectionColumnProperties[], separator = ColumnSeparatorType.NONE): boolean {
        this._assertTraditionalDocument();
        if (columns.some(({ width, paddingEnd }) => width < 0 || paddingEnd < 0)) {
            throw new RangeError('Section column widths and padding must be non-negative.');
        }
        return this._update({
            columnProperties: Tools.deepClone(columns),
            columnSeparatorType: separator,
        });
    }

    /**
     * Sets how the next section begins.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument && !fDocument.isModern()) {
     *   fDocument.getSection(0)?.setSectionType(univerAPI.Enum.SectionType.NEXT_PAGE);
     * }
     * ```
     */
    setSectionType(sectionType: SectionType): boolean {
        this._assertTraditionalDocument();
        return this._update({ sectionType });
    }

    /**
     * Ensures a header segment linked specifically to this section.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument && !fDocument.isModern()) {
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
     * if (fDocument && !fDocument.isModern()) {
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
     * if (fDocument && !fDocument.isModern()) {
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
     * if (fDocument && !fDocument.isModern()) {
     *   fDocument.getSection(1)?.setFooterLinkedToPrevious(true, 'even');
     * }
     * ```
     */
    setFooterLinkedToPrevious(linkedToPrevious: boolean, variant: SectionHeaderFooterVariant = 'default'): boolean {
        return this._setHeaderFooterLinkedToPrevious('footer', variant, linkedToPrevious);
    }

    /**
     * Updates header/footer switches and margins on this section break.
     * `marginHeader` and `marginFooter` are in points (pt).
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * if (fDocument && !fDocument.isModern()) {
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
     * if (fDocument && !fDocument.isModern()) {
     *   const sections = fDocument.getSections();
     *   if (sections.length > 1) {
     *     sections[0].remove();
     *   }
     * }
     * ```
     */
    remove(): boolean {
        this._assertTraditionalDocument();
        return this._injector.get(ICommandService).syncExecuteCommand(DeleteDocumentSectionBreakCommand.id, {
            unitId: this._document.getId(),
            sectionId: this._sectionId,
        });
    }

    private _update(patch: Partial<ISectionBreak>): boolean {
        const { sectionId: _sectionId, startIndex: _startIndex, ...config } = patch;
        return this._injector.get(ICommandService).syncExecuteCommand(UpdateDocumentSectionCommand.id, {
            unitId: this._document.getId(),
            updates: [{ sectionId: this._sectionId, config }],
        });
    }

    private _ensureHeaderFooter(kind: SectionHeaderFooterKind, variant: SectionHeaderFooterVariant): string {
        this._assertTraditionalDocument();
        const { index } = this._resolve();
        const config = this.getConfig();
        const key = getSectionHeaderFooterReferenceKey(kind, variant);
        const existing = config[key];
        if (typeof existing === 'string' && existing) {
            return existing;
        }

        if (index > 0) {
            const segmentId = generateRandomId(6);
            const success = this._injector.get(ICommandService).syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
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
        const success = this._injector.get(ICommandService).syncExecuteCommand(CreateHeaderFooterCommand.id, {
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
        return this._injector.get(ICommandService).syncExecuteCommand(SetSectionHeaderFooterLinkCommand.id, {
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
