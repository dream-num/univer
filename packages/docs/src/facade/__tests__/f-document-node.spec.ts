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
import { DocumentBlockRangeType, IResourceManagerService, PresetListType, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DocElementStaleError } from '../doc-element-registry';
import { createTestBed } from './create-test-bed';

const DOCUMENT_STYLE: IDocumentData['documentStyle'] = {
    pageSize: {
        width: 594.3,
        height: 840.51,
    },
    marginTop: 72,
    marginBottom: 72,
    marginRight: 90,
    marginLeft: 90,
};

function createDocumentData(id: string, body: NonNullable<IDocumentData['body']>): IDocumentData {
    return {
        id,
        body: {
            customBlocks: [],
            ...body,
        },
        documentStyle: DOCUMENT_STYLE,
    };
}

function createSimpleDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Alpha\rBeta\rGamma\r\n',
        paragraphs: [{ startIndex: 5 }, { startIndex: 10 }, { startIndex: 16 }],
        sectionBreaks: [{ startIndex: 17 }],
    });
}

function createDuplicateDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Same\rSame\rTail\r\n',
        paragraphs: [{ startIndex: 4 }, { startIndex: 9 }, { startIndex: 14 }],
        sectionBreaks: [{ startIndex: 15 }],
    });
}

function createTaskDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Todo\rDone\r\n',
        paragraphs: [
            {
                startIndex: 4,
                bullet: {
                    listId: 'task-list',
                    listType: PresetListType.CHECK_LIST,
                    nestingLevel: 0,
                },
            },
            { startIndex: 9 },
        ],
        sectionBreaks: [{ startIndex: 10 }],
    });
}

function createBulletDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Bullet\rTail\r\n',
        paragraphs: [
            {
                startIndex: 6,
                bullet: {
                    listId: 'bullet-list',
                    listType: PresetListType.BULLET_LIST,
                    nestingLevel: 0,
                },
            },
            { startIndex: 11 },
        ],
        sectionBreaks: [{ startIndex: 12 }],
    });
}

function createBlockRangeDocument(blockType = DocumentBlockRangeType.QUOTE, id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'Block\rAfter\r\n',
        paragraphs: [{ startIndex: 5 }, { startIndex: 11 }],
        blockRanges: [{
            blockId: `${blockType}-1`,
            blockType,
            startIndex: 0,
            endIndex: 5,
        }],
        sectionBreaks: [{ startIndex: 12 }],
    });
}

function createTableDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: 'TT\raa\r\n',
        paragraphs: [{ startIndex: 2 }, { startIndex: 5 }],
        tables: [{ tableId: 'table-1', startIndex: 0, endIndex: 2 }],
        sectionBreaks: [{ startIndex: 6 }],
    });
}

function createCustomBlockDocument(id = 'test'): IDocumentData {
    return createDocumentData(id, {
        dataStream: '\b\raa\r\n',
        paragraphs: [{ startIndex: 1 }, { startIndex: 4 }],
        customBlocks: [{ blockId: 'custom-1', blockType: 'custom' as never, startIndex: 0 }],
        sectionBreaks: [{ startIndex: 5 }],
    });
}

