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

import type { Univer } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBed, DOCUMENT_STYLE } from './create-test-bed';

describe('FUniver docs facade', () => {
    let univer: Univer;
    let univerAPI: ReturnType<typeof createTestBed>['univerAPI'];

    beforeEach(() => {
        const testBed = createTestBed();
        univer = testBed.univer;
        univerAPI = testBed.univerAPI;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should create, focus and resolve document facades by document id', () => {
        expect(univerAPI.getActiveDocument()?.getId()).toBe('test');
        expect(univerAPI.getDocument('test')?.getId()).toBe('test');
        expect(univerAPI.getDocument('missing-doc')).toBeNull();

        const created = univerAPI.createDocument({
            id: 'created-doc',
            title: 'Created',
            body: {
                dataStream: 'Created\r\n',
                paragraphs: [{ startIndex: 7, paragraphId: 'para_created' }],
            },
            documentStyle: DOCUMENT_STYLE,
        });

        expect(created.getId()).toBe('created-doc');
        expect(created.getName()).toBe('Created');
        expect(univerAPI.getDocument('created-doc')?.save().body?.dataStream).toBe('Created\r\n');
    });
});
