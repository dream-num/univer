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

import type { IDocDrawingBase, IDocumentData, IReferenceSource, ITable, ITableRow } from '@univerjs/core';
import type {
    IDocumentSkeletonCached,
    IDocumentSkeletonColumn,
    IDocumentSkeletonColumnGroup,
    IDocumentSkeletonColumnGroupColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonSection,
    IDocumentSkeletonTable,
} from '../../../basics/i-document-skeleton-cached';

export type IDocumentSkeletonGlyphPatch = Omit<IDocumentSkeletonGlyph, 'parent'>;

export interface IDocumentSkeletonDividePatch extends Omit<IDocumentSkeletonDivide, 'glyphGroup' | 'parent'> {
    glyphGroup: IDocumentSkeletonGlyphPatch[];
}

export interface IDocumentSkeletonLinePatch extends Omit<IDocumentSkeletonLine, 'divides' | 'parent'> {
    divides: IDocumentSkeletonDividePatch[];
}

export interface IDocumentSkeletonColumnPatch extends Omit<IDocumentSkeletonColumn, 'lines' | 'parent'> {
    lines: IDocumentSkeletonLinePatch[];
}

export interface IDocumentSkeletonSectionPatch extends Omit<IDocumentSkeletonSection, 'columns' | 'parent'> {
    columns: IDocumentSkeletonColumnPatch[];
}

export interface IDocumentSkeletonDrawingPatch extends Omit<IDocumentSkeletonDrawing, 'drawingOrigin'> {
    drawingOrigin?: IDocDrawingBase;
}

export interface IDocumentSkeletonRowPatch extends Omit<IDocumentSkeletonRow, 'cells' | 'parent' | 'rowSource'> {
    cells: IDocumentSkeletonPagePatch[];
    rowSource?: ITableRow;
    rowSourceIndex?: number;
}

export interface IDocumentSkeletonTablePatch extends Omit<IDocumentSkeletonTable, 'rows' | 'parent' | 'tableSource'> {
    rows: IDocumentSkeletonRowPatch[];
    tableSource?: ITable;
    tableSourceId?: string;
}

export interface IDocumentSkeletonColumnGroupColumnPatch extends Omit<IDocumentSkeletonColumnGroupColumn, 'page' | 'parent'> {
    page: IDocumentSkeletonPagePatch;
}

export interface IDocumentSkeletonColumnGroupPatch extends Omit<IDocumentSkeletonColumnGroup, 'columns' | 'parent'> {
    columns: IDocumentSkeletonColumnGroupColumnPatch[];
}

export interface IDocumentSkeletonPagePatch extends Omit<
    IDocumentSkeletonPage,
    'sections' | 'skeDrawings' | 'skeTables' | 'skeColumnGroups' | 'parent'
> {
    sections: IDocumentSkeletonSectionPatch[];
    skeDrawings: Array<[string, IDocumentSkeletonDrawingPatch]>;
    skeTables: Array<[string, IDocumentSkeletonTablePatch]>;
    skeColumnGroups: Array<[string, IDocumentSkeletonColumnGroupPatch]>;
}

export type IDocumentSkeletonPageGeometryPatch = Omit<
    IDocumentSkeletonPagePatch,
    'sections' | 'skeDrawings' | 'skeTables' | 'skeColumnGroups'
>;

export type IDocumentSkeletonSectionGeometryPatch = Omit<IDocumentSkeletonSectionPatch, 'columns'>;
export type IDocumentSkeletonColumnGeometryPatch = Omit<IDocumentSkeletonColumnPatch, 'lines'>;

export interface IDocumentSkeletonContinuousFlowPatch {
    sectionIndex: number;
    section: IDocumentSkeletonSectionGeometryPatch;
    columnIndex: number;
    column: IDocumentSkeletonColumnGeometryPatch;
    lineIndex: number;
    lines: IDocumentSkeletonLinePatch[];
    trailingColumns: IDocumentSkeletonColumnPatch[];
    trailingSections: IDocumentSkeletonSectionPatch[];
}

export interface IDocumentSkeletonContinuousBlockPatch {
    pageIndex: number;
    page: IDocumentSkeletonPageGeometryPatch;
    flow: IDocumentSkeletonContinuousFlowPatch;
    skeDrawings: Array<[string, IDocumentSkeletonDrawingPatch]>;
    skeTables: Array<[string, IDocumentSkeletonTablePatch]>;
    skeColumnGroups: Array<[string, IDocumentSkeletonColumnGroupPatch]>;
    previousHeight: number;
    heightDelta: number;
}

