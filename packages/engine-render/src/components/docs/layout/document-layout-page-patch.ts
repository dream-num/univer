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
import { Tools } from '@univerjs/core';
import type {
    IDocumentSkeletonCached,
    IDocumentSkeletonColumn,
    IDocumentSkeletonColumnGroup,
    IDocumentSkeletonColumnGroupColumn,
    IDocumentSkeletonDivide,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonGlyph,
    IDocumentSkeletonLine,
    IDocumentSkeletonNote,
    IDocumentSkeletonNoteDecoration,
    IDocumentSkeletonPage,
    IDocumentSkeletonRow,
    IDocumentSkeletonSection,
    IDocumentSkeletonTable,
} from '../../../basics/i-document-skeleton-cached';
import { resolveTableCellSpacing } from './table-cell-spacing';

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
    resolvedTableColumns?: ITable['tableColumns'];
}

export interface IDocumentSkeletonColumnGroupColumnPatch extends Omit<IDocumentSkeletonColumnGroupColumn, 'page' | 'parent'> {
    page: IDocumentSkeletonPagePatch;
}

export interface IDocumentSkeletonColumnGroupPatch extends Omit<IDocumentSkeletonColumnGroup, 'columns' | 'parent'> {
    columns: IDocumentSkeletonColumnGroupColumnPatch[];
}

export interface IDocumentSkeletonPagePatch extends Omit<
    IDocumentSkeletonPage,
    'sections' | 'skeDrawings' | 'skeTables' | 'skeColumnGroups' | 'notes' | 'noteDecorations' | 'parent'
> {
    sections: IDocumentSkeletonSectionPatch[];
    skeDrawings: Array<[string, IDocumentSkeletonDrawingPatch]>;
    skeTables: Array<[string, IDocumentSkeletonTablePatch]>;
    skeColumnGroups: Array<[string, IDocumentSkeletonColumnGroupPatch]>;
    noteDecorations?: Array<Omit<IDocumentSkeletonNoteDecoration, 'page'> & { page: IDocumentSkeletonPagePatch }>;
    notes?: Array<Omit<IDocumentSkeletonNote, 'page' | 'parent'> & { page: IDocumentSkeletonPagePatch }>;
}

export type IDocumentSkeletonPageGeometryPatch = Omit<
    IDocumentSkeletonPagePatch,
    'sections' | 'skeDrawings' | 'skeTables' | 'skeColumnGroups' | 'notes' | 'noteDecorations'
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
    /** The first patch may extend a complete layout previously applied by Main. */
    baseLayoutVersion?: string;
    completedLayoutVersion?: string;
    /** Present for a table delta. The listed IDs are the exact resulting order. */
    tableOrder?: string[];
}

export interface IDocumentSkeletonContinuousSnapshot {
    height: number;
    lineCount: number;
    tables?: Map<string, IDocumentSkeletonTable>;
    usesTableDelta: boolean;
    baselineSections?: IDocumentSkeletonSectionPatch[];
}

export interface IDocumentSkeletonContinuousBaseline {
    version: string;
    height: number;
    sections: IDocumentSkeletonSectionPatch[];
    tables: Map<string, IDocumentSkeletonTable>;
}

interface IContinuousBlockOptions {
    base?: IDocumentSkeletonContinuousBaseline;
    trackBaseline?: boolean;
    complete?: boolean;
    /** Detached comparison geometry usable for the new snapshot, independent of wire deltas. */
    captureFrom?: IDocumentSkeletonContinuousBaseline;
}

function withoutParent<T extends { parent?: unknown }>(value: T): Omit<T, 'parent'> {
    const { parent: _parent, ...copy } = value;
    return copy;
}

