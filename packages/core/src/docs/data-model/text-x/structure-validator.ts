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

import type { ICustomTable, IDocumentBody, IDocumentData } from '../../../types/interfaces/i-document-data';
import { DataStreamTreeTokenType } from '../types';
import {
    getBlockRangeInterval,
    getColumnGroupRangeInterval,
    getTableRangeInterval,
    intersectsOperationalIntervals,
} from './build-utils/range-interval';

export type DocStructureIssueCode =
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
    segmentType: 'body' | 'header' | 'footer';
    segmentId?: string;
    index?: number;
    message: string;
}

interface IValidationContext {
    segmentType: IDocStructureIssue['segmentType'];
    segmentId?: string;
}

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

function validateMinimumRootSentinels(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    if (!body.dataStream.includes(DataStreamTreeTokenType.PARAGRAPH)) {
        issues.push(createIssue(context, 'missing-root-paragraph', 'Document body must contain at least one paragraph sentinel.'));
    }

    if (!body.dataStream.includes(DataStreamTreeTokenType.SECTION_BREAK)) {
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

function collectPairedTokenRanges(
    dataStream: string,
    startToken: string,
    endToken: string,
    exclusiveEnd: boolean
) {
    const pairs = new Map<number, number>();
    const stack: number[] = [];
    const unmatchedEnds: number[] = [];

    for (let index = 0; index < dataStream.length; index++) {
        if (dataStream[index] === startToken) {
            stack.push(index);
        } else if (dataStream[index] === endToken) {
            const startIndex = stack.pop();
            if (startIndex === undefined) {
                unmatchedEnds.push(index);
            } else {
                pairs.set(startIndex, exclusiveEnd ? index + 1 : index);
            }
        }
    }

    return { pairs, unmatchedEnds, unmatchedStarts: stack };
}

function validateTableMetadata(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    const pairedTables = collectPairedTokenRanges(
        body.dataStream,
        DataStreamTreeTokenType.TABLE_START,
        DataStreamTreeTokenType.TABLE_END,
        true
    ).pairs;
    const metadataStarts = new Set<number>();
    let previousTable: ICustomTable | undefined;

    const tables = [...(body.tables ?? [])].sort((a, b) => a.startIndex - b.startIndex || a.endIndex - b.endIndex);
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

function validateBlockRangeMetadata(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    const pairedBlocks = collectPairedTokenRanges(
        body.dataStream,
        DataStreamTreeTokenType.BLOCK_START,
        DataStreamTreeTokenType.BLOCK_END,
        false
    );
    for (const index of [...pairedBlocks.unmatchedStarts, ...pairedBlocks.unmatchedEnds]) {
        issues.push(createIssue(context, 'unbalanced-block', 'Block sentinel has no matching boundary.', index));
    }

    const blockRanges = [...(body.blockRanges ?? [])].sort((a, b) => a.startIndex - b.startIndex || a.endIndex - b.endIndex);
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

function validateColumnGroupMetadata(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    const pairedColumnGroups = collectPairedTokenRanges(
        body.dataStream,
        DataStreamTreeTokenType.COLUMN_GROUP_START,
        DataStreamTreeTokenType.COLUMN_GROUP_END,
        false
    ).pairs;
    const metadataStarts = new Set<number>();
    const columnGroups = [...(body.columnGroups ?? [])].sort((a, b) => a.startIndex - b.startIndex || a.endIndex - b.endIndex);
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

function validateCustomBlockMetadata(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    const metadataCounts = new Map<number, number>();
    for (const customBlock of body.customBlocks ?? []) {
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

    for (let index = 0; index < body.dataStream.length; index++) {
        if (body.dataStream[index] === DataStreamTreeTokenType.CUSTOM_BLOCK && !metadataCounts.has(index)) {
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

    for (let i = 0; i < body.dataStream.length; i++) {
        const char = body.dataStream[i];
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

    validateMinimumRootSentinels(body, issues, context);
    validateParagraphMetadata(body, issues, context);
    validateSectionBreakMetadata(body, issues, context);
    validateTableMetadata(body, issues, context);
    validateBlockRangeMetadata(body, issues, context);
    validateColumnGroupMetadata(body, issues, context);
    validateCustomBlockMetadata(body, issues, context);
    validateStructuralContainers(body, issues, context);

    return issues;
}

export function validateDocumentStructure(snapshot: Pick<IDocumentData, 'body' | 'headers' | 'footers'>): IDocStructureIssue[] {
    const issues: IDocStructureIssue[] = [];

    if (snapshot.body) {
        issues.push(...validateDocBodyStructure(snapshot.body, { segmentType: 'body' }));
    }

    for (const [headerId, header] of Object.entries(snapshot.headers ?? {})) {
        issues.push(...validateDocBodyStructure(header.body, { segmentType: 'header', segmentId: headerId }));
    }

    for (const [footerId, footer] of Object.entries(snapshot.footers ?? {})) {
        issues.push(...validateDocBodyStructure(footer.body, { segmentType: 'footer', segmentId: footerId }));
    }

    return issues;
}
