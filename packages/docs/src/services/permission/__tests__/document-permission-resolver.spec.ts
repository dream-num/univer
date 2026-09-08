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

import { CustomRangeType, DataStreamTreeTokenType, DocumentDataModel, DrawingTypeEnum, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getDocumentEntityPermissionObjectId, getDocumentParagraphPermissionObjectId, getDocumentSectionPermissionObjectId } from '../document-permission';
import { getDocumentEditTargetObjectIds } from '../document-permission-resolver';

describe('document permission resolver', () => {
    it('uses note-owned drawing permissions while retaining the body reference restrictions', () => {
        const document = new DocumentDataModel({
            id: 'note-permission',
            body: {
                dataStream: 'A\uFFFC\r\n',
                paragraphs: [{ startIndex: 2, paragraphId: 'body-paragraph' }],
                sectionBreaks: [{ startIndex: 3, sectionId: 'body-section' }],
                customRanges: [{ startIndex: 1, endIndex: 1, rangeId: 'note-ref', rangeType: CustomRangeType.FOOTNOTE, properties: { footnoteId: 'note' } }],
            },
            footnotes: {
                note: {
                    footnoteId: 'note',
                    body: {
                        dataStream: '\b\r\n',
                        customBlocks: [{ startIndex: 0, blockId: 'image' }],
                        paragraphs: [{ startIndex: 1, paragraphId: 'note-paragraph' }],
                        sectionBreaks: [{ startIndex: 2, sectionId: 'note-section' }],
                    },
                    drawings: {
                        image: {
                            unitId: 'note-permission',
                            subUnitId: 'note-permission',
                            drawingId: 'image',
                            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                            layoutType: PositionedObjectLayoutType.INLINE,
                            docTransform: {
                                size: { width: 100, height: 40 },
                                angle: 0,
                                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                                positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
                            },
                        },
                    },
                },
            },
        });
        try {
            const targets = getDocumentEditTargetObjectIds(document, 'note', { startOffset: 0, endOffset: 1 });
            expect(targets).toContain(getDocumentEntityPermissionObjectId('note', 'drawing', 'image'));
            expect(targets).not.toContain(getDocumentEntityPermissionObjectId('note', 'custom-block', 'image'));
            expect(targets).toContain(getDocumentSectionPermissionObjectId('', 'body-section'));
            expect(targets).toContain(getDocumentParagraphPermissionObjectId('', 'body-paragraph'));
        } finally {
            document.dispose();
        }
    });

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
