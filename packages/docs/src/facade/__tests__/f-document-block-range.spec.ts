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
import { DocumentBlockRangeType, DocumentBlockType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { createBlockRangeDocument, createTestBed } from '../../__tests__/create-test-bed';

describe('FDocumentBlockRange', () => {
    let univer: Univer | null = null;
    let document: FDocument;

    function createDocumentFacade(blockType = DocumentBlockRangeType.QUOTE) {
        univer?.dispose();
        const testBed = createTestBed(createBlockRangeDocument(blockType));
        univer = testBed.univer;
        document = testBed.univerAPI.getActiveDocument()!;
    }

    afterEach(() => {
        univer?.dispose();
        univer = null;
    });

    it('edits and removes block range content while preserving surrounding paragraphs', () => {
        for (const blockType of [DocumentBlockRangeType.QUOTE, DocumentBlockRangeType.CALLOUT, DocumentBlockRangeType.CODE]) {
            createDocumentFacade(blockType);

            const body = document.getBody();
            const block = body.getElement(0)!.asBlockRange();

            expect(block.getType()).toBe(DocumentBlockType.BLOCK_RANGE);
            expect(block.getKey()).toBe(`${blockType}-1`);
            expect(block.getParent()).toBe(body);
            expect(block.getBlockType()).toBe(blockType);
            expect(block.getText()).toBe('Block');
            expect(block.getBlockRange().blockType).toBe(blockType);
            expect(body.insertParagraph(0, 'Intro').getText()).toBe('Intro');
            expect(block.getText()).toBe('Block');
            expect(block.setText('Updated')).toBe(true);
            expect(block.getText()).toBe('Updated');
            expect(block.remove()).toBe(true);
            expect(document.save().body?.dataStream).toBe('Intro\rAfter\r\n');
        }
    });

    it('unwraps a block range from the body', () => {
        createDocumentFacade();

        expect(document.getBody().getElement(0)!.asBlockRange().unwrap()).toBe(true);
        expect(document.save().body?.dataStream).toBe('After\r\n');
    });
});
