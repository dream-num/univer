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

import type { DocumentDataModel, ICommand, IDocumentData, Injector, Univer } from '@univerjs/core';
import { ICommandService, IResourceManagerService, UniverInstanceType } from '@univerjs/core';
import { InsertTextCommand, RichTextEditingMutation } from '@univerjs/docs';
import { FDocument } from '@univerjs/docs/facade';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBed } from './create-test-bed';

describe('Test FDocument', () => {
    let univer: Univer;
    let get: Injector['get'];
    let documentDataModel: DocumentDataModel;
    let document: FDocument;

    function createDocumentFacade(docData?: IDocumentData) {
        const testBed = createTestBed(docData);
        univer = testBed.univer;
        get = testBed.get;
        documentDataModel = testBed.doc;

        const commandService = get(ICommandService);
        commandService.registerCommand(InsertTextCommand);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        document = univer.__getInjector().createInstance(FDocument, documentDataModel);
    }

    beforeEach(() => {
        createDocumentFacade();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('appends text at the tail of the body', async () => {
        await expect(document.appendText('Univer')).resolves.toBe(true);

        expect(document.save().body?.dataStream).toBe('Hello,Univer\r\n');
    });

    it('inserts text at an explicit document range', async () => {
        await expect(document.insertText('Docs', {
            endOffset: 4,
            segmentId: '',
            startOffset: 2,
        })).resolves.toBe(true);

        expect(document.save().body?.dataStream).toBe('HeDocso,\r\n');
    });

    it('inserts paragraphs at an explicit document range', async () => {
        await expect(document.insertParagraph('Line 1\nLine 2', {
            endOffset: 6,
            segmentId: '',
            startOffset: 6,
        })).resolves.toBe(true);

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
});
