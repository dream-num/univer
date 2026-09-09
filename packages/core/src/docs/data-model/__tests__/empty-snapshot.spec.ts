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

import type { IDocumentData } from '../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { BooleanNumber } from '../../../types/enum';
import { DocumentFlavor } from '../../../types/interfaces';
import { DocumentDataModel } from '../document-data-model';
import { getEmptySnapshot } from '../empty-snapshot';

describe('getEmptySnapshot', () => {
    it.each([
        [DocumentFlavor.DRAWINGML, BooleanNumber.FALSE],
        [DocumentFlavor.UNSPECIFIED, BooleanNumber.TRUE],
        [DocumentFlavor.TRADITIONAL, BooleanNumber.TRUE],
        [DocumentFlavor.MODERN, BooleanNumber.TRUE],
    ] as const)('defaults hyphenation by flavor without overriding authored settings (%s)', (documentFlavor, expected) => {
        expect(getEmptySnapshot(undefined, undefined, undefined, documentFlavor).documentStyle.autoHyphenation).toBe(expected);

        for (const autoHyphenation of [undefined, BooleanNumber.FALSE, BooleanNumber.TRUE]) {
            const source: IDocumentData = {
                id: 'imported-shape-text',
                body: { dataStream: 'Representation\r\n' },
                documentStyle: { documentFlavor },
            };
            if (autoHyphenation !== undefined) {
                source.documentStyle.autoHyphenation = autoHyphenation;
            }
            const model = new DocumentDataModel(source);
            expect(model.getSnapshot().documentStyle.autoHyphenation).toBe(autoHyphenation ?? expected);
            expect(source.documentStyle.autoHyphenation).toBe(autoHyphenation);
            model.dispose();
        }
    });

    it('uses the configured paragraph spacing defaults for new docs', () => {
        const snapshot = getEmptySnapshot();

        expect(snapshot.body?.paragraphs?.[0].paragraphStyle).toEqual({});
        expect(snapshot.documentStyle.defaultParagraphStyle).toEqual({
            spaceAbove: { v: 0 },
            lineSpacing: 1.5,
            spaceBelow: { v: 12 },
        });
    });

    it('initializes optional body arrays for structured doc features', () => {
        expect(getEmptySnapshot().body).toMatchObject({
            blockRanges: [],
            columnGroups: [],
            customBlocks: [],
            customDecorations: [],
            customRanges: [],
            tables: [],
            textRuns: [],
        });
    });
});
