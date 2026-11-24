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

import type { DocumentDataModel, IDocumentBody, IDocumentData, Injector, Univer } from '@univerjs/core';
import {
    DataStreamTreeTokenType,
    DocumentFlavor,
    ICommandService,
    IUndoRedoService,
    RedoCommand,
    SectionType,
    UndoCommand,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    InsertDocumentColumnBreakCommand,
    InsertDocumentSectionBreakCommand,
    RichTextEditingMutation,
} from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    InsertContinuousSectionBreakMenuFactory,
    InsertEvenPageSectionBreakMenuFactory,
    InsertNextColumnSectionBreakMenuFactory,
    InsertNextPageSectionBreakMenuFactory,
    InsertOddPageSectionBreakMenuFactory,
} from '../../../menu/menu';
import { createCommandTestBed } from '../../commands/__tests__/create-command-test-bed';
import {
    DOCUMENT_SECTION_BREAK_MENU_OPERATIONS,
    InsertDocumentColumnBreakOperation,
    InsertDocumentSectionBreakOperation,
} from '../insert-break.operation';

function createTraditionalDocument(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'One\r\nTwo\r\n',
            paragraphs: [
                { paragraphId: 'paragraph-one', startIndex: 3 },
                { paragraphId: 'paragraph-two', startIndex: 8 },
            ],
            sectionBreaks: [
                { sectionId: 'section_one', startIndex: 4 },
                { sectionId: 'section_two', startIndex: 9 },
            ],
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: { width: 794, height: 1123 },
            marginTop: 96,
            marginBottom: 96,
            marginLeft: 96,
            marginRight: 96,
        },
    };
}

describe('document break operations', () => {
    let univer: Univer;
    let injector: Injector;
    let get: Injector['get'];
    let commandService: ICommandService;
    let documentDataModel: DocumentDataModel;

    beforeEach(() => {
        const testBed = createCommandTestBed(createTraditionalDocument());
        univer = testBed.univer;
        injector = testBed.injector;
        get = testBed.get;
        documentDataModel = testBed.doc;
        commandService = get(ICommandService);
        get(IUndoRedoService);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(InsertDocumentColumnBreakCommand);
        commandService.registerCommand(InsertDocumentSectionBreakCommand);
        commandService.registerCommand(InsertDocumentColumnBreakOperation);
        commandService.registerCommand(InsertDocumentSectionBreakOperation);
        for (const operation of Object.values(DOCUMENT_SECTION_BREAK_MENU_OPERATIONS)) {
            commandService.registerCommand(operation);
        }

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 5,
            endOffset: 5,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
    });

    afterEach(() => univer.dispose());

    it('inserts a column break at the active caret', () => {
        expect(commandService.syncExecuteCommand(InsertDocumentColumnBreakOperation.id)).toBe(true);

        const body = getDocumentBody();
        expect(body.dataStream[5]).toBe(DataStreamTreeTokenType.COLUMN_BREAK);
        expect(body.customRanges).toContainEqual(expect.objectContaining({
            startIndex: 5,
            endIndex: 5,
            properties: { breakType: 'column' },
        }));
    });

    it('inserts and configures a section in one undo and redo step', () => {
        const initialSections = structuredClone(getDocumentBody().sectionBreaks);
        expect(commandService.syncExecuteCommand(InsertDocumentSectionBreakOperation.id, {
            sectionType: SectionType.NEXT_COLUMN,
        })).toBe(true);
        expect(getDocumentBody().sectionBreaks).toEqual([
            expect.objectContaining({ sectionId: initialSections?.[0].sectionId, startIndex: 4 }),
            expect.objectContaining({ startIndex: 5 }),
            expect.objectContaining({ sectionId: initialSections?.[1].sectionId, startIndex: 10, sectionType: SectionType.NEXT_COLUMN }),
        ]);

        expect(commandService.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(getDocumentBody().sectionBreaks).toEqual(initialSections);
        expect(commandService.syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(getDocumentBody().sectionBreaks).toEqual([
            expect.objectContaining({ sectionId: initialSections?.[0].sectionId, startIndex: 4 }),
            expect.objectContaining({ startIndex: 5 }),
            expect.objectContaining({ sectionId: initialSections?.[1].sectionId, startIndex: 10, sectionType: SectionType.NEXT_COLUMN }),
        ]);
    });

    it.each([
        { factory: InsertContinuousSectionBreakMenuFactory, sectionType: SectionType.CONTINUOUS },
        { factory: InsertNextColumnSectionBreakMenuFactory, sectionType: SectionType.NEXT_COLUMN },
        { factory: InsertNextPageSectionBreakMenuFactory, sectionType: SectionType.NEXT_PAGE },
        { factory: InsertEvenPageSectionBreakMenuFactory, sectionType: SectionType.EVEN_PAGE },
        { factory: InsertOddPageSectionBreakMenuFactory, sectionType: SectionType.ODD_PAGE },
    ])('inserts a section of type $sectionType from its toolbar item ID', ({ factory, sectionType }) => {
        const item = factory(injector);
        const nextSectionId = getDocumentBody().sectionBreaks?.[1].sectionId;

        expect(commandService.syncExecuteCommand(item.id)).toBe(true);
        const sections = getDocumentBody().sectionBreaks;
        expect(sections?.[1]).toMatchObject({ startIndex: 5 });
        expect(sections?.[2]).toMatchObject({ sectionId: nextSectionId, sectionType });
    });

    function getDocumentBody(): IDocumentBody {
        const body = documentDataModel.getBody();
        if (!body) {
            throw new Error('Expected the test document to have a body.');
        }
        return body;
    }
});
