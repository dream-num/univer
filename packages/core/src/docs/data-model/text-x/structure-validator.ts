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

import type { ICustomTable, IDocumentBody, IDocumentData, IDocumentNote } from '../../../types/interfaces/i-document-data';
import { CustomRangeType, PositionedObjectLayoutType, TableTextWrapType } from '../../../types/interfaces/i-document-data';
import { DataStreamTreeTokenType } from '../types';
import {
    getBlockRangeInterval,
    getColumnGroupRangeInterval,
    getTableRangeInterval,
    intersectsOperationalIntervals,
} from './build-utils/range-interval';

export type DocStructureIssueCode =
    | 'missing-note'
    | 'invalid-note-reference'
    | 'nested-note'
    | 'invalid-note-body'
    | 'invalid-note-id'
    | 'duplicate-note-reference'
    | 'missing-root-paragraph'
    | 'missing-root-section-break'
    | 'paragraph-token-mismatch'
    | 'duplicate-paragraph-metadata'
    | 'section-break-token-mismatch'
    | 'duplicate-section-break-metadata'
    | 'missing-section-id'
    | 'duplicate-section-id'
    | 'table-start-token-mismatch'
    | 'table-end-token-mismatch'
    | 'missing-table-metadata'
    | 'overlapping-table'
    | 'block-range-token-mismatch'
    | 'missing-block-range-metadata'
    | 'overlapping-block-range'
    | 'unbalanced-block'
    | 'column-group-range-token-mismatch'
    | 'missing-column-group-metadata'
    | 'overlapping-column-group'
    | 'column-group-column-count-mismatch'
    | 'custom-block-token-mismatch'
    | 'missing-custom-block-metadata'
    | 'duplicate-custom-block-metadata'
    | 'empty-column'
    | 'empty-table-cell'
    | 'unbalanced-column-group'
    | 'unbalanced-table';

export interface IDocStructureIssue {
    code: DocStructureIssueCode;
    segmentType: 'body' | 'header' | 'footer' | 'note';
    segmentId?: string;
    index?: number;
    message: string;
}

interface IValidationContext {
    segmentType: IDocStructureIssue['segmentType'];
    segmentId?: string;
}

interface IPairedTokenRanges {
    pairs: Map<number, number>;
    unmatchedEnds: number[];
    unmatchedStarts: number[];
}

interface IDocumentStructuralTokenScan {
    hasRootParagraph: boolean;
    hasRootSectionBreak: boolean;
    tableRanges: IPairedTokenRanges;
    blockRanges: IPairedTokenRanges;
    columnGroupRanges: IPairedTokenRanges;
    customBlockIndexes: Set<number>;
}

const DOCUMENT_STRUCTURAL_TOKEN_PATTERN_SOURCE = `[${[
    DataStreamTreeTokenType.PARAGRAPH,
    DataStreamTreeTokenType.SECTION_BREAK,
    DataStreamTreeTokenType.TABLE_START,
    DataStreamTreeTokenType.TABLE_ROW_START,
    DataStreamTreeTokenType.TABLE_CELL_START,
    DataStreamTreeTokenType.TABLE_CELL_END,
    DataStreamTreeTokenType.TABLE_ROW_END,
    DataStreamTreeTokenType.TABLE_END,
    DataStreamTreeTokenType.COLUMN_GROUP_START,
    DataStreamTreeTokenType.COLUMN_START,
    DataStreamTreeTokenType.COLUMN_END,
    DataStreamTreeTokenType.COLUMN_GROUP_END,
    DataStreamTreeTokenType.BLOCK_START,
    DataStreamTreeTokenType.BLOCK_END,
    DataStreamTreeTokenType.CUSTOM_BLOCK,
].join('')}]`;

function createIssue(
    context: IValidationContext,
    code: DocStructureIssueCode,
    message: string,
    index?: number
): IDocStructureIssue {
    return {
        ...context,
        code,
        index,
        message,
    };
}

function validateMinimumRootSentinels(scan: IDocumentStructuralTokenScan, issues: IDocStructureIssue[], context: IValidationContext) {
    if (!scan.hasRootParagraph) {
        issues.push(createIssue(context, 'missing-root-paragraph', 'Document body must contain at least one paragraph sentinel.'));
    }

    if (!scan.hasRootSectionBreak) {
        issues.push(createIssue(context, 'missing-root-section-break', 'Document body must contain at least one section break sentinel.'));
    }
}

