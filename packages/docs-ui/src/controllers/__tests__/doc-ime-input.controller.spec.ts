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

import { awaitTime } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { IMEInputCommand } from '../../commands/commands/ime-input.command';
import { DocIMEInputController } from '../render-controllers/doc-ime-input.controller';

function createRange() {
    return {
        startOffset: 0,
        endOffset: 0,
        collapsed: true,
        segmentId: '',
        style: null,
    };
}

describe('doc ime input controller', () => {
    it('skips duplicate writes when compositionend data matches the last update', async () => {
        const onCompositionstart$ = new Subject<any>();
        const onCompositionupdate$ = new Subject<any>();
        const onCompositionend$ = new Subject<any>();
        const activeRange = createRange();
        let storedActiveRange: any = null;

        const docSelectionRenderService = {
            onCompositionstart$,
            onCompositionupdate$,
            onCompositionend$,
        };
        const docImeInputManagerService = {
            setActiveRange: vi.fn((range) => {
                storedActiveRange = range;
            }),
            getActiveRange: vi.fn(() => storedActiveRange),
            clearUndoRedoMutationParamsCache: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(() => Promise.resolve(true)),
        };
        const docStateEmitService = {
            emitStateChangeInfo: vi.fn(),
        };

        new DocIMEInputController(
            {
                unitId: 'doc-unit',
            } as never,
            docSelectionRenderService as never,
            docImeInputManagerService as never,
            {
                getSkeleton: vi.fn(() => ({})),
            } as never,
            docStateEmitService as never,
            commandService as never
        );

        onCompositionstart$.next({
            activeRange,
        });
        onCompositionupdate$.next({
            event: { data: '한' },
            activeRange,
        });
        await awaitTime(0);
        onCompositionend$.next({
            event: { data: '한' },
            activeRange,
        });
        await awaitTime(0);

        expect(commandService.executeCommand).toHaveBeenCalledTimes(1);
        expect(commandService.executeCommand).toHaveBeenCalledWith(IMEInputCommand.id, {
            unitId: 'doc-unit',
            newText: '한',
            oldTextLen: 0,
            isCompositionStart: true,
            isCompositionEnd: false,
        });
        expect(docStateEmitService.emitStateChangeInfo).toHaveBeenCalledWith({
            commandId: RichTextEditingMutation.id,
            unitId: 'doc-unit',
            segmentId: '',
            trigger: IMEInputCommand.id,
            redoState: {
                actions: [],
                textRanges: [activeRange],
            },
            undoState: {
                actions: [],
                textRanges: [activeRange],
            },
            isCompositionEnd: true,
        });
        expect(docImeInputManagerService.clearUndoRedoMutationParamsCache).toHaveBeenCalledTimes(2);
        expect(docImeInputManagerService.setActiveRange).toHaveBeenLastCalledWith(null);
    });

    it('keeps the compositionend write when the final data differs from the latest update', async () => {
        const onCompositionstart$ = new Subject<any>();
        const onCompositionupdate$ = new Subject<any>();
        const onCompositionend$ = new Subject<any>();
        const activeRange = createRange();
        let storedActiveRange: any = null;

        const docSelectionRenderService = {
            onCompositionstart$,
            onCompositionupdate$,
            onCompositionend$,
        };
        const docImeInputManagerService = {
            setActiveRange: vi.fn((range) => {
                storedActiveRange = range;
            }),
            getActiveRange: vi.fn(() => storedActiveRange),
            clearUndoRedoMutationParamsCache: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(() => Promise.resolve(true)),
        };
        const docStateEmitService = {
            emitStateChangeInfo: vi.fn(),
        };

        new DocIMEInputController(
            {
                unitId: 'doc-unit',
            } as never,
            docSelectionRenderService as never,
            docImeInputManagerService as never,
            {
                getSkeleton: vi.fn(() => ({})),
            } as never,
            docStateEmitService as never,
            commandService as never
        );

        onCompositionstart$.next({
            activeRange,
        });
        onCompositionupdate$.next({
            event: { data: 'ㅎ' },
            activeRange,
        });
        await awaitTime(0);
        onCompositionend$.next({
            event: { data: '한' },
            activeRange,
        });
        await awaitTime(0);

        expect(commandService.executeCommand).toHaveBeenCalledTimes(2);
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(2, IMEInputCommand.id, {
            unitId: 'doc-unit',
            newText: '한',
            oldTextLen: 1,
            isCompositionStart: false,
            isCompositionEnd: true,
        });
        expect(docStateEmitService.emitStateChangeInfo).not.toHaveBeenCalled();
    });
});
