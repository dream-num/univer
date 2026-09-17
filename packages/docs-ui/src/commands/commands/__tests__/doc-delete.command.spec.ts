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
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import {
    ColumnLayoutType,
    DeleteDirection,
    DocumentFlavor,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateChangeManagerService,
    DocStateEmitService,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
    UpdateTextCommand,
} from '@univerjs/docs';
import {
    DocumentSkeletonPageType,
    IRenderManagerService,
    NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
    RenderManagerService,
    UniverRenderEnginePlugin,
} from '@univerjs/engine-render';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { EditorService, IEditorService } from '../../../services/editor/editor-manager.service';
import { CutContentCommand } from '../clipboard.inner.command';
import { DeleteLeftCommand, DeleteRightCommand, MergeTwoParagraphCommand } from '../doc-delete.command';

describe('empty editor deletion', () => {
    it.each([DeleteLeftCommand, DeleteRightCommand])('keeps registered embedded editor formatting for $id', async (command) => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        // The headless test has no canvas. Editor registration can precede render creation.
        let skeletonManager: DocSkeletonManagerService | undefined;
        injector.add([IRenderManagerService, { useValue: {
            createRender: () => null,
            getRenderUnitById: () => skeletonManager ? { with: () => skeletonManager } : undefined,
        } as unknown as IRenderManagerService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([DocLayoutExecutorService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: 'shape-editor',
            documentStyle: {},
            body: {
                dataStream: '\r\n',
                paragraphs: [{ startIndex: 0, paragraphId: 'empty', paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER } }],
                textRuns: [{ st: 0, ed: 1, ts: { fs: 16, bl: 1 } }],
            },
        });
        const registration = injector.get(IEditorService).register({ initialSnapshot: model.getSnapshot() }, document.createElement('div'));
        try {
            injector.get(IUniverInstanceService).focusUnit(model.getUnitId());
            skeletonManager = injector.createInstance(DocSkeletonManagerService, { unit: model, unitId: model.getUnitId(), type: UniverInstanceType.UNIVER_DOC });
            const commands = injector.get(ICommandService);
            [command, UpdateTextCommand, RichTextEditingMutation].forEach((entry) => commands.registerCommand(entry));
            const selections = injector.get(DocSelectionManagerService);
            selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
            selections.replaceSelectionInfoWithoutRefresh({
                textRanges: [{ startOffset: 0, endOffset: 0, collapsed: true, isActive: true }],
                rectRanges: [],
                segmentId: '',
                segmentPage: 0,
                isEditing: true,
                style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            });
            const before = structuredClone(model.getSnapshot());
            expect(await commands.executeCommand(command.id)).toBe(true);
            expect(await commands.executeCommand(command.id)).toBe(true);
            expect(model.getSnapshot()).toEqual(before);
        } finally {
            registration.dispose();
            skeletonManager?.dispose();
            univer.dispose();
        }
    });
});

describe('MergeTwoParagraphCommand segment selection', () => {
    it.each([DeleteDirection.LEFT, DeleteDirection.RIGHT])('keeps the footnote caret after merging in direction %s', async (direction) => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: 'note-merge',
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: { dataStream: 'Body\r\n', paragraphs: [{ startIndex: 4, paragraphId: 'body' }] },
            notes: { note: { type: 'footnote' as const, noteId: 'note', body: {
                dataStream: 'First\rSecond\r\n',
                paragraphs: [{ startIndex: 5, paragraphId: 'first' }, { startIndex: 12, paragraphId: 'second' }],
            } } },
        });
        try {
            injector.get(IUniverInstanceService).focusUnit('note-merge');
            const commands = injector.get(ICommandService);
            commands.registerCommand(MergeTwoParagraphCommand);
            commands.registerCommand(RichTextEditingMutation);
            const selections = injector.get(DocSelectionManagerService);
            selections.__TEST_ONLY_setCurrentSelection({ unitId: 'note-merge', subUnitId: 'note-merge' });
            const offset = direction === DeleteDirection.LEFT ? 6 : 5;
            const range = { startOffset: offset, endOffset: offset, collapsed: true, isActive: true, segmentId: 'note' };
            selections.replaceSelectionInfoWithoutRefresh({
                textRanges: [range],
                rectRanges: [],
                segmentId: 'note',
                segmentPage: 2,
                isEditing: true,
                style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
            });
            expect(await commands.executeCommand(MergeTwoParagraphCommand.id, { direction, range })).toBe(true);
            expect(model.getSnapshot().notes!.note.body.dataStream).toBe('FirstSecond\r\n');
            expect(model.getSnapshot().body!.dataStream).toBe('Body\r\n');
            expect(selections.getActiveTextRange()).toMatchObject({ segmentId: 'note', startOffset: 5, endOffset: 5 });
        } finally {
            univer.dispose();
        }
    });
});