function validateParagraphMetadata(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    const metadataCounts = new Map<number, number>();
    for (const paragraph of body.paragraphs ?? []) {
        if (body.dataStream[paragraph.startIndex] !== DataStreamTreeTokenType.PARAGRAPH) {
            issues.push(createIssue(
                context,
                'paragraph-token-mismatch',
                'Paragraph metadata must point to a paragraph sentinel.',
                paragraph.startIndex
            ));
        } else {
            metadataCounts.set(paragraph.startIndex, (metadataCounts.get(paragraph.startIndex) ?? 0) + 1);
        }
    }

    validatePointMetadataDuplicates(metadataCounts, {
        context,
        duplicateCode: 'duplicate-paragraph-metadata',
        duplicateMessage: 'Paragraph sentinel must have exactly one paragraph metadata entry.',
    }, issues);
}

function validateSectionBreakMetadata(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    const metadataCounts = new Map<number, number>();
    const sectionIds = new Map<string, number>();
    for (const sectionBreak of body.sectionBreaks ?? []) {
        if (!sectionBreak.sectionId) {
            issues.push(createIssue(context, 'missing-section-id', 'Section break metadata must have a stable section id.', sectionBreak.startIndex));
        } else {
            sectionIds.set(sectionBreak.sectionId, (sectionIds.get(sectionBreak.sectionId) ?? 0) + 1);
        }

        if (body.dataStream[sectionBreak.startIndex] !== DataStreamTreeTokenType.SECTION_BREAK) {
            issues.push(createIssue(
                context,
                'section-break-token-mismatch',
                'Section break metadata must point to a section break sentinel.',
                sectionBreak.startIndex
            ));
        } else {
            metadataCounts.set(sectionBreak.startIndex, (metadataCounts.get(sectionBreak.startIndex) ?? 0) + 1);
        }
    }

    validatePointMetadataDuplicates(metadataCounts, {
        context,
        duplicateCode: 'duplicate-section-break-metadata',
        duplicateMessage: 'Section break sentinel must have exactly one section break metadata entry.',
    }, issues);

    for (const [sectionId, count] of sectionIds) {
        if (count > 1) {
            issues.push(createIssue(context, 'duplicate-section-id', `Section id "${sectionId}" must be unique within a document segment.`));
        }
    }
}

function validatePointMetadataDuplicates(
    metadataCounts: Map<number, number>,
    options: {
        context: IValidationContext;
        duplicateCode: DocStructureIssueCode;
        duplicateMessage: string;
    },
    issues: IDocStructureIssue[]
): void {
    for (const [index, count] of metadataCounts) {
        if (count > 1) {
            issues.push(createIssue(options.context, options.duplicateCode, options.duplicateMessage, index));
        }
    }
}

function sortStructuralRanges<T extends { startIndex: number; endIndex: number }>(ranges: readonly T[]): readonly T[] {
    for (let index = 1; index < ranges.length; index++) {
        const previous = ranges[index - 1];
        const current = ranges[index];
        if (
            current.startIndex < previous.startIndex ||
            (current.startIndex === previous.startIndex && current.endIndex < previous.endIndex)
        ) {
            return [...ranges].sort((left, right) =>
                left.startIndex - right.startIndex || left.endIndex - right.endIndex
            );
        }
    }

    return ranges;
}

function createPairedTokenRanges(): IPairedTokenRanges {
    return {
        pairs: new Map(),
        unmatchedEnds: [],
        unmatchedStarts: [],
    };
}

function closeTokenRange(ranges: IPairedTokenRanges, index: number, exclusiveEnd: boolean): void {
    const startIndex = ranges.unmatchedStarts.pop();
    if (startIndex === undefined) {
        ranges.unmatchedEnds.push(index);
        return;
    }

    ranges.pairs.set(startIndex, exclusiveEnd ? index + 1 : index);
}