export interface IDocumentSkeletonContinuousSnapshot {
    height: number;
    lineEnds: number[];
}

function withoutParent<T extends { parent?: unknown }>(value: T): Omit<T, 'parent'> {
    const copy = { ...value };
    delete copy.parent;
    return copy;
}

function serializeDivide(source: IDocumentSkeletonDivide): IDocumentSkeletonDividePatch {
    return {
        ...withoutParent(source),
        glyphGroup: source.glyphGroup.map(withoutParent),
    };
}

export function serializeDocumentSkeletonLine(source: IDocumentSkeletonLine): IDocumentSkeletonLinePatch {
    const line = {
        ...withoutParent(source),
        divides: source.divides.map(serializeDivide),
    };
    return source.bullet == null
        ? line
        : { ...line, bullet: { ...source.bullet } };
}

function serializeColumn(source: IDocumentSkeletonColumn): IDocumentSkeletonColumnPatch {
    return {
        ...withoutParent(source),
        lines: source.lines.map(serializeDocumentSkeletonLine),
    };
}

function serializeSection(source: IDocumentSkeletonSection): IDocumentSkeletonSectionPatch {
    return {
        ...withoutParent(source),
        columns: source.columns.map(serializeColumn),
    };
}

function serializeDrawing(
    source: IDocumentSkeletonDrawing,
    omitResourceSources: boolean
): IDocumentSkeletonDrawingPatch {
    const drawing = { ...source };
    if (!omitResourceSources) {
        return drawing;
    }
    const { drawingOrigin: _drawingOrigin, ...geometry } = drawing;
    return geometry;
}

function serializeTable(
    source: IDocumentSkeletonTable,
    omitResourceSources: boolean
): IDocumentSkeletonTablePatch {
    const table = withoutParent(source);
    const { tableSource, ...geometry } = table;
    return {
        ...geometry,
        ...(!omitResourceSources ? { tableSource } : {}),
        tableSourceId: tableSource.tableId,
        rows: source.rows.map((row) => {
            const serializedRow = withoutParent(row);
            const { rowSource, ...rowGeometry } = serializedRow;
            return {
                ...rowGeometry,
                ...(!omitResourceSources ? { rowSource } : {}),
                rowSourceIndex: row.index,
                cells: row.cells.map((cell) => serializeDocumentSkeletonPage(cell, omitResourceSources)),
            };
        }),
    };
}

function serializeColumnGroup(
    source: IDocumentSkeletonColumnGroup,
    omitResourceSources: boolean
): IDocumentSkeletonColumnGroupPatch {
    return {
        ...withoutParent(source),
        columns: source.columns.map((column) => ({
            ...withoutParent(column),
            page: serializeDocumentSkeletonPage(column.page, omitResourceSources),
        })),
    };
}

export function serializeDocumentSkeletonPage(
    source: IDocumentSkeletonPage,
    omitResourceSources = false
): IDocumentSkeletonPagePatch {
    return {
        ...withoutParent(source),
        sections: source.sections.map(serializeSection),
        skeDrawings: [...source.skeDrawings].map(([drawingId, drawing]) => [
            drawingId,
            serializeDrawing(drawing, omitResourceSources),
        ]),
        skeTables: [...source.skeTables].map(([tableId, table]) => [
            tableId,
            serializeTable(table, omitResourceSources),
        ]),
        skeColumnGroups: [...source.skeColumnGroups].map(([groupId, group]) => [
            groupId,
            serializeColumnGroup(group, omitResourceSources),
        ]),
    };
}

function hydrateDivide(source: IDocumentSkeletonDividePatch, parent: IDocumentSkeletonLine): IDocumentSkeletonDivide {
    const divide: IDocumentSkeletonDivide = {
        ...source,
        glyphGroup: [],
        parent,
    };
    divide.glyphGroup = source.glyphGroup.map((glyph) => ({ ...glyph, parent: divide }));
    return divide;
}

export function hydrateDocumentSkeletonLine(
    source: IDocumentSkeletonLinePatch,
    parent: IDocumentSkeletonColumn
): IDocumentSkeletonLine {
    const line: IDocumentSkeletonLine = {
        ...source,
        divides: [],
        parent,
    };
    line.divides = source.divides.map((divide) => hydrateDivide(divide, line));
    return line;
}