function replaceArrayTail<T>(target: T[], start: number, replacement: T[]): void {
    // Keep the array identity without spreading a document-sized list into call arguments.
    const offset = Math.min(start, target.length);
    target.length = offset + replacement.length;
    for (let index = 0; index < replacement.length; index++) {
        target[offset + index] = replacement[index];
    }
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
        ...(omitResourceSources ? { resolvedTableColumns: tableSource.tableColumns } : {}),
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
    const { notes, noteDecorations, ...geometry } = withoutParent(source);
    return {
        ...geometry,
        sections: source.sections.map(serializeSection),
        ...(noteDecorations == null
            ? {}
            : {
                noteDecorations: noteDecorations.map((decoration) => ({ ...decoration, page: serializeDocumentSkeletonPage(decoration.page, omitResourceSources) })),
            }),
        ...(notes == null
            ? {}
            : {
                notes: notes.map((note) => ({ ...withoutParent(note), page: serializeDocumentSkeletonPage(note.page, omitResourceSources) })),
            }),
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
    return snapshot.headers?.[segmentId] ?? snapshot.footers?.[segmentId] ?? snapshot.notes?.[segmentId] ?? snapshot;
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
    const resolved = resolveTableCellSpacing(tableSource, snapshot);
    return source.resolvedTableColumns == null || Tools.diffValue(source.resolvedTableColumns, resolved.tableColumns)
        ? resolved
        : { ...resolved, tableColumns: source.resolvedTableColumns };
}

function hydrateTable(
    source: IDocumentSkeletonTablePatch,
    parent: IDocumentSkeletonPage | undefined,
    snapshot: IDocumentData | undefined,
    segmentId: string
): IDocumentSkeletonTable {
    const tableSource = requireTableSource(source, snapshot, segmentId);
    const {
        tableSource: _tableSource,
        tableSourceId: _tableSourceId,
        resolvedTableColumns: _resolvedTableColumns,
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
        notes: _notes,
        noteDecorations: _noteDecorations,
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
    const { notes, noteDecorations, ...geometry } = source;
    const page: IDocumentSkeletonPage = {
        ...geometry,
        sections: [],
        ...(noteDecorations == null
            ? {}
            : {
                noteDecorations: noteDecorations.map((decoration) => ({
                    ...decoration,
                    page: hydrateDocumentSkeletonPageInternal(decoration.page, undefined, snapshot, decoration.page.segmentId),
                })),
            }),
        ...(notes == null
            ? {}
            : {
                notes: notes.map((note) => ({
                    ...note,
                    page: hydrateDocumentSkeletonPageInternal(note.page, undefined, snapshot, note.noteId),
                })),
            }),
        skeDrawings: new Map(source.skeDrawings.map(([drawingId, drawing]) => [
            drawingId,
            hydrateDrawing(drawing, snapshot, resourceSegmentId),
        ])),
        skeTables: new Map(),
        skeColumnGroups: new Map(),
        parent,
    };
    page.sections = source.sections.map((section) => hydrateSection(section, page));
    for (const note of page.notes ?? []) {
        note.parent = page;
        note.page.parent = note;
    }
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

export interface IDocumentSkeletonFlowCursor {
    sectionIndex: number;
    columnIndex: number;
    lineIndex: number;
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
        notes: _notes,
        noteDecorations: _noteDecorations,
        skeDrawings: _skeDrawings,
        skeTables: _skeTables,
        skeColumnGroups: _skeColumnGroups,
        ...page
    } = serialized;
    return page;
}

const MAX_PUBLICATION_COMPARISON_DEPTH = 64;

// Compare skeleton geometry before serialization so unchanged tables never
// allocate a second tree of wire objects. Only actual owner back-references
// are omitted. Rendering inputs such as table and row sources still compare.
export function compareLayoutGeometry(
    left: unknown,
    right: unknown,
    leftOwner?: unknown,
    rightOwner?: unknown,
    depth = 0
): boolean {
    if (Object.is(left, right)) {
        return true;
    }
    if (depth >= MAX_PUBLICATION_COMPARISON_DEPTH || left == null || right == null ||
        typeof left !== 'object' || typeof right !== 'object') {
        return false;
    }
    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
            return false;
        }
        const previous = left as unknown as Record<string, unknown>;
        const next = right as unknown as Record<string, unknown>;
        const keys = Object.keys(previous);
        return keys.length === Object.keys(next).length && keys.every((key) =>
            Object.prototype.hasOwnProperty.call(next, key) &&
            compareLayoutGeometry(previous[key], next[key], leftOwner, rightOwner, depth + 1)
        );
    }
    if (left instanceof Map || right instanceof Map) {
        if (!(left instanceof Map) || !(right instanceof Map) || left.size !== right.size) {
            return false;
        }
        const rightEntries = right.entries();
        for (const [key, value] of left) {
            const entry = rightEntries.next().value;
            if (entry == null || !Object.is(key, entry[0]) ||
                !compareLayoutGeometry(value, entry[1], leftOwner, rightOwner, depth + 1)) {
                return false;
            }
        }
        return true;
    }
    if (Object.prototype.toString.call(left) !== '[object Object]' || Object.prototype.toString.call(right) !== '[object Object]') {
        return false;
    }

    const previous = left as Record<string, unknown>;
    const next = right as Record<string, unknown>;
    const keys = Object.keys(previous);
    const nextKeys = Object.keys(next);
    const leftBackReference = leftOwner != null && previous.parent === leftOwner;
    const rightBackReference = rightOwner != null && next.parent === rightOwner;
    const skipParent = (leftBackReference || rightBackReference) &&
        (leftBackReference || previous.parent == null) && (rightBackReference || next.parent == null);
    const previousSize = keys.length - Number(skipParent && Object.prototype.hasOwnProperty.call(previous, 'parent'));
    const nextSize = nextKeys.length - Number(skipParent && Object.prototype.hasOwnProperty.call(next, 'parent'));
    return previousSize === nextSize && keys.every((key) =>
        (skipParent && key === 'parent') || (Object.prototype.hasOwnProperty.call(next, key) &&
            compareLayoutGeometry(previous[key], next[key], previous, next, depth + 1))
    );
}

