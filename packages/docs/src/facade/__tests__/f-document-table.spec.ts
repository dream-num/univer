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
import type { FDocument } from '../f-document';
import { DocumentBlockType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTableDocument, createTestBed } from '../../__tests__/create-test-bed';

describe('FDocumentTable', () => {
    let univer: Univer;
    let document: FDocument;

    function createDocumentFacade() {
        univer?.dispose();
        const testBed = createTestBed(createTableDocument());
        univer = testBed.univer;
        document = testBed.univerAPI.getActiveDocument()!;
    }

    beforeEach(() => {
        createDocumentFacade();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('exposes table identity and removes the table from document body', () => {
        const body = document.getBody();
        const table = body.getElement(0)!.asTable();

        expect(table.getType()).toBe(DocumentBlockType.TABLE);
        expect(table.getKey()).toBe('table-1');
        expect(table.getParent()).toBe(body);
        expect(table.getTable().tableId).toBe('table-1');
        expect(body.removeTable(table)).toBe(true);
        expect(document.save().body?.tables).toEqual([]);

        createDocumentFacade();
        expect(document.getBody().getElement(0)!.asTable().remove()).toBe(true);
        expect(document.save().body?.dataStream).toBe('aa\r\n');
    });
});
