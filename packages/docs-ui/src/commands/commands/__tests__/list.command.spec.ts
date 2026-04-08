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

import type { DocumentDataModel, ICommand, IDocumentData, Injector, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, PRESET_LIST_TYPE, PresetListType, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    BulletListCommand,
    ChangeListNestingLevelCommand,
    ChangeListNestingLevelType,
    ChangeListTypeCommand,
    CheckListCommand,
    findNearestSectionBreak,
    getParagraphsRelative,
    ListOperationCommand,
    QuickListCommand,
} from '../list.command';
import { createCommandTestBed } from './create-command-test-bed';

function waitNextTick() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function getDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Alpha\rBeta\r\n',
            paragraphs: [
                { startIndex: 5 },
                { startIndex: 10 },
            ],
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

describe('list commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    function getBody() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)?.getBody();
    }

    function setSelections(ranges: Array<{ startOffset: number; endOffset: number; collapsed: boolean }>) {
        const selectionManager = get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
        });
        selectionManager.__TEST_ONLY_add(ranges.map((range, index) => ({
            ...range,
            isActive: index === 0,
            segmentId: '',
            style: null as never,
        })));
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(getDocumentData());
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(ListOperationCommand);
        commandService.registerCommand(ChangeListTypeCommand);
        commandService.registerCommand(ChangeListNestingLevelCommand);
        commandService.registerCommand(BulletListCommand);
        commandService.registerCommand(CheckListCommand);
        commandService.registerCommand(QuickListCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
    });

    afterEach(() => univer.dispose());

    it('toggles bullet lists on selected paragraphs through the public command chain', async () => {
        setSelections([
            { startOffset: 0, endOffset: 4, collapsed: false },
            { startOffset: 6, endOffset: 9, collapsed: false },
        ]);

        await commandService.executeCommand(BulletListCommand.id);
        await waitNextTick();

        const paragraphs = getBody()?.paragraphs ?? [];
        expect(paragraphs[0].bullet?.listType).toBe(PresetListType.BULLET_LIST);
        expect(paragraphs[1].bullet?.listType).toBe(PresetListType.BULLET_LIST);
        expect(paragraphs[0].bullet?.listId).toBe(paragraphs[1].bullet?.listId);
    });

    it('changes checklist type and nesting level on an existing list', async () => {
        setSelections([
            { startOffset: 0, endOffset: 4, collapsed: false },
            { startOffset: 6, endOffset: 9, collapsed: false },
        ]);

        await commandService.executeCommand(CheckListCommand.id);
        await commandService.executeCommand(ChangeListTypeCommand.id, {
            listType: PresetListType.CHECK_LIST_CHECKED,
        });
        await commandService.executeCommand(ChangeListNestingLevelCommand.id, {
            type: ChangeListNestingLevelType.increase,
        });
        await waitNextTick();

        const paragraphs = getBody()?.paragraphs ?? [];
        expect(paragraphs[0].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);
        expect(paragraphs[0].bullet?.nestingLevel).toBeGreaterThanOrEqual(1);
    });

    it('creates quick list from a markdown-like paragraph', async () => {
        setSelections([{ startOffset: 0, endOffset: 4, collapsed: false }]);

        await commandService.executeCommand(CheckListCommand.id);
        await waitNextTick();

        expect(getBody()?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST);

        const paragraph = {
            ...(getBody()?.paragraphs?.[0] as NonNullable<NonNullable<ReturnType<typeof getBody>>['paragraphs']>[number]),
            paragraphStart: 0,
            paragraphEnd: 5,
        };

        setSelections([{ startOffset: 2, endOffset: 2, collapsed: true }]);
        await commandService.executeCommand(QuickListCommand.id, {
            listType: PresetListType.ORDER_LIST,
            paragraph,
        });
        await waitNextTick();

        expect(getBody()?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.ORDER_LIST);
        expect(getBody()?.paragraphs?.[0].bullet?.listId).toBeDefined();
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.textStyle).toMatchObject(
            PRESET_LIST_TYPE[PresetListType.ORDER_LIST].nestingLevel[0].paragraphProperties?.textStyle ?? {}
        );
    });

    it('extends selected paragraphs to adjacent items in the same list and finds nearest section breaks', () => {
        const paragraphs = [
            { startIndex: 5, bullet: { listType: PresetListType.BULLET_LIST, listId: 'list-1', nestingLevel: 0 } },
            { startIndex: 10, bullet: { listType: PresetListType.BULLET_LIST, listId: 'list-1', nestingLevel: 0 } },
            { startIndex: 16 },
            { startIndex: 22, bullet: { listType: PresetListType.BULLET_LIST, listId: 'list-2', nestingLevel: 0 } },
        ] as NonNullable<NonNullable<ReturnType<typeof getBody>>['paragraphs']>;

        const relative = getParagraphsRelative(
            [{ startOffset: 6, endOffset: 9, collapsed: false, segmentId: '' }],
            paragraphs,
            'Alpha\rBeta\rGamma\r\n'
        );

        expect(relative.map((paragraph) => paragraph.startIndex)).toContain(5);
        expect(relative.at(-1)?.startIndex).toBe(10);
        expect(relative.length).toBeGreaterThanOrEqual(2);
        expect(findNearestSectionBreak(11, [
            { startIndex: 3 } as never,
            { startIndex: 15 } as never,
            { startIndex: 25 } as never,
        ])?.startIndex).toBe(15);
    });
});
