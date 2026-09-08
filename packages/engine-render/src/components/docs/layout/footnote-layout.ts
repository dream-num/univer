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

import type { IDocumentBody } from '@univerjs/core';
import type { IDocumentSkeletonFootnote, IDocumentSkeletonFootnoteDecoration, IDocumentSkeletonGlyph, IDocumentSkeletonPage, IDocumentSkeletonTable } from '../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, ISectionBreakConfig } from '../../../basics/interfaces';
import type { IFootnoteReferenceLayout } from './footnote-numbering';
import type { ILayoutContext } from './tools';
import { ColumnSeparatorType, CustomRangeType, DocumentDataModel, GridType } from '@univerjs/core';
import { DocumentSkeletonPageType } from '../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy } from '../document-compatibility';
import { DocumentViewModel } from '../view-model/document-view-model';
import { dealWithSection } from './block/section';
import { formatFootnoteNumber } from './footnote-numbering';
import { createSkeletonLetterGlyph } from './model/glyph';
import { createSkeletonPage, expandCellPageHeightForFlowTables, expandCellPageHeightForInlineDrawings } from './model/page';
import { clearFontCreateConfigCache, getFontConfigFromLastGlyph, getNullSkeleton, updateBlockIndex, updateInlineDrawingCoordsAndBorder } from './tools';

export interface IFootnoteLayoutConstraints {
    width: number;
    firstPageHeight: number;
    continuationPageHeight: number;
    columnCount?: number;
    firstColumn?: { index: number; top: number };
}

function createFootnoteColumns(config: ISectionBreakConfig, width: number, count: number) {
    if (count <= 1) {
        return [];
    }
    if (config.columnProperties?.length === count) {
        return config.columnProperties;
    }
    const gap = Math.min(48, width / (count * 2));
    const columnWidth = Math.max(1, (width - gap * (count - 1)) / count);
    return Array.from({ length: count }, (_, index) => ({
        width: columnWidth,
        paddingEnd: index === count - 1 ? 0 : gap,
    }));
}

function lastFootnoteColumn(fragments: IDocumentSkeletonFootnote[]) {
    const page = fragments[fragments.length - 1]?.page;
    const columns = page?.sections[page.sections.length - 1]?.columns ?? [];
    for (let index = columns.length - 1; index >= 0; index--) {
        const line = columns[index].lines[columns[index].lines.length - 1];
        if (line) {
            return { index, top: line.top + line.lineHeight };
        }
    }
    return { index: 0, top: 0 };
}

/** Uses the body layout pipeline, including table row splitting and inline drawing metrics. */
export function layoutFootnoteBody(
    parentContext: ILayoutContext,
    reference: IFootnoteReferenceLayout,
    sectionConfig: ISectionBreakConfig,
    constraints: IFootnoteLayoutConstraints
): IDocumentSkeletonPage[] {
    const viewModel = parentContext.viewModel.getFootnoteTreeMap().get(reference.footnoteId);
    if (!viewModel) {
        return [];
    }
    return layoutFootnoteSegment(parentContext, viewModel, reference, sectionConfig, constraints);
}

