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

import type { IDocumentBody } from '../../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { DataStreamTreeTokenType } from '../../types';
import { validateDocBodyStructure, validateDocumentStructure } from '../structure-validator';

describe('validateDocBodyStructure', () => {
    it('accepts a valid plain document body', () => {
        const body: IDocumentBody = {
            dataStream: `A${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'para-1' }],
            sectionBreaks: [{ startIndex: 2 }],
        };

        expect(validateDocBodyStructure(body)).toEqual([]);
    });

    it('reports root bodies without a minimum paragraph and section pair', () => {
        const body: IDocumentBody = {
            dataStream: 'A',
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toEqual([
            'missing-root-paragraph',
            'missing-root-section-break',
        ]);
    });

    it('reports paragraph and section metadata that do not point to matching tokens', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 4, paragraphId: 'bad-para' }],
            sectionBreaks: [{ startIndex: 5 }],
            columnGroups: [{ startIndex: 0, endIndex: 5, columnGroupId: 'cg-1' }],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toEqual([
            'paragraph-token-mismatch',
            'section-break-token-mismatch',
        ]);
    });

    it('reports columns that have no paragraph or section child', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 5, paragraphId: 'root' }],
            sectionBreaks: [{ startIndex: 6 }],
            columnGroups: [{ startIndex: 0, endIndex: 4, columnGroupId: 'cg-1' }],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toContain('empty-column');
    });

    it('reports table cells that have no section child', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}A${T.PARAGRAPH}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 4, paragraphId: 'cell' },
                { startIndex: 8, paragraphId: 'after-table' },
            ],
            sectionBreaks: [{ startIndex: 9 }],
            tables: [{ startIndex: 0, endIndex: 8, tableId: 'table-1' }],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toContain('empty-table-cell');
    });

    it('keeps table metadata anchored to the table end token when the following paragraph has text', () => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}A${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const body: IDocumentBody = {
            dataStream: `${tableStream}After${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 4, paragraphId: 'cell' },
                { startIndex: tableStream.length + 5, paragraphId: 'after-table' },
            ],
            sectionBreaks: [
                { startIndex: 5 },
                { startIndex: tableStream.length + 6 },
            ],
            tables: [{ startIndex: 0, endIndex: tableStream.length, tableId: 'table-1' }],
        };

        expect(validateDocBodyStructure(body)).toEqual([]);

        body.tables![0].endIndex = tableStream.length + 5;
        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toContain('table-end-token-mismatch');
    });

    it('reports unbalanced structural tokens', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 3, paragraphId: 'para-1' }],
            sectionBreaks: [{ startIndex: 5 }],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toContain('unbalanced-column-group');
    });

    it('validates header and footer bodies with segment diagnostics', () => {
        const T = DataStreamTreeTokenType;
        const issues = validateDocumentStructure({
            body: {
                dataStream: `${T.PARAGRAPH}${T.SECTION_BREAK}`,
                paragraphs: [{ startIndex: 0, paragraphId: 'body' }],
                sectionBreaks: [{ startIndex: 1 }],
            },
            headers: {
                'header-1': {
                    headerId: 'header-1',
                    body: { dataStream: 'bad-header' },
                },
            },
            footers: {
                'footer-1': {
                    footerId: 'footer-1',
                    body: {
                        dataStream: `${T.PARAGRAPH}bad-footer`,
                        paragraphs: [{ startIndex: 0, paragraphId: 'footer' }],
                    },
                },
            },
        });

        expect(issues.map((issue) => `${issue.segmentType}:${issue.segmentId}:${issue.code}`)).toEqual([
            'header:header-1:missing-root-paragraph',
            'header:header-1:missing-root-section-break',
            'footer:footer-1:missing-root-section-break',
        ]);
    });
});