function scanDocumentStructuralTokens(dataStream: string): IDocumentStructuralTokenScan {
    const scan: IDocumentStructuralTokenScan = {
        hasRootParagraph: false,
        hasRootSectionBreak: false,
        tableRanges: createPairedTokenRanges(),
        blockRanges: createPairedTokenRanges(),
        columnGroupRanges: createPairedTokenRanges(),
        customBlockIndexes: new Set(),
    };

    const tokenPattern = new RegExp(DOCUMENT_STRUCTURAL_TOKEN_PATTERN_SOURCE, 'g');
    for (const match of dataStream.matchAll(tokenPattern)) {
        const index = match.index;
        const token = match[0];
        if (token === DataStreamTreeTokenType.PARAGRAPH) {
            scan.hasRootParagraph = true;
        } else if (token === DataStreamTreeTokenType.SECTION_BREAK) {
            scan.hasRootSectionBreak = true;
        } else if (token === DataStreamTreeTokenType.TABLE_START) {
            scan.tableRanges.unmatchedStarts.push(index);
        } else if (token === DataStreamTreeTokenType.TABLE_END) {
            closeTokenRange(scan.tableRanges, index, true);
        } else if (token === DataStreamTreeTokenType.BLOCK_START) {
            scan.blockRanges.unmatchedStarts.push(index);
        } else if (token === DataStreamTreeTokenType.BLOCK_END) {
            closeTokenRange(scan.blockRanges, index, false);
        } else if (token === DataStreamTreeTokenType.COLUMN_GROUP_START) {
            scan.columnGroupRanges.unmatchedStarts.push(index);
        } else if (token === DataStreamTreeTokenType.COLUMN_GROUP_END) {
            closeTokenRange(scan.columnGroupRanges, index, false);
        } else if (token === DataStreamTreeTokenType.CUSTOM_BLOCK) {
            scan.customBlockIndexes.add(index);
        }
    }

    return scan;
}

function validateTableMetadata(body: IDocumentBody, scan: IDocumentStructuralTokenScan, issues: IDocStructureIssue[], context: IValidationContext) {
    const pairedTables = scan.tableRanges.pairs;
    const metadataStarts = new Set<number>();
    let previousTable: ICustomTable | undefined;

    const tables = sortStructuralRanges(body.tables ?? []);
    for (const table of tables) {
        metadataStarts.add(table.startIndex);
        if (!Number.isInteger(table.startIndex) || body.dataStream[table.startIndex] !== DataStreamTreeTokenType.TABLE_START) {
            issues.push(createIssue(
                context,
                'table-start-token-mismatch',
                'Table startIndex must point to a table start sentinel.',
                table.startIndex
            ));
        }

        if (
            !Number.isInteger(table.endIndex) ||
            table.endIndex <= table.startIndex ||
            table.endIndex > body.dataStream.length ||
            body.dataStream[table.endIndex - 1] !== DataStreamTreeTokenType.TABLE_END ||
            pairedTables.get(table.startIndex) !== table.endIndex
        ) {
            issues.push(createIssue(
                context,
                'table-end-token-mismatch',
                'Table endIndex must be the exclusive boundary immediately after a table end sentinel.',
                table.endIndex
            ));
        }

        if (previousTable && intersectsOperationalIntervals(getTableRangeInterval(previousTable), getTableRangeInterval(table))) {
            issues.push(createIssue(context, 'overlapping-table', 'Table ranges must not overlap.', table.startIndex));
        }
        previousTable = table;
    }

    for (const startIndex of pairedTables.keys()) {
        if (!metadataStarts.has(startIndex)) {
            issues.push(createIssue(context, 'missing-table-metadata', 'Table token range must have a table metadata entry.', startIndex));
        }
    }
}

function validateBlockRangeMetadata(body: IDocumentBody, scan: IDocumentStructuralTokenScan, issues: IDocStructureIssue[], context: IValidationContext) {
    const pairedBlocks = scan.blockRanges;
    for (const index of [...pairedBlocks.unmatchedStarts, ...pairedBlocks.unmatchedEnds]) {
        issues.push(createIssue(context, 'unbalanced-block', 'Block sentinel has no matching boundary.', index));
    }

    const blockRanges = sortStructuralRanges(body.blockRanges ?? []);
    const metadataStarts = new Set<number>();
    let previousBlockRange: (typeof blockRanges)[number] | undefined;
    for (let i = 0; i < blockRanges.length; i++) {
        const blockRange = blockRanges[i];
        metadataStarts.add(blockRange.startIndex);
        if (pairedBlocks.pairs.get(blockRange.startIndex) !== blockRange.endIndex) {
            issues.push(createIssue(
                context,
                'block-range-token-mismatch',
                'Block range must point to its matching block start and end sentinels.',
                blockRange.startIndex
            ));
        }

        if (previousBlockRange && intersectsOperationalIntervals(
            getBlockRangeInterval(previousBlockRange),
            getBlockRangeInterval(blockRange)
        )) {
            issues.push(createIssue(
                context,
                'overlapping-block-range',
                'Block ranges must not overlap or share structural sentinels.',
                blockRange.startIndex
            ));
        }
        previousBlockRange = blockRange;
    }

    for (const startIndex of pairedBlocks.pairs.keys()) {
        if (!metadataStarts.has(startIndex)) {
            issues.push(createIssue(context, 'missing-block-range-metadata', 'Block token range must have a block metadata entry.', startIndex));
        }
    }
}