function getContinuousPrefixCursor(
    baseline: IDocumentSkeletonContinuousBaseline,
    current: IDocumentSkeletonPage
): IDocumentSkeletonFlowCursor {
    // Anything before the selected section or column is retained verbatim, so
    // compare the full geometry there. The patch updates the selected section
    // and column metadata even if all of their leading lines can be reused.
    const firstChangedSection = current.sections.findIndex((section, index) =>
        !compareLayoutGeometry(baseline.sections[index], section, baseline, current)
    );
    const sectionIndex = firstChangedSection < 0 ? Math.max(0, current.sections.length - 1) : firstChangedSection;
    const columns = current.sections[sectionIndex]?.columns ?? [];
    const previousColumns = baseline.sections[sectionIndex]?.columns ?? [];
    const firstChangedColumn = columns.findIndex((column, index) =>
        !compareLayoutGeometry(previousColumns[index], column, baseline.sections[sectionIndex], current.sections[sectionIndex])
    );
    const columnIndex = firstChangedColumn < 0 ? Math.max(0, columns.length - 1) : firstChangedColumn;
    const lines = columns[columnIndex]?.lines ?? [];
    const previousLines = previousColumns[columnIndex]?.lines ?? [];
    let equalLines = 0;
    while (equalLines < previousLines.length && equalLines < lines.length &&
        compareLayoutGeometry(previousLines[equalLines], lines[equalLines], previousColumns[columnIndex], columns[columnIndex])) {
        equalLines++;
    }
    // Republish the last retained line since it borders the changed flow.
    return { sectionIndex, columnIndex, lineIndex: Math.max(0, equalLines - 1) };
}

function recordContinuousBaselineFlow(
    flow: IDocumentSkeletonContinuousFlowPatch,
    previousSections: IDocumentSkeletonSectionPatch[] | undefined,
    base: IDocumentSkeletonContinuousBaseline | undefined
): IDocumentSkeletonSectionPatch[] {
    // Own the prefix arrays once, while sharing detached geometry with the
    // acknowledged version. Each publication replaces only its changed suffix.
    const sections = previousSections ?? base?.sections.slice(0, flow.sectionIndex + 1).map((section) => ({
        ...section,
        columns: section.columns.map((column) => ({ ...column, lines: column.lines.slice() })),
    })) ?? [];
    const detached = structuredClone(flow);
    const columns = sections[flow.sectionIndex]?.columns ?? [];
    const lines = columns[flow.columnIndex]?.lines ?? [];
    replaceArrayTail(lines, flow.lineIndex, detached.lines);
    replaceArrayTail(columns, flow.columnIndex, [{ ...detached.column, lines }, ...detached.trailingColumns]);
    replaceArrayTail(sections, flow.sectionIndex, [{ ...detached.section, columns }, ...detached.trailingSections]);
    return sections;
}

