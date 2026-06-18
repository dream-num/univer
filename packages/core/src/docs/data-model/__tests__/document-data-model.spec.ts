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

import { describe, expect, it } from 'vitest';
import { DocumentDataModel } from '../document-data-model';

describe('DocumentDataModel', () => {
    it('normalizes document data without body to an editable empty document', () => {
        const document = new DocumentDataModel({
            id: 'doc-without-body',
            title: 'Document Without Body',
            documentStyle: {},
        });

        expect(document.getUnitId()).toBe('doc-without-body');
        expect(document.getTitle()).toBe('Document Without Body');
        expect(document.getBody()).toMatchObject({
            dataStream: '\r\n',
            paragraphs: [{ startIndex: 0 }],
            sectionBreaks: [{ startIndex: 1 }],
        });
    });
});