function layoutFootnoteSegment(
    parentContext: ILayoutContext,
    viewModel: DocumentViewModel,
    reference: Pick<IFootnoteReferenceLayout, 'footnoteId' | 'sectionId'> & { label?: string },
    sectionConfig: ISectionBreakConfig,
    constraints: IFootnoteLayoutConstraints
): IDocumentSkeletonPage[] {
    const skeleton = getNullSkeleton();
    const { skeHeaders, skeFooters, skeListLevel, drawingAnchor } = skeleton;
    const dataModel = viewModel.getDataModel();
    const config: ISectionBreakConfig = {
        ...sectionConfig,
        documentCompatibilityPolicy: sectionConfig.documentCompatibilityPolicy ??
            getDocumentCompatibilityPolicy(parentContext.dataModel.documentStyle.documentFlavor),
        sectionId: reference.sectionId,
        pageSize: { width: constraints.width, height: constraints.continuationPageHeight },
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginHeader: 0,
        marginFooter: 0,
        headerIds: {},
        footerIds: {},
        headerTreeMap: new Map(),
        footerTreeMap: new Map(),
        columnProperties: createFootnoteColumns(sectionConfig, constraints.width, constraints.columnCount ?? 1),
        columnSeparatorType: ColumnSeparatorType.NONE,
        gridType: GridType.DEFAULT,
        drawings: dataModel.drawings,
        lists: { ...sectionConfig.lists, ...dataModel.lists },
        documentTextStyle: reference.label == null ? sectionConfig.documentTextStyle : { ...sectionConfig.documentTextStyle, fs: 10 },
    };
    const ctx: ILayoutContext = {
        ...parentContext,
        viewModel,
        dataModel,
        skeleton,
        skeletonResourceReference: { skeHeaders, skeFooters, skeListLevel, drawingAnchor },
        footnoteReferences: undefined,
        footnoteLayout: undefined,
        footnoteLabel: reference.label,
        footnoteReferenceTextStyle: parentContext.dataModel.getSnapshot().footnotes?.[reference.footnoteId]?.referenceTextStyle,
        footnoteSegmentId: reference.footnoteId,
        footnoteFirstColumn: constraints.firstColumn,
        deferSlicedTableLayout: undefined,
        layoutStartPointer: { [reference.footnoteId]: null },
        isDirty: false,
        floatObjectsCache: new Map(),
        paragraphConfigCache: new Map(),
        sectionBreakConfigCache: new Map(),
        paragraphsOpenNewPage: new Set(),
    };
    const firstPage = createSkeletonPage(ctx, {
        ...config,
        pageSize: { width: constraints.width, height: Math.max(1, constraints.firstPageHeight) },
    }, ctx.skeletonResourceReference);
    firstPage.type = DocumentSkeletonPageType.FOOTNOTE;
    firstPage.segmentId = reference.footnoteId;
    for (let index = 0; index < (constraints.firstColumn?.index ?? 0); index++) {
        firstPage.sections[0].columns[index].isFull = true;
    }
    try {
        const pages = dealWithSection(ctx, viewModel, viewModel.getChildren()[0], firstPage, config, null).pages;
        for (const page of pages) {
            page.type = DocumentSkeletonPageType.FOOTNOTE;
            page.segmentId = reference.footnoteId;
        }
        updateBlockIndex(pages, -1, config.documentCompatibilityPolicy);
        updateInlineDrawingCoordsAndBorder(ctx, pages);
        expandCellPageHeightForInlineDrawings(pages);
        expandCellPageHeightForFlowTables(pages);
        return pages;
    } finally {
        // Text run offsets are local to a segment. Never reuse a note's font cache for body text.
        clearFontCreateConfigCache();
    }
}

interface IPageFootnoteLayout {
    fragments: IDocumentSkeletonFootnote[];
    following: IDocumentSkeletonFootnote[][];
    referenceIds: string[];
    height: number;
    separator?: IDocumentSkeletonPage;
    notice?: IDocumentSkeletonPage;
}

type FootnoteDecorationKind = IDocumentSkeletonFootnoteDecoration['kind'];

function defaultSeparatorBody(continued: boolean): IDocumentBody {
    return {
        dataStream: '\uFFFC\r\n',
        paragraphs: [{ paragraphId: 'separator', startIndex: 1, paragraphStyle: { spaceAbove: { v: 0 }, spaceBelow: { v: 0 } } }],
        sectionBreaks: [{ sectionId: 'separator', startIndex: 2 }],
        customRanges: [{
            rangeId: 'separator',
            rangeType: CustomRangeType.FIELD,
            startIndex: 0,
            endIndex: 0,
            wholeEntity: true,
            properties: { fieldType: continued ? 'FOOTNOTE_CONTINUATION_SEPARATOR' : 'FOOTNOTE_SEPARATOR' },
        }],
    };
}

function footnoteContentHeight(fragments: IDocumentSkeletonFootnote[]): number {
    return fragments.reduce((height, fragment) => Math.max(height, fragment.page.height), 0);
}

function collectPageReferenceGlyphs(page: IDocumentSkeletonPage): IDocumentSkeletonGlyph[] {
    const result: IDocumentSkeletonGlyph[] = [];
    for (const section of page.sections) {
        for (const column of section.columns) {
            for (const line of column.lines) {
                for (const divide of line.divides) {
                    result.push(...divide.glyphGroup.filter((glyph) => glyph.footnoteId));
                }
            }
        }
    }
    for (const table of page.skeTables.values()) {
        result.push(...table.rows.flatMap((row) => row.cells.flatMap(collectPageReferenceGlyphs)));
    }
    for (const group of page.skeColumnGroups.values()) {
        result.push(...group.columns.flatMap((column) => collectPageReferenceGlyphs(column.page)));
    }
    return result;
}