describe('FDocument facade in Node', () => {
    let univer: Univer;
    let document: FDocument;
    let get: ReturnType<typeof createTestBed>['get'];

    function createDocumentFacade(docData?: IDocumentData) {
        const testBed = createTestBed(docData);
        univer = testBed.univer;
        get = testBed.get;
        document = testBed.univerAPI.getActiveDocument()!;
    }

    beforeEach(() => {
        createDocumentFacade();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('keeps existing FDocument methods in the docs package', () => {
        expect(document.appendText('Univer')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,Univer\r\n');

        univer.dispose();
        createDocumentFacade();
        expect(document.insertText('Docs', {
            endOffset: 4,
            segmentId: '',
            startOffset: 2,
        })).toBe(true);
        expect(document.save().body?.dataStream).toBe('HeDocso,\r\n');

        univer.dispose();
        createDocumentFacade();
        expect(document.insertParagraph('Line 1\nLine 2', {
            endOffset: 6,
            segmentId: '',
            startOffset: 6,
        })).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello,Line 1\rLine 2\r\r\n');
    });

    it('throws when appending text to a document without a body', () => {
        univer.dispose();
        createDocumentFacade({
            id: 'test',
            title: 'Test Document',
            documentStyle: {},
        });

        expect(() => document.appendText('Univer')).toThrowError('The document body is empty');
    });

    it('includes current document resources in snapshots', () => {
        const resourceManagerService = get(IResourceManagerService);

        resourceManagerService.registerPluginResource({
            pluginName: 'DOC_TEST_RESOURCE_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_DOC],
            onLoad: () => undefined,
            onUnLoad: () => undefined,
            toJson: () => '{"value":1}',
            parseJson: (bytes) => JSON.parse(bytes),
        });

        expect(document.save().resources).toEqual([
            {
                name: 'DOC_TEST_RESOURCE_PLUGIN',
                data: '{"value":1}',
            },
        ]);
    });

    it('runs FDocBody paragraph and range APIs in Node', () => {
        univer.dispose();
        createDocumentFacade(createSimpleDocument());

        const body = document.getBody();
        expect(body.getNumChildren()).toBe(3);

        const first = body.getChild(0);
        const second = body.getChild(1).asParagraph();
        expect(first.getType()).toBe('paragraph');
        expect(first.getKey()).toMatch(/^paragraph-/);
        expect(first.getParent()).toBe(body);
        expect(first.getNextSibling()?.asParagraph().getText()).toBe('Beta');
        expect(body.getChild(1).getPreviousSibling()?.asParagraph().getText()).toBe('Alpha');
        expect(body.createSibling(first.getType(), first.getKey(), 1)?.asParagraph().getText()).toBe('Beta');

        expect(body.getChildIndex(second)).toBe(1);
        expect(body.insertText(0, 'Hello ')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello Alpha\rBeta\rGamma\r\n');

        expect(body.insertParagraph(0, 'Title')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Title\rHello Alpha\rBeta\rGamma\r\n');

        expect(body.appendParagraph('Tail')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Title\rHello Alpha\rBeta\rGamma\rTail\r\n');

        expect(body.deleteRange({ startOffset: 0, endOffset: 6 })).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hello Alpha\rBeta\rGamma\rTail\r\n');

        expect(body.replaceRange({ startOffset: 0, endOffset: 5 }, 'Hi')).toBe(true);
        expect(document.save().body?.dataStream).toBe('Hi Alpha\rBeta\rGamma\rTail\r\n');

        expect(body.setTextStyle({ startOffset: 0, endOffset: 2 }, { bl: 1 })).toBe(true);
        expect(document.save().body?.textRuns).toContainEqual({
            st: 0,
            ed: 2,
            ts: { bl: 1 },
        });

        const paragraph = body.getChild(0).asParagraph();
        expect(body.setParagraphStyle(paragraph, { horizontalAlign: 2 })).toBe(true);
        expect(document.save().body?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(2);

        expect(body.getParagraphText(paragraph.getKey())).toBe('Hi Alpha');
        expect(body.getParagraphRange(paragraph.getKey())).toMatchObject({ startOffset: 0, endOffset: 8 });
        expect(body.resolveParagraph(paragraph.getKey()).paragraphIndex).toBe(0);
        expect(body.resolveElement(paragraph.getType(), paragraph.getKey())).toMatchObject({ type: 'paragraph', position: 0 });

        expect(body.setParagraphText(paragraph.getKey(), 'Updated')).toBe(true);
        expect(paragraph.getText()).toBe('Updated');
        expect(body.appendParagraphText(paragraph.getKey(), ' suffix')).toBe(true);
        expect(paragraph.getText()).toBe('Updated suffix');
        expect(body.removeParagraph(paragraph.getKey())).toBe(true);
        expect(document.save().body?.dataStream).toBe('Beta\rGamma\rTail\r\n');
    });

    it('keeps paragraph wrappers stable for insert-before and duplicate text', () => {
        univer.dispose();
        createDocumentFacade(createDuplicateDocument());

        const body = document.getBody();
        const secondSame = body.getChild(1).asParagraph();

        expect(body.insertParagraph(0, 'X')).toBe(true);
        expect(body.getChildIndex(secondSame)).toBe(2);
        expect(secondSame.setText('Picked')).toBe(true);
        expect(document.save().body?.dataStream).toBe('X\rSame\rPicked\rTail\r\n');
    });

    it('marks deleted paragraph wrappers as stale', () => {
        univer.dispose();
        createDocumentFacade(createSimpleDocument());

        const paragraph = document.getBody().getChild(1).asParagraph();
        expect(paragraph.removeFromParent()).toBe(true);
        expect(() => paragraph.getText()).toThrow(DocElementStaleError);
    });

    it('runs FDocParagraph list and task APIs in Node', () => {
        univer.dispose();
        createDocumentFacade(createBulletDocument());

        const bulletBody = document.getBody();
        const listItem = bulletBody.getChild(0).asParagraph();
        expect(listItem.getType()).toBe('paragraph');
        expect(listItem.getKey()).toMatch(/^paragraph-/);
        expect(listItem.getParent()).toBe(bulletBody);
        expect(listItem.isListItem()).toBe(true);
        expect(listItem.isTask()).toBe(false);

        univer.dispose();
        createDocumentFacade(createTaskDocument());

        const task = document.getBody().getChild(0).asParagraph();
        expect(task.isListItem()).toBe(true);
        expect(task.isTask()).toBe(true);
        expect(task.setTaskChecked(true)).toBe(true);
        expect(document.save().body?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);
        expect(document.getBody().setTaskChecked(task.getKey(), false)).toBe(true);
        expect(document.save().body?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST);
    });

    it('runs FDocElement cast APIs in Node', () => {
        univer.dispose();
        createDocumentFacade(createSimpleDocument());
        expect(document.getBody().getChild(0).asParagraph().getText()).toBe('Alpha');

        univer.dispose();
        createDocumentFacade(createBlockRangeDocument());
        expect(document.getBody().getChild(0).asBlockRange().getBlockType()).toBe(DocumentBlockRangeType.QUOTE);

        univer.dispose();
        createDocumentFacade(createTableDocument());
        expect(document.getBody().getChild(0).asTable().getTableId()).toBe('table-1');

        univer.dispose();
        createDocumentFacade(createCustomBlockDocument());
        expect(document.getBody().getChild(0).asCustomBlock().getBlockId()).toBe('custom-1');
    });

    it('runs FDocBlockRange APIs in Node', () => {
        for (const blockType of [DocumentBlockRangeType.QUOTE, DocumentBlockRangeType.CALLOUT, DocumentBlockRangeType.CODE]) {
            univer.dispose();
            createDocumentFacade(createBlockRangeDocument(blockType));

            const body = document.getBody();
            const block = body.getChild(0).asBlockRange();

            expect(block.getType()).toBe('blockRange');
            expect(block.getKey()).toBe(`${blockType}-1`);
            expect(block.getParent()).toBe(body);
            expect(block.getBlockType()).toBe(blockType);
            expect(block.getText()).toBe('Block');
            expect(body.getBlockRange(block.getKey()).blockType).toBe(blockType);
            expect(body.getBlockRangeText(block.getKey())).toBe('Block');
            expect(body.insertParagraph(0, 'Intro')).toBe(true);
            expect(block.getText()).toBe('Block');
            expect(block.setText('Updated')).toBe(true);
            expect(body.getBlockRangeText(block.getKey())).toBe('Updated');
            expect(block.removeFromParent()).toBe(true);
            expect(document.save().body?.dataStream).toBe('Intro\rAfter\r\n');
        }

        univer.dispose();
        createDocumentFacade(createBlockRangeDocument());
        expect(document.getBody().getChild(0).asBlockRange().unwrap()).toBe(true);
        expect(document.save().body?.dataStream).toBe('After\r\n');
    });

    it('runs FDocTable APIs in Node', () => {
        univer.dispose();
        createDocumentFacade(createTableDocument());

        const body = document.getBody();
        const table = body.getChild(0).asTable();

        expect(table.getType()).toBe('table');
        expect(table.getKey()).toBe('table-1');
        expect(table.getParent()).toBe(body);
        expect(table.getTableId()).toBe('table-1');
        expect(body.getTable(table.getTableId()).tableId).toBe('table-1');
        expect(table.removeFromParent()).toBe(true);
        expect(document.save().body?.tables).toEqual([]);

        univer.dispose();
        createDocumentFacade(createTableDocument());
        expect(document.getBody().removeTable('table-1')).toBe(true);
        expect(document.save().body?.dataStream).toBe('aa\r\n');
    });

    it('runs FDocCustomBlock APIs in Node', () => {
        univer.dispose();
        createDocumentFacade(createCustomBlockDocument());

        const body = document.getBody();
        const customBlock = body.getChild(0).asCustomBlock();

        expect(customBlock.getType()).toBe('customBlock');
        expect(customBlock.getKey()).toBe('custom-1');
        expect(customBlock.getParent()).toBe(body);
        expect(customBlock.getBlockId()).toBe('custom-1');
        expect(body.getCustomBlock(customBlock.getBlockId()).blockId).toBe('custom-1');
        expect(customBlock.removeFromParent()).toBe(true);
        expect(document.save().body?.customBlocks).toEqual([]);

        univer.dispose();
        createDocumentFacade(createCustomBlockDocument());
        expect(document.getBody().removeCustomBlock('custom-1')).toBe(true);
        expect(document.save().body?.dataStream).toBe('\raa\r\n');
    });

    it('removes a generic element from its parent in Node', () => {
        univer.dispose();
        createDocumentFacade(createSimpleDocument());

        expect(document.getBody().getChild(0).removeFromParent()).toBe(true);
        expect(document.save().body?.dataStream).toBe('Beta\rGamma\r\n');
    });
});
