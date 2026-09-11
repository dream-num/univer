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
import { ICommandService, IUniverInstanceService, LocaleType, RedoCommand, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateChangeManagerService,
    DocStateEmitService,
    IDocStateChangeInterceptorService,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { DocIMEInputManagerService } from '../../../services/doc-ime-input-manager.service';
import { DocIMEStateChangeInterceptorService } from '../../../services/doc-ime-state-change-interceptor.service';
import { DocMenuStyleService } from '../../../services/doc-menu-style.service';
import { IMEInputCommand } from '../ime-input.command';

describe('IME composition history', () => {
    it.each([false, true])('cancellation keeps only actual document changes in undo/redo (replacesSelection=%s)', async (replacesSelection) => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        univer.registerPlugin(UniverRenderEnginePlugin);
        const injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([DocMenuStyleService]);
        injector.add([IDocStateChangeInterceptorService, { useClass: DocIMEStateChangeInterceptorService }]);
        injector.add([DocStateChangeManagerService]);
        try {
            const doc = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
                id: 'ime-history',
                body: { dataStream: 'original\r\n' },
                documentStyle: { pageSize: { width: 600, height: 800 } },
            });
            const unitId = doc.getUnitId();
            const renders = injector.get(IRenderManagerService);
            renders.createRender(unitId);
            const render = renders.getAllRenderersOfType(UniverInstanceType.UNIVER_DOC)[0]!;
            render.addRenderDependencies([[DocSkeletonManagerService], [DocIMEInputManagerService]]);
            const ime = render.with(DocIMEInputManagerService);
            const state = injector.get(DocStateEmitService);
            injector.get(DocStateChangeManagerService);
            injector.get(IUniverInstanceService).focusUnit(unitId);
            const commands = injector.get(ICommandService);
            for (const command of [IMEInputCommand, RichTextEditingMutation, SetTextSelectionsOperation]) {
                commands.registerCommand(command);
            }
            const compose = async (contents: string[], startOffset: number, endOffset = startOffset) => {
                const range: ITextRangeWithStyle = {
                    startOffset,
                    endOffset,
                    collapsed: startOffset === endOffset,
                    segmentId: '',
                };
                ime.clearUndoRedoMutationParamsCache();
                ime.setActiveRange(range);
                ime.setPreviousDocRanges([range]);
                let previous = '';
                for (const [index, newText] of contents.entries()) {
                    expect(await commands.executeCommand(IMEInputCommand.id, {
                        unitId,
                        newText,
                        oldTextLen: previous.length,
                        isCompositionStart: index === 0,
                        isCompositionEnd: false,
                    })).toBe(true);
                    previous = newText;
                }
                // Native compositionend repeats the last update; the controller finalizes its cached changes.
                state.emitStateChangeInfo({
                    commandId: RichTextEditingMutation.id,
                    unitId,
                    trigger: IMEInputCommand.id,
                    redoState: { actions: null, textRanges: [range] },
                    undoState: { actions: null, textRanges: [range] },
                    isCompositionEnd: true,
                });
                ime.clearUndoRedoMutationParamsCache();
            };

            await compose(['ce', "ce'shi", '测试'], 0);
            expect(doc.getBody()?.dataStream).toBe('测试original\r\n');
            const committedBody = JSON.parse(JSON.stringify(doc.getBody()));
            await compose(['h', 'ha', ''], 2, replacesSelection ? 10 : 2);
            expect(doc.getBody()?.dataStream).toBe(replacesSelection ? '测试\r\n' : '测试original\r\n');

            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(doc.getBody()?.dataStream).toBe(replacesSelection ? '测试original\r\n' : 'original\r\n');
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            if (replacesSelection) {
                expect(doc.getBody()?.dataStream).toBe('测试\r\n');
            } else {
                expect(doc.getBody()).toEqual(committedBody);
            }
        } finally {
            univer.dispose();
        }
    });
});