function hydrateColumn(source: IDocumentSkeletonColumnPatch, parent: IDocumentSkeletonSection): IDocumentSkeletonColumn {
    const column: IDocumentSkeletonColumn = {
        ...source,
        lines: [],
        parent,
    };
    column.lines = source.lines.map((line) => hydrateDocumentSkeletonLine(line, column));
    return column;
}

function hydrateSection(source: IDocumentSkeletonSectionPatch, parent: IDocumentSkeletonPage): IDocumentSkeletonSection {
    const section: IDocumentSkeletonSection = {
        ...source,
        columns: [],
        parent,
    };
    section.columns = source.columns.map((column) => hydrateColumn(column, section));
    return section;
}

function getDocumentReferenceSource(
    snapshot: IDocumentData,
    segmentId: string
): IReferenceSource {
    return snapshot.headers?.[segmentId] ?? snapshot.footers?.[segmentId] ?? snapshot;
}

function requireDrawingOrigin(
    source: IDocumentSkeletonDrawingPatch,
    snapshot: IDocumentData | undefined,
    segmentId: string
): IDocDrawingBase {
    const drawingOrigin = source.drawingOrigin ?? (snapshot == null
        ? undefined
        : getDocumentReferenceSource(snapshot, segmentId).drawings?.[source.drawingId] ??
            snapshot.drawings?.[source.drawingId]);
    if (drawingOrigin == null) {
        throw new Error(`Document layout publication is missing drawing source "${source.drawingId}".`);
    }
    return drawingOrigin;
}

function hydrateDrawing(
    source: IDocumentSkeletonDrawingPatch,
    snapshot: IDocumentData | undefined,
    segmentId: string
): IDocumentSkeletonDrawing {
    return {
        ...source,
        drawingOrigin: requireDrawingOrigin(source, snapshot, segmentId),
    };
}

function requireTableSource(
    source: IDocumentSkeletonTablePatch,
    snapshot: IDocumentData | undefined,
    segmentId: string
): ITable {
    const sourceId = source.tableSourceId ?? source.tableId;
    const tableSource = source.tableSource ?? (snapshot == null
        ? undefined
        : getDocumentReferenceSource(snapshot, segmentId).tableSource?.[sourceId] ??
            snapshot.tableSource?.[sourceId]);
    if (tableSource == null) {
        throw new Error(`Document layout publication is missing table source "${sourceId}".`);
    }
    return tableSource;
}

function hydrateTable(
    source: IDocumentSkeletonTablePatch,
    parent: IDocumentSkeletonPage,
    snapshot: IDocumentData | undefined,
    segmentId: string
): IDocumentSkeletonTable {
    const tableSource = requireTableSource(source, snapshot, segmentId);
    const {
        tableSource: _tableSource,
        tableSourceId: _tableSourceId,
        rows: sourceRows,
        ...tableGeometry
    } = source;
    const table: IDocumentSkeletonTable = {
        ...tableGeometry,
        tableSource,
        rows: [],
        parent,
    };
    table.rows = sourceRows.map((sourceRow) => {
        const rowSource = sourceRow.rowSource ?? tableSource.tableRows[sourceRow.rowSourceIndex ?? sourceRow.index];
        if (rowSource == null) {
            throw new Error(
                `Document layout publication is missing row source ${sourceRow.rowSourceIndex ?? sourceRow.index} ` +
                `for table "${tableSource.tableId}".`
            );
        }
        const {
            rowSource: _rowSource,
            rowSourceIndex: _rowSourceIndex,
            cells: sourceCells,
            ...rowGeometry
        } = sourceRow;
        const row: IDocumentSkeletonRow = {
            ...rowGeometry,
            rowSource,
            cells: [],
            parent: table,
        };
        row.cells = sourceCells.map((cell) => hydrateDocumentSkeletonPageInternal(
            cell,
            row,
            snapshot,
            segmentId
        ));
        return row;
    });
    return table;
}

