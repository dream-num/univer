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
import { DocumentBlockRangeType } from '../../../../types/interfaces';
import { DataStreamTreeTokenType } from '../../types';
import { validateDocBodyStructure, validateDocumentStructure } from '../structure-validator';

describe('validateDocBodyStructure', () => {
    it('accepts a valid plain document body', () => {
        const body: IDocumentBody = {
            dataStream: `A${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'para-1' }],
            sectionBreaks: [{ sectionId: 'section_fixture_7', startIndex: 2 }],
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
            sectionBreaks: [{ sectionId: 'section_fixture_8', startIndex: 5 }],
            columnGroups: [{ startIndex: 0, endIndex: 5, columnGroupId: 'cg-1' }],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toEqual([
            'paragraph-token-mismatch',
            'section-break-token-mismatch',
        ]);
    });

    it('reports duplicate paragraph and section metadata', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}B${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 1, paragraphId: 'first' },
                { startIndex: 1, paragraphId: 'duplicate-first' },
            ],
            sectionBreaks: [
                { sectionId: 'section_duplicate_a', startIndex: 4 },
                { sectionId: 'section_duplicate_b', startIndex: 4 },
            ],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toEqual([
            'duplicate-paragraph-metadata',
            'duplicate-section-break-metadata',
        ]);
    });

    it('reports columns that have no paragraph or section child', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 5, paragraphId: 'root' }],
            sectionBreaks: [{ sectionId: 'section_fixture_11', startIndex: 6 }],
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
            sectionBreaks: [{ sectionId: 'section_fixture_12', startIndex: 9 }],
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
                { sectionId: 'section_fixture_13', startIndex: 5 },
                { sectionId: 'section_fixture_14', startIndex: tableStream.length + 6 },
            ],
            tables: [{ startIndex: 0, endIndex: tableStream.length, tableId: 'table-1' }],
        };

        expect(validateDocBodyStructure(body)).toEqual([]);

        body.tables![0].endIndex = tableStream.length + 5;
        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toContain('table-end-token-mismatch');
    });

    it('reports table token ranges without metadata', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 3, paragraphId: 'cell' },
                { startIndex: 8, paragraphId: 'after-table' },
            ],
            sectionBreaks: [
                { sectionId: 'section_cell', startIndex: 4 },
                { sectionId: 'section_root', startIndex: 9 },
            ],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toContain('missing-table-metadata');
    });

    it('reports block metadata that points to another block end sentinel', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_START}${T.BLOCK_END}${T.PARAGRAPH}${T.BLOCK_END}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 2, paragraphId: 'outer' },
                { startIndex: 5, paragraphId: 'inner' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_17', startIndex: 7 }],
            blockRanges: [
                { startIndex: 0, endIndex: 6, blockId: 'outer', blockType: DocumentBlockRangeType.CODE },
                { startIndex: 3, endIndex: 6, blockId: 'inner', blockType: DocumentBlockRangeType.CALLOUT },
            ],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toEqual([
            'block-range-token-mismatch',
            'overlapping-block-range',
        ]);
    });

    it('accepts adjacent block ranges', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.BLOCK_START}${T.PARAGRAPH}${T.BLOCK_END}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 2, paragraphId: 'first' },
                { startIndex: 5, paragraphId: 'second' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_18', startIndex: 7 }],
            blockRanges: [
                { startIndex: 0, endIndex: 3, blockId: 'first', blockType: DocumentBlockRangeType.CODE },
                { startIndex: 4, endIndex: 6, blockId: 'second', blockType: DocumentBlockRangeType.CALLOUT },
            ],
        };

        expect(validateDocBodyStructure(body)).toEqual([]);
    });

    it('reports block token ranges without metadata and unbalanced block tokens', () => {
        const T = DataStreamTreeTokenType;
        const missingMetadata: IDocumentBody = {
            dataStream: `${T.BLOCK_START}${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 1, paragraphId: 'inside' },
                { startIndex: 3, paragraphId: 'after' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_19', startIndex: 4 }],
        };
        const unbalanced: IDocumentBody = {
            dataStream: `${T.BLOCK_START}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'inside' }],
            sectionBreaks: [{ sectionId: 'section_fixture_20', startIndex: 2 }],
        };

        expect(validateDocBodyStructure(missingMetadata).map((issue) => issue.code)).toContain('missing-block-range-metadata');
        expect(validateDocBodyStructure(unbalanced).map((issue) => issue.code)).toContain('unbalanced-block');
    });

    it('validates column group pairing, metadata presence, overlap, and column count', () => {
        const T = DataStreamTreeTokenType;
        const dataStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`;
        const baseBody: IDocumentBody = {
            dataStream,
            paragraphs: [
                { startIndex: 2, paragraphId: 'left' },
                { startIndex: 5, paragraphId: 'right' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_21', startIndex: 8 }],
        };

        expect(validateDocBodyStructure(baseBody).map((issue) => issue.code)).toContain('missing-column-group-metadata');

        const badCount: IDocumentBody = {
            ...baseBody,
            columnGroups: [{
                startIndex: 0,
                endIndex: 7,
                columnGroupId: 'columns-1',
                columns: [{ columnId: 'left', widthRatio: 1 }],
            }],
        };
        expect(validateDocBodyStructure(badCount).map((issue) => issue.code)).toContain('column-group-column-count-mismatch');

        const overlapping: IDocumentBody = {
            ...baseBody,
            columnGroups: [
                { startIndex: 0, endIndex: 7, columnGroupId: 'columns-1' },
                { startIndex: 0, endIndex: 7, columnGroupId: 'columns-2' },
            ],
        };
        expect(validateDocBodyStructure(overlapping).map((issue) => issue.code)).toContain('overlapping-column-group');

        const exclusiveEnd: IDocumentBody = {
            ...baseBody,
            columnGroups: [{
                startIndex: 0,
                endIndex: 8,
                columnGroupId: 'columns-exclusive',
                columns: [
                    { columnId: 'left', widthRatio: 1 },
                    { columnId: 'right', widthRatio: 1 },
                ],
            }],
        };
        expect(validateDocBodyStructure(exclusiveEnd).map((issue) => issue.code)).toContain('column-group-range-token-mismatch');
    });

    it('requires custom block metadata to point at exactly one custom block sentinel', () => {
        const T = DataStreamTreeTokenType;
        const valid: IDocumentBody = {
            dataStream: `${T.CUSTOM_BLOCK}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'after-custom-block' }],
            sectionBreaks: [{ sectionId: 'section_fixture_22', startIndex: 2 }],
            customBlocks: [{ startIndex: 0, blockId: 'drawing-1' }],
        };

        expect(validateDocBodyStructure(valid)).toEqual([]);
        expect(validateDocBodyStructure({ ...valid, customBlocks: [] }).map((issue) => issue.code)).toContain('missing-custom-block-metadata');
        expect(validateDocBodyStructure({
            ...valid,
            customBlocks: [
                { startIndex: 0, blockId: 'drawing-1' },
                { startIndex: 0, blockId: 'drawing-2' },
            ],
        }).map((issue) => issue.code)).toContain('duplicate-custom-block-metadata');
        expect(validateDocBodyStructure({
            ...valid,
            dataStream: `${T.BLOCK_START}${T.PARAGRAPH}${T.SECTION_BREAK}`,
        }).map((issue) => issue.code)).toContain('custom-block-token-mismatch');
    });

    it('reports unbalanced structural tokens', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 3, paragraphId: 'para-1' }],
            sectionBreaks: [{ sectionId: 'section_fixture_23', startIndex: 5 }],
        };

        expect(validateDocBodyStructure(body).map((issue) => issue.code)).toContain('unbalanced-column-group');
    });

    it('validates header and footer bodies with segment diagnostics', () => {
        const T = DataStreamTreeTokenType;
        const issues = validateDocumentStructure({
            body: {
                dataStream: `${T.PARAGRAPH}${T.SECTION_BREAK}`,
                paragraphs: [{ startIndex: 0, paragraphId: 'body' }],
                sectionBreaks: [{ sectionId: 'section_fixture_24', startIndex: 1 }],
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