function collectContinuousTables(
    page: IDocumentSkeletonPage,
    previous: Map<string, IDocumentSkeletonTable> | undefined,
    omitResourceSources: boolean,
    usesTableDelta: boolean,
    validateBaseline: boolean
): {
    tables: Map<string, IDocumentSkeletonTable> | undefined;
    patches: IDocumentSkeletonContinuousBlockPatch['skeTables'];
} {
    const tables = new Map<string, IDocumentSkeletonTable>();
    const patches: IDocumentSkeletonContinuousBlockPatch['skeTables'] = [];
    let canTrackTables = true;
    for (const [key, table] of page.skeTables) {
        const prior = previous?.get(key);
        // Full intermediate packets still serialize the current table. The
        // private draft can reuse its first copy until final validation.
        const unchanged = prior != null && (!validateBaseline || compareLayoutGeometry(prior, table, prior.parent, page));
        if (unchanged) {
            tables.set(key, prior);
        } else if (canTrackTables) {
            try {
                // Retain only top-level table geometry and its painting inputs.
                // Serializing the table drops the parent link to the rest of the document.
                const detached = structuredClone(serializeTable(table, false));
                tables.set(key, hydrateTable(detached, undefined, undefined, page.segmentId));
            } catch (error) {
                if (!(error instanceof Error) || error.name !== 'DataCloneError') {
                    throw error;
                }
                canTrackTables = false;
            }
        }
        if (!usesTableDelta || !unchanged) {
            patches.push([key, serializeTable(table, omitResourceSources)]);
        }
    }
    return { tables: canTrackTables ? tables : undefined, patches };
}

export function serializeContinuousFlow(
    currentPage: IDocumentSkeletonPage,
    cursor: IDocumentSkeletonFlowCursor
): IDocumentSkeletonContinuousFlowPatch {
    const section = currentPage.sections[cursor.sectionIndex];
    const column = section?.columns[cursor.columnIndex];
    if (section == null || column == null) {
        throw new Error('Continuous document layout requires at least one section and column.');
    }

    const serializedSection = withoutParent(section);
    const serializedColumn = withoutParent(column);
    const { columns: _columns, ...sectionGeometry } = serializedSection;
    const { lines: _lines, ...columnGeometry } = serializedColumn;

    return {
        sectionIndex: cursor.sectionIndex,
        section: sectionGeometry,
        columnIndex: cursor.columnIndex,
        column: columnGeometry,
        lineIndex: cursor.lineIndex,
        lines: column.lines.slice(cursor.lineIndex).map(serializeDocumentSkeletonLine),
        trailingColumns: section.columns.slice(cursor.columnIndex + 1).map(serializeColumn),
        trailingSections: currentPage.sections.slice(cursor.sectionIndex + 1).map(serializeSection),
    };
}

/**
 * Serializes the first prefix of a continuous layout generation, then its
 * changed suffix. The boundary line is deliberately republished because
 * paragraph spacing can alter it when the next block is appended.
 */
