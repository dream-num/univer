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

import { NamedStyleType, PresetListType } from '@univerjs/core';
import { ContextMenuGroup, ContextMenuPosition, MenuItemType, RibbonInsertGroup, RibbonStartGroup } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand, CheckListCommand, InsertBulletListBellowCommand, InsertCheckListBellowCommand, InsertOrderListBellowCommand, OrderListCommand } from '../../commands/commands/list.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignOperationCommand, AlignRightCommand } from '../../commands/commands/paragraph-align.command';
import { H1HeadingCommand, NormalTextHeadingCommand, SetParagraphNamedStyleCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../../commands/commands/set-heading.command';
import { SwitchDocModeCommand } from '../../commands/commands/switch-doc-mode.command';
import { CreateDocTableCommand } from '../../commands/commands/table/doc-table-create.command';
import { DocTableDeleteTableCommand } from '../../commands/commands/table/doc-table-delete.command';
import { DocCreateTableOperation } from '../../commands/operations/doc-create-table.operation';
import { DocParagraphSettingPanelOperation } from '../../commands/operations/doc-paragraph-setting-panel.operation';
import { AlignMenuItemFactory, DocSwitchModeMenuItemFactory, FLOAT_TEXT_STYLE_MENU_ID, FLOAT_TOOLBAR_MENU_POSITION, FloatTextStyleMenuItemFactory, InsertDefaultTableMenuFactory, InsertTableMenuFactory } from '../menu';
import { DOC_CONTENT_INSERT_MENU_ID, DOC_TABLE_BLOCK_MENU_ID, EMPTY_PARAGRAPH_MENU_ID, INSERT_BELLOW_MENU_ID } from '../paragraph-menu';
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

    it('keeps the doc mode switch beside page settings', () => {
        const layout = (menuSchema as any)[RibbonStartGroup.LAYOUT];

        expect(layout[SwitchDocModeCommand.id].order).toBe(11);
        expect(layout[SwitchDocModeCommand.id].menuItemFactory).toBe(DocSwitchModeMenuItemFactory);
    });

    it('adds a text style menu for the floating toolbar', () => {
        const format = (menuSchema as any)[RibbonStartGroup.FORMAT];
        const floatToolbar = (menuSchema as any)[FLOAT_TOOLBAR_MENU_POSITION];

        expect(format[FLOAT_TEXT_STYLE_MENU_ID]).toBeUndefined();
        expect(floatToolbar[FLOAT_TEXT_STYLE_MENU_ID].order).toBe(0);

        const item = FloatTextStyleMenuItemFactory({ get: () => ({ get: () => undefined, register: () => undefined }) } as never);
        expect(item.type).toBe(MenuItemType.SELECTOR);
        expect(item.commandId).toBe(SetParagraphNamedStyleCommand.id);
        expect((item.selections as Array<{ id?: string; value?: string | number }>).map((option) => [option.id, option.value])).toEqual([
            [undefined, NamedStyleType.NORMAL_TEXT],
            [undefined, NamedStyleType.HEADING_1],
            [undefined, NamedStyleType.HEADING_2],
            [undefined, NamedStyleType.HEADING_3],
            [undefined, NamedStyleType.HEADING_4],
            [undefined, NamedStyleType.HEADING_5],
            [OrderListCommand.id, PresetListType.ORDER_LIST],
            [BulletListCommand.id, PresetListType.BULLET_LIST],
            [CheckListCommand.id, PresetListType.CHECK_LIST],
        ]);
    });

    it('uses current-paragraph first-level actions for empty paragraph menus', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];
        const insertBelow = paragraph[ContextMenuGroup.LAYOUT][INSERT_BELLOW_MENU_ID];
        const contentInsertQuick = paragraph[DOC_CONTENT_INSERT_MENU_ID][ContextMenuGroup.QUICK];
        const contentInsert = paragraph[DOC_CONTENT_INSERT_MENU_ID][ContextMenuGroup.LAYOUT];
        const emptyMenu = paragraph[EMPTY_PARAGRAPH_MENU_ID];
        const quick = emptyMenu[ContextMenuGroup.QUICK];
        const layout = emptyMenu[ContextMenuGroup.LAYOUT];

        expect(quick.order).toBe(-1);
        expect(contentInsertQuick.order).toBe(-2);
        expect(contentInsertQuick.quickLayout).toBe('icon');
        expect(layout.order).toBe(1);
        expect(quick[DocParagraphSettingPanelOperation.id]).toBeUndefined();
        expect(paragraph[ContextMenuGroup.LAYOUT][DocParagraphSettingPanelOperation.id].order).toBeLessThan(insertBelow.order);
        expect(layout[DocParagraphSettingPanelOperation.id].order).toBeLessThan(layout[BulletListCommand.id].order);
        expect(quick[H1HeadingCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[ContextMenuGroup.QUICK][TitleHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[ContextMenuGroup.QUICK][SubtitleHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[ContextMenuGroup.QUICK][TitleHeadingCommand.id].order).toBeLessThan(quick[H1HeadingCommand.id].order);
        expect(paragraph[ContextMenuGroup.QUICK][SubtitleHeadingCommand.id].order).toBeLessThan(quick[H1HeadingCommand.id].order);
        expect(quick[NormalTextHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(contentInsertQuick[H1HeadingCommand.id].menuItemFactory).toBeDefined();
        expect(contentInsertQuick[NormalTextHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(paragraph[ContextMenuGroup.QUICK][OrderListCommand.id]).toBeUndefined();
        expect(paragraph[ContextMenuGroup.QUICK][BulletListCommand.id]).toBeUndefined();
        expect(paragraph[ContextMenuGroup.QUICK][CheckListCommand.id]).toBeUndefined();

        expect(insertBelow[InsertOrderListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(insertBelow[InsertBulletListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(insertBelow[InsertCheckListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(insertBelow[InsertHorizontalLineBellowCommand.id].menuItemFactory).toBeDefined();
        expect(insertBelow[DocCreateTableOperation.id].menuItemFactory).toBe(InsertDefaultTableMenuFactory);
        expect(contentInsert[InsertOrderListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(contentInsert[InsertBulletListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(contentInsert[InsertCheckListBellowCommand.id].menuItemFactory).toBeDefined();
        expect(contentInsert[InsertHorizontalLineBellowCommand.id].menuItemFactory).toBeDefined();
        expect(contentInsert[DocCreateTableOperation.id].menuItemFactory).toBe(InsertDefaultTableMenuFactory);

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

    it('uses a compact table block menu without text style actions', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];
        const tableMenu = paragraph[DOC_TABLE_BLOCK_MENU_ID];
        const format = tableMenu[ContextMenuGroup.FORMAT];
        const layout = tableMenu[ContextMenuGroup.LAYOUT];

        expect(tableMenu[ContextMenuGroup.QUICK]).toBeUndefined();
        expect(format[DocTableDeleteTableCommand.id].menuItemFactory).toBeDefined();
        expect(format[H1HeadingCommand.id]).toBeUndefined();
        expect(format[NormalTextHeadingCommand.id]).toBeUndefined();
        expect(layout[INSERT_BELLOW_MENU_ID][DocCreateTableOperation.id].menuItemFactory).toBe(InsertDefaultTableMenuFactory);
    });

    it('uses direct table creation for paragraph insert table actions', () => {
        const item = InsertDefaultTableMenuFactory({ get: () => undefined } as never);

        expect(item.commandId).toBe(CreateDocTableCommand.id);
        expect(item.params).toEqual({ rowCount: 3, colCount: 5 });
        expect(item.icon).toBe('GridIcon');
    });
});
