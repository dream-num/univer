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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import { CustomRangeType, DocumentFlavor, ICommandService, IUniverInstanceService, RedoCommand, UndoCommand, Univer, UniverInstanceType, validateDocumentStructure } from '@univerjs/core';
import { DocSelectionManagerService, DocStateChangeManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService, NORMAL_TEXT_SELECTION_PLUGIN_STYLE, RenderManagerService } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createInternalClipboardDocData } from '../../../services/clipboard/internal-fragment';
import { InnerPasteCommand } from '../clipboard.inner.command';

const SOURCE: IDocumentData = {
    id: 'source',
    documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
    body: {
        dataStream: 'A\uFFFCB',
        textRuns: [{ st: 2, ed: 3, ts: { bl: 1 } }],
        customRanges: [{ startIndex: 1, endIndex: 1, wholeEntity: true, rangeId: 'reference', rangeType: CustomRangeType.FOOTNOTE, properties: { noteId: 'note' } }],
    },
    notes: {
        note: { type: 'footnote' as const, noteId: 'note', customMark: '†', referenceTextStyle: { fs: 8, va: 3 }, body: {
            dataStream: 'Explanation\r\n',
            paragraphs: [{ startIndex: 11, paragraphId: 'source-paragraph' }],
            sectionBreaks: [{ startIndex: 12, sectionId: 'source-section' }],
            textRuns: [{ st: 0, ed: 11, ts: { fs: 9.5 } }],
        } },
    },
};

describe('InnerPasteCommand notes', () => {
    let univer: Univer;
    let document: DocumentDataModel;
    let commands: ICommandService;
    let selections: DocSelectionManagerService;
    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([DocStateChangeManagerService]);
        injector.get(DocStateChangeManagerService);
        commands = injector.get(ICommandService);
        [InnerPasteCommand, RichTextEditingMutation].forEach((command) => commands.registerCommand(command));
        document = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: 'target',
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: { dataStream: '\r\n', customRanges: [], customDecorations: [], customBlocks: [], textRuns: [], paragraphs: [{ startIndex: 0, paragraphId: 'target-paragraph' }], sectionBreaks: [{ startIndex: 1, sectionId: 'target-section' }] },
        });
        injector.get(IUniverInstanceService).focusUnit(document.getUnitId());
        selections = injector.get(DocSelectionManagerService);
        selections.__TEST_ONLY_setCurrentSelection({ unitId: 'target', subUnitId: 'target' });
    });
    afterEach(() => univer.dispose());

    async function paste(offset: number, segmentId = '') {
        selections.replaceSelectionInfoWithoutRefresh({
            textRanges: [{ startOffset: offset, endOffset: offset, segmentId, collapsed: true, isActive: true }],
            rectRanges: [],
            segmentId,
            segmentPage: -1,
            isEditing: true,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
        });
        return commands.executeCommand(InnerPasteCommand.id, {
            doc: createInternalClipboardDocData(SOURCE),
            segmentId,
            textRanges: [{ startOffset: offset + 3, endOffset: offset + 3, collapsed: true, segmentId }],
        });
    }

    it('copies independent rich notes and restores their identities through undo and redo', async () => {
        const before = structuredClone(document.getSnapshot());
        expect(await paste(0)).toBe(true);
        const first = structuredClone(document.getSnapshot());
        const firstId = Object.keys(first.notes!)[0];
        expect(firstId).not.toBe('note');
        expect(first.notes![firstId]).toMatchObject({ customMark: '†', referenceTextStyle: { fs: 8, va: 3 } });
        expect(first.notes![firstId].body.textRuns).toEqual(SOURCE.notes!.note.body.textRuns);
        commands.syncExecuteCommand(UndoCommand.id);
        expect(document.getSnapshot()).toEqual(before);
        commands.syncExecuteCommand(RedoCommand.id);
        expect(document.getSnapshot()).toEqual(first);
        expect(await paste(3)).toBe(true);
        const second = document.getSnapshot();
        const ids = second.body!.customRanges!.map((range) => range.properties!.noteId);
        expect(new Set(ids).size).toBe(2);
        expect(Object.keys(second.notes!)).toHaveLength(2);
        expect(validateDocumentStructure(second)).toEqual([]);
        expect(SOURCE.notes!.note.body.paragraphs![0].paragraphId).toBe('source-paragraph');
    });

    it('drops references in modern mode and adjusts following text styles', async () => {
        document.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        expect(await paste(0)).toBe(true);
        expect(document.getBody()!.dataStream).toBe('AB\r\n');
        expect(document.getBody()!.textRuns).toContainEqual(expect.objectContaining({ st: 1, ed: 2, ts: { bl: 1 } }));
        expect(document.getSnapshot().notes).toEqual({});
        expect(validateDocumentStructure(document.getSnapshot())).toEqual([]);
    });

    it('rejects nested references without leaving orphan note resources', async () => {
        await paste(0);
        const before = structuredClone(document.getSnapshot());
        const id = Object.keys(before.notes!)[0];
        expect(await paste(0, id)).toBe(false);
        expect(document.getSnapshot()).toEqual(before);
    });
});
