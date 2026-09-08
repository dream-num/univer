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
import { DeleteDirection, DocumentFlavor, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService, NORMAL_TEXT_SELECTION_PLUGIN_STYLE, RenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { MergeTwoParagraphCommand } from '../doc-delete.command';

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
            footnotes: { note: { footnoteId: 'note', body: {
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
            expect(model.getSnapshot().footnotes!.note.body.dataStream).toBe('FirstSecond\r\n');
            expect(model.getSnapshot().body!.dataStream).toBe('Body\r\n');
            expect(selections.getActiveTextRange()).toMatchObject({ segmentId: 'note', startOffset: 5, endOffset: 5 });
        } finally {
            univer.dispose();
        }
    });
});