function collectPageReferenceIds(page: IDocumentSkeletonPage): string[] {
    return [...new Set(collectPageReferenceGlyphs(page).map((glyph) => glyph.footnoteId!))];
}

function collectCellReferenceLines(page: IDocumentSkeletonPage, offset = 0): { top: number; bottom: number; glyphs: IDocumentSkeletonGlyph[] }[] {
    const lines = page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines.flatMap((line) => {
        const glyphs = line.divides.flatMap((divide) => divide.glyphGroup.filter((glyph) => glyph.footnoteId));
        const top = offset + page.marginTop + section.top + line.top;
        return glyphs.length > 0 ? [{ top, bottom: top + line.lineHeight + page.marginBottom, glyphs }] : [];
    })));
    for (const table of page.skeTables.values()) {
        for (const row of table.rows) {
            lines.push(...row.cells.flatMap((cell) => collectCellReferenceLines(cell, offset + page.marginTop + table.top + row.top)));
        }
    }
    return lines;
}

/** Per-layout state, shared by synchronous and sliced body pagination. */
export class DocumentFootnoteLayout {
    private readonly _pages = new WeakMap<IDocumentSkeletonPage, IPageFootnoteLayout>();
    private readonly _inherited = new WeakMap<IDocumentSkeletonPage, IPageFootnoteLayout>();
    private readonly _references = new Map<string, IFootnoteReferenceLayout>();
    private readonly _referencePageBreaks = new Map<number, Map<number, number>>();
    private readonly _decorations = new Map<string, IDocumentSkeletonPage | undefined>();

    constructor(private readonly _ctx: ILayoutContext) {
        for (const reference of _ctx.footnoteReferences?.values() ?? []) {
            this._references.set(reference.footnoteId, reference);
        }
    }

    updateReferenceGlyphs(
        page: IDocumentSkeletonPage,
        glyphs: IDocumentSkeletonGlyph[],
        config: ISectionBreakConfig,
        paragraph: IParagraphConfig
    ): void {
        if (!glyphs.some((glyph) => glyph.footnoteId) || page.type !== DocumentSkeletonPageType.BODY || page.segmentId !== '') {
            return;
        }
        this._updateReferenceLabels(page, glyphs);
        for (const glyph of glyphs) {
            const reference = glyph.footnoteId ? this._references.get(glyph.footnoteId) : undefined;
            if (!reference || reference.properties.restart !== 'eachPage' || reference.number == null) {
                continue;
            }
            const label = reference.label;
            if (glyph.content !== label) {
                const fontConfig = getFontConfigFromLastGlyph(glyph, config, paragraph.paragraphStyle ?? {});
                Object.assign(glyph, createSkeletonLetterGlyph(label, fontConfig), {
                    raw: '\uFFFC',
                    count: 1,
                    footnoteId: reference.footnoteId,
                });
            }
        }
    }

    private _updateReferenceLabels(page: IDocumentSkeletonPage, incoming: IDocumentSkeletonGlyph[]): boolean {
        const ids = [...new Set([...collectPageReferenceIds(page), ...incoming.map((glyph) => glyph.footnoteId!)])]
            .filter((id) => this._references.has(id))
            .sort((left, right) => this._references.get(left)!.referenceIndex - this._references.get(right)!.referenceIndex);
        let precedingCount = 0;
        let changed = false;
        for (const id of ids) {
            const reference = this._references.get(id)!;
            if (reference.number == null) {
                continue;
            }
            if (reference.properties.restart === 'eachPage') {
                const number = (reference.properties.startNumber ?? 1) + precedingCount;
                const label = formatFootnoteNumber(number, reference.properties.numberFormat);
                changed ||= reference.label !== label;
                reference.label = label;
            }
            precedingCount++;
        }
        if (changed) {
            this._pages.delete(page);
        }
        return changed;
    }

    getTableBodyLimit(
        page: IDocumentSkeletonPage,
        currentPages: IDocumentSkeletonPage[],
        config: ISectionBreakConfig,
        table: IDocumentSkeletonTable
    ): number {
        const references = table.rows.flatMap((row) => row.cells.flatMap(collectPageReferenceGlyphs));
        return this.getBodyLimit(page, currentPages, config, table.top + table.height, references);
    }