function validateColumnGroupMetadata(body: IDocumentBody, scan: IDocumentStructuralTokenScan, issues: IDocStructureIssue[], context: IValidationContext) {
    const pairedColumnGroups = scan.columnGroupRanges.pairs;
    const metadataStarts = new Set<number>();
    const columnGroups = sortStructuralRanges(body.columnGroups ?? []);
    let previousColumnGroup: (typeof columnGroups)[number] | undefined;

    for (const columnGroup of columnGroups) {
        metadataStarts.add(columnGroup.startIndex);
        const pairedEndIndex = pairedColumnGroups.get(columnGroup.startIndex);
        if (pairedEndIndex !== columnGroup.endIndex) {
            issues.push(createIssue(
                context,
                'column-group-range-token-mismatch',
                'Column group range must point to its matching start and end sentinels.',
                columnGroup.startIndex
            ));
        }
        if (previousColumnGroup && intersectsOperationalIntervals(
            getColumnGroupRangeInterval(previousColumnGroup),
            getColumnGroupRangeInterval(columnGroup)
        )) {
            issues.push(createIssue(context, 'overlapping-column-group', 'Column group ranges must not overlap.', columnGroup.startIndex));
        }
        previousColumnGroup = columnGroup;

        if (Array.isArray(columnGroup.columns)) {
            let streamColumnCount = 0;
            const scanEnd = pairedEndIndex ?? columnGroup.endIndex;
            for (let index = columnGroup.startIndex + 1; index < scanEnd; index++) {
                if (body.dataStream[index] === DataStreamTreeTokenType.COLUMN_START) {
                    streamColumnCount++;
                }
            }
            if (streamColumnCount !== columnGroup.columns.length) {
                issues.push(createIssue(
                    context,
                    'column-group-column-count-mismatch',
                    'Column group metadata column count must match the data stream.',
                    columnGroup.startIndex
                ));
            }
        }
    }

    for (const startIndex of pairedColumnGroups.keys()) {
        if (!metadataStarts.has(startIndex)) {
            issues.push(createIssue(context, 'missing-column-group-metadata', 'Column group token range must have a metadata entry.', startIndex));
        }
    }
}

function validateCustomBlockMetadata(body: IDocumentBody, scan: IDocumentStructuralTokenScan, issues: IDocStructureIssue[], context: IValidationContext) {
    const metadataCounts = new Map<number, number>();
    const customBlocks = [...(body.customBlocks ?? []), ...(body.docxRawCustomBlocks ?? [])];
    for (const customBlock of customBlocks) {
        const { startIndex } = customBlock;
        if (!Number.isInteger(startIndex) || body.dataStream[startIndex] !== DataStreamTreeTokenType.CUSTOM_BLOCK) {
            issues.push(createIssue(
                context,
                'custom-block-token-mismatch',
                'Custom block startIndex must point to a custom block sentinel.',
                startIndex
            ));
            continue;
        }

        metadataCounts.set(startIndex, (metadataCounts.get(startIndex) ?? 0) + 1);
    }

    validatePointMetadataDuplicates(metadataCounts, {
        context,
        duplicateCode: 'duplicate-custom-block-metadata',
        duplicateMessage: 'Custom block sentinel must have exactly one custom block metadata entry.',
    }, issues);

    for (const index of scan.customBlockIndexes) {
        if (!metadataCounts.has(index)) {
            issues.push(createIssue(
                context,
                'missing-custom-block-metadata',
                'Custom block sentinel must have a custom block metadata entry.',
                index
            ));
        }
    }
}

