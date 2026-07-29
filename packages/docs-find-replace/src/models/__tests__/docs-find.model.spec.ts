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

import type { ICommand } from '@univerjs/core';
import type { Documents, DocumentSkeleton, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IFindQuery } from '@univerjs/find-replace';
import { ICommandService } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, DocTextResolverService, RichTextEditingMutation } from '@univerjs/docs';
import { DocBackScrollRenderController, getTextRangeFromCharIndex } from '@univerjs/docs-ui';
import { createCommandTestBed } from '@univerjs/docs-ui/commands/commands/__tests__/create-command-test-bed';
import { IRenderManagerService } from '@univerjs/engine-render';
import { FindBy, FindDirection, FindScope } from '@univerjs/find-replace';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocsReplaceCommand } from '../../commands/commands/docs-replace.command';
import { DocsFindModel } from '../docs-find.model';

const getTextRangeFromCharIndexMock = vi.hoisted(() => vi.fn());
vi.mock('@univerjs/docs-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/docs-ui')>();
    return { ...actual, getTextRangeFromCharIndex: getTextRangeFromCharIndexMock };
});

function docsQuery(findString: string): IFindQuery {
    return {
        findString,
        replaceRevealed: true,
        caseSensitive: false,
        matchesTheWholeWord: false,
        matchesTheWholeCell: false,
        findDirection: FindDirection.ROW,
        findScope: FindScope.SUBUNIT,
        findBy: FindBy.VALUE,
    };
}

function activeRange(startOffset: number, endOffset: number): ITextRangeWithStyle {
    return { startOffset, endOffset, collapsed: startOffset === endOffset, isActive: true, segmentId: '' };
}

function createModelTestBed(dataStream = 'cat xx cat\r\n') {
    const scrollToRange = vi.fn();
    const testBed = createCommandTestBed(
        { id: 'test-doc', body: { dataStream }, documentStyle: {} },
        [
            [DocBackScrollRenderController, { useValue: { scrollToRange } }],
            [DocTextResolverService],
        ]
    );
    const commandService = testBed.get(ICommandService);
    commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
    commandService.registerCommand(DocsReplaceCommand);
    const selectionManager = testBed.get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'test-doc', subUnitId: 'test-doc' });
    const skeletonManager = testBed.get(DocSkeletonManagerService);
    vi.spyOn(skeletonManager, 'getSkeleton').mockReturnValue(null as never);
    const model = testBed.injector.createInstance(DocsFindModel, testBed.doc, skeletonManager);
    return { ...testBed, commandService, selectionManager, skeletonManager, scrollToRange, model };
}

