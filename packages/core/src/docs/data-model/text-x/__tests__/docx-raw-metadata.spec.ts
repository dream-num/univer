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
import type { TextXAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { DataStreamTreeTokenType } from '../../types';
import { TextXActionType } from '../action-types';
import { validateDocBodyStructure } from '../structure-validator';
import { TextX } from '../text-x';

describe('DOCX raw metadata', () => {
    it('moves raw custom-block offsets through insertion and undo', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}${T.CUSTOM_BLOCK}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 1, paragraphId: 'before-raw-block' },
                { startIndex: 3, paragraphId: 'after-raw-block' },
            ],
            sectionBreaks: [{ sectionId: 'section_docx_raw', startIndex: 4 }],
            docxRawCustomBlocks: [{
                startIndex: 2,
                blockId: 'raw-2',
                docxRawXml: '<w:r><w:footnoteReference w:id="1"/></w:r>',
            }],
            docxRawBlocks: [{ startIndex: 2, xml: '<w:sdt/>' }],
            docxExportExcludedRanges: [{ start: 2, end: 4 }],
        };
        const original = structuredClone(body);
        const actions: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 1 },
            { t: TextXActionType.INSERT, len: 1, body: { dataStream: 'B' } },
        ];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);

        expect(body.docxRawCustomBlocks?.[0].startIndex).toBe(3);
        expect(body.docxRawBlocks?.[0].startIndex).toBe(3);
        expect(body.docxExportExcludedRanges).toEqual([{ start: 3, end: 5 }]);
        expect(validateDocBodyStructure(body)).toEqual([]);

        TextX.apply(body, TextX.invert(actions));
        expect(body.dataStream).toBe(original.dataStream);
        expect(body.paragraphs).toEqual(original.paragraphs);
        expect(body.sectionBreaks).toEqual(original.sectionBreaks);
        expect(body.docxRawCustomBlocks).toEqual(original.docxRawCustomBlocks);
        expect(body.docxRawBlocks).toEqual(original.docxRawBlocks);
        expect(body.docxExportExcludedRanges).toEqual(original.docxExportExcludedRanges);
        expect(validateDocBodyStructure(body)).toEqual([]);
    });

    it('restores raw metadata after deleting and undoing its range', () => {
        const body: IDocumentBody = {
            dataStream: 'ABCDE',
            docxRawBlocks: [{ startIndex: 2, xml: '<w:sdt/>' }],
            docxExportExcludedRanges: [{ start: 1, end: 4 }],
        };
        const actions: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 1 },
            { t: TextXActionType.DELETE, len: 3 },
        ];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);
        expect(body.docxRawBlocks).toEqual([]);
        expect(body.docxExportExcludedRanges).toEqual([]);

        TextX.apply(body, TextX.invert(actions));
        expect(body.docxRawBlocks).toEqual([{ startIndex: 2, xml: '<w:sdt/>' }]);
        expect(body.docxExportExcludedRanges).toEqual([{ start: 1, end: 4 }]);
    });
});
