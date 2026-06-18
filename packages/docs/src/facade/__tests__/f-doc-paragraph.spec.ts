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
import { PresetListType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { DocElementStaleError } from '../doc-element-registry';
import {
    createBulletDocument,
    createDuplicateDocument,
    createSimpleDocument,
    createTaskDocument,
    createTestBed,
} from './create-test-bed';

describe('FDocParagraph', () => {
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

    it('should keep paragraph handles stable when text is duplicated or inserted before them', () => {
        createDocumentFacade(createDuplicateDocument());

        const body = document.getBody();
        const secondSame = body.getChild(1).asParagraph();

        expect(secondSame.getId()).toBe('para_same_2');
        expect(body.insertParagraph(0, 'X').getText()).toBe('X');
        expect(body.getChildIndex(secondSame)).toBe(2);
        expect(secondSame.setText('Picked')).toBe(true);
        expect(document.save().body?.dataStream).toBe('X\rSame\rPicked\rTail\r\n');
        expect(secondSame.removeFromParent()).toBe(true);
        expect(document.save().body?.dataStream).toBe('X\rSame\rTail\r\n');
    });

    it('should mark paragraph handles as stale after their backing paragraph is removed', () => {
        createDocumentFacade(createSimpleDocument());

        const paragraph = document.getBody().getChild(1).asParagraph();
        expect(paragraph.removeFromParent()).toBe(true);
        expect(() => paragraph.getText()).toThrow(DocElementStaleError);
        expect(() => paragraph.removeFromParent()).toThrow(DocElementStaleError);
    });

    it('should update checklist paragraphs without changing non-task list items', () => {
        createDocumentFacade(createBulletDocument());

        const bulletBody = document.getBody();
        const listItem = bulletBody.getChild(0).asParagraph();
        expect(listItem.getType()).toBe('paragraph');
        expect(listItem.getKey()).toMatch(/^para_/);
        expect(listItem.getId()).toBe(listItem.getKey());
        expect(listItem.getParent()).toBe(bulletBody);
        expect(listItem.isListItem()).toBe(true);
        expect(listItem.isTask()).toBe(false);

        createDocumentFacade(createTaskDocument());

        const task = document.getBody().getChild(0).asParagraph();
        expect(task.isListItem()).toBe(true);
        expect(task.isTask()).toBe(true);
        expect(task.setTaskChecked(true)).toBe(true);
        expect(document.save().body?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);
        expect(document.getBody().setTaskChecked(task.getKey(), false)).toBe(true);
        expect(document.save().body?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST);
    });
});
