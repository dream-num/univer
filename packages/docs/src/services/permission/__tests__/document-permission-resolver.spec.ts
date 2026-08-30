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

import { DataStreamTreeTokenType, DocumentDataModel } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getDocumentParagraphPermissionObjectId } from '../document-permission';
import { getDocumentEditTargetObjectIds } from '../document-permission-resolver';

describe('document permission resolver', () => {
    it('indexes paragraph content starts once per document revision', () => {
        const paragraphCount = 1_000;
        const paragraphs = Array.from({ length: paragraphCount }, (_, index) => ({
            startIndex: index * 2 + 1,
            paragraphId: `paragraph-${index}`,
        }));
        const dataStream = `${Array.from({ length: paragraphCount }, () => `A${DataStreamTreeTokenType.PARAGRAPH}`).join('')}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const document = new DocumentDataModel({
            id: 'permission-index-document',
            body: {
                dataStream,
                paragraphs,
                sectionBreaks: [{
                    sectionId: 'permission-index-section',
                    startIndex: dataStream.length - 1,
                }],
            },
            documentStyle: {},
        });
        const modelParagraphs = document.getBody()!.paragraphs!;
        const originalIterator = modelParagraphs[Symbol.iterator].bind(modelParagraphs);
        let iteratorCount = 0;
        Object.defineProperty(modelParagraphs, Symbol.iterator, {
            configurable: true,
            value: () => {
                iteratorCount++;
                return originalIterator();
            },
        });

        const targetOffset = paragraphs[500].startIndex - 1;
        const objectIds = getDocumentEditTargetObjectIds(document, '', {
            startOffset: targetOffset,
            endOffset: targetOffset,
        });
        const iteratorCountAfterFirstLookup = iteratorCount;
        getDocumentEditTargetObjectIds(document, '', {
            startOffset: targetOffset,
            endOffset: targetOffset,
        });

        expect(objectIds).toContain(getDocumentParagraphPermissionObjectId('', 'paragraph-500'));
        expect(iteratorCountAfterFirstLookup).toBeLessThanOrEqual(2);
        expect(iteratorCount).toBe(iteratorCountAfterFirstLookup);
    });
});