function validateStructuralContainers(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    const columnGroupStack: number[] = [];
    const columnStack: Array<{ startIndex: number; hasChild: boolean }> = [];
    const tableStack: number[] = [];
    const tableRowStack: number[] = [];
    const tableCellStack: Array<{ startIndex: number; hasParagraph: boolean; hasSectionBreak: boolean }> = [];

    const tokenPattern = new RegExp(DOCUMENT_STRUCTURAL_TOKEN_PATTERN_SOURCE, 'g');
    for (const match of body.dataStream.matchAll(tokenPattern)) {
        const i = match.index;
        const char = match[0];
        const column = columnStack[columnStack.length - 1];
        const cell = tableCellStack[tableCellStack.length - 1];

        if (char === DataStreamTreeTokenType.PARAGRAPH) {
            if (column) {
                column.hasChild = true;
            }

            if (cell) {
                cell.hasParagraph = true;
            }
        } else if (char === DataStreamTreeTokenType.SECTION_BREAK) {
            if (column) {
                column.hasChild = true;
            }

            if (cell) {
                cell.hasSectionBreak = true;
            }
        } else if (char === DataStreamTreeTokenType.COLUMN_GROUP_START) {
            columnGroupStack.push(i);
        } else if (char === DataStreamTreeTokenType.COLUMN_START) {
            columnStack.push({ startIndex: i, hasChild: false });
        } else if (char === DataStreamTreeTokenType.COLUMN_END) {
            const closedColumn = columnStack.pop();
            if (!closedColumn) {
                issues.push(createIssue(context, 'unbalanced-column-group', 'Column end token has no matching column start.', i));
            } else if (!closedColumn.hasChild) {
                issues.push(createIssue(context, 'empty-column', 'Column must contain at least one paragraph or section child.', closedColumn.startIndex));
            }
        } else if (char === DataStreamTreeTokenType.COLUMN_GROUP_END) {
            if (columnStack.length > 0 || columnGroupStack.length === 0) {
                issues.push(createIssue(context, 'unbalanced-column-group', 'Column group closes while a column is still open.', i));
                columnStack.length = 0;
            } else {
                columnGroupStack.pop();
            }
        } else if (char === DataStreamTreeTokenType.TABLE_START) {
            tableStack.push(i);
        } else if (char === DataStreamTreeTokenType.TABLE_ROW_START) {
            tableRowStack.push(i);
        } else if (char === DataStreamTreeTokenType.TABLE_CELL_START) {
            tableCellStack.push({ startIndex: i, hasParagraph: false, hasSectionBreak: false });
        } else if (char === DataStreamTreeTokenType.TABLE_CELL_END) {
            const closedCell = tableCellStack.pop();
            if (!closedCell) {
                issues.push(createIssue(context, 'unbalanced-table', 'Table cell end token has no matching start.', i));
            } else if (!closedCell.hasParagraph || !closedCell.hasSectionBreak) {
                issues.push(createIssue(context, 'empty-table-cell', 'Table cell must contain a paragraph and section break child.', closedCell.startIndex));
            }
        } else if (char === DataStreamTreeTokenType.TABLE_ROW_END) {
            if (tableCellStack.length > 0 || tableRowStack.length === 0) {
                issues.push(createIssue(context, 'unbalanced-table', 'Table row closes while a cell is still open.', i));
                tableCellStack.length = 0;
            } else {
                tableRowStack.pop();
            }
        } else if (char === DataStreamTreeTokenType.TABLE_END) {
            if (tableCellStack.length > 0 || tableRowStack.length > 0 || tableStack.length === 0) {
                issues.push(createIssue(context, 'unbalanced-table', 'Table closes while a row or cell is still open.', i));
                tableCellStack.length = 0;
                tableRowStack.length = 0;
            } else {
                tableStack.pop();
            }
        }
    }

    if (columnGroupStack.length > 0 || columnStack.length > 0) {
        issues.push(createIssue(context, 'unbalanced-column-group', 'Column group or column token is not closed.', body.dataStream.length));
    }

    if (tableStack.length > 0 || tableRowStack.length > 0 || tableCellStack.length > 0) {
        issues.push(createIssue(context, 'unbalanced-table', 'Table, row, or cell token is not closed.', body.dataStream.length));
    }
}

export function validateDocBodyStructure(
    body: IDocumentBody,
    context: IValidationContext = { segmentType: 'body' }
): IDocStructureIssue[] {
    const issues: IDocStructureIssue[] = [];
    const scan = scanDocumentStructuralTokens(body.dataStream);

    validateMinimumRootSentinels(scan, issues, context);
    validateParagraphMetadata(body, issues, context);
    validateSectionBreakMetadata(body, issues, context);
    validateTableMetadata(body, scan, issues, context);
    validateBlockRangeMetadata(body, scan, issues, context);
    validateColumnGroupMetadata(body, scan, issues, context);
    validateCustomBlockMetadata(body, scan, issues, context);
    validateStructuralContainers(body, issues, context);

    if (context.segmentType === 'header' || context.segmentType === 'footer') {
        for (const range of body.customRanges ?? []) {
            if ((range.rangeType === CustomRangeType.FOOTNOTE || range.rangeType === CustomRangeType.ENDNOTE)) {
                issues.push(createIssue(context, 'invalid-note-reference', 'Note references are only supported in the document body.', range.startIndex));
            }
        }
    }

    return issues;
}