    /** Measure table slices without publishing speculative notes on body pages. */
    createTablePagination(page: IDocumentSkeletonPage, config: ISectionBreakConfig, availableHeight: number) {
        if (page.type !== DocumentSkeletonPageType.BODY || page.segmentId !== '') {
            return undefined;
        }
        let current = { ...page, skeTables: new Map(page.skeTables) };
        const pages = [current];
        this._inherited.set(current, this._getInherited(page, this._ctx.skeleton.pages, config));
        let top = page.pageHeight - page.marginTop - page.marginBottom - availableHeight;
        return {
            renumberWholeRow: (table: IDocumentSkeletonTable, rows: IDocumentSkeletonTable['rows'], remainingHeight: number): boolean => {
                if (!rows.some((row) => row.cells.some((cell) => collectPageReferenceGlyphs(cell)
                    .some((glyph) => this._references.get(glyph.footnoteId!)?.properties.restart === 'eachPage')))) {
                    return false;
                }
                let target = { ...current, skeTables: new Map(current.skeTables) };
                const targetPages = [target];
                this._inherited.set(target, this._getInherited(current, pages, config));
                const accepted = this._pages.get(current);
                if (accepted) {
                    this._pages.set(target, accepted);
                }
                let offset = top + table.height;
                let preceding = table.rows.flatMap((row) => row.cells.flatMap(collectPageReferenceGlyphs));
                let changed = false;
                for (const row of rows) {
                    const glyphs = row.cells.flatMap(collectPageReferenceGlyphs);
                    let previousPlan = this._pages.get(target) ?? this._getInherited(target, targetPages, config);
                    this._updateReferenceLabels(target, [...preceding, ...glyphs]);
                    let limit = this.getBodyLimit(target, targetPages, config, offset + row.height, [...preceding, ...glyphs]);
                    const tolerance = (config.documentCompatibilityPolicy ?? getDocumentCompatibilityPolicy()).table.rowOverflowTolerance;
                    const requiresNewPage = row !== rows[0] || remainingHeight <= 0 || row.height > remainingHeight + tolerance;
                    if (requiresNewPage || offset + row.height > limit + 0.01) {
                        do {
                            this._pages.set(target, previousPlan);
                            target = createSkeletonPage(this._ctx, config, this._ctx.skeletonResourceReference, target.pageNumber + 1);
                            targetPages.push(target);
                            offset = 0;
                            preceding = [];
                            previousPlan = this._getInherited(target, targetPages, config);
                            this._updateReferenceLabels(target, glyphs);
                            limit = this.getBodyLimit(target, targetPages, config, row.height, glyphs);
                        } while (row.height > limit + 0.01 && this._getInherited(target, targetPages, config).fragments.length > 0);
                    }
                    changed ||= glyphs.some((glyph) => glyph.content !== this._references.get(glyph.footnoteId!)?.label);
                    offset += row.height;
                    preceding.push(...glyphs);
                }
                return changed;
            },
            measureRow: (table: IDocumentSkeletonTable, rows: IDocumentSkeletonTable['rows'], previousHeights?: readonly number[]): number[] | undefined => {
                let measurePage = { ...current, skeTables: new Map(current.skeTables) };
                const measurePages = [measurePage];
                this._inherited.set(measurePage, this._getInherited(current, pages, config));
                const accepted = this._pages.get(current);
                if (accepted) {
                    this._pages.set(measurePage, accepted);
                }
                const heights = [...(previousHeights ?? [])];
                let changed = false;
                for (let index = 0; index < rows.length; index++) {
                    const row = rows[index];
                    const offset = index === 0 ? top + table.height : 0;
                    const contentHeight = measurePage.pageHeight - measurePage.marginTop - measurePage.marginBottom;
                    const available = heights[index] ?? contentHeight - offset;
                    const lines = row.cells
                        .flatMap((cell) => collectCellReferenceLines(cell))
                        .filter((line) => line.bottom <= available)
                        .sort((left, right) => left.bottom - right.bottom);
                    const incoming = lines.flatMap((line) => line.glyphs);
                    if (index === 0) {
                        incoming.push(...table.rows.flatMap((item) => item.cells.flatMap(collectPageReferenceGlyphs)));
                    }
                    // A cell is shaped before its physical page is known. Rebuild the
                    // row when its page-local marker changes, including marker width.
                    changed = this._updateReferenceLabels(measurePage, incoming) || changed;
                    const lastReference = lines[lines.length - 1];
                    const minimumBottom = lastReference?.bottom ?? Math.min(row.height, available);
                    const limit = this.getBodyLimit(measurePage, measurePages, config, offset + minimumBottom, incoming) - offset;
                    const deferredIds = new Set(this._pages.get(measurePage)?.following.flatMap((fragments) => fragments.filter((fragment) => !fragment.continued).map((fragment) => fragment.footnoteId)));
                    const deferredLine = lines.find((line) => line.top > 0 && line.glyphs.some((glyph) => deferredIds.has(glyph.footnoteId!)));
                    // A continuing note can postpone later notes. Split before a later
                    // reference line so its first note fragment follows it to the next page.
                    const capacity = Math.max(1, Math.min(
                        limit < minimumBottom && lastReference ? lastReference.top : limit,
                        deferredLine?.top ?? Number.POSITIVE_INFINITY
                    ));
                    if (row.height > capacity + 0.01 && capacity + 0.01 < available) {
                        heights[index] = capacity;
                        changed = true;
                    } else {
                        heights[index] = available;
                    }
                    measurePage = createSkeletonPage(this._ctx, config, this._ctx.skeletonResourceReference, measurePage.pageNumber + 1);
                    measurePages.push(measurePage);
                }
                return changed ? heights : undefined;
            },
            append: (table: IDocumentSkeletonTable, row: IDocumentSkeletonTable['rows'][number]): number | undefined => {
                const previous = this._pages.get(current);
                const incoming = [...table.rows, row].flatMap((item) => item.cells.flatMap(collectPageReferenceGlyphs));
                const bottom = top + table.height + row.height;
                const limit = this.getBodyLimit(current, pages, config, bottom, incoming);
                if (bottom <= limit + 0.01) {
                    return Math.max(0, limit - bottom);
                }
                if (previous) {
                    this._pages.set(current, previous);
                } else {
                    this._pages.set(current, this._getInherited(current, pages, config));
                }
                return undefined;
            },
            hasContinuation: () => this._getInherited(current, pages, config).fragments.length > 0,
            nextPage: () => {
                current = createSkeletonPage(this._ctx, config, this._ctx.skeletonResourceReference, current.pageNumber + 1);
                pages.push(current);
                top = 0;
            },
        };
    }

