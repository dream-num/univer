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

import type { IDocumentBody, IDocumentData } from '../../../types/interfaces/i-document-data';
import { DataStreamTreeTokenType } from '../types';

export type DocStructureIssueCode =
    | 'missing-root-paragraph'
    | 'missing-root-section-break'
    | 'paragraph-token-mismatch'
    | 'section-break-token-mismatch'
    | 'table-start-token-mismatch'
    | 'table-end-token-mismatch'
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
    for (const paragraph of body.paragraphs ?? []) {
        if (body.dataStream[paragraph.startIndex] !== DataStreamTreeTokenType.PARAGRAPH) {
            issues.push(createIssue(
                context,
                'paragraph-token-mismatch',
                'Paragraph metadata must point to a paragraph sentinel.',
                paragraph.startIndex
            ));
        }
    }
}

function validateSectionBreakMetadata(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    for (const sectionBreak of body.sectionBreaks ?? []) {
        if (body.dataStream[sectionBreak.startIndex] !== DataStreamTreeTokenType.SECTION_BREAK) {
            issues.push(createIssue(
                context,
                'section-break-token-mismatch',
                'Section break metadata must point to a section break sentinel.',
                sectionBreak.startIndex
            ));
        }
    }
}

function validateTableMetadata(body: IDocumentBody, issues: IDocStructureIssue[], context: IValidationContext) {
    for (const table of body.tables ?? []) {
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
            body.dataStream[table.endIndex - 1] !== DataStreamTreeTokenType.TABLE_END
        ) {
            issues.push(createIssue(
                context,
                'table-end-token-mismatch',
                'Table endIndex must be the exclusive boundary immediately after a table end sentinel.',
                table.endIndex
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