describe('DocsFindModel', () => {
    beforeEach(() => {
        getTextRangeFromCharIndexMock.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('starts from the cursor and honors movement flags', () => {
        const { model, selectionManager, univer } = createModelTestBed();
        selectionManager.__TEST_ONLY_add([activeRange(5, 5)]);
        const replaceDocRanges = vi.spyOn(selectionManager, 'replaceDocRanges');
        model.start(docsQuery('cat'));

        expect(model.moveToNextMatch({ stayIfOnMatch: true, noFocus: true })?.range.startOffset).toBe(7);
        expect(model.moveToNextMatch({ loop: true, noFocus: true })?.range.startOffset).toBe(0);
        expect(model.moveToPreviousMatch({ loop: true, noFocus: true })?.range.startOffset).toBe(7);
        expect(replaceDocRanges).not.toHaveBeenCalled();

        model.dispose();
        univer.dispose();
    });

    it('ignores the cursor when requested and stays on an exact selected match', () => {
        const { model, selectionManager, univer } = createModelTestBed();
        selectionManager.__TEST_ONLY_add([activeRange(5, 5)]);
        model.start(docsQuery('cat'));
        expect(model.moveToNextMatch({ ignoreSelection: true, noFocus: true })?.range.startOffset).toBe(0);

        model.dispose();
        const second = createModelTestBed();
        second.selectionManager.__TEST_ONLY_add([activeRange(0, 3)]);
        second.model.start(docsQuery('cat'));
        expect(second.model.moveToNextMatch({ stayIfOnMatch: true, noFocus: true })?.range.startOffset).toBe(0);
        second.model.dispose();
        second.univer.dispose();
        univer.dispose();
    });

    it('selects and scrolls to the active match without focusing the document editor', () => {
        const { model, selectionManager, scrollToRange, univer } = createModelTestBed();
        const replaceDocRanges = vi.spyOn(selectionManager, 'replaceDocRanges');
        model.start(docsQuery('cat'));
        model.moveToNextMatch({ ignoreSelection: true, noFocus: true });
        model.focusSelection();

        expect(replaceDocRanges).toHaveBeenCalledWith([
            expect.objectContaining({ startOffset: 0, endOffset: 3 }),
        ], { unitId: 'test-doc', subUnitId: 'test-doc' }, true, { shouldFocus: false });
        expect(scrollToRange).toHaveBeenCalledWith(expect.objectContaining({ startOffset: 0, endOffset: 3 }));
        model.dispose();
        univer.dispose();
    });

    it('passes a range only for current replacement', async () => {
        const { model, commandService, univer } = createModelTestBed();
        const executeCommand = vi.spyOn(commandService, 'executeCommand');
        model.start(docsQuery('cat'));
        model.moveToNextMatch({ ignoreSelection: true, noFocus: true });

        await expect(model.replace('dog')).resolves.toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(DocsReplaceCommand.id, expect.objectContaining({
            range: expect.objectContaining({ startOffset: 0, endOffset: 3 }),
        }));
        await model.replaceAll('dog');
        expect(executeCommand).toHaveBeenLastCalledWith(DocsReplaceCommand.id, expect.not.objectContaining({ range: expect.anything() }));
        model.dispose();
        univer.dispose();
    });

    it('rescans after a rich-text mutation', async () => {
        vi.useFakeTimers();
        const { model, univer } = createModelTestBed();
        model.start(docsQuery('cat'));
        model.moveToNextMatch({ ignoreSelection: true, noFocus: true });
        const update = firstValueFrom(model.matchesUpdate$);

        await expect(model.replace('dog')).resolves.toBe(true);
        await vi.advanceTimersByTimeAsync(250);
        expect(await update).toEqual(model.getMatches());
        expect(model.getMatches()).toHaveLength(1);
        model.dispose();
        univer.dispose();
    });

    it('rescans when a consumer-facing text projection changes', async () => {
        vi.useFakeTimers();
        const { get, model, univer } = createModelTestBed();
        model.start(docsQuery('cat'));
        const update = firstValueFrom(model.matchesUpdate$);

        get(DocTextResolverService).notifyTextChanged('test-doc');
        await vi.advanceTimersByTimeAsync(250);

        expect(await update).toEqual(model.getMatches());
        model.dispose();
        univer.dispose();
    });

    it('disposes every TextRange highlight', () => {
        const { model, skeletonManager, get, univer } = createModelTestBed();
        vi.mocked(skeletonManager.getSkeleton).mockReturnValue({} as DocumentSkeleton);
        const render = get(IRenderManagerService).getRenderUnitById('test-doc')!;
        (render as unknown as { mainComponent: Documents }).mainComponent = {} as Documents;
        const first = { dispose: vi.fn() };
        const second = { dispose: vi.fn() };
        getTextRangeFromCharIndexMock.mockReturnValueOnce(first).mockReturnValueOnce(second);

        model.start(docsQuery('cat'));
        expect(getTextRangeFromCharIndex).toHaveBeenCalledTimes(2);
        model.dispose();
        expect(first.dispose).toHaveBeenCalledOnce();
        expect(second.dispose).toHaveBeenCalledOnce();
        univer.dispose();
    });
});
