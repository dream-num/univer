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

import type { JSONXActions } from '@univerjs/core';
import {
    DocStyleType,
    DocumentDataModel,
    DocumentFlavor,
    ICommandService,
    IPermissionService,
    JSONX,
    NamedStyleType,
    PRESERVE_INSERTED_PARAGRAPH_IDS,
    PresetListType,
    RedoCommand,
    TextXActionType,
    Tools,
    UndoCommand,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { DocumentViewModel } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDocumentData, createTestBed } from '../../../facade/__tests__/create-test-bed';
import { DocSelectionManagerService } from '../../../services/doc-selection-manager.service';
import { DocStateEmitService } from '../../../services/doc-state-emit.service';
import { DocumentEditablePermission } from '../../../services/permission/permission-point/document/editable';
import { RichTextEditingMutation } from '../../mutations/core-editing.mutation';
import { SetHeadingCollapsedCommand } from '../set-heading-collapsed.command';
import { UpdateDocumentParagraphStyleCommand } from '../update-document-paragraph-style.command';

function createData() {
    return createDocumentData('fold-doc', {
        dataStream: 'Parent\rChild\rText\rPeer\rTail\r\n',
        customRanges: [],
        customDecorations: [],
        paragraphs: [
            { startIndex: 6, paragraphId: 'parent', paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
            { startIndex: 12, paragraphId: 'child', paragraphStyle: { namedStyleType: NamedStyleType.HEADING_2 } },
            { startIndex: 17, paragraphId: 'text' },
            { startIndex: 22, paragraphId: 'peer', paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
            { startIndex: 27, paragraphId: 'tail' },
        ],
        sectionBreaks: [{ startIndex: 28, sectionId: 'section' }],
    });
}

function getLatestActions(bed: ReturnType<typeof createTestBed>): JSONXActions {
    let actions: JSONXActions = null;
    const subscription = bed.get(DocStateEmitService).docStateChangeParams$.subscribe((change) => {
        actions = change?.redoState.actions ?? null;
    });
    subscription.unsubscribe();
    expect(actions).not.toBeNull();
    return actions;
}

function replayRemoteMutation(bed: ReturnType<typeof createTestBed>, actions: JSONXActions | undefined): void {
    if (actions == null) {
        return;
    }
    bed.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, JSON.parse(JSON.stringify({
        unitId: bed.doc.getUnitId(),
        actions,
        textRanges: null,
    })), { fromCollab: true });
}

describe('SetHeadingCollapsedCommand', () => {
    let bed: ReturnType<typeof createTestBed>;
    beforeEach(() => {
        const data = createData();
        data.documentStyle.documentFlavor = DocumentFlavor.MODERN;
        bed = createTestBed(data);
    });
    afterEach(() => bed.univer.dispose());
    const set = (paragraphId: string, collapsed: boolean) => bed.get(ICommandService).syncExecuteCommand(
        SetHeadingCollapsedCommand.id,
        { unitId: 'fold-doc', paragraphId, collapsed }
    );

    it('round trips nested collapsed state through snapshots, undo and redo without changing content', async () => {
        const originalBody = Tools.deepClone(bed.doc.getBody());
        expect(set('child', true)).toBe(true);
        expect(set('parent', true)).toBe(true);
        const saved = JSON.parse(JSON.stringify(bed.doc.getSnapshot()));
        const restored = new DocumentDataModel(saved);
        const view = new DocumentViewModel(restored);
        expect(view.getCollapsedHeadingAtOffset(15)?.paragraphId).toBe('parent');
        expect(restored.getBody()?.dataStream).toBe(originalBody?.dataStream);
        view.dispose();
        restored.dispose();
        await bed.get(ICommandService).executeCommand(UndoCommand.id);
        expect(bed.doc.getBody()?.paragraphs?.[0].headingCollapsed).toBeUndefined();
        expect(bed.doc.getBody()?.paragraphs?.[1].headingCollapsed).toBe(true);
        await bed.get(ICommandService).executeCommand(RedoCommand.id);
        expect(bed.doc.getBody()?.paragraphs?.[0].headingCollapsed).toBe(true);
        expect(set('parent', false)).toBe(true);
        const expanded = new DocumentViewModel(bed.doc);
        expect(expanded.getCollapsedHeadingAtOffset(13)?.paragraphId).toBe('child');
        expect(expanded.getCollapsedHeadingAtOffset(18)).toBeUndefined();
        expect(bed.doc.getBody()?.dataStream).toBe(originalBody?.dataStream);
        expanded.dispose();
    });

    it('replays serialized fold, expansion, undo and redo mutations on a peer', async () => {
        const peer = createTestBed(Tools.deepClone(bed.doc.getSnapshot()));
        const originalStream = bed.doc.getBody()!.dataStream;
        const expectPeerConvergence = () => {
            replayRemoteMutation(peer, getLatestActions(bed));
            expect(peer.doc.getSnapshot()).toEqual(bed.doc.getSnapshot());
            expect(peer.doc.getBody()!.dataStream).toBe(originalStream);
        };
        try {
            expect(set('child', true)).toBe(true);
            expectPeerConvergence();
            expect(set('parent', true)).toBe(true);
            expectPeerConvergence();
            expect(set('parent', false)).toBe(true);
            expectPeerConvergence();
            const expanded = Tools.deepClone(peer.doc.getSnapshot());
            await bed.get(ICommandService).executeCommand(UndoCommand.id);
            expectPeerConvergence();
            expect(peer.doc.getBody()!.paragraphs![0].headingCollapsed).toBe(true);
            await bed.get(ICommandService).executeCommand(RedoCommand.id);
            expectPeerConvergence();
            expect(peer.doc.getSnapshot()).toEqual(expanded);
            const restored = createTestBed(JSON.parse(JSON.stringify(peer.doc.getSnapshot())));
            const view = new DocumentViewModel(restored.doc);
            try {
                expect(restored.doc.getSnapshot()).toEqual(bed.doc.getSnapshot());
                expect(view.getCollapsedHeadingAtOffset(13)?.paragraphId).toBe('child');
                expect(view.getCollapsedHeadingAtOffset(18)).toBeUndefined();
            } finally {
                view.dispose();
                restored.univer.dispose();
            }
        } finally {
            peer.univer.dispose();
        }
    });

    it.each(['insert', 'delete', 'delete-heading', 'format'] as const)('converges through peer mutations when folding races with %s', (edit) => {
        const peer = createTestBed(Tools.deepClone(bed.doc.getSnapshot()));
        try {
            expect(set('parent', true)).toBe(true);
            const fold = Tools.deepClone(getLatestActions(bed));
            const insertBody = { dataStream: 'Before\r', paragraphs: [{ paragraphId: 'before', startIndex: 6 }] };
            Reflect.set(insertBody, PRESERVE_INSERTED_PARAGRAPH_IDS, true);
            let actions: JSONXActions;
            if (edit === 'insert') {
                actions = JSONX.getInstance().editOp([{ t: TextXActionType.INSERT, len: 7, body: insertBody }], ['body']);
            } else if (edit === 'delete') {
                actions = JSONX.getInstance().editOp([
                    { t: TextXActionType.RETAIN, len: 7 },
                    { t: TextXActionType.DELETE, len: 6 },
                ], ['body']);
            } else if (edit === 'delete-heading') {
                actions = JSONX.getInstance().editOp([{ t: TextXActionType.DELETE, len: 7 }], ['body']);
            } else {
                actions = JSONX.getInstance().editOp([
                    { t: TextXActionType.RETAIN, len: 6 },
                    { t: TextXActionType.RETAIN, len: 1, coverType: UpdateDocsAttributeType.COVER, body: {
                        dataStream: '',
                        paragraphs: [{ startIndex: 0, paragraphId: 'parent', paragraphStyle: { spaceAbove: { v: 12 } } }],
                    } },
                ], ['body']);
            }
            peer.get(ICommandService).syncExecuteCommand(RichTextEditingMutation.id, {
                unitId: peer.doc.getUnitId(),
                actions,
                textRanges: null,
                isEditing: false,
            });
            const peerEdit = Tools.deepClone(getLatestActions(peer));
            replayRemoteMutation(bed, JSONX.transform(peerEdit, fold, 'left'));
            replayRemoteMutation(peer, JSONX.transform(fold, peerEdit, 'right'));
            expect(peer.doc.getSnapshot()).toEqual(bed.doc.getSnapshot());
            const parent = bed.doc.getBody()!.paragraphs!.find((paragraph) => paragraph.paragraphId === 'parent');
            if (edit === 'delete-heading') {
                expect(parent).toBeUndefined();
                expect(bed.doc.getBody()!.dataStream).toBe('Child\rText\rPeer\rTail\r\n');
                expect(bed.doc.getBody()!.paragraphs![0]).toMatchObject({ paragraphId: 'child', startIndex: 5 });
                expect(bed.doc.getBody()!.paragraphs![0].headingCollapsed).toBeUndefined();
                return;
            }
            expect(parent).toMatchObject({
                startIndex: edit === 'insert' ? 13 : 6,
                headingCollapsed: true,
                paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 },
            });
            expect(parent?.bullet).toBeUndefined();
            if (edit === 'insert') {
                expect(bed.doc.getBody()!.dataStream).toBe('Before\rParent\rChild\rText\rPeer\rTail\r\n');
            } else if (edit === 'delete') {
                expect(bed.doc.getBody()!.dataStream).toBe('Parent\rText\rPeer\rTail\r\n');
                expect(bed.doc.getBody()!.paragraphs!.some((paragraph) => paragraph.paragraphId === 'child')).toBe(false);
            } else {
                expect(parent?.paragraphStyle?.spaceAbove).toEqual({ v: 12 });
            }
        } finally {
            peer.univer.dispose();
        }
    });

    it.each(['left', 'right'] as const)('converges when same-heading toggles race with %s priority', (priority) => {
        const peer = createTestBed(Tools.deepClone(bed.doc.getSnapshot()));
        const originalStream = bed.doc.getBody()!.dataStream;
        try {
            expect(set('parent', true)).toBe(true);
            const fold = Tools.deepClone(getLatestActions(bed));
            const peerCommands = peer.get(ICommandService);
            expect(peerCommands.syncExecuteCommand(SetHeadingCollapsedCommand.id, {
                unitId: peer.doc.getUnitId(),
                paragraphId: 'parent',
                collapsed: true,
            })).toBe(true);
            const peerFold = Tools.deepClone(getLatestActions(peer));
            expect(peerCommands.syncExecuteCommand(SetHeadingCollapsedCommand.id, {
                unitId: peer.doc.getUnitId(),
                paragraphId: 'parent',
                collapsed: false,
            })).toBe(true);
            const peerToggle = JSONX.compose(peerFold, Tools.deepClone(getLatestActions(peer)));
            replayRemoteMutation(bed, JSONX.transform(peerToggle, fold, priority));
            replayRemoteMutation(peer, JSONX.transform(fold, peerToggle, priority === 'left' ? 'right' : 'left'));
            expect(peer.doc.getSnapshot()).toEqual(bed.doc.getSnapshot());
            expect(bed.doc.getBody()!.paragraphs![0].headingCollapsed).toBe(priority === 'right');
            expect(bed.doc.getBody()!.dataStream).toBe(originalStream);
        } finally {
            peer.univer.dispose();
        }
    });

    it.each(['left', 'right'] as const)('retains inherited heading and numbering through concurrent formatting history replay (%s)', async (priority) => {
        const parent = bed.doc.getBody()!.paragraphs![0];
        parent.styleId = 'derived-heading';
        parent.paragraphStyle = undefined;
        parent.sourceBullet = { listId: 'imported', listType: PresetListType.ORDER_LIST, nestingLevel: 0 };
        parent.directBullet = null;
        bed.doc.getSnapshot().styles = {
            heading: { type: DocStyleType.paragraph, name: 'Heading', paragraphStyle: { namedStyleType: NamedStyleType.HEADING_1 } },
            'derived-heading': { type: DocStyleType.paragraph, name: 'Derived', basedOn: 'heading' },
        };
        const initial = Tools.deepClone(bed.doc.getSnapshot());
        const peer = createTestBed(initial);
        try {
            const commands = bed.get(ICommandService);
            expect(set('parent', true)).toBe(true);
            await commands.executeCommand(UndoCommand.id);
            expect(bed.doc.getSnapshot()).toEqual(initial);
            await commands.executeCommand(RedoCommand.id);
            const fold = Tools.deepClone(getLatestActions(bed));

            const peerCommands = peer.get(ICommandService);
            expect(peerCommands.syncExecuteCommand(UpdateDocumentParagraphStyleCommand.id, {
                unitId: peer.doc.getUnitId(),
                paragraphId: 'parent',
                startOffset: 0,
                endOffset: 6,
                style: { spaceAbove: { v: 12 } },
            })).toBe(true);
            await peerCommands.executeCommand(UndoCommand.id);
            expect(peer.doc.getSnapshot()).toEqual(initial);
            await peerCommands.executeCommand(RedoCommand.id);
            const format = Tools.deepClone(getLatestActions(peer));

            replayRemoteMutation(bed, JSONX.transform(format, fold, priority));
            replayRemoteMutation(peer, JSONX.transform(fold, format, priority === 'left' ? 'right' : 'left'));
            expect(peer.doc.getSnapshot()).toEqual(bed.doc.getSnapshot());
            expect(bed.doc.getBody()!.paragraphs![0]).toMatchObject({
                styleId: 'derived-heading',
                sourceBullet: parent.sourceBullet,
                directBullet: null,
                headingCollapsed: true,
                paragraphStyle: { spaceAbove: { v: 12 } },
            });
            expect(bed.doc.getBody()!.dataStream).toBe(initial.body!.dataStream);

            const restored = new DocumentDataModel(JSON.parse(JSON.stringify(bed.doc.getSnapshot())));
            const view = new DocumentViewModel(restored);
            try {
                expect(view.getCollapsedHeadingAtOffset(15)?.paragraphId).toBe('parent');
                expect(restored.getSnapshot()).toEqual(bed.doc.getSnapshot());
            } finally {
                view.dispose();
                restored.dispose();
            }
        } finally {
            peer.univer.dispose();
        }
    });

    it('moves a hidden caret to the heading and restores it on undo', async () => {
        const selections = bed.get(DocSelectionManagerService);
        selections.__TEST_ONLY_setCurrentSelection({ unitId: 'fold-doc', subUnitId: 'fold-doc' });
        selections.__TEST_ONLY_add([{ startOffset: 15, endOffset: 15, collapsed: true, isActive: true }]);
        expect(set('parent', true)).toBe(true);
        expect(selections.getActiveTextRange()).toMatchObject({ startOffset: 6, endOffset: 6 });
        await bed.get(ICommandService).executeCommand(UndoCommand.id);
        expect(selections.getActiveTextRange()).toMatchObject({ startOffset: 15, endOffset: 15 });
    });

    it('rejects non-headings, missing IDs, repeated changes and hidden child headings', () => {
        expect(set('text', true)).toBe(false);
        expect(set('missing', true)).toBe(false);
        expect(set('parent', true)).toBe(true);
        expect(set('parent', true)).toBe(false);
        expect(set('child', true)).toBe(false);
    });

    it('does not modify traditional or disabled documents', () => {
        bed.doc.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        expect(set('parent', true)).toBe(false);
        bed.doc.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        bed.doc.getSnapshot().disabled = true;
        expect(set('parent', true)).toBe(false);
    });

    it('respects document edit permission', () => {
        const permissions = bed.get(IPermissionService);
        const point = new DocumentEditablePermission('fold-doc');
        permissions.addPermissionPoint(point);
        permissions.updatePermissionPoint(point.id, false);
        expect(set('parent', true)).toBe(false);
        expect(bed.doc.getBody()?.paragraphs?.[0].headingCollapsed).toBeUndefined();
    });
});
