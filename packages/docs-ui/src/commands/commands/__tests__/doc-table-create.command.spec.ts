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

import { DataStreamTreeTokenType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { buildDocTableInsertBody, normalizeTableInsertOffset, shouldCreateParagraphBeforeTable } from '../table/doc-table-create.command';
import { genEmptyTable } from '../table/table';

describe('doc table create command helpers', () => {
    it('normalizes offset zero to keep the initial empty paragraph above the table', () => {
        expect(normalizeTableInsertOffset({ dataStream: '\r\n' }, 0)).toBe(1);
        expect(normalizeTableInsertOffset({ dataStream: 'Title\r\n' }, 0)).toBe(0);
    });

    it('does not create another before-table paragraph at an existing paragraph boundary', () => {
        expect(shouldCreateParagraphBeforeTable({ dataStream: '\r\n' }, 1)).toBe(false);
        expect(shouldCreateParagraphBeforeTable({ dataStream: 'Title\r\n' }, 6)).toBe(false);
    });

    it('creates a before-table paragraph when inserting inside paragraph text', () => {
        expect(shouldCreateParagraphBeforeTable({ dataStream: 'Title\r\n' }, 2)).toBe(true);
    });

    it('builds inserted table body with a normal paragraph after the table', () => {
        const tableData = genEmptyTable(1, 1);
        const body = buildDocTableInsertBody({
            tableDataStream: tableData.dataStream,
            tableParagraphs: tableData.paragraphs,
            sectionBreaks: tableData.sectionBreaks,
            tableId: 'table-1',
            textRun: { st: 0, ed: tableData.dataStream.length, ts: {} },
        });

        expect(body.dataStream).toBe(`${tableData.dataStream}${DataStreamTreeTokenType.PARAGRAPH}`);
        expect(body.tables).toEqual([{
            startIndex: 0,
            endIndex: tableData.dataStream.length,
            tableId: 'table-1',
        }]);
        expect(body.paragraphs.at(-1)).toMatchObject({
            startIndex: tableData.dataStream.length,
            paragraphId: expect.stringMatching(/^para_/),
        });
    });
});
