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

import { BooleanNumber, DocumentDataModel, DocumentFlavor } from '@univerjs/core';
import { vi } from 'vitest';

export function mockWorkerCanvas(): void {
    vi.stubGlobal('document', undefined);
    vi.stubGlobal('OffscreenCanvas', class {
        getContext() {
            return {
                font: '',
                textBaseline: 'alphabetic',
                measureText(this: { font: string }, content: string) {
                    const size = this.font.match(/([\d.]+)(px|pt)/);
                    const points = size ? Number(size[1]) * (size[2] === 'px' ? 0.75 : 1) : 11;
                    return {
                        width: content.length * 7 * points / 11,
                        fontBoundingBoxAscent: 9 * points / 11,
                        fontBoundingBoxDescent: 3 * points / 11,
                        actualBoundingBoxAscent: 8 * points / 11,
                        actualBoundingBoxDescent: 2 * points / 11,
                    };
                },
            };
        }
    });
}

export function createPaginatedDocument(pageCount = 1_000) {
    const paragraphs = [];
    const pageStarts = [];
    let dataStream = '';
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        pageStarts.push(dataStream.length);
        dataStream += `Page ${pageIndex + 1}\r`;
        paragraphs.push({
            startIndex: dataStream.length - 1,
            paragraphId: `page-${pageIndex + 1}`,
            paragraphStyle: pageIndex === 0 ? undefined : { pageBreakBefore: BooleanNumber.TRUE },
        });
    }
    dataStream += '\n';
    const dataModel = new DocumentDataModel({
        id: 'paginated-layout-test',
        body: {
            dataStream,
            paragraphs,
            sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'section' }],
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: { width: 240, height: 180 },
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
        },
    });
    return { dataModel, pageStarts };
}
