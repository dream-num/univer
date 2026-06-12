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
import { DocCopyCurrentParagraphCommand, DocCutCurrentParagraphCommand } from '../../commands/commands/clipboard.command';
import { DeleteCurrentParagraphCommand } from '../../commands/commands/doc-delete.command';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../../commands/commands/doc-horizontal-line.command';
import { ResetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand } from '../../commands/commands/inline-format.command';
import { BulletListCommand, CheckListCommand, InsertBulletListBellowCommand, InsertCheckListBellowCommand, InsertOrderListBellowCommand, OrderListCommand } from '../../commands/commands/list.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignOperationCommand, AlignRightCommand } from '../../commands/commands/paragraph-align.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SetParagraphNamedStyleCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../../commands/commands/set-heading.command';
import { SwitchDocModeCommand } from '../../commands/commands/switch-doc-mode.command';
import { CreateDocTableCommand } from '../../commands/commands/table/doc-table-create.command';
import { DocTableDeleteTableCommand } from '../../commands/commands/table/doc-table-delete.command';
import { DocCreateTableOperation } from '../../commands/operations/doc-create-table.operation';
import { DocParagraphSettingPanelOperation } from '../../commands/operations/doc-paragraph-setting-panel.operation';
import { AlignMenuItemFactory, DocSwitchModeMenuItemFactory, FLOAT_TEXT_STYLE_MENU_ID, FLOAT_TOOLBAR_MENU_POSITION, FloatTextStyleMenuItemFactory, InsertDefaultTableMenuFactory, InsertTableMenuFactory } from '../menu';
import {
    DOC_CONTENT_INSERT_MENU_ID,
    DOC_PARAGRAPH_T_ALIGN_MENU_ID,
    DOC_PARAGRAPH_T_COLORS_MENU_ID,
    DOC_PARAGRAPH_T_DIVIDER_MENU_ID,
    DOC_PARAGRAPH_T_EDIT_MENU_ID,
    DOC_PARAGRAPH_T_INDENT_DECREASE_ID,
    DOC_PARAGRAPH_T_INDENT_INCREASE_ID,
    DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
    DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID,
    DOC_PARAGRAPH_T_INSERT_MENU_ID,
    DOC_TABLE_BLOCK_MENU_ID,
    EMPTY_PARAGRAPH_MENU_ID,
    INSERT_BELLOW_MENU_ID,
    InsertBulletListBellowMenuItemFactory,
    InsertCheckListBellowMenuItemFactory,
    InsertHorizontalLineBellowMenuItemFactory,
    InsertOrderListBellowMenuItemFactory,
    ParagraphMenuBackgroundColorHeaderActionMenuItemFactory,
    ParagraphMenuDefaultTextColorMenuItemFactory,
    ParagraphMenuInsertBelowHeadingH1MenuItemFactory,
    ParagraphMenuInsertBelowTableMenuItemFactory,
    ParagraphMenuTextColorHeaderActionMenuItemFactory,
} from '../paragraph-menu';
import { menuSchema } from '../schema';

const OPTIONAL_INSERT_COMMAND_IDS = [
    'docs-code.command.insert',
    'docs-quote.command.insert',
    'docs-callout.command.insert',
    'doc.command.insert-float-image',
    'doc.command.menu-insert-shape',
];

