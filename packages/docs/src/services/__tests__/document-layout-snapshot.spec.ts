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

import type { IDocumentData } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createDocumentLayoutSnapshot } from '../document-layout-snapshot';

describe('createDocumentLayoutSnapshot', () => {
    it('excludes exchange-only resources while preserving layout metadata', () => {
        const snapshot: IDocumentData = {
            id: 'layout-snapshot',
            documentStyle: {},
            resources: [{ name: 'DOC_RESOURCE', data: 'large-resource-payload' }],
            body: {
                dataStream: '\b\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'paragraph-1' }],
                customBlocks: [{
                    startIndex: 0,
                    blockId: 'drawing-1',
                    docxRawXml: '<w:r>large raw XML</w:r>',
                    docxExportTs: { fs: 20 },
                }],
                docxRawCustomBlocks: [{
                    startIndex: 0,
                    blockId: 'raw-1',
                    docxRawXml: '<w:r>opaque</w:r>',
                }],
                docxRawBlocks: [{ startIndex: 0, xml: '<w:proofErr />' }],
                docxExportExcludedRanges: [{ start: 0, end: 1 }],
                payloads: { clipboard: 'large clipboard payload' },
            },
            headers: {
                header: {
                    headerId: 'header',
                    body: {
                        dataStream: '\r\n',
                        docxRawBlocks: [{ startIndex: 0, xml: '<w:header />' }],
                    },
                },
            },
        };

        const layoutSnapshot = createDocumentLayoutSnapshot(snapshot);

        expect(layoutSnapshot.resources).toBeUndefined();
        expect(layoutSnapshot.body).toMatchObject({
            dataStream: '\b\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'paragraph-1' }],
            customBlocks: [{ startIndex: 0, blockId: 'drawing-1' }],
        });
        expect(layoutSnapshot.body?.customBlocks?.[0]).not.toHaveProperty('docxRawXml');
        expect(layoutSnapshot.body?.customBlocks?.[0]).not.toHaveProperty('docxExportTs');
        expect(layoutSnapshot.body?.docxRawCustomBlocks).toBeUndefined();
        expect(layoutSnapshot.body?.docxRawBlocks).toBeUndefined();
        expect(layoutSnapshot.body?.docxExportExcludedRanges).toBeUndefined();
        expect(layoutSnapshot.body?.payloads).toBeUndefined();
        expect(layoutSnapshot.headers?.header.body.docxRawBlocks).toBeUndefined();
        expect(snapshot.resources).toHaveLength(1);
        expect(snapshot.body?.customBlocks?.[0].docxRawXml).toContain('large raw XML');
    });
});
