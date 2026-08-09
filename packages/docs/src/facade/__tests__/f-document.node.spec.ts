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

// @vitest-environment node

import type { Univer } from '@univerjs/core';
import { ColumnSeparatorType, DataStreamTreeTokenType, DocumentFlavor, PageOrientType, SectionType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { createDocumentData, createTestBed } from './create-test-bed';

describe('FDocument in Node', () => {
    let univer: Univer | undefined;

    afterEach(() => {
        univer?.dispose();
    });

    it('updates traditional sections without loading Docs UI or browser globals', () => {
        const data = createDocumentData('node-section-facade', {
            dataStream: 'Alpha\rBeta\r\n',
            paragraphs: [
                { startIndex: 5, paragraphId: 'alpha' },
                { startIndex: 10, paragraphId: 'beta' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_node', startIndex: 11 }],
        });
        data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        const testBed = createTestBed(data);
        univer = testBed.univer;
        const document = testBed.univerAPI.getActiveDocument();
        const section = document?.getSection(0);

        expect(globalThis).not.toHaveProperty('window');
        expect(section?.setColumns(2, {
            gap: 18,
            separator: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
        })).toBe(true);
        expect(section?.setSectionType(SectionType.NEXT_PAGE)).toBe(true);
        expect(section?.setPageSetup({
            pageNumberStart: 7,
            pageSize: { width: 960, height: 720 },
            pageOrient: PageOrientType.LANDSCAPE,
            marginTop: 48,
            marginBottom: 48,
            marginLeft: 64,
            marginRight: 64,
        })).toBe(true);
        expect(document?.insertColumnBreak(3)).toBe(true);

        expect(section?.describe()).toMatchObject({
            columnCount: 2,
            columnSeparatorType: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
            sectionType: SectionType.NEXT_PAGE,
            config: {
                pageNumberStart: 7,
                pageSize: { width: 960, height: 720 },
                pageOrient: PageOrientType.LANDSCAPE,
            },
        });
        expect(section?.getEffectivePageSetup()).toEqual({
            pageNumberStart: 7,
            pageSize: { width: 960, height: 720 },
            pageOrient: PageOrientType.LANDSCAPE,
            margins: {
                top: 48,
                bottom: 48,
                left: 64,
                right: 64,
            },
            contentSize: {
                width: 832,
                height: 624,
            },
        });
        expect(document?.save().body?.customRanges).toContainEqual(expect.objectContaining({
            startIndex: 3,
            endIndex: 3,
            properties: { breakType: 'column' },
        }));
    });

    it('reads custom block structure without rendering or pixel layout', () => {
        const data = createDocumentData('node-custom-block-layout', {
            dataStream: `A${DataStreamTreeTokenType.CUSTOM_BLOCK}B\r\n`,
            customBlocks: [{ blockId: 'embed-block', startIndex: 1 }],
        });
        const testBed = createTestBed(data);
        univer = testBed.univer;

        expect(globalThis).not.toHaveProperty('window');
        expect(testBed.univerAPI.getActiveDocument()?.getCustomBlockLayout()).toEqual({
            blocks: [{ blockId: 'embed-block', startIndex: 1, index: 0 }],
        });
    });
});