function validateNoteBody(noteId: string, note: IDocumentNote): IDocStructureIssue[] {
    const context: IValidationContext = { segmentType: 'note', segmentId: noteId };
    const issues = validateDocBodyStructure(note.body, context);
    if (note.noteId !== noteId || noteId.length === 0 || !['footnote', 'endnote'].includes(note.type)) {
        issues.push({ ...context, code: 'invalid-note-id', message: 'Note identity must match its segment key.' });
    }
    if (note.body.customRanges?.some((range) => (range.rangeType === CustomRangeType.FOOTNOTE || range.rangeType === CustomRangeType.ENDNOTE))) {
        issues.push({ ...context, code: 'nested-note', message: 'A note cannot contain another note reference.' });
    }
    const rootSections = note.body.sectionBreaks?.filter((section) =>
        !note.body.tables?.some((table) => section.startIndex >= table.startIndex && section.startIndex < table.endIndex)) ?? [];
    const hasPageSetup = rootSections.some((section) => Object.keys(section).some((key) => key !== 'sectionId' && key !== 'startIndex'));
    const hasFloatingDrawings = Object.values(note.drawings ?? {}).some((drawing) => drawing.layoutType !== PositionedObjectLayoutType.INLINE);
    const hasFloatingTables = Object.values(note.tableSource ?? {}).some((table) => table.textWrap === TableTextWrapType.WRAP);
    if (rootSections.length > 1 || hasPageSetup || note.body.columnGroups?.length || hasFloatingDrawings || hasFloatingTables) {
        issues.push({ ...context, code: 'invalid-note-body', message: 'Notes support paragraphs, inline drawings and flow tables without independent sections or columns.' });
    }
    return issues;
}

export function validateDocumentStructure(snapshot: Pick<IDocumentData, 'body' | 'headers' | 'footers' | 'notes'>): IDocStructureIssue[] {
    const issues: IDocStructureIssue[] = [];

    if (snapshot.body) {
        issues.push(...validateDocBodyStructure(snapshot.body, { segmentType: 'body' }));
        const referencedNotes = new Set<string>();
        for (const range of snapshot.body.customRanges ?? []) {
            if ((range.rangeType !== CustomRangeType.FOOTNOTE && range.rangeType !== CustomRangeType.ENDNOTE)) {
                continue;
            }
            const noteId = range.properties?.noteId;
            if (typeof noteId !== 'string' || snapshot.notes?.[noteId] == null) {
                issues.push({ code: 'missing-note', segmentType: 'body', index: range.startIndex, message: 'Note reference must resolve to a note segment.' });
            } else if (snapshot.notes[noteId].type !== (range.rangeType === CustomRangeType.ENDNOTE ? 'endnote' : 'footnote')) {
                issues.push({ code: 'invalid-note-reference', segmentType: 'body', index: range.startIndex, message: 'Note reference kind must match its target.' });
            } else if (referencedNotes.has(noteId)) {
                issues.push({ code: 'duplicate-note-reference', segmentType: 'body', index: range.startIndex, message: 'Each note must have its own reference identity.' });
            } else {
                referencedNotes.add(noteId);
            }
            if (range.startIndex !== range.endIndex || snapshot.body.dataStream[range.startIndex] !== '\uFFFC' || !range.wholeEntity) {
                issues.push({ code: 'invalid-note-reference', segmentType: 'body', index: range.startIndex, message: 'Note reference must cover one whole-entity reference character.' });
            }
        }
    }

    for (const [headerId, header] of Object.entries(snapshot.headers ?? {})) {
        issues.push(...validateDocBodyStructure(header.body, { segmentType: 'header', segmentId: headerId }));
    }

    for (const [footerId, footer] of Object.entries(snapshot.footers ?? {})) {
        issues.push(...validateDocBodyStructure(footer.body, { segmentType: 'footer', segmentId: footerId }));
    }

    for (const [noteId, note] of Object.entries(snapshot.notes ?? {})) {
        issues.push(...validateNoteBody(noteId, note));
        if (snapshot.headers?.[noteId] || snapshot.footers?.[noteId]) {
            issues.push({ code: 'invalid-note-id', segmentType: 'note', segmentId: noteId, message: 'Notes must not share a segment identity with a header or footer.' });
        }
    }

    return issues;
}