    getBodyLimit(
        page: IDocumentSkeletonPage,
        currentPages: IDocumentSkeletonPage[],
        config: ISectionBreakConfig,
        bodyBottom: number,
        incoming: IDocumentSkeletonGlyph[] = []
    ): number {
        const contentHeight = page.pageHeight - page.marginTop - page.marginBottom;
        if (page.type !== DocumentSkeletonPageType.BODY || page.segmentId !== '' || !Number.isFinite(contentHeight)) {
            return contentHeight;
        }
        const inherited = this._getInherited(page, currentPages, config);
        const ids = new Set(collectPageReferenceIds(page));
        for (const glyph of incoming) {
            if (glyph.footnoteId) {
                ids.add(glyph.footnoteId);
            }
        }
        const referenceIds = [...ids].sort((left, right) =>
            (this._references.get(left)?.referenceIndex ?? 0) - (this._references.get(right)?.referenceIndex ?? 0));
        const previous = this._pages.get(page);
        if (previous && previous.referenceIds.length === referenceIds.length &&
            previous.referenceIds.every((id, index) => id === referenceIds[index])) {
            this._position(page, previous, bodyBottom);
            return contentHeight - previous.height;
        }

        const firstReference = this._references.get(inherited.fragments[0]?.footnoteId ?? referenceIds[0]);
        const requestedCount = firstReference?.properties.columnCount ?? 0;
        const columnCount = requestedCount === 0 ? Math.max(1, config.columnProperties?.length ?? 1) : requestedCount;
        const separator = this._layoutDecoration(inherited.fragments.some((fragment) => fragment.continued) ? 'continuationSeparator' : 'separator', page, config);
        const available = Math.max(1, contentHeight - bodyBottom - (separator?.height ?? 0));
        let plan = this._layoutPageNotes(page, config, referenceIds, inherited, available, columnCount, separator);
        if (!plan) {
            return -1;
        }
        // Balance all notes on this page together; a continuing note already uses
        // the full available height and must retain its continuation boundary.
        if (columnCount > 1 && plan.following.length === 0 && inherited.fragments.length === 0 && plan.fragments.length > 0) {
            let low = 1;
            let high = Math.max(1, footnoteContentHeight(plan.fragments));
            for (let attempt = 0; attempt < 12 && high - low > 0.25; attempt++) {
                const middle = (low + high) / 2;
                const candidate = this._layoutPageNotes(page, config, referenceIds, inherited, middle, columnCount, separator);
                if (candidate && candidate.following.length === 0) {
                    plan = candidate;
                    high = middle;
                } else {
                    low = middle;
                }
            }
        }
        this._pages.set(page, plan);
        this._position(page, plan, bodyBottom);
        return contentHeight - plan.height;
    }