describe('delete commands with a selection spanning fixed columns', () => {
    it.each([
        [DeleteLeftCommand, 0],
        [DeleteLeftCommand, 1],
        [DeleteRightCommand, 0],
        [DeleteRightCommand, 1],
    ])('%s deletes every selected column regardless of active endpoint %s', async (command, activeIndex) => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        univer.registerPlugin(UniverRenderEnginePlugin);
        const injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([DocLayoutExecutorService]);
        injector.add([DocStateChangeManagerService]);
        const renderManager = injector.get(IRenderManagerService);
        const documentData: IDocumentData = {
            id: 'column-delete-test',
            body: {
                dataStream: '\u0012\u0013Left text\r\u0014\u0013Right text\r\u0014\u0015\n',
                customBlocks: [],
                customDecorations: [],
                customRanges: [],
                paragraphs: [
                    { paragraphId: 'left-paragraph', startIndex: 11 },
                    { paragraphId: 'right-paragraph', startIndex: 24 },
                ],
                columnGroups: [{
                    columnGroupId: 'fixed-columns',
                    startIndex: 0,
                    endIndex: 26,
                    layout: ColumnLayoutType.FIXED,
                    columns: [
                        { columnId: 'left', widthRatio: 1 },
                        { columnId: 'right', widthRatio: 1 },
                    ],
                    gap: { v: 80 },
                }],
            },
            documentStyle: { pageSize: { width: 600, height: 800 } },
        };
        try {
            const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, documentData);
            renderManager.createRender(doc.getUnitId());
            const [render] = renderManager.getAllRenderersOfType(UniverInstanceType.UNIVER_DOC);
            render.addRenderDependencies([[DocSkeletonManagerService]]);
            injector.get(IUniverInstanceService).focusUnit(doc.getUnitId());
            injector.get(DocStateChangeManagerService);
            const commands = injector.get(ICommandService);
            for (const item of [command, CutContentCommand, RichTextEditingMutation, SetTextSelectionsOperation]) {
                commands.registerCommand(item);
            }
            const selections = injector.get(DocSelectionManagerService);
            const ranges: ITextRangeWithStyle[] = [[7, 11], [14, 24]].map(([startOffset, endOffset], index) => ({
                startOffset,
                endOffset,
                collapsed: false,
                isActive: index === activeIndex,
                segmentId: '',
                startNodePosition: {
                    page: 0,
                    section: 0,
                    column: 0,
                    line: 0,
                    divide: 0,
                    glyph: 0,
                    isBack: true,
                    pageType: DocumentSkeletonPageType.CELL,
                    segmentPage: -1,
                    path: ['pages', 0, 'skeColumnGroups', 'fixed-columns', 'columns', index, 'page'],
                },
            }));
            selections.__TEST_ONLY_add(ranges);
            const originalBody = JSON.parse(JSON.stringify(doc.getBody()));

            expect(await commands.executeCommand(command.id)).toBe(true);
            expect(doc.getBody()?.dataStream).toBe('\u0012\u0013Left \r\u0014\u0013\r\u0014\u0015\n');
            expect(doc.getBody()?.columnGroups?.[0].columns).toEqual(originalBody.columnGroups[0].columns);
            const restoredSelection = await firstValueFrom(selections.refreshSelection$);
            expect(restoredSelection?.docRanges).toEqual([expect.objectContaining({ startOffset: 7, endOffset: 7 })]);

            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(doc.getBody()).toEqual(originalBody);
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(doc.getBody()?.dataStream).toBe('\u0012\u0013Left \r\u0014\u0013\r\u0014\u0015\n');
        } finally {
            univer.dispose();
        }
    });
});
