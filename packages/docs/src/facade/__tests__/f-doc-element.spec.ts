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
import { DocumentBlockRangeType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import {
    createBlockRangeDocument,
    createCustomBlockDocument,
    createSimpleDocument,
    createTableDocument,
    createTestBed,
} from './create-test-bed';

describe('FDocElement', () => {
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

    it('should cast body elements to their concrete facade types', () => {
        createDocumentFacade(createSimpleDocument());
        expect(document.getBody().getChild(0).asParagraph().getText()).toBe('Alpha');

        createDocumentFacade(createBlockRangeDocument());
        expect(document.getBody().getChild(0).asBlockRange().getBlockType()).toBe(DocumentBlockRangeType.QUOTE);

        createDocumentFacade(createTableDocument());
        expect(document.getBody().getChild(0).asTable().getTableId()).toBe('table-1');

        createDocumentFacade(createCustomBlockDocument());
        expect(document.getBody().getChild(0).asCustomBlock().getBlockId()).toBe('custom-1');
    });

    it('should remove a generic element from its parent', () => {
        createDocumentFacade(createSimpleDocument());

        expect(document.getBody().getChild(0).removeFromParent()).toBe(true);
        expect(document.save().body?.dataStream).toBe('Beta\rGamma\r\n');
    });

    it('should navigate siblings and reject invalid casts', () => {
        createDocumentFacade(createSimpleDocument());

        const body = document.getBody();
        const first = body.getChild(0);
        const second = body.getChild(1);

        expect(first.getPreviousSibling()).toBeNull();
        expect(first.getNextSibling()?.getKey()).toBe(second.getKey());
        expect(second.getPreviousSibling()?.getKey()).toBe(first.getKey());
        expect(() => first.asTable()).toThrow('Cannot cast paragraph to table.');
        expect(() => first.asBlockRange()).toThrow('Cannot cast paragraph to blockRange.');
        expect(() => first.asCustomBlock()).toThrow('Cannot cast paragraph to customBlock.');

        createDocumentFacade(createTableDocument());
        expect(() => document.getBody().getChild(0).asParagraph()).toThrow('Cannot cast table to paragraph.');
    });
});
