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

import { ContextMenuGroup, ContextMenuPosition, MenuItemType, RibbonInsertGroup, RibbonStartGroup } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand, CheckListCommand, InsertBulletListBellowCommand, InsertCheckListBellowCommand, InsertOrderListBellowCommand, OrderListCommand } from '../../commands/commands/list.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignOperationCommand, AlignRightCommand } from '../../commands/commands/paragraph-align.command';
import { H1HeadingCommand, NormalTextHeadingCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../../commands/commands/set-heading.command';
import { CreateDocTableCommand } from '../../commands/commands/table/doc-table-create.command';
import { DocCreateTableOperation } from '../../commands/operations/doc-create-table.operation';
import { DocParagraphSettingPanelOperation } from '../../commands/operations/doc-paragraph-setting-panel.operation';
import { AlignMenuItemFactory, InsertDefaultTableMenuFactory, InsertTableMenuFactory } from '../menu';
import { EMPTY_PARAGRAPH_MENU_ID, INSERT_BELLOW_MENU_ID } from '../paragraph-menu';
import { menuSchema } from '../schema';

describe('docs ui ribbon schema', () => {
    it('uses one align dropdown instead of separate toolbar buttons', () => {
        const layout = (menuSchema as any)[RibbonStartGroup.LAYOUT];

        expect(layout[AlignOperationCommand.id].menuItemFactory).toBe(AlignMenuItemFactory);
        expect(layout[AlignLeftCommand.id]).toBeUndefined();
        expect(layout[AlignCenterCommand.id]).toBeUndefined();
        expect(layout[AlignRightCommand.id]).toBeUndefined();
        expect(layout[AlignJustifyCommand.id]).toBeUndefined();

        const item = AlignMenuItemFactory({ get: () => ({}) } as never);
        expect(item.type).toBe(MenuItemType.SELECTOR);
        expect((item.selections as Array<{ id?: string }>).map((option) => option.id)).toEqual([
            AlignLeftCommand.id,
            AlignCenterCommand.id,
            AlignRightCommand.id,
            AlignJustifyCommand.id,
        ]);
    });

    it('moves horizontal line and checklist to the insert tab', () => {
        const layout = (menuSchema as any)[RibbonStartGroup.LAYOUT];
        const media = (menuSchema as any)[RibbonInsertGroup.MEDIA];

        expect(layout[HorizontalLineCommand.id]).toBeUndefined();
        expect(layout[CheckListCommand.id]).toBeUndefined();
        expect(media[HorizontalLineCommand.id].menuItemFactory).toBeDefined();
        expect(media[CheckListCommand.id].menuItemFactory).toBeDefined();
    });

    it('uses current-paragraph first-level actions for empty paragraph menus', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];
        const insertBelow = paragraph[ContextMenuGroup.LAYOUT][INSERT_BELLOW_MENU_ID];
        const emptyMenu = paragraph[EMPTY_PARAGRAPH_MENU_ID];
        const quick = emptyMenu[ContextMenuGroup.QUICK];
        const layout = emptyMenu[ContextMenuGroup.LAYOUT];

        expect(quick.order).toBe(-1);
        expect(layout.order).toBe(1);
        expect(quick[DocParagraphSettingPanelOperation.id]).toBeUndefined();
        expect(layout[DocParagraphSettingPanelOperation.id].order).toBeLessThan(layout[BulletListCommand.id].order);
        expect(paragraph[ContextMenuGroup.LAYOUT][DocParagraphSettingPanelOperation.id].order).toBeLessThan(insertBelow.order);
        expect(quick[H1HeadingCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[ContextMenuGroup.QUICK][TitleHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[ContextMenuGroup.QUICK][SubtitleHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[ContextMenuGroup.QUICK][TitleHeadingCommand.id].order).toBeLessThan(quick[H1HeadingCommand.id].order);
        expect(paragraph[ContextMenuGroup.QUICK][SubtitleHeadingCommand.id].order).toBeLessThan(quick[H1HeadingCommand.id].order);
        expect(quick[NormalTextHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[ContextMenuGroup.QUICK][OrderListCommand.id]).toBeUndefined();
        expect(paragraph[ContextMenuGroup.QUICK][BulletListCommand.id]).toBeUndefined();
        expect(paragraph[ContextMenuGroup.QUICK][CheckListCommand.id]).toBeUndefined();

        expect(insertBelow[InsertOrderListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(insertBelow[InsertBulletListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(insertBelow[InsertCheckListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(insertBelow[InsertHorizontalLineBellowCommand.id].menuItemFactory).toBeDefined();
        expect(insertBelow[DocCreateTableOperation.id].menuItemFactory).toBe(InsertDefaultTableMenuFactory);

        expect(layout[OrderListCommand.id].menuItemFactory).toBeDefined();
        expect(layout[BulletListCommand.id].menuItemFactory).toBeDefined();
        expect(layout[CheckListCommand.id].menuItemFactory).toBeDefined();
        expect(layout[HorizontalLineCommand.id].menuItemFactory).toBeDefined();
        expect(layout[DocCreateTableOperation.id].menuItemFactory).toBe(InsertDefaultTableMenuFactory);
        expect(emptyMenu[ContextMenuGroup.FORMAT]).toBeUndefined();
        expect(emptyMenu[INSERT_BELLOW_MENU_ID]).toBeUndefined();
        expect(layout[InsertHorizontalLineBellowCommand.id]).toBeUndefined();
    });

    it('uses the same table icon in paragraph insert menus', () => {
        const item = InsertTableMenuFactory({ get: () => undefined } as never);

        expect(item.icon).toBe('GridIcon');
    });

    it('uses direct table creation for paragraph insert table actions', () => {
        const item = InsertDefaultTableMenuFactory({ get: () => undefined } as never);

        expect(item.commandId).toBe(CreateDocTableCommand.id);
        expect(item.params).toEqual({ rowCount: 3, colCount: 5 });
        expect(item.icon).toBe('GridIcon');
    });
});