export function serializeDocumentSkeletonContinuousBlock(
    currentPage: IDocumentSkeletonPage,
    previousSnapshot: IDocumentSkeletonContinuousSnapshot | null,
    omitResourceSources = false,
    options: IContinuousBlockOptions = {}
): { block: IDocumentSkeletonContinuousBlockPatch; snapshot: IDocumentSkeletonContinuousSnapshot } {
    const baseline = options.base;
    const lineCount = countFlowLines(currentPage);
    const cursor = previousSnapshot == null && baseline != null
        ? getContinuousPrefixCursor(baseline, currentPage)
        : resolveFlowCursor(currentPage, Math.max(0, Math.min(previousSnapshot?.lineCount ?? 0, lineCount) - 1));
    const flow = serializeContinuousFlow(currentPage, cursor);
    const wantsBaseline = options.trackBaseline && typeof structuredClone === 'function' &&
        (previousSnapshot == null || previousSnapshot.baselineSections != null);
    const captureBase = wantsBaseline && previousSnapshot == null ? baseline ?? options.captureFrom : undefined;
    const previousTables = previousSnapshot?.tables ?? baseline?.tables ?? captureBase?.tables;
    const usesTableDelta = previousTables != null && (baseline != null || previousSnapshot?.usesTableDelta === true);
    const tableHistory = wantsBaseline || usesTableDelta
        ? collectContinuousTables(currentPage, previousTables, omitResourceSources, usesTableDelta, usesTableDelta || options.complete === true)
        : undefined;
    let baselineSections: IDocumentSkeletonSectionPatch[] | undefined;
    if (wantsBaseline && tableHistory?.tables != null) {
        try {
            const captureFlow = captureBase != null && captureBase !== baseline
                ? serializeContinuousFlow(currentPage, getContinuousPrefixCursor(captureBase, currentPage))
                : flow;
            baselineSections = recordContinuousBaselineFlow(captureFlow, previousSnapshot?.baselineSections, captureBase);
        } catch (error) {
            if (!(error instanceof Error) || error.name !== 'DataCloneError') {
                throw error;
            }
        }
    }
    const previousHeight = previousSnapshot?.height ?? baseline?.height ?? 0;
    const snapshot: IDocumentSkeletonContinuousSnapshot = {
        height: currentPage.height,
        lineCount,
        tables: tableHistory?.tables,
        usesTableDelta,
        baselineSections,
    };

    return {
        snapshot,
        block: {
            pageIndex: 0,
            page: serializePageGeometry(currentPage),
            flow,
            skeDrawings: [...currentPage.skeDrawings].map(([drawingId, drawing]) => [
                drawingId,
                serializeDrawing(drawing, omitResourceSources),
            ]),
            skeTables: tableHistory?.patches ?? [...currentPage.skeTables].map(([tableId, table]) => [
                tableId,
                serializeTable(table, omitResourceSources),
            ]),
            // A missing comparison snapshot affects the next publication only.
            ...(usesTableDelta ? { tableOrder: Array.from(currentPage.skeTables.keys()) } : {}),
            ...(baseline == null ? {} : { baseLayoutVersion: baseline.version }),
            skeColumnGroups: [...currentPage.skeColumnGroups].map(([groupId, group]) => [
                groupId,
                serializeColumnGroup(group, omitResourceSources),
            ]),
            previousHeight,
            heightDelta: currentPage.height - previousHeight,
        },
    };
}

function applyContinuousTablePatch(
    page: IDocumentSkeletonPage,
    patch: IDocumentSkeletonContinuousBlockPatch,
    snapshot: IDocumentData | undefined
): Map<string, IDocumentSkeletonTable> {
    const changedTables = new Map(patch.skeTables.map(([key, table]) => [key, hydrateTable(table, page, snapshot, page.segmentId)]));
    if (patch.tableOrder == null) {
        return changedTables;
    }

    const tables = new Map<string, IDocumentSkeletonTable>();
    for (const key of patch.tableOrder) {
        const table = changedTables.get(key) ?? page.skeTables.get(key);
        if (table == null) {
            throw new Error('Continuous layout table delta is missing retained geometry.');
        }
        tables.set(key, table);
    }
    return tables;
}

/**
 * The foreground layout can stay live while Worker patches advance a separate
 * result. Own the containers we write and borrow untouched geometry until commit.
 */
export function forkContinuousLayoutSkeleton(
    baseline: IDocumentSkeletonCached,
    pageIndex: number
): IDocumentSkeletonCached {
    const skeleton = {
        ...baseline,
        pages: baseline.pages.slice(),
        skeHeaders: new Map([...baseline.skeHeaders].map(([segmentId, pages]) => [segmentId, new Map(pages)])),
        skeFooters: new Map([...baseline.skeFooters].map(([segmentId, pages]) => [segmentId, new Map(pages)])),
    };
    const page = baseline.pages[pageIndex];
    skeleton.pages[pageIndex] = { ...page, sections: page.sections.slice(), parent: skeleton };
    return skeleton;
}

/** Commit ownership of the geometry that the draft borrowed from the baseline. */
export function attachContinuousLayoutGeometry(page: IDocumentSkeletonPage): void {
    for (const section of page.sections) {
        if (section.parent !== page) {
            section.parent = page;
            continue;
        }
        for (const column of section.columns) {
            if (column.parent !== section) {
                column.parent = section;
                continue;
            }
            for (const line of column.lines) {
                line.parent = column;
            }
        }
    }
    for (const table of page.skeTables.values()) {
        table.parent = page;
    }
    for (const group of page.skeColumnGroups.values()) {
        group.parent = page;
    }
}

