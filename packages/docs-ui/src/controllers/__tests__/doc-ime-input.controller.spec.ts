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

interface ITestEditorInputConfig {
    activeRange: ReturnType<typeof createRange>;
    event?: { data: string };
    rangeList?: ReturnType<typeof createRange>[];
}

describe('doc ime input controller', () => {
    it('skips duplicate writes when compositionend data matches the last update', async () => {
        const onCompositionstart$ = new Subject<ITestEditorInputConfig>();
        const onCompositionupdate$ = new Subject<ITestEditorInputConfig>();
        const onCompositionend$ = new Subject<ITestEditorInputConfig>();
        const activeRange = createRange();
        let storedActiveRange: ReturnType<typeof createRange> | null = null;

        const docSelectionRenderService = {
            onCompositionstart$,
            onCompositionupdate$,
            onCompositionend$,
            getAllRectRanges: vi.fn(() => []),
        };
        const docImeInputManagerService = {
            setActiveRange: vi.fn((range) => {
                storedActiveRange = range;
            }),
            getActiveRange: vi.fn(() => storedActiveRange),
            getPreviousDocRanges: vi.fn(() => []),
            getPreviousSelectionOptions: vi.fn(() => null),
            setPreviousDocRanges: vi.fn(),
            setPreviousSelectionOptions: vi.fn(),
            clearUndoRedoMutationParamsCache: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(() => Promise.resolve(true)),
        };
        const docStateEmitService = {
            emitStateChangeInfo: vi.fn(),
        };
        const docSelectionManagerService = {
            getSelectionInfo: vi.fn(() => ({ options: null })),
        };

        const controller = new DocIMEInputController(
            {
                unitId: 'doc-unit',
            } as never,
            docSelectionRenderService as never,
            docImeInputManagerService as never,
            {
                getSkeleton: vi.fn(() => ({})),
            } as never,
            docStateEmitService as never,
            docSelectionManagerService as never,
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
        controller.dispose();
    });

    it('keeps the compositionend write when the final data differs from the latest update', async () => {
        const onCompositionstart$ = new Subject<ITestEditorInputConfig>();
        const onCompositionupdate$ = new Subject<ITestEditorInputConfig>();
        const onCompositionend$ = new Subject<ITestEditorInputConfig>();
        const activeRange = createRange();
        let storedActiveRange: ReturnType<typeof createRange> | null = null;

        const docSelectionRenderService = {
            onCompositionstart$,
            onCompositionupdate$,
            onCompositionend$,
            getAllRectRanges: vi.fn(() => []),
        };
        const docImeInputManagerService = {
            setActiveRange: vi.fn((range) => {
                storedActiveRange = range;
            }),
            getActiveRange: vi.fn(() => storedActiveRange),
            getPreviousDocRanges: vi.fn(() => []),
            getPreviousSelectionOptions: vi.fn(() => null),
            setPreviousDocRanges: vi.fn(),
            setPreviousSelectionOptions: vi.fn(),
            clearUndoRedoMutationParamsCache: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(() => Promise.resolve(true)),
        };
        const docStateEmitService = {
            emitStateChangeInfo: vi.fn(),
        };
        const docSelectionManagerService = {
            getSelectionInfo: vi.fn(() => ({ options: null })),
        };

        const controller = new DocIMEInputController(
            {
                unitId: 'doc-unit',
            } as never,
            docSelectionRenderService as never,
            docImeInputManagerService as never,
            {
                getSkeleton: vi.fn(() => ({})),
            } as never,
            docStateEmitService as never,
            docSelectionManagerService as never,
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
        controller.dispose();
    });

    it('rolls back an active composition when compositionend data is empty', async () => {
        const onCompositionstart$ = new Subject<ITestEditorInputConfig>();
        const onCompositionupdate$ = new Subject<ITestEditorInputConfig>();
        const onCompositionend$ = new Subject<ITestEditorInputConfig>();
        const activeRange = createRange();

        const docSelectionRenderService = {
            onCompositionstart$,
            onCompositionupdate$,
            onCompositionend$,
            getAllRectRanges: vi.fn(() => []),
        };
        const docImeInputManagerService = {
            setActiveRange: vi.fn(),
            getActiveRange: vi.fn(() => activeRange),
            getPreviousDocRanges: vi.fn(() => []),
            getPreviousSelectionOptions: vi.fn(() => null),
            setPreviousDocRanges: vi.fn(),
            setPreviousSelectionOptions: vi.fn(),
            clearUndoRedoMutationParamsCache: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(() => Promise.resolve(true)),
        };
        const docStateEmitService = {
            emitStateChangeInfo: vi.fn(),
        };

        const controller = new DocIMEInputController(
            { unitId: 'doc-unit' } as never,
            docSelectionRenderService as never,
            docImeInputManagerService as never,
            { getSkeleton: vi.fn(() => ({})) } as never,
            docStateEmitService as never,
            { getSelectionInfo: vi.fn(() => ({ options: null })) } as never,
            commandService as never
        );

        onCompositionstart$.next({ activeRange });
        onCompositionupdate$.next({ event: { data: 'nihao' }, activeRange });
        await awaitTime(0);
        onCompositionupdate$.next({ event: { data: '' }, activeRange });
        await awaitTime(0);
        onCompositionend$.next({ event: { data: '' }, activeRange });
        await awaitTime(0);

        expect(commandService.executeCommand).toHaveBeenCalledTimes(2);
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(2, IMEInputCommand.id, {
            unitId: 'doc-unit',
            newText: '',
            oldTextLen: 5,
            isCompositionStart: false,
            isCompositionEnd: true,
            isCompositionCanceled: true,
        });
        expect(docStateEmitService.emitStateChangeInfo).not.toHaveBeenCalled();
        expect(docImeInputManagerService.clearUndoRedoMutationParamsCache).toHaveBeenCalledTimes(2);
        expect(docImeInputManagerService.setActiveRange).toHaveBeenLastCalledWith(null);
        controller.dispose();
    });

    it('ends an empty composition without creating a history entry', async () => {
        const onCompositionstart$ = new Subject<ITestEditorInputConfig>();
        const onCompositionupdate$ = new Subject<ITestEditorInputConfig>();
        const onCompositionend$ = new Subject<ITestEditorInputConfig>();
        const activeRange = createRange();
        const commandService = {
            executeCommand: vi.fn(() => Promise.resolve(true)),
        };
        const docStateEmitService = {
            emitStateChangeInfo: vi.fn(),
        };

        const controller = new DocIMEInputController(
            { unitId: 'doc-unit' } as never,
            {
                onCompositionstart$,
                onCompositionupdate$,
                onCompositionend$,
                getAllRectRanges: vi.fn(() => []),
            } as never,
            {
                setActiveRange: vi.fn(),
                getActiveRange: vi.fn(() => activeRange),
                getPreviousDocRanges: vi.fn(() => []),
                getPreviousSelectionOptions: vi.fn(() => null),
                setPreviousDocRanges: vi.fn(),
                setPreviousSelectionOptions: vi.fn(),
                clearUndoRedoMutationParamsCache: vi.fn(),
            } as never,
            { getSkeleton: vi.fn(() => ({})) } as never,
            docStateEmitService as never,
            { getSelectionInfo: vi.fn(() => ({ options: null })) } as never,
            commandService as never
        );

        onCompositionstart$.next({ activeRange });
        onCompositionend$.next({ event: { data: '' }, activeRange });
        await awaitTime(0);

        expect(commandService.executeCommand).not.toHaveBeenCalled();
        expect(docStateEmitService.emitStateChangeInfo).not.toHaveBeenCalled();
        controller.dispose();
    });
});