const OPTIONAL_INSERT_BELOW_COMMAND_IDS = [
    'docs-code.command.insert-below',
    'docs-quote.command.insert-below',
    'docs-callout.command.insert-below',
    'doc.command.insert-float-image.below',
    'doc.command.menu-insert-shape.below',
];

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
        expect((item.selections as Array<{ label?: string }>).map((option) => option.label)).toEqual([
            'docs-ui.toolbar.alignLeft',
            'docs-ui.toolbar.alignCenter',
            'docs-ui.toolbar.alignRight',
            'docs-ui.toolbar.alignJustify',
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
        expect((item.selections as Array<{ label?: string }>).map((option) => option.label)).toEqual([
            'ui.toolbar.heading.normal',
            'ui.toolbar.heading.1',
            'ui.toolbar.heading.2',
            'ui.toolbar.heading.3',
            'ui.toolbar.heading.4',
            'ui.toolbar.heading.5',
            'docs-ui.toolbar.order',
            'docs-ui.toolbar.unorder',
            'docs-ui.toolbar.checklist',
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
        expect(item.title).toBe('docs-ui.toolbar.table.insert');
    });

    it('builds the insert-state T menu from official menu schema groups', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];
        const insertMenu = paragraph[DOC_PARAGRAPH_T_INSERT_MENU_ID];
        const quickTop = insertMenu.quickTop;
        const quickBottom = insertMenu.quickBottom;
        const insert = insertMenu.insert;

        expect(quickTop.quickLayout).toBe('icon');
        expect(quickBottom.quickLayout).toBe('icon');
        expect(Object.keys(quickTop)).toEqual(expect.arrayContaining([
            H1HeadingCommand.id,
            H2HeadingCommand.id,
            H3HeadingCommand.id,
            H4HeadingCommand.id,
            H5HeadingCommand.id,
            OrderListCommand.id,
        ]));
        expect(Object.keys(quickBottom)).toEqual(expect.arrayContaining([
            BulletListCommand.id,
            CheckListCommand.id,
            HorizontalLineCommand.id,
        ]));
        expect(insert[DocCreateTableOperation.id].menuItemFactory).toBe(InsertDefaultTableMenuFactory);
        expect(OPTIONAL_INSERT_COMMAND_IDS.some((id) => quickBottom[id] || insert[id])).toBe(false);
    });

    it('builds the edit-state T menu with official submenus instead of a custom panel', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];
        const editMenu = paragraph[DOC_PARAGRAPH_T_EDIT_MENU_ID];
        const quickTop = editMenu.quickTop;
        const quickBottom = editMenu.quickBottom;
        const layout = editMenu.layout;
        const format = editMenu.format;
        const others = editMenu.others;

        expect(quickTop.quickLayout).toBe('icon');
        expect(quickBottom.quickLayout).toBe('icon');
        expect(quickTop[NormalTextHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(quickTop[TitleHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(quickTop[SubtitleHeadingCommand.id].menuItemFactory).toBeDefined();
        expect(OPTIONAL_INSERT_COMMAND_IDS.some((id) => quickBottom[id])).toBe(false);
        expect(layout[DOC_PARAGRAPH_T_ALIGN_MENU_ID].menuItemFactory).toBeDefined();
        expect(layout[DOC_PARAGRAPH_T_COLORS_MENU_ID].menuItemFactory).toBeDefined();
        expect(format[DocCutCurrentParagraphCommand.id].menuItemFactory).toBeDefined();
        expect(format[DocCopyCurrentParagraphCommand.id].menuItemFactory).toBeDefined();
        expect(format[DeleteCurrentParagraphCommand.id].menuItemFactory).toBeDefined();
        expect(others[DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID].menuItemFactory).toBeDefined();
    });

    it('keeps divider-state T menus compact while reusing the same official submenu system', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];
        const dividerMenu = paragraph[DOC_PARAGRAPH_T_DIVIDER_MENU_ID];

        expect(dividerMenu.quick).toBeUndefined();
        expect(dividerMenu.layout[DOC_PARAGRAPH_T_COLORS_MENU_ID].menuItemFactory).toBeDefined();
        expect(dividerMenu.layout[DOC_PARAGRAPH_T_ALIGN_MENU_ID]).toBeUndefined();
        expect(dividerMenu.others[DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID].menuItemFactory).toBeDefined();
    });

    it('defines align, color, and insert-below submenu contents in schema', () => {
        const paragraph = (menuSchema as any)[ContextMenuPosition.PARAGRAPH];
        const alignMenu = paragraph[DOC_PARAGRAPH_T_ALIGN_MENU_ID];
        const colorsMenu = paragraph[DOC_PARAGRAPH_T_COLORS_MENU_ID];
        const insertBelowMenu = paragraph[DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID];

        expect(alignMenu.align.title).toBe('docs-ui.paragraphMenu.align');
        expect(alignMenu.align.quickLayout).toBe('icon');
        expect(Object.keys(alignMenu.align)).toEqual(expect.arrayContaining([
            AlignOperationCommand.id,
            `${AlignOperationCommand.id}.center`,
            `${AlignOperationCommand.id}.right`,
            `${AlignOperationCommand.id}.justify`,
        ]));
        expect(alignMenu.indent.title).toBe('docs-ui.paragraphMenu.indent');
        expect(alignMenu.indent.quickLayout).toBeUndefined();
        expect(Object.keys(alignMenu.indent)).toEqual(expect.arrayContaining([
            DOC_PARAGRAPH_T_INDENT_INCREASE_ID,
            DOC_PARAGRAPH_T_INDENT_DECREASE_ID,
        ]));

        expect(colorsMenu.text.title).toBe('docs-ui.toolbar.textColor.main');
        expect(colorsMenu.text.headerActionMenuItemFactory).toBe(ParagraphMenuTextColorHeaderActionMenuItemFactory);
        expect(colorsMenu.text.quickLayout).toBe('icon');
        expect(colorsMenu.text.quickColumns).toBe(8);
        expect(colorsMenu.text.quickLayoutVariant).toBe('compact');
        expect(colorsMenu.text[`${SetInlineFormatTextColorCommand.id}.default`].menuItemFactory).toBe(ParagraphMenuDefaultTextColorMenuItemFactory);
        expect(colorsMenu.backgroundTop.title).toBe('docs-ui.toolbar.fillColor.main');
        expect(colorsMenu.backgroundTop.headerActionMenuItemFactory).toBe(ParagraphMenuBackgroundColorHeaderActionMenuItemFactory);
        expect(colorsMenu.backgroundTop.quickLayout).toBe('icon');
        expect(colorsMenu.backgroundTop.quickColumns).toBe(8);
        expect(colorsMenu.backgroundTop.quickLayoutVariant).toBe('compact');
        expect(colorsMenu.backgroundTop[ResetInlineFormatTextBackgroundColorCommand.id].menuItemFactory).toBeDefined();
        expect(colorsMenu.backgroundBottom.quickLayout).toBe('icon');
        expect(colorsMenu.backgroundBottom.quickColumns).toBe(8);
        expect(colorsMenu.backgroundBottom.quickLayoutVariant).toBe('compact');
        expect(colorsMenu.reset).toBeUndefined();
        expect(Object.keys(colorsMenu.text).filter((key) => key.startsWith('doc.menu.paragraph-t.text-color.'))).toHaveLength(7);
        expect(Object.keys(colorsMenu.backgroundTop).filter((key) => key.startsWith('doc.menu.paragraph-t.background-color.'))).toHaveLength(7);
        expect(Object.keys(colorsMenu.backgroundBottom).filter((key) => key.startsWith('doc.menu.paragraph-t.background-color.'))).toHaveLength(8);

        expect(insertBelowMenu.quickTop.quickLayout).toBe('icon');
        expect(insertBelowMenu.quickBottom.quickLayout).toBe('icon');
        expect(Object.keys(insertBelowMenu.quickTop)).toEqual(expect.arrayContaining([
            `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h1`,
            `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h2`,
            `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h3`,
            `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h4`,
            `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h5`,
            InsertOrderListBellowCommand.id,
        ]));
        expect(Object.keys(insertBelowMenu.quickBottom)).toEqual(expect.arrayContaining([
            InsertBulletListBellowCommand.id,
            InsertCheckListBellowCommand.id,
            InsertHorizontalLineBellowCommand.id,
        ]));
        expect(insertBelowMenu.insert[`${DocCreateTableOperation.id}.below`].menuItemFactory).toBeDefined();
        expect(OPTIONAL_INSERT_BELOW_COMMAND_IDS.some((id) => insertBelowMenu.quickBottom[id] || insertBelowMenu.insert[id])).toBe(false);
    });

    it('registers icons needed by paragraph T insert-below tiny menu items', () => {
        const registered = new Set<string>();
        const accessor = {
            get: () => ({
                get: (key: string) => registered.has(key),
                register: (key: string) => registered.add(key),
            }),
        } as never;

        [
            ParagraphMenuInsertBelowHeadingH1MenuItemFactory,
            InsertOrderListBellowMenuItemFactory,
            InsertBulletListBellowMenuItemFactory,
            InsertCheckListBellowMenuItemFactory,
            InsertHorizontalLineBellowMenuItemFactory,
            ParagraphMenuInsertBelowTableMenuItemFactory,
        ].forEach((factory) => factory(accessor));

        expect([...registered]).toEqual(expect.arrayContaining([
            'H1Icon',
            'OrderIcon',
            'UnorderIcon',
            'TodoListDoubleIcon',
            'ReduceIcon',
            'GridIcon',
        ]));
    });
});
