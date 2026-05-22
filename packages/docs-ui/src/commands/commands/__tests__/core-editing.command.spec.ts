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

import type { DocumentDataModel, ICommand, IDocumentData, Injector, IStyleBase, Univer } from '@univerjs/core';
import {
    awaitTime,
    BooleanNumber,
    CustomRangeType,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    UniverInstanceType,
    UpdateDocsAttributeType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DeleteDirection } from '../../../types/delete-direction';
import { DeleteCommand, InsertCommand, UpdateCommand } from '../core-editing.command';
import { DeleteLeftCommand, DeleteRightCommand } from '../doc-delete.command';
import { createCommandTestBed } from './create-command-test-bed';

function getDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello world\r\n',
            textRuns: [{
                st: 0,
                ed: 11,
                ts: {
                    bl: BooleanNumber.FALSE,
                },
            }],
            customRanges: [{
                startIndex: 6,
                endIndex: 10,
                rangeId: 'range-world',
                rangeType: CustomRangeType.HYPERLINK,
                wholeEntity: true,
            }],
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function getCenteredSingleCharacterDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'A\r\n',
            textRuns: [{
                st: 0,
                ed: 1,
                ts: {},
            }],
            paragraphs: [{
                startIndex: 1,
                paragraphStyle: {
                    horizontalAlign: HorizontalAlign.CENTER,
                },
            }],
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function getCenteredEmptyParagraphDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: '\r\n',
            paragraphs: [{
                startIndex: 0,
                paragraphStyle: {
                    horizontalAlign: HorizontalAlign.CENTER,
                },
            }],
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

describe('core editing commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getBody() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)?.getBody();
    }

    function getDataStream() {
        return getBody()?.dataStream ?? '';
    }

    function getFormatValueAt(key: keyof IStyleBase, pos: number) {
        for (const textRun of getBody()?.textRuns ?? []) {
            const { st, ed, ts = {} } = textRun;

            if (st <= pos && ed >= pos) {
                return ts[key];
            }
        }
    }

    function setActiveSelection(offset: number) {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add([{ startOffset: offset, endOffset: offset, collapsed: true, isActive: true, segmentId: '', style: null as never }]);
    }

    function mockSkeleton() {
        const skeletonManager = get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => ({});
    }

    function registerDeleteKeyCommands() {
        commandService.registerCommand(DeleteLeftCommand);
        commandService.registerCommand(DeleteRightCommand);
        commandService.registerCommand(UpdateCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(getDocumentData());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertCommand);
        commandService.registerCommand(DeleteCommand);
        commandService.registerCommand(UpdateCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
    });

    afterEach(() => univer.dispose());

    it('inserts text through the real mutation chain and moves the caret', async () => {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_add([{ startOffset: 5, endOffset: 5, collapsed: true, isActive: true, segmentId: '', style: null as never }]);

        await commandService.executeCommand(InsertCommand.id, {
            unitId: 'test-doc',
            segmentId: '',
            range: { startOffset: 5, endOffset: 5, collapsed: true },
            body: {
                dataStream: ', brave',
            },
        });

        await awaitTime(0);

        expect(getDataStream()).toBe('Hello, brave world\r\n');
    });

    it('deletes an entire custom range when the selection hits a whole entity', async () => {
        await commandService.executeCommand(DeleteCommand.id, {
            unitId: 'test-doc',
            segmentId: '',
            range: { startOffset: 7, endOffset: 7, collapsed: true },
            direction: DeleteDirection.RIGHT,
        });

        await awaitTime(0);

        expect(getDataStream()).toBe('Hello \r\n');
        expect(getBody()?.customRanges).toEqual([]);
    });

    it('keeps center alignment when deleting the last character from a centered paragraph', async () => {
        univer.dispose();
        const testBed = createCommandTestBed(getCenteredSingleCharacterDocumentData());
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        await commandService.executeCommand(DeleteCommand.id, {
            unitId: 'test-doc',
            segmentId: '',
            range: { startOffset: 0, endOffset: 0, collapsed: true },
            direction: DeleteDirection.RIGHT,
        });

        await awaitTime(0);

        expect(getDataStream()).toBe('\r\n');
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);
    });

    it('keeps center alignment when backspacing the last character from a centered paragraph', async () => {
        univer.dispose();
        const testBed = createCommandTestBed(getCenteredSingleCharacterDocumentData());
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(DeleteCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

        await commandService.executeCommand(DeleteCommand.id, {
            unitId: 'test-doc',
            segmentId: '',
            range: { startOffset: 1, endOffset: 1, collapsed: true },
            direction: DeleteDirection.LEFT,
        });

        await awaitTime(0);

        expect(getDataStream()).toBe('\r\n');
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.CENTER);
    });

    it('resets an empty centered paragraph to left alignment on a second delete', async () => {
        univer.dispose();
        const testBed = createCommandTestBed(getCenteredEmptyParagraphDocumentData());
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        registerDeleteKeyCommands();
        mockSkeleton();
        setActiveSelection(0);

        await commandService.executeCommand(DeleteRightCommand.id);

        await awaitTime(0);

        expect(getDataStream()).toBe('\r\n');
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.LEFT);
    });

    it('resets an empty centered paragraph to left alignment on a second backspace', async () => {
        univer.dispose();
        const testBed = createCommandTestBed(getCenteredEmptyParagraphDocumentData());
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        registerDeleteKeyCommands();
        mockSkeleton();
        setActiveSelection(0);

        await commandService.executeCommand(DeleteLeftCommand.id);

        await awaitTime(0);

        expect(getDataStream()).toBe('\r\n');
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(HorizontalAlign.LEFT);
    });

    it('updates text styles through the shared rich text mutation flow', async () => {
        await commandService.executeCommand(UpdateCommand.id, {
            unitId: 'test-doc',
            segmentId: '',
            range: { startOffset: 0, endOffset: 5, collapsed: false },
            coverType: UpdateDocsAttributeType.REPLACE,
            updateBody: {
                dataStream: 'Hello',
                textRuns: [{
                    st: 0,
                    ed: 5,
                    ts: {
                        bl: BooleanNumber.TRUE,
                    },
                }],
            },
            textRanges: [{
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
            }],
        });

        await awaitTime(0);

        expect(getDataStream()).toBe('Hello world\r\n');
        expect(getFormatValueAt('bl', 1)).toBe(BooleanNumber.TRUE);
    });
});