    finish(pages: IDocumentSkeletonPage[], config: ISectionBreakConfig): void {
        let previous = pages[pages.length - 1];
        if (!previous) {
            return;
        }
        while (this._pages.get(previous)?.following.length) {
            const page = createSkeletonPage(this._ctx, config, this._ctx.skeletonResourceReference, previous.pageNumber + 1);
            pages.push(page);
            const inherited = this._getInherited(page, pages, config);
            this._pages.set(page, inherited);
            this._position(page, inherited, 0);
            previous = page;
        }
    }

    getReferencePageBreaks(paragraphIndex: number): readonly number[] | undefined {
        const boundaries = this._referencePageBreaks.get(paragraphIndex);
        return boundaries ? [...boundaries.values()] : undefined;
    }

    /** Re-shape moved text while retaining the page boundary chosen by keep/widow control. */
    queueReferenceRelayout(pages: IDocumentSkeletonPage[]): void {
        let anchor = Number.POSITIVE_INFINITY;
        for (const page of pages) {
            if (page.type !== DocumentSkeletonPageType.BODY || page.segmentId !== '') {
                continue;
            }
            this._updateReferenceLabels(page, []);
            for (const section of page.sections) {
                for (const column of section.columns) {
                    const offsets = new Map<number, number>();
                    for (const line of column.lines) {
                        let offset = offsets.get(line.paragraphIndex) ?? 0;
                        for (const glyph of line.divides.flatMap((divide) => divide.glyphGroup)) {
                            const reference = this._references.get(glyph.footnoteId ?? '');
                            if (reference?.properties.restart === 'eachPage' && glyph.content !== reference.label) {
                                const boundaries = this._referencePageBreaks.get(line.paragraphIndex) ?? new Map<number, number>();
                                boundaries.set(page.pageNumber, reference.referenceIndex - offset);
                                this._referencePageBreaks.set(line.paragraphIndex, boundaries);
                                anchor = Math.min(anchor, line.paragraphIndex);
                            }
                            offset += glyph.count;
                        }
                        offsets.set(line.paragraphIndex, offset);
                    }
                }
            }
        }
        if (!Number.isFinite(anchor)) {
            return;
        }
        // The retained physical-page boundary also covers keep-next predecessors.
        // A second whole-paragraph break would separate them again during the retry.
        for (const paragraph of this._ctx.paragraphsOpenNewPage) {
            if (paragraph >= anchor) {
                this._ctx.paragraphsOpenNewPage.delete(paragraph);
            }
        }
        this._ctx.isDirty = true;
        this._ctx.layoutStartPointer[''] = Math.min(anchor, this._ctx.layoutStartPointer[''] ?? Number.POSITIVE_INFINITY);
    }

    /** Rebuild reservations after keep-lines or widow control relocates shaped lines. */
    reconcilePages(pages: IDocumentSkeletonPage[], config: ISectionBreakConfig): boolean {
        let fits = true;
        for (const page of pages) {
            this._inherited.delete(page);
            this._pages.delete(page);
            this._updateReferenceLabels(page, []);
            const bodyBottom = page.sections.reduce((bottom, section) => Math.max(
                bottom,
                ...section.columns.map((column) => {
                    const line = column.lines[column.lines.length - 1];
                    return line ? section.top + line.top + line.lineHeight : 0;
                })
            ), 0);
            if (bodyBottom > this.getBodyLimit(page, pages, config, bodyBottom) + 2) {
                fits = false;
            }
        }
        return fits;
    }