function hydrateColumnGroup(
    source: IDocumentSkeletonColumnGroupPatch,
    parent: IDocumentSkeletonPage,
    snapshot: IDocumentData | undefined,
    segmentId: string
): IDocumentSkeletonColumnGroup {
    const group: IDocumentSkeletonColumnGroup = {
        ...source,
        columns: [],
        parent,
    };
    group.columns = source.columns.map((sourceColumn) => {
        const page = hydrateDocumentSkeletonPageInternal(
            sourceColumn.page,
            undefined,
            snapshot,
            segmentId
        );
        const column: IDocumentSkeletonColumnGroupColumn = {
            ...sourceColumn,
            page,
            parent: group,
        };
        page.parent = column;
        return column;
    });
    return group;
}

export function hydrateDocumentSkeletonPage(
    source: IDocumentSkeletonPagePatch,
    parent?: IDocumentSkeletonCached | IDocumentSkeletonRow | IDocumentSkeletonColumnGroupColumn,
    snapshot?: IDocumentData
): IDocumentSkeletonPage {
    return hydrateDocumentSkeletonPageInternal(source, parent, snapshot, source.segmentId);
}

export function hydrateDocumentSkeletonPagePlaceholder(
    source: IDocumentSkeletonPagePatch,
    parent?: IDocumentSkeletonCached
): IDocumentSkeletonPage {
    const {
        sections: _sections,
        skeDrawings: _skeDrawings,
        skeTables: _skeTables,
        skeColumnGroups: _skeColumnGroups,
        ...geometry
    } = source;
    return {
        ...geometry,
        isLayoutPlaceholder: true,
        sections: [],
        st: -1,
        ed: -1,
        skeDrawings: new Map(),
        skeTables: new Map(),
        skeColumnGroups: new Map(),
        parent,
    };
}

export function hydrateDocumentSkeletonPageMaterializationPlaceholder(
    source: IDocumentSkeletonPagePatch,
    parent?: IDocumentSkeletonCached
): IDocumentSkeletonPage {
    const placeholder = hydrateDocumentSkeletonPagePlaceholder(source, parent);
    delete placeholder.isLayoutPlaceholder;
    placeholder.isMaterializationPlaceholder = true;
    placeholder.st = source.st;
    placeholder.ed = source.ed;
    return placeholder;
}

function hydrateDocumentSkeletonPageInternal(
    source: IDocumentSkeletonPagePatch,
    parent: IDocumentSkeletonCached | IDocumentSkeletonRow | IDocumentSkeletonColumnGroupColumn | undefined,
    snapshot: IDocumentData | undefined,
    resourceSegmentId: string
): IDocumentSkeletonPage {
    const page: IDocumentSkeletonPage = {
        ...source,
        sections: [],
        skeDrawings: new Map(source.skeDrawings.map(([drawingId, drawing]) => [
            drawingId,
            hydrateDrawing(drawing, snapshot, resourceSegmentId),
        ])),
        skeTables: new Map(),
        skeColumnGroups: new Map(),
        parent,
    };
    page.sections = source.sections.map((section) => hydrateSection(section, page));
    page.skeTables = new Map(source.skeTables.map(([tableId, table]) => [
        tableId,
        hydrateTable(table, page, snapshot, resourceSegmentId),
    ]));
    page.skeColumnGroups = new Map(source.skeColumnGroups.map(([groupId, group]) => [
        groupId,
        hydrateColumnGroup(group, page, snapshot, resourceSegmentId),
    ]));
    return page;
}

interface IDocumentSkeletonFlowCursor {
    sectionIndex: number;
    columnIndex: number;
    lineIndex: number;
}

function collectFlowLineEnds(page: IDocumentSkeletonPage): number[] {
    const lineEnds: number[] = [];
    for (const section of page.sections) {
        for (const column of section.columns) {
            for (const line of column.lines) {
                lineEnds.push(line.ed);
            }
        }
    }
    return lineEnds;
}

function countFlowLines(page: IDocumentSkeletonPage): number {
    let lineCount = 0;
    for (const section of page.sections) {
        for (const column of section.columns) {
            lineCount += column.lines.length;
        }
    }
    return lineCount;
}

function collectFlowLineEndsFromCursor(
    page: IDocumentSkeletonPage,
    cursor: IDocumentSkeletonFlowCursor
): number[] {
    const lineEnds: number[] = [];
    for (let sectionIndex = cursor.sectionIndex; sectionIndex < page.sections.length; sectionIndex++) {
        const section = page.sections[sectionIndex];
        const firstColumnIndex = sectionIndex === cursor.sectionIndex ? cursor.columnIndex : 0;
        for (let columnIndex = firstColumnIndex; columnIndex < section.columns.length; columnIndex++) {
            const column = section.columns[columnIndex];
            const firstLineIndex = sectionIndex === cursor.sectionIndex && columnIndex === cursor.columnIndex
                ? cursor.lineIndex
                : 0;
            for (let lineIndex = firstLineIndex; lineIndex < column.lines.length; lineIndex++) {
                lineEnds.push(column.lines[lineIndex].ed);
            }
        }
    }
    return lineEnds;
}

