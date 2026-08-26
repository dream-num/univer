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
import type { FDocument } from '../../facade/f-document';
import {
    CommandType,
    DocumentFlavor,
    DrawingTypeEnum,
    ICommandService,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    JSONX,
    RedoCommand,
    TextXActionType,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InsertTextCommand } from '../../commands/commands/core-editing.command';
import { DeleteDocumentSectionBreakCommand } from '../../commands/commands/update-document-section.command';
import { RichTextEditingMutation } from '../../commands/mutations/core-editing.mutation';
import { DocsRenameMutation } from '../../commands/mutations/docs-rename.mutation';
import { createDocumentData, createTableDocument, createTestBed } from '../../facade/__tests__/create-test-bed';
import { DOCUMENT_UNIT_PERMISSION_ACTIONS, DocumentPermission } from '../../services/permission/document-permission';

function createTwoSectionDocument(): IDocumentData {
    const data = createDocumentData('permission-test', {
        dataStream: 'One\r\nTwo\r\n',
        paragraphs: [
            { startIndex: 3, paragraphId: 'paragraph-one' },
            { startIndex: 8, paragraphId: 'paragraph-two' },
        ],
        sectionBreaks: [
            { sectionId: 'section-one', startIndex: 4 },
            { sectionId: 'section-two', startIndex: 9 },
        ],
    });
    data.documentStyle = { ...data.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
    return data;
}

function createSharedHeaderDocument(): IDocumentData {
    const data = createTwoSectionDocument();
    data.headers = {
        'shared-header': {
            headerId: 'shared-header',
            body: {
                dataStream: 'Head\r\n',
                paragraphs: [{ startIndex: 4, paragraphId: 'header-paragraph' }],
                sectionBreaks: [],
            },
        },
    };
    data.documentStyle.defaultHeaderId = 'shared-header';
    return data;
}

function createDrawingDocument(): IDocumentData {
    const data = createDocumentData('permission-drawing', {
        dataStream: 'A\b\r\n',
        paragraphs: [{ startIndex: 2, paragraphId: 'drawing-paragraph' }],
        sectionBreaks: [{ sectionId: 'drawing-section', startIndex: 3 }],
        customBlocks: [{ startIndex: 1, blockId: 'drawing-one' }],
    });
    data.drawings = {
        'drawing-one': {
            drawingId: 'drawing-one',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            docTransform: { angle: 0 },
        } as never,
    };
    data.drawingsOrder = ['drawing-one'];
    return data;
}

describe('DocPermissionController', () => {
    let univer: Univer;
    let document: FDocument;
    let get: ReturnType<typeof createTestBed>['get'];

    beforeEach(() => {
        const testBed = createTestBed(createTwoSectionDocument());
        univer = testBed.univer;
        get = testBed.get;
        document = testBed.univerAPI.getActiveDocument()!;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('registers every whole-Document permission point when the unit is created', () => {
        const permissionService = get(IPermissionService);
        DOCUMENT_UNIT_PERMISSION_ACTIONS.forEach((action) => {
            expect(permissionService.getPermissionPoint(
                new DocumentPermission(document.getId(), document.getId(), action).id
            )).not.toBeNull();
        });
    });

    it('enforces document edit permission through the facade and command pipeline', async () => {
        await document.getPermission().setReadOnly();

        expect(document.getPermission().canEdit()).toBe(false);
        expect(document.getParagraph('paragraph-one')!.setText('Denied')).toBe(false);
        expect(document.getParagraph('paragraph-one')!.getText()).toBe('One');
    });

    it('uses section and paragraph ids as hierarchical edit boundaries', async () => {
        const firstSection = document.getSection(0)!;
        const firstParagraph = document.getParagraphs()[0];
        const secondParagraph = document.getParagraph('paragraph-two')!;
        if (!firstParagraph) throw new Error('Paragraph not found.');

        await firstSection.getPermission().setReadOnly();

        expect(firstSection.getPermission().canEdit()).toBe(false);
        expect(firstParagraph.getPermission().canEdit()).toBe(false);
        expect(secondParagraph.getPermission().canEdit()).toBe(true);
        expect(firstParagraph.setText('Denied')).toBe(false);
        expect(secondParagraph.setText('Allowed')).toBe(true);

        await document.getSection(0)!.getPermission().setEditable();
        await document.getParagraph('paragraph-one')!.getPermission().setEditable(false);
        expect(document.getParagraph('paragraph-one')!.setText('Denied again')).toBe(false);
    });

    it('requires every owner Section to edit a shared header', async () => {
        univer.dispose();
        const testBed = createTestBed(createSharedHeaderDocument());
        univer = testBed.univer;
        get = testBed.get;
        document = testBed.univerAPI.getActiveDocument()!;
        await document.getSection(1)!.getPermission().setEditable(false);

        expect(get(ICommandService).syncExecuteCommand(InsertTextCommand.id, {
            unitId: document.getId(),
            segmentId: 'shared-header',
            range: { startOffset: 1, endOffset: 1, collapsed: true },
            body: { dataStream: 'X' },
        })).toBe(false);

        await document.getSection(1)!.getPermission().setEditable(true);
        expect(get(ICommandService).syncExecuteCommand(InsertTextCommand.id, {
            unitId: document.getId(),
            segmentId: 'shared-header',
            range: { startOffset: 1, endOffset: 1, collapsed: true },
            body: { dataStream: 'X' },
        })).toBe(true);
    });

    it('accepts collaboration mutations despite local edit permission', async () => {
        await document.getPermission().setReadOnly();

        await expect(get(ICommandService).executeCommand(DocsRenameMutation.id, {
            unitId: document.getId(),
            name: 'Remote name',
        }, { fromCollab: true })).resolves.toBe(true);
        expect(document.getName()).toBe('Remote name');
    });

    it('applies incoming changesets without creating local Undo history', async () => {
        get(IUndoRedoService).clearUndoRedo(document.getId());
        await document.getPermission().setReadOnly();

        await expect(get(ICommandService).executeCommand(DocsRenameMutation.id, {
            unitId: document.getId(),
            name: 'Remote changeset',
        }, { fromChangeset: true })).resolves.toBe(true);
        await document.getPermission().setEditable(true);

        expect(get(ICommandService).syncExecuteCommand(UndoCommand.id)).toBe(false);
        expect(document.getName()).toBe('Remote changeset');
    });

    it('enforces stable entity ids together with their current Section parent', async () => {
        univer.dispose();
        const testBed = createTestBed(createTableDocument('permission-entity'));
        univer = testBed.univer;
        document = testBed.univerAPI.getActiveDocument()!;

        await document.getEntityPermission('', 'table', 'table-1').setEditable(false);

        expect(document.getEntityPermission('', 'table', 'table-1').canEdit()).toBe(false);
        expect(document.getTextRange(0, 2).setText('Denied')).toBe(false);
    });

    it('enforces Drawing entity permission on direct JSONX transform mutations', async () => {
        univer.dispose();
        const testBed = createTestBed(createDrawingDocument());
        univer = testBed.univer;
        get = testBed.get;
        document = testBed.univerAPI.getActiveDocument()!;
        const drawingId = document.getDocumentDataModel().getSnapshot().drawingsOrder?.[0];
        if (!drawingId) throw new Error('Drawing not found.');
        await document.getEntityPermission('', 'drawing', drawingId).setReadOnly();
        const actions = JSONX.getInstance().replaceOp(
            ['drawings', drawingId, 'docTransform', 'angle'],
            0,
            15
        );

        expect(get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: document.getId(),
            segmentId: '',
            actions,
            textRanges: [],
        })).toBe(false);
        expect(document.getDocumentDataModel().getSnapshot().drawings?.[drawingId].docTransform?.angle).toBe(0);
    });

    it('enforces paragraph permission on direct RichText mutations used by paste and undo/redo', async () => {
        await document.getParagraph('paragraph-one')!.getPermission().setEditable(false);
        const actions = JSONX.getInstance().editOp([
            { t: TextXActionType.RETAIN, len: 1 },
            { t: TextXActionType.INSERT, len: 1, body: { dataStream: 'X' } },
        ]);

        expect(get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: document.getId(),
            segmentId: '',
            actions,
            textRanges: [],
        })).toBe(false);
        expect(get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: document.getId(),
            segmentId: '',
            actions: JSONX.getInstance().editOp([{ t: TextXActionType.DELETE, len: 1 }]),
            textRanges: [],
        })).toBe(false);
        expect(document.getParagraph('paragraph-one')!.getText()).toBe('One');

        await document.getParagraph('paragraph-one')!.getPermission().setEditable(true);
        expect(get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: document.getId(),
            segmentId: '',
            actions,
            textRanges: [],
        })).toBeTruthy();
        expect(document.getParagraph('paragraph-one')!.getText()).toBe('OXne');
    });

    it('keeps denied Undo history available until the paragraph is editable again', async () => {
        const paragraph = document.getParagraph('paragraph-one')!;
        expect(paragraph.setText('Changed')).toBe(true);
        await paragraph.getPermission().setEditable(false);

        expect(get(ICommandService).syncExecuteCommand(UndoCommand.id)).toBe(false);
        expect(paragraph.getText()).toBe('Changed');

        await paragraph.getPermission().setEditable(true);
        expect(get(ICommandService).syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(paragraph.getText()).toBe('One');
    });

    it('keeps denied Redo history available until the paragraph is editable again', async () => {
        const paragraph = document.getParagraph('paragraph-one')!;
        expect(paragraph.setText('Changed')).toBe(true);
        expect(get(ICommandService).syncExecuteCommand(UndoCommand.id)).toBe(true);
        await paragraph.getPermission().setEditable(false);

        expect(get(ICommandService).syncExecuteCommand(RedoCommand.id)).toBe(false);
        expect(paragraph.getText()).toBe('One');

        await paragraph.getPermission().setEditable(true);
        expect(get(ICommandService).syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(paragraph.getText()).toBe('Changed');
    });

    it('rejects a range edit when any covered Paragraph is read-only', async () => {
        await document.getParagraph('paragraph-two')!.getPermission().setEditable(false);

        expect(document.getTextRange(0, 8).setText('Denied')).toBe(false);
        expect(document.getParagraph('paragraph-one')!.getText()).toBe('One');
        expect(document.getParagraph('paragraph-two')!.getText()).toBe('Two');
    });

    it('requires both adjacent Sections before deleting their shared boundary', async () => {
        await document.getSection(1)!.getPermission().setEditable(false);

        expect(get(ICommandService).syncExecuteCommand(DeleteDocumentSectionBreakCommand.id, {
            unitId: document.getId(),
            sectionId: 'section-one',
        })).toBe(false);
        expect(document.getSection(0)?.getId()).toBe('section-one');
        expect(document.getSection(1)?.getId()).toBe('section-two');
    });

    it.each([
        [UnitAction.Copy, 'doc.command.copy-current-paragraph'],
        [UnitAction.Print, 'docs.operation.print'],
        [UnitAction.Export, 'docs-exchange-client.operation.export-doc'],
        [UnitAction.Comment, 'docs.command.add-comment'],
        [UnitAction.Comment, 'docs.operation.add-drawing-comment'],
    ] as const)('enforces unit action %s on its existing command surface', async (point, commandId) => {
        const commandService = get(ICommandService);
        commandService.registerCommand({ id: commandId, type: CommandType.OPERATION, handler: () => true });
        await document.getPermission().setPoint(point, false);

        expect(commandService.syncExecuteCommand(commandId)).toBe(false);
    });

    it('keeps Copy and Comment available when only Document Edit is denied', async () => {
        const commandService = get(ICommandService);
        commandService.registerCommand({ id: 'doc.command.copy-current-paragraph', type: CommandType.OPERATION, handler: () => true });
        commandService.registerCommand({ id: 'docs.command.add-comment', type: CommandType.COMMAND, handler: () => true });
        await document.getPermission().setReadOnly();

        expect(commandService.syncExecuteCommand('doc.command.copy-current-paragraph')).toBe(true);
        expect(commandService.syncExecuteCommand('docs.command.add-comment')).toBe(true);
    });

    it('blocks local comment mutations and still accepts remote comments', async () => {
        const commandService = get(ICommandService);
        commandService.registerCommand({ id: 'thread-comment.mutation.add-comment', type: CommandType.MUTATION, handler: () => true });
        await document.getPermission().setPoint(UnitAction.Comment, false);
        const params = { unitId: document.getId() };

        expect(commandService.syncExecuteCommand('thread-comment.mutation.add-comment', params)).toBe(false);
        await expect(commandService.executeCommand(
            'thread-comment.mutation.add-comment',
            params,
            { fromChangeset: true }
        )).resolves.toBe(true);
    });

    it('blocks extension edit commands and resource mutations at the Unit ceiling', async () => {
        const commandService = get(ICommandService);
        commandService.registerCommand({ id: 'doc.command.insert-float-image', type: CommandType.COMMAND, handler: () => true });
        commandService.registerCommand({ id: 'doc.command.switch-mode', type: CommandType.COMMAND, handler: () => true });
        commandService.registerCommand({ id: 'docs-code.mutation.set-config', type: CommandType.MUTATION, handler: () => true });
        commandService.registerCommand({ id: 'doc.command.open-header-footer-panel', type: CommandType.COMMAND, handler: () => true });
        await document.getPermission().setReadOnly();
        const params = { unitId: document.getId() };

        expect(commandService.syncExecuteCommand('doc.command.insert-float-image', params)).toBe(false);
        expect(commandService.syncExecuteCommand('doc.command.switch-mode', params)).toBe(false);
        expect(commandService.syncExecuteCommand('docs-code.mutation.set-config', params)).toBe(false);
        expect(commandService.syncExecuteCommand('doc.command.open-header-footer-panel', params)).toBe(true);
    });

    it('enforces stable Entity permissions on direct extension mutations', async () => {
        const commandService = get(ICommandService);
        commandService.registerCommand({ id: 'doc.mutation.update-shape-data', type: CommandType.MUTATION, handler: () => true });
        await document.getEntityPermission('', 'custom-block', 'shape-one').setEditable(false);
        const params = { unitId: document.getId(), shapeId: 'shape-one' };

        expect(commandService.syncExecuteCommand('doc.mutation.update-shape-data', params)).toBe(false);
        expect(commandService.syncExecuteCommand('doc.mutation.update-shape-data', {
            ...params,
            formulaLastValueGuard: { sessionId: 1 },
        })).toBe(true);
        await expect(commandService.executeCommand(
            'doc.mutation.update-shape-data',
            params,
            { fromChangeset: true }
        )).resolves.toBe(true);
    });

    it('keeps derived Formula persistence available in read-only Documents', async () => {
        const commandService = get(ICommandService);
        commandService.registerCommand({ id: 'docs-formula.mutation.set-last-values', type: CommandType.MUTATION, handler: () => true });
        await document.getPermission().setReadOnly();

        expect(commandService.syncExecuteCommand('docs-formula.mutation.set-last-values', {
            unitId: document.getId(),
            updates: [],
        })).toBe(true);
    });

    it('uses the execution Unit instead of the active Document for external actions', async () => {
        const commandService = get(ICommandService);
        commandService.registerCommand({ id: 'docs.operation.print', type: CommandType.OPERATION, handler: () => true });
        await document.getPermission().setPoint(UnitAction.Print, false);
        univer.createUnit(UniverInstanceType.UNIVER_DOC, createDocumentData('other-doc', {
            dataStream: '\r\n',
            paragraphs: [{ startIndex: 0, paragraphId: 'other-paragraph' }],
        }));

        expect(commandService.syncExecuteCommand(
            'docs.operation.print',
            undefined,
            { unitId: document.getId() }
        )).toBe(false);
    });

    it('clears Unit and object permissions when the Document is disposed', async () => {
        const unitPermission = document.getPermission();
        const paragraphPermission = document.getParagraph('paragraph-one')!.getPermission();
        await unitPermission.setReadOnly();
        await paragraphPermission.setEditable(false);

        expect(get(IUniverInstanceService).disposeUnit(document.getId())).toBe(true);
        expect(unitPermission.getPoint(UnitAction.Edit)).toBe(true);
        expect(paragraphPermission.canEdit()).toBe(true);
    });
});