    private _layoutPageNotes(
        page: IDocumentSkeletonPage,
        config: ISectionBreakConfig,
        referenceIds: string[],
        inherited: IPageFootnoteLayout,
        available: number,
        columnCount: number,
        separator: IDocumentSkeletonPage | undefined,
        reserveNotice = false
    ): IPageFootnoteLayout | undefined {
        const plan: IPageFootnoteLayout = {
            fragments: [...inherited.fragments],
            following: inherited.following.map((fragments) => [...fragments]),
            referenceIds,
            height: inherited.height,
            separator,
        };
        const width = page.pageWidth - page.marginLeft - page.marginRight;
        const continuationSeparator = this._layoutDecoration('continuationSeparator', page, config);
        const notice = this._layoutDecoration('continuationNotice', page, config);
        const continuationHeight = page.pageHeight - page.marginTop - page.marginBottom -
            (continuationSeparator?.height ?? 0) - (notice?.height ?? 0);
        for (const id of referenceIds) {
            const reference = this._references.get(id);
            if (!reference) {
                continue;
            }
            const delayed = plan.following.length > 0;
            const target = delayed ? plan.following[plan.following.length - 1] : plan.fragments;
            const notePages = layoutFootnoteBody(this._ctx, reference, config, {
                width,
                firstPageHeight: delayed ? continuationHeight : Math.max(1, available - (reserveNotice ? notice?.height ?? 0 : 0)),
                continuationPageHeight: Math.max(1, continuationHeight),
                columnCount,
                firstColumn: lastFootnoteColumn(target),
            });
            const first = notePages[0];
            if (!first) {
                continue;
            }
            if (first.sections.every((section) => section.columns.every((column) => column.lines.length === 0))) {
                // Keep a new reference with the first line of its note. Otherwise
                // a later paragraph retry can inherit a note whose reference moved.
                if (!delayed && (plan.fragments.length > 0 ||
                    page.sections.some((section) => section.columns.some((column) => column.lines.length > 0)))) {
                    return undefined;
                }
                this._appendFollowing(plan.following, notePages.slice(1), reference, false);
                continue;
            }
            if (delayed) {
                target.push({ footnoteId: id, referenceIndex: reference.referenceIndex, continued: false, left: page.marginLeft, top: 0, page: first });
                this._appendFollowing(plan.following, notePages.slice(1), reference, true);
                continue;
            }
            if (first.height > available + 2) {
                if (page.sections.some((section) => section.columns.some((column) => column.lines.length > 0)) ||
                    plan.fragments.length > 0) {
                    return undefined;
                }
                this._appendFollowing(plan.following, notePages, reference, false);
                continue;
            }
            plan.fragments.push({
                footnoteId: id,
                referenceIndex: reference.referenceIndex,
                continued: false,
                left: page.marginLeft,
                top: 0,
                page: first,
            });
            this._appendFollowing(plan.following, notePages.slice(1), reference, true);
        }
        if (!reserveNotice && notice && plan.following.length > 0) {
            return this._layoutPageNotes(page, config, referenceIds, inherited, available, columnCount, separator, true);
        }
        plan.notice = plan.following.length > 0 ? notice : undefined;
        plan.height = plan.fragments.length === 0
            ? 0
            : (separator?.height ?? 0) +
            footnoteContentHeight(plan.fragments) + (plan.notice?.height ?? 0);
        return plan;
    }

    private _layoutDecoration(kind: FootnoteDecorationKind, page: IDocumentSkeletonPage, config: ISectionBreakConfig): IDocumentSkeletonPage | undefined {
        const width = page.pageWidth - page.marginLeft - page.marginRight;
        const key = `${kind}:${config.sectionId}:${width}`;
        if (this._decorations.has(key)) {
            return this._decorations.get(key);
        }
        const snapshot = this._ctx.dataModel.getSnapshot();
        const body = snapshot.footnoteSettings?.[kind] ?? (kind === 'continuationNotice' ? undefined : defaultSeparatorBody(kind === 'continuationSeparator'));
        if (!body) {
            this._decorations.set(key, undefined);
            return undefined;
        }
        const model = new DocumentDataModel({ id: `footnote-${kind}`, body, documentStyle: snapshot.documentStyle, styles: snapshot.styles });
        const viewModel = new DocumentViewModel(model);
        try {
            const pages = layoutFootnoteSegment(this._ctx, viewModel, { footnoteId: model.getUnitId(), sectionId: config.sectionId }, config, {
                width,
                firstPageHeight: Number.POSITIVE_INFINITY,
                continuationPageHeight: Number.POSITIVE_INFINITY,
            });
            const decoration = pages[0];
            if (decoration) {
                for (const section of decoration.sections) {
                    for (const column of section.columns) {
                        const lastLine = column.lines[column.lines.length - 1];
                        if (lastLine) {
                            decoration.height = Math.max(decoration.height, section.top + lastLine.top + lastLine.lineHeight + Math.max(0, lastLine.spaceBelowApply ?? 0));
                        }
                    }
                }
            }
            this._decorations.set(key, decoration);
            return decoration;
        } finally {
            viewModel.dispose();
            model.dispose();
        }
    }

