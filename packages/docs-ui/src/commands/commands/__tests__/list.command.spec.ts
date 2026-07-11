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
import {
    awaitTime,
    ICommandService,
    IUniverInstanceService,
    PRESET_LIST_TYPE,
    PresetListType,
    UniverInstanceType,
    validateDocBodyStructure,
} from '@univerjs/core';
import { DocContentInsertService, DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InsertBulletBelowCommand } from '../insert-below/insert-bullet-below.command';
import {
    BulletListCommand,
    ChangeListNestingLevelCommand,
    ChangeListNestingLevelType,
    ChangeListTypeCommand,
    CheckListCommand,
    findNearestSectionBreak,
    getParagraphsRelative,
    InsertBulletListBellowCommand,
    InsertCheckListBellowCommand,
    InsertOrderListBellowCommand,
    ListOperationCommand,
    OrderListCommand,
    QuickListCommand,
    ToggleCheckListCommand,
} from '../list.command';
import { createCommandTestBed } from './create-command-test-bed';

function getDocumentData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Alpha\rBeta\r\n',
            paragraphs: [
                { paragraphId: 'para_docs_ui_fixture_20', startIndex: 5 },
                { paragraphId: 'para_docs_ui_fixture_21', startIndex: 10 },
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
    let selectionId: number;

    function getBody() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)?.getBody();
    }

    function setSelections(ranges: Array<{ startOffset: number; endOffset: number; collapsed: boolean }>) {
        const selectionManager = get(DocSelectionManagerService);
        const subUnitId = `test-doc-selection-${selectionId++}`;
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId,
        });
        selectionManager.__TEST_ONLY_add(ranges.map((range, index) => ({
            ...range,
            isActive: index === 0,
            segmentId: '',
            style: null as never,
        })));
    }

    beforeEach(() => {
        const testBed = createCommandTestBed(getDocumentData(), [[DocContentInsertService]]);
        univer = testBed.univer;
        get = testBed.get;
        selectionId = 0;

        commandService = get(ICommandService);
        commandService.registerCommand(ListOperationCommand);
        commandService.registerCommand(ChangeListTypeCommand);
        commandService.registerCommand(ChangeListNestingLevelCommand);
        commandService.registerCommand(BulletListCommand);
        commandService.registerCommand(CheckListCommand);
        commandService.registerCommand(OrderListCommand);
        commandService.registerCommand(ToggleCheckListCommand);
        commandService.registerCommand(QuickListCommand);
        commandService.registerCommand(InsertBulletListBellowCommand);
        commandService.registerCommand(InsertOrderListBellowCommand);
        commandService.registerCommand(InsertCheckListBellowCommand);
        commandService.registerCommand(InsertBulletBelowCommand);
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
        await awaitTime(0);

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
        await awaitTime(0);

        const paragraphs = getBody()?.paragraphs ?? [];
        expect(paragraphs[0].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);
        expect(paragraphs[0].bullet?.nestingLevel).toBeGreaterThanOrEqual(1);
    });

    it('creates quick list from a markdown-like paragraph', async () => {
        setSelections([{ startOffset: 0, endOffset: 4, collapsed: false }]);

        await commandService.executeCommand(CheckListCommand.id);
        await awaitTime(0);

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
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.ORDER_LIST);
        expect(getBody()?.paragraphs?.[0].bullet?.nestingLevel).toBe(0);
        expect(getBody()?.paragraphs?.[0].paragraphStyle?.textStyle).toMatchObject(
            PRESET_LIST_TYPE[PresetListType.ORDER_LIST].nestingLevel[0].paragraphProperties?.textStyle ?? {}
        );
    });

    it('applies ordered lists and retypes selected list paragraphs through toolbar commands', async () => {
        setSelections([
            { startOffset: 0, endOffset: 4, collapsed: false },
            { startOffset: 6, endOffset: 9, collapsed: false },
        ]);

        await commandService.executeCommand(OrderListCommand.id);
        await commandService.executeCommand(BulletListCommand.id, {
            value: PresetListType.CHECK_LIST,
        });
        await commandService.executeCommand(CheckListCommand.id, {
            value: PresetListType.CHECK_LIST_CHECKED,
        });
        await awaitTime(0);

        const paragraphs = getBody()?.paragraphs ?? [];
        expect(paragraphs.map((paragraph) => paragraph.bullet?.listType)).toEqual([
            PresetListType.CHECK_LIST_CHECKED,
            PresetListType.CHECK_LIST_CHECKED,
        ]);
        expect(paragraphs[0].bullet?.listId).toBe(paragraphs[1].bullet?.listId);
    });

    it('toggles a checklist item between checked and unchecked states', async () => {
        setSelections([{ startOffset: 0, endOffset: 4, collapsed: false }]);

        await commandService.executeCommand(CheckListCommand.id);
        await commandService.executeCommand(ToggleCheckListCommand.id, {
            index: 5,
            segmentId: '',
            textRanges: [{ startOffset: 0, endOffset: 4, collapsed: false, segmentId: '' }],
        });
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST_CHECKED);

        await commandService.executeCommand(ToggleCheckListCommand.id, {
            index: 5,
            segmentId: '',
            textRanges: [{ startOffset: 0, endOffset: 4, collapsed: false, segmentId: '' }],
        });
        await awaitTime(0);

        expect(getBody()?.paragraphs?.[0].bullet?.listType).toBe(PresetListType.CHECK_LIST);
    });

    it('inserts new list items below the current paragraph for every list menu action', async () => {
        setSelections([{ startOffset: 2, endOffset: 2, collapsed: true }]);

        await commandService.executeCommand(InsertBulletListBellowCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs).toHaveLength(3);
        expect(getBody()?.paragraphs?.[1].bullet).toMatchObject({
            listType: PresetListType.BULLET_LIST,
            nestingLevel: 0,
        });

        setSelections([{ startOffset: 2, endOffset: 2, collapsed: true }]);
        await commandService.executeCommand(InsertOrderListBellowCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs).toHaveLength(4);
        expect(getBody()?.paragraphs?.[1].bullet).toMatchObject({
            listType: PresetListType.ORDER_LIST,
            nestingLevel: 0,
        });

        setSelections([{ startOffset: 2, endOffset: 2, collapsed: true }]);
        await commandService.executeCommand(InsertCheckListBellowCommand.id);
        await awaitTime(0);

        expect(getBody()?.paragraphs).toHaveLength(5);
        expect(getBody()?.paragraphs?.[1].bullet).toMatchObject({
            listType: PresetListType.CHECK_LIST,
            nestingLevel: 0,
        });
    });

    it('inserts a list at an explicit paragraph gap without inheriting or converting the right paragraph', async () => {
        const bodyBefore = getBody()!;
        bodyBefore.paragraphs![1].paragraphStyle = { indentStart: { v: 60 } };
        get(DocContentInsertService).setInsertRange({
            unitId: 'test-doc',
            startOffset: 6,
            endOffset: 6,
        });

        expect(await commandService.executeCommand(InsertBulletListBellowCommand.id)).toBe(true);
        await awaitTime(0);

        const body = getBody()!;
        expect(body.paragraphs?.find((paragraph) => paragraph.startIndex === 6)?.bullet?.listType).toBe(PresetListType.BULLET_LIST);
        expect(body.paragraphs?.find((paragraph) => paragraph.paragraphId === 'para_docs_ui_fixture_21')?.paragraphStyle).toEqual({ indentStart: { v: 60 } });
        expect(validateDocBodyStructure(body)).toEqual([]);
    });

    it('inserts a bullet below the focused list item and keeps the active list identity', async () => {
        setSelections([{ startOffset: 0, endOffset: 4, collapsed: false }]);

        await commandService.executeCommand(BulletListCommand.id);
        await awaitTime(0);

        const sourceBullet = getBody()?.paragraphs?.[0].bullet;
        setSelections([{ startOffset: 2, endOffset: 2, collapsed: true }]);

        await commandService.executeCommand(InsertBulletBelowCommand.id, {
            listType: PresetListType.BULLET_LIST,
        });
        await awaitTime(0);

        expect(getBody()?.paragraphs).toHaveLength(3);
        expect(getBody()?.paragraphs?.[1].bullet).toEqual({
            listType: PresetListType.BULLET_LIST,
            listId: sourceBullet?.listId,
            nestingLevel: sourceBullet?.nestingLevel,
        });
    });

    it('does not insert a bullet below when the active selection spans text', async () => {
        setSelections([{ startOffset: 0, endOffset: 4, collapsed: false }]);

        const result = await commandService.executeCommand(InsertBulletBelowCommand.id, {
            listType: PresetListType.BULLET_LIST,
        });

        expect(result).toBe(false);
        expect(getBody()?.paragraphs).toHaveLength(2);
        expect(getBody()?.dataStream).toBe('Alpha\rBeta\r\n');
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