function findFlowLineIndex(lineEnds: number[], offset: number): number {
    const index = lineEnds.findIndex((lineEnd) => lineEnd >= offset);
    return index < 0 ? lineEnds.length : index;
}

function resolveFlowCursor(page: IDocumentSkeletonPage, flowLineIndex: number): IDocumentSkeletonFlowCursor {
    let remaining = flowLineIndex;
    for (let sectionIndex = 0; sectionIndex < page.sections.length; sectionIndex++) {
        const section = page.sections[sectionIndex];
        for (let columnIndex = 0; columnIndex < section.columns.length; columnIndex++) {
            const lineCount = section.columns[columnIndex].lines.length;
            if (remaining < lineCount) {
                return { sectionIndex, columnIndex, lineIndex: remaining };
            }
            remaining -= lineCount;
        }
    }

    const sectionIndex = Math.max(0, page.sections.length - 1);
    const section = page.sections[sectionIndex];
    const columnIndex = Math.max(0, (section?.columns.length ?? 1) - 1);
    return {
        sectionIndex,
        columnIndex,
        lineIndex: section?.columns[columnIndex]?.lines.length ?? 0,
    };
}

function serializePageGeometry(source: IDocumentSkeletonPage): IDocumentSkeletonPageGeometryPatch {
    const serialized = withoutParent(source);
    const {
        sections: _sections,
        skeDrawings: _skeDrawings,
        skeTables: _skeTables,
        skeColumnGroups: _skeColumnGroups,
        ...page
    } = serialized;
    return page;
}

/**
 * Serializes only the changed suffix of a continuous document's logical page.
 * The boundary line is deliberately republished because paragraph spacing can
 * alter it when the next block is appended.
 */
export function serializeDocumentSkeletonContinuousBlock(
    currentPage: IDocumentSkeletonPage,
    previousSnapshot: IDocumentSkeletonContinuousSnapshot | null,
    replacementOffset?: number,
    omitResourceSources = false
): { block: IDocumentSkeletonContinuousBlockPatch; snapshot: IDocumentSkeletonContinuousSnapshot } {
    const previousLineCount = previousSnapshot?.lineEnds.length ?? 0;
    let currentLineEnds: number[];
    let replacementLineIndex: number;
    let cursor: IDocumentSkeletonFlowCursor;
    if (previousSnapshot != null && replacementOffset == null) {
        replacementLineIndex = Math.max(0, Math.min(previousLineCount, countFlowLines(currentPage)) - 1);
        cursor = resolveFlowCursor(currentPage, replacementLineIndex);
        const appendedLineEnds = collectFlowLineEndsFromCursor(currentPage, cursor);
        currentLineEnds = previousSnapshot.lineEnds;
        currentLineEnds.splice(
            replacementLineIndex,
            currentLineEnds.length - replacementLineIndex,
            ...appendedLineEnds
        );
    } else {
        currentLineEnds = collectFlowLineEnds(currentPage);
        const replacementStart = replacementOffset ?? 0;
        replacementLineIndex = previousSnapshot == null
            ? 0
            : Math.min(
                findFlowLineIndex(previousSnapshot.lineEnds, replacementStart),
                findFlowLineIndex(currentLineEnds, replacementStart)
            );
        cursor = resolveFlowCursor(currentPage, replacementLineIndex);
    }
    const section = currentPage.sections[cursor.sectionIndex];
    const column = section?.columns[cursor.columnIndex];
    if (section == null || column == null) {
        throw new Error('Continuous document layout requires at least one section and column.');
    }

    const serializedSection = withoutParent(section);
    const serializedColumn = withoutParent(column);
    const { columns: _columns, ...sectionGeometry } = serializedSection;
    const { lines: _lines, ...columnGeometry } = serializedColumn;

    const snapshot: IDocumentSkeletonContinuousSnapshot = {
        height: currentPage.height,
        lineEnds: currentLineEnds,
    };

    return {
        snapshot,
        block: {
            pageIndex: 0,
            page: serializePageGeometry(currentPage),
            flow: {
                sectionIndex: cursor.sectionIndex,
                section: sectionGeometry,
                columnIndex: cursor.columnIndex,
                column: columnGeometry,
                lineIndex: cursor.lineIndex,
                lines: column.lines.slice(cursor.lineIndex).map(serializeDocumentSkeletonLine),
                trailingColumns: section.columns.slice(cursor.columnIndex + 1).map(serializeColumn),
                trailingSections: currentPage.sections.slice(cursor.sectionIndex + 1).map(serializeSection),
            },
            skeDrawings: [...currentPage.skeDrawings].map(([drawingId, drawing]) => [
                drawingId,
                serializeDrawing(drawing, omitResourceSources),
            ]),
            skeTables: [...currentPage.skeTables].map(([tableId, table]) => [
                tableId,
                serializeTable(table, omitResourceSources),
            ]),
            skeColumnGroups: [...currentPage.skeColumnGroups].map(([groupId, group]) => [
                groupId,
                serializeColumnGroup(group, omitResourceSources),
            ]),
            previousHeight: previousSnapshot?.height ?? 0,
            heightDelta: currentPage.height - (previousSnapshot?.height ?? 0),
        },
    };
}