    private _appendFollowing(
        following: IDocumentSkeletonFootnote[][],
        pages: IDocumentSkeletonPage[],
        reference: IFootnoteReferenceLayout,
        continued: boolean
    ): void {
        for (let index = 0; index < pages.length; index++) {
            following.push([{
                footnoteId: reference.footnoteId,
                referenceIndex: reference.referenceIndex,
                continued: continued || index > 0,
                left: 0,
                top: 0,
                page: pages[index],
            }]);
        }
    }

    private _getInherited(page: IDocumentSkeletonPage, currentPages: IDocumentSkeletonPage[], config: ISectionBreakConfig): IPageFootnoteLayout {
        const existing = this._inherited.get(page);
        if (existing) {
            return existing;
        }
        let pageIndex = currentPages.indexOf(page);
        let previous = pageIndex > 0 ? currentPages[pageIndex - 1] : undefined;
        if (!previous) {
            const pages = this._ctx.skeleton.pages;
            pageIndex = pages.indexOf(page);
            previous = pageIndex > 0 ? pages[pageIndex - 1] : pages[pages.length - 1];
            if (previous === page) {
                previous = undefined;
            }
        }
        const previousPlan = previous == null ? undefined : this._pages.get(previous);
        const fragments = previousPlan?.following[0] ?? [];
        const separator = fragments.length > 0
            ? this._layoutDecoration(fragments.some((fragment) => fragment.continued) ? 'continuationSeparator' : 'separator', page, config)
            : undefined;
        const notice = (previousPlan?.following.length ?? 0) > 1 ? this._layoutDecoration('continuationNotice', page, config) : undefined;
        const plan: IPageFootnoteLayout = {
            fragments: fragments.map((fragment) => ({ ...fragment, left: page.marginLeft })),
            following: previousPlan?.following.slice(1) ?? [],
            referenceIds: [],
            height: fragments.length === 0
                ? 0
                : (separator?.height ?? 0) + footnoteContentHeight(fragments) + (notice?.height ?? 0),
            separator,
            notice,
        };
        this._inherited.set(page, plan);
        return plan;
    }

    private _position(page: IDocumentSkeletonPage, plan: IPageFootnoteLayout, bodyBottom: number): void {
        if (plan.fragments.length === 0) {
            delete page.footnotes;
            delete page.footnoteHeight;
            delete page.footnoteDecorations;
            return;
        }
        const firstReference = this._references.get(plan.fragments[0].footnoteId);
        const separatorHeight = plan.separator?.height ?? 0;
        const top = firstReference?.properties.position === 'beneathText'
            ? page.marginTop + bodyBottom + separatorHeight
            : page.pageHeight - page.marginBottom - plan.height + separatorHeight;
        page.footnotes = plan.fragments.map((fragment) => {
            const positioned = { ...fragment, top, left: page.marginLeft };
            return positioned;
        });
        page.footnoteHeight = plan.height;
        const decorations: IDocumentSkeletonFootnoteDecoration[] = [];
        if (plan.separator) {
            decorations.push({ kind: plan.fragments.some((fragment) => fragment.continued) ? 'continuationSeparator' : 'separator', left: page.marginLeft, top: top - separatorHeight, page: plan.separator });
        }
        if (plan.notice) {
            decorations.push({ kind: 'continuationNotice', left: page.marginLeft, top: top + footnoteContentHeight(plan.fragments), page: plan.notice });
        }
        page.footnoteDecorations = decorations;
    }
}
