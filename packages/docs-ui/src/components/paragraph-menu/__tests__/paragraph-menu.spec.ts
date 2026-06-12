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

import { NamedStyleType } from '@univerjs/core';
import { MenuItemType } from '@univerjs/ui';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as paragraphMenu from '..';
import { createParagraphMenuHoverOpenScheduler, getParagraphFormattingRange, getParagraphMenuActiveHeadingCommandId, getParagraphMenuCommand, getParagraphMenuCommandTargetRange, getParagraphMenuHiddenHeadingCommandIds, getParagraphMenuHiddenItemIds, getParagraphMenuIconSizeClass, getParagraphMenuPopupDirection, getParagraphMenuResolvedCommand, getParagraphMenuTargetRange, isEmptyParagraphMenuTarget, PARAGRAPH_MENU_HOVER_OPEN_DELAY, setParagraphMenuInteractionActive, shouldShowParagraphSettingMenu, shouldUseInsertBelowRange } from '..';
import { HorizontalLineCommand } from '../../../commands/commands/doc-horizontal-line.command';
import { SetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand } from '../../../commands/commands/inline-format.command';
import { BulletListCommand, InsertBulletListBellowCommand, OrderListCommand } from '../../../commands/commands/list.command';
import { H1HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SetParagraphNamedStyleCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../../../commands/commands/set-heading.command';
import { CreateDocTableCommand } from '../../../commands/commands/table/doc-table-create.command';
import {
    DOC_PARAGRAPH_T_EDIT_MENU_ID,
    DOC_PARAGRAPH_T_INSERT_MENU_ID,
    EmptyParagraphBulletListMenuItemFactory,
    EmptyParagraphH1MenuItemFactory,
    EmptyParagraphHorizontalLineMenuItemFactory,
    HEADING_ICON_MAP,
    INSERT_BELLOW_MENU_ID,
    InsertBulletListBellowMenuItemFactory,
    InsertHorizontalLineBellowMenuItemFactory,
    InsertOrderListBellowMenuItemFactory,
    ParagraphMenuBackgroundColorHeaderActionMenuItemFactory,
    ParagraphMenuBackgroundColorSwatchMenuItemFactories,
    ParagraphMenuDefaultTextColorMenuItemFactory,
    ParagraphMenuIndentDecreaseMenuItemFactory,
    ParagraphMenuIndentIncreaseMenuItemFactory,
    ParagraphMenuNoBackgroundMenuItemFactory,
    ParagraphMenuTextColorHeaderActionMenuItemFactory,
    ParagraphMenuTextColorSwatchMenuItemFactories,
    TableBlockCopyMenuItemFactory,
    TableBlockDeleteMenuItemFactory,
    TableBlockPasteMenuItemFactory,
} from '../../../menu/paragraph-menu';

describe('ParagraphMenu', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('uses a smaller icon for normal text paragraph triggers', () => {
        expect(getParagraphMenuIconSizeClass('TextTypeIcon')).toBe('univer-size-3');
        expect(getParagraphMenuIconSizeClass('TitleTypeIcon')).toBe('univer-size-4');
        expect(getParagraphMenuIconSizeClass('SubtitleTypeIcon')).toBe('univer-size-4');
        expect(getParagraphMenuIconSizeClass('H1Icon')).toBe('univer-size-4');
        expect(HEADING_ICON_MAP[NamedStyleType.TITLE].key).toBe('TitleTypeIcon');
        expect(HEADING_ICON_MAP[NamedStyleType.SUBTITLE].key).toBe('SubtitleTypeIcon');
    });

    it('uses the enlarged context menu size variant for the docs T menu', () => {
        expect((paragraphMenu as any).getParagraphMenuContextMenuSizeVariant?.()).toBe('paragraph-t');
    });

    it('uses fully-qualified locale keys for paragraph context menu labels', () => {
        const accessor = {
            get: () => ({
                get: () => undefined,
                register: () => undefined,
            }),
        } as never;

        expect(EmptyParagraphH1MenuItemFactory(accessor).title).toBe('ui.toolbar.heading.1');
        expect(EmptyParagraphBulletListMenuItemFactory(accessor).title).toBe('docs-ui.rightClick.bulletList');
        expect(EmptyParagraphHorizontalLineMenuItemFactory(accessor).title).toBe('docs-ui.toolbar.horizontalLine');
        expect(TableBlockCopyMenuItemFactory(accessor).title).toBe('docs-ui.rightClick.copy');
        expect(TableBlockPasteMenuItemFactory(accessor).title).toBe('docs-ui.rightClick.paste');
        expect(TableBlockDeleteMenuItemFactory(accessor).title).toBe('docs-ui.rightClick.delete');
    });

    it('adds matching tooltips to T-menu icon actions', () => {
        const accessor = {
            get: () => ({
                get: () => undefined,
                register: () => undefined,
            }),
        } as never;

        expect(EmptyParagraphH1MenuItemFactory(accessor).tooltip).toBe('ui.toolbar.heading.1');
        expect(EmptyParagraphBulletListMenuItemFactory(accessor).tooltip).toBe('docs-ui.rightClick.bulletList');
        expect(EmptyParagraphHorizontalLineMenuItemFactory(accessor).tooltip).toBe('docs-ui.toolbar.horizontalLine');
        expect(InsertOrderListBellowMenuItemFactory(accessor).tooltip).toBe('docs-ui.rightClick.orderList');
        expect(InsertBulletListBellowMenuItemFactory(accessor).tooltip).toBe('docs-ui.rightClick.bulletList');
        expect(InsertHorizontalLineBellowMenuItemFactory(accessor).tooltip).toBe('docs-ui.toolbar.horizontalLine');
        expect(ParagraphMenuIndentIncreaseMenuItemFactory(accessor).tooltip).toBe('docs-ui.paragraphMenu.increaseIndent');
        expect(ParagraphMenuIndentDecreaseMenuItemFactory(accessor).tooltip).toBe('docs-ui.paragraphMenu.decreaseIndent');
        expect(ParagraphMenuIndentIncreaseMenuItemFactory(accessor).title).toBe('docs-ui.paragraphMenu.increase');
        expect(ParagraphMenuIndentDecreaseMenuItemFactory(accessor).title).toBe('docs-ui.paragraphMenu.decrease');
    });

    it('renders paragraph text color swatches with an A glyph inside an outlined color chip', () => {
        const registeredIcons = new Map<string, React.ComponentType<{ className?: string }>>();
        const componentManager = {
            get: (key: string) => registeredIcons.get(key),
            register: (key: string, component: React.ComponentType<{ className?: string }>) => {
                registeredIcons.set(key, component);
            },
        };
        const accessor = {
            get: () => componentManager,
        } as never;

        const factory = ParagraphMenuTextColorSwatchMenuItemFactories['doc.menu.paragraph-t.text-color.0'].menuItemFactory;
        const menuItem = factory(accessor);
        const Icon = registeredIcons.get(menuItem.icon as string);

        expect(Icon).toBeDefined();
        expect(menuItem.tooltip).toBeUndefined();

        const markup = renderToStaticMarkup(React.createElement(Icon!, { className: 'swatch-icon' }));

        expect(markup).toContain('>A<');
        expect(markup.match(/<rect/g)?.length ?? 0).toBeGreaterThan(0);
    });

    it('keeps paragraph background color swatches as plain color blocks', () => {
        const registeredIcons = new Map<string, React.ComponentType<{ className?: string }>>();
        const componentManager = {
            get: (key: string) => registeredIcons.get(key),
            register: (key: string, component: React.ComponentType<{ className?: string }>) => {
                registeredIcons.set(key, component);
            },
        };
        const accessor = {
            get: () => componentManager,
        } as never;

        const factory = ParagraphMenuBackgroundColorSwatchMenuItemFactories['doc.menu.paragraph-t.background-color.0'].menuItemFactory;
        const menuItem = factory(accessor);
        const Icon = registeredIcons.get(menuItem.icon as string);

        expect(Icon).toBeDefined();
        expect(menuItem.tooltip).toBeUndefined();

        const markup = renderToStaticMarkup(React.createElement(Icon!, { className: 'swatch-icon' }));

        expect(markup).not.toContain('>A<');
        expect(markup.match(/<rect/g)?.length ?? 0).toBeGreaterThan(0);
    });

    it('keeps the non-color explanatory actions in the colors submenu tooltip-free', () => {
        const accessor = {
            get: () => ({
                get: () => undefined,
                register: () => undefined,
            }),
        } as never;

        expect(ParagraphMenuDefaultTextColorMenuItemFactory(accessor).tooltip).toBeUndefined();
        expect(ParagraphMenuNoBackgroundMenuItemFactory(accessor).tooltip).toBeUndefined();
    });

    it('reuses the existing text color selector logic for the colors header action with an A icon', () => {
        const registeredIcons = new Map<string, React.ComponentType<{ className?: string }>>();
        const componentManager = {
            get: (key: string) => registeredIcons.get(key),
            register: (key: string, component: React.ComponentType<{ className?: string }>) => {
                registeredIcons.set(key, component);
            },
        };
        const accessor = {
            get: () => componentManager,
        } as never;

        const menuItem = ParagraphMenuTextColorHeaderActionMenuItemFactory(accessor);
        const Icon = registeredIcons.get(menuItem.icon as string);

        expect(menuItem.type).toBe(MenuItemType.BUTTON_SELECTOR);
        expect(menuItem.id).toBe(SetInlineFormatTextColorCommand.id);
        expect(menuItem.icon).toBe('HeaderTextColorIcon');
        expect(menuItem.tooltip).toBeUndefined();
        expect(Array.isArray((menuItem as any).selections)).toBe(true);
        expect(Icon).toBeDefined();

        const markup = renderToStaticMarkup(React.createElement(Icon!, { className: 'header-color-icon' }));

        expect(markup).toContain('>A<');
        expect(markup).toContain('width="1em"');
        expect(markup).toContain('height="1em"');
    });

    it('reuses the existing background color selector logic for the colors header action with the bucket icon', () => {
        const accessor = {
            get: () => ({
                get: () => undefined,
                register: () => undefined,
            }),
        } as never;

        const menuItem = ParagraphMenuBackgroundColorHeaderActionMenuItemFactory(accessor);

        expect(menuItem.type).toBe(MenuItemType.BUTTON_SELECTOR);
        expect(menuItem.id).toBe(SetInlineFormatTextBackgroundColorCommand.id);
        expect(menuItem.icon).toBe('PaintBucketDoubleIcon');
        expect(menuItem.tooltip).toBeUndefined();
        expect(Array.isArray((menuItem as any).selections)).toBe(true);
    });

    it('opens the popup away from the drag handle when there is not enough left space', () => {
        expect(getParagraphMenuPopupDirection(170)).toBe('right');
        expect(getParagraphMenuPopupDirection(260)).toBe('left');
    });

    it('creates a hover bridge overlapping the trigger edge for left-side paragraph popups', () => {
        expect(paragraphMenu.getParagraphMenuHoverBridgeStyle?.({
            left: 320,
            right: 348,
            top: 120,
            bottom: 152,
        }, 'left')).toEqual({
            left: 308,
            top: 112,
            width: 24,
            height: 48,
        });
    });

    it('creates a hover bridge overlapping the trigger edge for right-side paragraph popups', () => {
        expect(paragraphMenu.getParagraphMenuHoverBridgeStyle?.({
            left: 24,
            right: 52,
            top: 40,
            bottom: 72,
        }, 'right')).toEqual({
            left: 40,
            top: 32,
            width: 24,
            height: 48,
        });
    });

    it('delays opening the paragraph popup for hover and cancels before the delay elapses', () => {
        vi.useFakeTimers();
        const openMenu = vi.fn();
        const scheduler = createParagraphMenuHoverOpenScheduler(openMenu);

        scheduler.schedule();
        vi.advanceTimersByTime(PARAGRAPH_MENU_HOVER_OPEN_DELAY - 1);

        expect(openMenu).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);

        expect(openMenu).toHaveBeenCalledTimes(1);

        openMenu.mockClear();
        scheduler.schedule();
        scheduler.cancel();
        vi.advanceTimersByTime(PARAGRAPH_MENU_HOVER_OPEN_DELAY);

        expect(openMenu).not.toHaveBeenCalled();
    });

    it('opens the paragraph popup immediately for click', () => {
        vi.useFakeTimers();
        const openMenu = vi.fn();
        const scheduler = createParagraphMenuHoverOpenScheduler(openMenu);

        scheduler.schedule();
        scheduler.openNow();

        expect(openMenu).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(PARAGRAPH_MENU_HOVER_OPEN_DELAY);

        expect(openMenu).toHaveBeenCalledTimes(1);
    });

    it('marks the paragraph menu interaction as active while hovering trigger, bridge, or popup', () => {
        const setParagraphMenuActive = vi.fn();

        setParagraphMenuInteractionActive({ setParagraphMenuActive } as never, true);
        setParagraphMenuInteractionActive({ setParagraphMenuActive } as never, false);

        expect(setParagraphMenuActive).toHaveBeenNthCalledWith(1, true);
        expect(setParagraphMenuActive).toHaveBeenNthCalledWith(2, false);
    });

    it('maps paragraph named styles to the active heading menu item', () => {
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.HEADING_1)).toBe(H1HeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.HEADING_3)).toBe(H3HeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.NORMAL_TEXT)).toBe(NormalTextHeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(undefined)).toBe(NormalTextHeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.TITLE)).toBe(TitleHeadingCommand.id);
        expect(getParagraphMenuActiveHeadingCommandId(NamedStyleType.SUBTITLE)).toBe(SubtitleHeadingCommand.id);
    });

    it('hides the alternate title shortcuts for the hovered paragraph style', () => {
        expect(getParagraphMenuHiddenHeadingCommandIds(NamedStyleType.TITLE)).toEqual([
            H4HeadingCommand.id,
            H5HeadingCommand.id,
            SubtitleHeadingCommand.id,
        ]);
        expect(getParagraphMenuHiddenHeadingCommandIds(NamedStyleType.SUBTITLE)).toEqual([
            H4HeadingCommand.id,
            H5HeadingCommand.id,
            TitleHeadingCommand.id,
        ]);
        expect(getParagraphMenuHiddenHeadingCommandIds(NamedStyleType.NORMAL_TEXT)).toEqual([
            H5HeadingCommand.id,
            TitleHeadingCommand.id,
            SubtitleHeadingCommand.id,
        ]);
    });

    it('keeps all six insert-state header icons visible for empty paragraphs', () => {
        expect(getParagraphMenuHiddenItemIds(
            DOC_PARAGRAPH_T_INSERT_MENU_ID,
            { kind: 'paragraph' } as never,
            NamedStyleType.NORMAL_TEXT
        )).toEqual([]);

        expect(getParagraphMenuHiddenItemIds(
            DOC_PARAGRAPH_T_EDIT_MENU_ID,
            { kind: 'paragraph' } as never,
            NamedStyleType.NORMAL_TEXT
        )).toEqual([
            H5HeadingCommand.id,
            TitleHeadingCommand.id,
            SubtitleHeadingCommand.id,
        ]);
    });

    it('shows paragraph settings only for paragraph and list menu targets', () => {
        expect(shouldShowParagraphSettingMenu(null)).toBe(true);
        expect(shouldShowParagraphSettingMenu({ kind: 'paragraph' } as never)).toBe(true);
        expect(shouldShowParagraphSettingMenu({ kind: 'paragraph', icon: 'OrderIcon' } as never)).toBe(true);
        expect(shouldShowParagraphSettingMenu({ kind: 'blockRange' } as never)).toBe(false);
        expect(shouldShowParagraphSettingMenu({ kind: 'table' } as never)).toBe(false);
        expect(shouldShowParagraphSettingMenu({ kind: 'customBlock' } as never)).toBe(false);
    });

    it('detects empty paragraph menu targets', () => {
        const paragraph = {
            paragraphStart: 2,
            paragraphEnd: 2,
        };
        const nonEmptyParagraph = {
            paragraphStart: 2,
            paragraphEnd: 3,
        };

        expect(isEmptyParagraphMenuTarget('a\r\r', paragraph as never)).toBe(true);
        expect(isEmptyParagraphMenuTarget('a\r\r', { paragraphStart: 1, paragraphEnd: 2 } as never)).toBe(true);
        expect(isEmptyParagraphMenuTarget('a\n\n', { paragraphStart: 1, paragraphEnd: 2 } as never)).toBe(true);
        expect(isEmptyParagraphMenuTarget('a\rb\r', nonEmptyParagraph as never)).toBe(false);
    });

    it('builds a collapsed selection range for the hovered paragraph', () => {
        expect(getParagraphMenuTargetRange({
            paragraphStart: 3,
            paragraphEnd: 8,
            segmentId: 'header-1',
        } as never)).toEqual({
            collapsed: true,
            endOffset: 3,
            segmentId: 'header-1',
            startOffset: 3,
        });
    });

    it('builds a full formatting range for whole-paragraph color actions', () => {
        expect(getParagraphFormattingRange({
            kind: 'paragraph',
            menuRange: {
                startOffset: 3,
                endOffset: 3,
                collapsed: true,
            },
        } as never, {
            paragraphStart: 3,
            paragraphEnd: 8,
            segmentId: 'header-1',
        } as never)).toEqual({
            collapsed: false,
            endOffset: 8,
            segmentId: 'header-1',
            startOffset: 3,
        });

        expect(getParagraphFormattingRange({
            kind: 'blockRange',
            blockRange: {
                startIndex: 6,
                endIndex: 14,
            },
            menuRange: {
                startOffset: 6,
                endOffset: 15,
                collapsed: false,
            },
        } as never, {
            segmentId: 'body',
        } as never)).toEqual({
            collapsed: false,
            endOffset: 15,
            segmentId: 'body',
            startOffset: 6,
        });
    });

    it('uses the formatting range for whole-paragraph selection commands', () => {
        const targetRange = { startOffset: 3, endOffset: 3, collapsed: true };
        const formattingRange = { startOffset: 3, endOffset: 8, collapsed: false };

        expect(getParagraphMenuCommandTargetRange(SetInlineFormatTextColorCommand.id, targetRange as never, formattingRange as never)).toEqual(formattingRange);
        expect(getParagraphMenuCommandTargetRange(H1HeadingCommand.id, targetRange as never, formattingRange as never)).toEqual(targetRange);
    });

    it('preserves context menu command params for paragraph menu actions', () => {
        expect(getParagraphMenuCommand({
            commandId: CreateDocTableCommand.id,
            id: 'doc.operation.create-table',
            label: 'doc.operation.create-table',
            params: { rowCount: 3, colCount: 5 },
        })).toEqual({
            commandId: CreateDocTableCommand.id,
            params: { rowCount: 3, colCount: 5 },
        });

        expect(getParagraphMenuCommand({
            label: 'doc.command.h1-heading',
        }, { startOffset: 3, endOffset: 3, collapsed: true })).toEqual({
            commandId: SetParagraphNamedStyleCommand.id,
            params: {
                value: NamedStyleType.HEADING_1,
                textRanges: [{ startOffset: 3, endOffset: 3, collapsed: true }],
            },
        });
    });

    it('preserves custom color values when resolving paragraph menu commands', () => {
        expect(getParagraphMenuResolvedCommand({
            id: SetInlineFormatTextColorCommand.id,
            value: '#ff5500',
        }, null)).toEqual({
            commandId: SetInlineFormatTextColorCommand.id,
            params: { value: '#ff5500' },
        });

        expect(getParagraphMenuResolvedCommand({
            id: SetInlineFormatTextBackgroundColorCommand.id,
            value: 'rgba(255, 140, 81, 0.3)',
        }, null)).toEqual({
            commandId: SetInlineFormatTextBackgroundColorCommand.id,
            params: { value: 'rgba(255, 140, 81, 0.3)' },
        });
    });

    it('passes the hovered paragraph range to current-paragraph menu commands', () => {
        const targetRange = { startOffset: 3, endOffset: 3, collapsed: true };

        expect(getParagraphMenuCommand({
            label: BulletListCommand.id,
        }, targetRange)).toEqual({
            commandId: BulletListCommand.id,
            params: { docRange: [targetRange] },
        });
        expect(getParagraphMenuCommand({
            label: OrderListCommand.id,
        }, targetRange)).toEqual({
            commandId: OrderListCommand.id,
            params: { docRange: [targetRange] },
        });
        expect(getParagraphMenuCommand({
            label: HorizontalLineCommand.id,
        }, targetRange)).toEqual({
            commandId: HorizontalLineCommand.id,
            params: { insertRange: targetRange },
        });
        expect(getParagraphMenuCommand({
            label: H1HeadingCommand.id,
        }, null)).toEqual({
            commandId: H1HeadingCommand.id,
            params: undefined,
        });
    });

    it('detects menu commands that should use the hovered block insert-below anchor', () => {
        expect(shouldUseInsertBelowRange(InsertBulletListBellowCommand.id, {
            id: InsertBulletListBellowCommand.id,
        })).toBe(true);
        expect(shouldUseInsertBelowRange('docs-callout.command.insert-below', {
            id: 'docs-callout.command.insert-below',
        })).toBe(true);
        expect(shouldUseInsertBelowRange('doc.command.insert-float-image', {
            id: 'doc.command.insert-float-image',
        })).toBe(true);
        expect(shouldUseInsertBelowRange(CreateDocTableCommand.id, {
            id: 'doc.operation.create-table',
        })).toBe(true);
        expect(shouldUseInsertBelowRange(H1HeadingCommand.id, {
            id: H1HeadingCommand.id,
        })).toBe(false);
        expect(shouldUseInsertBelowRange(H1HeadingCommand.id, {
            id: INSERT_BELLOW_MENU_ID,
        })).toBe(true);
    });
});
