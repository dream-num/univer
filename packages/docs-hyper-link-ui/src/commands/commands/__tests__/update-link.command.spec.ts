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
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IUpdateDocHyperLinkCommandParams } from '../update-link.command';
import { CustomRangeType, ICommandService, IUniverInstanceService, Tools, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocStateEmitService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { UpdateDocHyperLinkCommand } from '../update-link.command';

describe('UpdateDocHyperLinkCommand', () => {
    it.each([{}, { textStyleMode: 'text' }, { textColorMode: 'text' }])('retains formatting policy %j when changing label and URL', async (policy) => {
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([DocSelectionManagerService]);
            injector.add([DocStateEmitService]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
                id: 'link-style',
                body: {
                    dataStream: 'Mail\r\n',
                    textRuns: [{ st: 0, ed: 4, ts: { cl: { rgb: '#AA1122' }, ul: { s: 0 } } }],
                    customRanges: [{
                        startIndex: 0,
                        endIndex: 3,
                        rangeId: 'link',
                        rangeType: CustomRangeType.HYPERLINK,
                        properties: { url: 'mailto:before@example.test', ...policy },
                    }],
                },
                documentStyle: {},
            });
            injector.get(IUniverInstanceService).focusUnit('link-style');
            const commands = injector.get(ICommandService);
            commands.registerCommand(UpdateDocHyperLinkCommand);
            commands.registerCommand(RichTextEditingMutation);
            const selection = injector.get(DocSelectionManagerService);
            selection.__TEST_ONLY_setCurrentSelection({ unitId: 'link-style', subUnitId: 'link-style' });
            selection.__TEST_ONLY_add([{ startOffset: 0, endOffset: 4, collapsed: false, isActive: true, segmentId: '', style: null as never }]);
            const before = Tools.deepClone(doc.getBody());
            const undo = await commands.executeCommand<IUpdateDocHyperLinkCommandParams, IRichTextEditingMutationParams>(UpdateDocHyperLinkCommand.id, {
                unitId: 'link-style',
                linkId: 'link',
                payload: 'mailto:after@example.test',
                label: 'New mail',
                segmentId: '',
            });
            expect(undo).toBeTruthy();
            expect(doc.getBody()?.dataStream).toBe('New mail\r\n');
            expect(doc.getBody()?.customRanges?.[0].properties).toEqual({ url: 'mailto:after@example.test', ...policy });
            expect(doc.getBody()?.textRuns?.[0].ts).toEqual({ cl: { rgb: '#AA1122' }, ul: { s: 0 } });
            const updated = Tools.deepClone(doc.getBody());
            const redo = commands.syncExecuteCommand<IRichTextEditingMutationParams, IRichTextEditingMutationParams>(RichTextEditingMutation.id, undo);
            expect(doc.getBody()?.dataStream).toBe(before?.dataStream);
            expect(doc.getBody()?.customRanges).toEqual(before?.customRanges);
            commands.syncExecuteCommand(RichTextEditingMutation.id, redo);
            expect(doc.getBody()).toEqual(updated);
        } finally {
            univer.dispose();
        }
    });
});
