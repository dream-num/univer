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

import type { IDocumentData, Univer } from '@univerjs/core';
import type { FDocument } from '../f-document';
import { DocumentBlockRangeType, DocumentBlockType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import {
    createBlockRangeDocument,
    createCustomBlockDocument,
    createSimpleDocument,
    createTableDocument,
    createTestBed,
} from '../../__tests__/create-test-bed';

describe('FDocumentElement', () => {
    let univer: Univer | null = null;
    let document: FDocument;

    function createDocumentFacade(docData: IDocumentData) {
        univer?.dispose();
        const testBed = createTestBed(docData);
        univer = testBed.univer;
        document = testBed.univerAPI.getActiveDocument()!;
    }

    afterEach(() => {
        univer?.dispose();
        univer = null;
    });

    it('casts body elements to their concrete facade types', () => {
        createDocumentFacade(createSimpleDocument());
        expect(document.getBody().getElement(0)!.asParagraph().getText()).toBe('Alpha');

        createDocumentFacade(createBlockRangeDocument());
        expect(document.getBody().getElement(0)!.asBlockRange().getBlockType()).toBe(DocumentBlockRangeType.QUOTE);

        createDocumentFacade(createTableDocument());
        expect(document.getBody().getElement(0)!.asTable().getTable().tableId).toBe('table-1');

        createDocumentFacade(createCustomBlockDocument());
        expect(document.getBody().getElement(0)!.asCustomBlock().getCustomBlock().blockId).toBe('custom-1');
    });

    it('removes a generic element from its parent', () => {
        createDocumentFacade(createSimpleDocument());

        expect(document.getBody().getElement(0)!.remove()).toBe(true);
        expect(document.save().body?.dataStream).toBe('Beta\rGamma\r\n');
    });

    it('navigates siblings and rejects invalid casts without changing the element type', () => {
        createDocumentFacade(createSimpleDocument());

        const body = document.getBody();
        const first = body.getElement(0)!;
        const second = body.getElement(1)!;

        expect(first.getPreviousSibling()).toBeNull();
        expect(first.getNextSibling()?.getKey()).toBe(second.getKey());
        expect(second.getPreviousSibling()?.getKey()).toBe(first.getKey());
        expect(() => first.asTable()).toThrow('Element type is not a table: paragraph');
        expect(() => first.asBlockRange()).toThrow('Element type is not a block range: paragraph');
        expect(() => first.asCustomBlock()).toThrow('Element type is not a custom block: paragraph');
        expect(first.getType()).toBe(DocumentBlockType.PARAGRAPH);

        createDocumentFacade(createTableDocument());
        const table = document.getBody().getElement(0)!;
        expect(() => table.asParagraph()).toThrow('Element type is not a paragraph: table');
        expect(table.getType()).toBe(DocumentBlockType.TABLE);
    });
});