export function applyDocumentSkeletonContinuousBlock(
    target: IDocumentSkeletonCached,
    patch: IDocumentSkeletonContinuousBlockPatch,
    snapshot?: IDocumentData
): IDocumentSkeletonPage {
    const { flow } = patch;
    let page = target.pages[patch.pageIndex];
    if (page == null) {
        page = hydrateDocumentSkeletonPage({
            ...patch.page,
            sections: [{
                ...flow.section,
                columns: [{
                    ...flow.column,
                    lines: flow.lines,
                }, ...flow.trailingColumns],
            }, ...flow.trailingSections],
            skeDrawings: patch.skeDrawings,
            skeTables: patch.skeTables,
            skeColumnGroups: patch.skeColumnGroups,
        }, target, snapshot);
        target.pages[patch.pageIndex] = page;
        return page;
    }

    const sections = page.sections;
    const existingSection = sections[flow.sectionIndex];
    if (existingSection == null) {
        sections.splice(flow.sectionIndex, sections.length - flow.sectionIndex, hydrateSection({
            ...flow.section,
            columns: [{
                ...flow.column,
                lines: flow.lines,
            }, ...flow.trailingColumns],
        }, page), ...flow.trailingSections.map((section) => hydrateSection(section, page)));
    } else {
        const columns = existingSection.columns;
        const existingColumn = columns[flow.columnIndex];
        Object.assign(existingSection, flow.section, { columns, parent: page });
        if (existingColumn == null) {
            columns.splice(flow.columnIndex, columns.length - flow.columnIndex, hydrateColumn({
                ...flow.column,
                lines: flow.lines,
            }, existingSection), ...flow.trailingColumns.map((column) => hydrateColumn(column, existingSection)));
        } else {
            const lines = existingColumn.lines;
            Object.assign(existingColumn, flow.column, { lines, parent: existingSection });
            lines.splice(
                flow.lineIndex,
                lines.length - flow.lineIndex,
                ...flow.lines.map((line) => hydrateDocumentSkeletonLine(line, existingColumn))
            );
            columns.splice(
                flow.columnIndex + 1,
                columns.length - flow.columnIndex - 1,
                ...flow.trailingColumns.map((column) => hydrateColumn(column, existingSection))
            );
        }
        sections.splice(
            flow.sectionIndex + 1,
            sections.length - flow.sectionIndex - 1,
            ...flow.trailingSections.map((section) => hydrateSection(section, page))
        );
    }

    Object.assign(page, patch.page, {
        sections,
        skeDrawings: new Map(patch.skeDrawings.map(([drawingId, drawing]) => [
            drawingId,
            hydrateDrawing(drawing, snapshot, page.segmentId),
        ])),
        skeTables: new Map(patch.skeTables.map(([tableId, table]) => [
            tableId,
            hydrateTable(table, page, snapshot, page.segmentId),
        ])),
        skeColumnGroups: new Map(
            patch.skeColumnGroups.map(([groupId, group]) => [
                groupId,
                hydrateColumnGroup(group, page, snapshot, page.segmentId),
            ])
        ),
        parent: target,
    });
    return page;
}
