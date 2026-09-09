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

import type { IRichTextEditingMutationParams } from '../core-editing.mutation';
import { CustomRangeType, DocumentFlavor, ICommandService, JSONX, TextX } from '@univerjs/core';
import { NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { createDocumentData, createTestBed } from '../../../facade/__tests__/create-test-bed';
import { DocSelectionManagerService } from '../../../services/doc-selection-manager.service';
import { InsertTextCommand } from '../../commands/core-editing.command';
import { RichTextEditingMutation, transformDocumentTextRanges } from '../core-editing.mutation';

describe('transformDocumentTextRanges', () => {
    it('moves an active body caret through an insertion with right priority', () => {
        expect(transformDocumentTextRanges(['body', {
            et: 'text-x',
            e: [
                { t: 'r', len: 10 },
                { t: 'i', len: 6, body: { dataStream: 'REMOTE' } },
            ],
        }], [{
            startOffset: 14,
            endOffset: 14,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }])).toEqual([expect.objectContaining({
            startOffset: 20,
            endOffset: 20,
            collapsed: true,
            isActive: true,
        })]);
    });

    it('treats an omitted segment id as the document body', () => {
        expect(transformDocumentTextRanges(['body', {
            et: 'text-x',
            e: [
                { t: 'i', len: 6, body: { dataStream: 'REMOTE' } },
            ],
        }], [{
            startOffset: 14,
            endOffset: 14,
            collapsed: true,
            isActive: true,
        }])).toEqual([expect.objectContaining({
            startOffset: 20,
            endOffset: 20,
            collapsed: true,
            isActive: true,
        })]);
    });

    it('does not move a body selection through a header mutation', () => {
        const range = {
            startOffset: 14,
            endOffset: 18,
            collapsed: false,
            segmentId: '',
        };
        expect(transformDocumentTextRanges(['header-1', 'body', {
            et: 'text-x',
            e: [{ t: 'i', len: 6, body: { dataStream: 'REMOTE' } }],
        }], [range])).toEqual([range]);
    });
});

describe('RichTextEditingMutation selection scheduling', () => {
    it('rejects a remote footnote whose segment identity belongs to a header', () => {
        const snapshot = createDocumentData('note-collision', {
            dataStream: 'Body\r\n',
            paragraphs: [{ paragraphId: 'p', startIndex: 4 }],
            sectionBreaks: [{ sectionId: 's', startIndex: 5 }],
        });
        snapshot.headers = { shared: { headerId: 'shared', body: {
            dataStream: 'Header\r\n',
            paragraphs: [{ paragraphId: 'hp', startIndex: 6 }],
            sectionBreaks: [{ sectionId: 'hs', startIndex: 7 }],
        } } };
        const bed = createTestBed(snapshot);
        try {
            const before = structuredClone(bed.doc.getSnapshot());
            expect(() => bed.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
                unitId: snapshot.id,
                segmentId: '',
                textRanges: null,
                actions: JSONX.getInstance().insertOp(['notes', 'shared'], { type: 'footnote' as const, noteId: 'shared', body: { dataStream: '\r\n', paragraphs: [{ paragraphId: 'np', startIndex: 0 }], sectionBreaks: [{ sectionId: 'ns', startIndex: 1 }] } }),
            }, { fromCollab: true })).toThrow('invalid-note-id');
            expect(bed.doc.getSnapshot()).toEqual(before);
            expect(bed.doc.getSelfOrHeaderFooterModel('shared')?.getBody()?.dataStream).toBe('Header\r\n');
        } finally {
            bed.univer.dispose();
        }
    });

    it('keeps consecutive text, spaces and paragraphs in the active footnote', async () => {
        const snapshot = createDocumentData('note-input', {
            dataStream: 'A\uFFFCB\r\n',
            paragraphs: [{ paragraphId: 'p', startIndex: 3 }],
            sectionBreaks: [{ sectionId: 's', startIndex: 4 }],
            customRanges: [{ rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, startIndex: 1, endIndex: 1, wholeEntity: true, properties: { noteId: 'note' } }],
        });
        snapshot.documentStyle = { ...snapshot.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        snapshot.notes = { note: { type: 'footnote' as const, noteId: 'note', body: {
            dataStream: '\r\n',
            paragraphs: [{ paragraphId: 'np', startIndex: 0 }],
            sectionBreaks: [{ sectionId: 'ns', startIndex: 1 }],
        } } };
        const bed = createTestBed(snapshot);
        const selectionManager = bed.get(DocSelectionManagerService);
        const target = { unitId: 'note-input', subUnitId: 'note-input' };
        selectionManager.__TEST_ONLY_setCurrentSelection(target);
        selectionManager.replaceSelectionInfoWithoutRefresh({
            textRanges: [{ startOffset: 0, endOffset: 0, collapsed: true, isActive: true, segmentId: 'note' }],
            rectRanges: [],
            segmentId: 'note',
            segmentPage: 0,
            isEditing: true,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
        }, target);
        try {
            for (const text of ['First', ' ', 'line', '\r', 'Next', ' ', 'line']) {
                const range = selectionManager.getActiveTextRange()!;
                expect(range.segmentId).toBe('note');
                bed.get(ICommandService).syncExecuteCommand(InsertTextCommand.id, {
                    unitId: target.unitId,
                    range,
                    body: text === '\r'
                        ? { dataStream: text, paragraphs: [{ paragraphId: 'next-p', startIndex: 0 }] }
                        : { dataStream: text },
                });
                await Promise.resolve();
                expect(selectionManager.getSelectionInfo()?.segmentId).toBe('note');
            }
            expect(bed.doc.getSnapshot().notes?.note.body.dataStream).toBe('First line\rNext line\r\n');
            expect(bed.doc.getBody()?.dataStream).toBe('A\uFFFCB\r\n');
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([1, 2])('publishes deletion at offset %i and its collaborative undo atomically', (offset) => {
        const snapshot = createDocumentData('note-delete', {
            dataStream: 'A\uFFFCB\r\n',
            customDecorations: [],
            paragraphs: [{ paragraphId: 'p', startIndex: 3 }],
            sectionBreaks: [{ sectionId: 's', startIndex: 4 }],
            customRanges: [{ rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, startIndex: 1, endIndex: 1, wholeEntity: true, properties: { noteId: 'note' } }],
        });
        snapshot.documentStyle = { ...snapshot.documentStyle, documentFlavor: DocumentFlavor.TRADITIONAL };
        snapshot.notes = { note: { type: 'footnote' as const, noteId: 'note', body: {
            dataStream: 'Explanation\r\n',
            paragraphs: [{ paragraphId: 'np', startIndex: 11 }],
            sectionBreaks: [{ sectionId: 'ns', startIndex: 12 }],
        } } };
        const bed = createTestBed(structuredClone(snapshot));
        const peer = createTestBed(structuredClone(snapshot));
        const params: IRichTextEditingMutationParams = {
            unitId: 'note-delete',
            segmentId: '',
            textRanges: null,
            actions: JSONX.getInstance().editOp(new TextX().retain(offset).delete(1).serialize(), ['body']),
        };
        try {
            const before = structuredClone(bed.doc.getSnapshot());
            const expectedText = offset === 1 ? 'AB\r\n' : 'A\uFFFC\r\n';
            const noteExists = offset !== 1;
            const observed: Array<{ text?: string; noteExists: boolean }> = [];
            const subscription = bed.doc.change$.subscribe(() => observed.push({
                text: bed.doc.getBody()?.dataStream,
                noteExists: bed.doc.getSnapshot().notes?.note != null,
            }));
            observed.length = 0;
            const apply = vi.spyOn(JSONX, 'apply');
            const undo = bed.get(ICommandService).syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(RichTextEditingMutation.id, params);
            expect(apply).toHaveBeenCalledTimes(offset === 1 ? 2 : 1);
            apply.mockRestore();
            expect(bed.doc.getBody()?.dataStream).toBe(expectedText);
            expect(bed.doc.getSnapshot().notes?.note != null).toBe(noteExists);
            expect(observed).toEqual([{ text: expectedText, noteExists }]);
            peer.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, params, { fromCollab: true });
            expect(peer.doc.getSnapshot()).toEqual(bed.doc.getSnapshot());
            bed.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, undo);
            peer.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, undo, { fromCollab: true });
            expect(bed.doc.getSnapshot()).toEqual(before);
            expect(peer.doc.getSnapshot()).toEqual(before);
            expect(observed).toEqual([{ text: expectedText, noteExists }, { text: 'A\uFFFCB\r\n', noteExists: true }]);
            subscription.unsubscribe();
        } finally {
            bed.univer.dispose();
            peer.univer.dispose();
        }
    });

    it('does not refresh selection for metadata changes without ranges', async () => {
        const testBed = createTestBed();
        const selectionManager = testBed.get(DocSelectionManagerService);
        const refreshSelection = vi.spyOn(selectionManager, 'refreshSelection');
        const documentStyle = testBed.doc.getDocumentStyle();
        const previousMargin = documentStyle.marginTop;
        const actions = JSONX.getInstance().replaceOp(
            ['documentStyle', 'marginTop'],
            previousMargin,
            (previousMargin ?? 0) + 1
        );

        testBed.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: testBed.doc.getUnitId(),
            actions,
            textRanges: [],
            trigger: 'test.metadata-command',
        });
        await Promise.resolve();

        expect(refreshSelection).not.toHaveBeenCalled();
        testBed.univer.dispose();
    });
});
