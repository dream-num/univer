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

import { ColumnSeparatorType, DataStreamTreeTokenType, DocumentDataModel, SectionType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createSectionColumnUpdates, getSectionSettingValues, getSelectedSections } from '../use-section-setting';

describe('section setting selection', () => {
    it('maps ranges to top-level sections by their stable ids', () => {
        const model = new DocumentDataModel({
            id: 'section-setting-selection',
            body: {
                dataStream: `A${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}B${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                paragraphs: [
                    { paragraphId: 'paragraph_1', startIndex: 1 },
                    { paragraphId: 'paragraph_2', startIndex: 4 },
                ],
                sectionBreaks: [
                    { sectionId: 'section_1', startIndex: 2 },
                    { sectionId: 'section_2', startIndex: 5 },
                ],
            },
        });

        expect(getSelectedSections(model, [{ startOffset: 0, endOffset: 4, collapsed: false }]).map((section) => section.sectionId))
            .toEqual(['section_1', 'section_2']);
        expect(getSelectedSections(model, [{ startOffset: 3, endOffset: 4, collapsed: false }]).map((section) => section.sectionId))
            .toEqual(['section_2']);
        expect(getSelectedSections(model, [{ startOffset: 0, endOffset: 5, collapsed: false, segmentId: 'header' }]))
            .toEqual([]);
    });

    it('reports mixed values instead of silently using the first section', () => {
        const sections = [
            {
                sectionId: 'section_1',
                startIndex: 2,
                columnProperties: [
                    { width: 190, paddingEnd: 18 },
                    { width: 190, paddingEnd: 0 },
                ],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: SectionType.CONTINUOUS,
            },
            {
                sectionId: 'section_2',
                startIndex: 5,
                columnProperties: [
                    { width: 120, paddingEnd: 12 },
                    { width: 120, paddingEnd: 12 },
                    { width: 120, paddingEnd: 0 },
                ],
                columnSeparatorType: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
                sectionType: SectionType.NEXT_PAGE,
            },
        ];

        expect(getSectionSettingValues(sections)).toEqual({
            columnCount: undefined,
            columnGap: undefined,
            separatorType: undefined,
            sectionType: undefined,
        });
    });

    it('preserves each section column count when applying a shared gap', () => {
        const sections = [
            {
                sectionId: 'section_1',
                startIndex: 2,
                columnProperties: [
                    { width: 190, paddingEnd: 18 },
                    { width: 190, paddingEnd: 0 },
                ],
            },
            {
                sectionId: 'section_2',
                startIndex: 5,
                columnProperties: [
                    { width: 120, paddingEnd: 12 },
                    { width: 120, paddingEnd: 12 },
                    { width: 120, paddingEnd: 0 },
                ],
            },
        ];
        const updates = createSectionColumnUpdates(sections, {}, { columnGap: 24 });

        expect(updates[0].config.columnProperties).toHaveLength(2);
        expect(updates[1].config.columnProperties).toHaveLength(3);
        expect(updates[0].config.columnProperties?.[0].paddingEnd).toBe(24);
        expect(updates[1].config.columnProperties?.[0].paddingEnd).toBe(24);
    });
});