interface IContinuousBlockApplyOptions {
    staging?: boolean;
    foregroundGeometry?: Pick<IDocumentSkeletonPage, 'skeTables' | 'skeColumnGroups' | 'skeDrawings'>;
}

export function applyDocumentSkeletonContinuousBlock(
    target: IDocumentSkeletonCached,
    patch: IDocumentSkeletonContinuousBlockPatch,
    snapshot?: IDocumentData,
    options: IContinuousBlockApplyOptions = {}
): IDocumentSkeletonPage {
    const { flow } = patch;
    let page = target.pages[patch.pageIndex];
    if (page == null) {
        if (patch.tableOrder != null) {
            throw new Error('Continuous layout table delta requires a baseline page.');
        }
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

    const { foregroundGeometry } = options;
    // Foreground maps can combine retained Main objects and new Worker objects.
    // Give incoming containers their own parent chains before the visible splice.
    if (foregroundGeometry != null) {
        for (const [id, table] of foregroundGeometry.skeTables) {
            if (table.parent !== page) {
                foregroundGeometry.skeTables.set(id, hydrateTable(serializeTable(table, false), page, snapshot, page.segmentId));
            }
        }
        for (const [id, group] of foregroundGeometry.skeColumnGroups) {
            if (group.parent !== page) {
                foregroundGeometry.skeColumnGroups.set(id, hydrateColumnGroup(serializeColumnGroup(group, false), page, snapshot, page.segmentId));
            }
        }
    }
    const geometry = foregroundGeometry ?? {
        skeTables: applyContinuousTablePatch(page, patch, snapshot),
        skeDrawings: new Map(
            patch.skeDrawings.map(([id, drawing]) => [id, hydrateDrawing(drawing, snapshot, page.segmentId)])
        ),
        skeColumnGroups: new Map(
            patch.skeColumnGroups.map(([id, group]) => [id, hydrateColumnGroup(group, page, snapshot, page.segmentId)])
        ),
    };
    const sections = page.sections;
    let existingSection = sections[flow.sectionIndex];
    if (options.staging && existingSection != null && existingSection.parent !== page) {
        existingSection = { ...existingSection, columns: existingSection.columns.slice(), parent: page };
        sections[flow.sectionIndex] = existingSection;
    }
    if (existingSection == null) {
        replaceArrayTail(sections, flow.sectionIndex, [hydrateSection({
            ...flow.section,
            columns: [{
                ...flow.column,
                lines: flow.lines,
            }, ...flow.trailingColumns],
        }, page), ...flow.trailingSections.map((section) => hydrateSection(section, page))]);
    } else {
        const columns = existingSection.columns;
        let existingColumn = columns[flow.columnIndex];
        if (options.staging && existingColumn != null && existingColumn.parent !== existingSection) {
            existingColumn = { ...existingColumn, lines: existingColumn.lines.slice(), parent: existingSection };
            columns[flow.columnIndex] = existingColumn;
        }
        Object.assign(existingSection, flow.section, { columns, parent: page });
        if (existingColumn == null) {
            replaceArrayTail(columns, flow.columnIndex, [hydrateColumn({
                ...flow.column,
                lines: flow.lines,
            }, existingSection), ...flow.trailingColumns.map((column) => hydrateColumn(column, existingSection))]);
        } else {
            const lines = existingColumn.lines;
            Object.assign(existingColumn, flow.column, { lines, parent: existingSection });
            replaceArrayTail(
                lines,
                flow.lineIndex,
                flow.lines.map((line) => hydrateDocumentSkeletonLine(line, existingColumn))
            );
            replaceArrayTail(
                columns,
                flow.columnIndex + 1,
                flow.trailingColumns.map((column) => hydrateColumn(column, existingSection))
            );
        }
        replaceArrayTail(
            sections,
            flow.sectionIndex + 1,
            flow.trailingSections.map((section) => hydrateSection(section, page))
        );
    }

    Object.assign(page, patch.page, {
        sections,
        ...geometry,
        parent: target,
    });
    return page;
}
