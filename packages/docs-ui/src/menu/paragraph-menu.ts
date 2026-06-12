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

import type { IAccessor, ICommand } from '@univerjs/core';
import type { IMenuButtonItem, IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import type { ComponentType } from 'react';
import { ICommandService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { SetTextSelectionsOperation } from '@univerjs/docs';
import {
    GridIcon,
    H1Icon,
    H2Icon,
    H3Icon,
    H4Icon,
    H5Icon,
    MoreLeftIcon,
    MoreRightIcon,
    OrderIcon,
    ReduceIcon,
    TextTypeIcon,
    TodoListDoubleIcon,
    UnorderIcon,
} from '@univerjs/icons';
import { ComponentManager, getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { createElement } from 'react';
import { Observable } from 'rxjs';
import { DocCopyCommand, DocCopyCurrentParagraphCommand, DocCutCurrentParagraphCommand, DocPasteCommand } from '../commands/commands/clipboard.command';
import { DeleteCurrentParagraphCommand } from '../commands/commands/doc-delete.command';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../commands/commands/doc-horizontal-line.command';
import { ResetInlineFormatTextBackgroundColorCommand, ResetInlineFormatTextColorCommand, SetInlineFormatFontSizeCommand, SetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand } from '../commands/commands/inline-format.command';
import { BulletListCommand, CheckListCommand, InsertBulletListBellowCommand, InsertCheckListBellowCommand, InsertOrderListBellowCommand, OrderListCommand } from '../commands/commands/list.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../commands/commands/set-heading.command';
import { DocTableDeleteTableCommand } from '../commands/commands/table/doc-table-delete.command';
import { DocCreateTableOperation } from '../commands/operations/doc-create-table.operation';
import { BackgroundColorSelectorMenuItemFactory, disableMenuWhenNoDocRange, getParagraphStyleAtCursor, TextColorSelectorMenuItemFactory } from './menu';

const HEADING_MAP: Record<NamedStyleType, ICommand> = {
    [NamedStyleType.HEADING_1]: H1HeadingCommand,
    [NamedStyleType.HEADING_2]: H2HeadingCommand,
    [NamedStyleType.HEADING_3]: H3HeadingCommand,
    [NamedStyleType.HEADING_4]: H4HeadingCommand,
    [NamedStyleType.HEADING_5]: H5HeadingCommand,
    [NamedStyleType.NORMAL_TEXT]: NormalTextHeadingCommand,
    [NamedStyleType.TITLE]: TitleHeadingCommand,
    [NamedStyleType.SUBTITLE]: SubtitleHeadingCommand,
    [NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED]: NormalTextHeadingCommand,
};

const HEADING_TITLE_MAP: Partial<Record<NamedStyleType, string>> = {
    [NamedStyleType.HEADING_1]: 'ui.toolbar.heading.1',
    [NamedStyleType.HEADING_2]: 'ui.toolbar.heading.2',
    [NamedStyleType.HEADING_3]: 'ui.toolbar.heading.3',
    [NamedStyleType.HEADING_4]: 'ui.toolbar.heading.4',
    [NamedStyleType.HEADING_5]: 'ui.toolbar.heading.5',
    [NamedStyleType.NORMAL_TEXT]: 'ui.toolbar.heading.normal',
    [NamedStyleType.TITLE]: 'ui.toolbar.heading.title',
    [NamedStyleType.SUBTITLE]: 'ui.toolbar.heading.subTitle',
};

function TitleTypeIcon({ className }: { className: string }) {
    return createElement(
        'svg',
        {
            className,
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            'aria-hidden': true,
        },
        createElement('text', {
            x: 2,
            y: 19,
            fontFamily: 'Arial, sans-serif',
            fontSize: 19,
            fontWeight: 500,
        }, 'T'),
        createElement('text', {
            x: 15,
            y: 19,
            fontFamily: 'Arial, sans-serif',
            fontSize: 13,
            fontWeight: 500,
        }, 't')
    );
}

function SubtitleTypeIcon({ className }: { className: string }) {
    return createElement(
        'svg',
        {
            className,
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            'aria-hidden': true,
        },
        createElement('text', {
            x: 5,
            y: 19,
            fontFamily: 'Arial, sans-serif',
            fontSize: 19,
            fontWeight: 500,
        }, 'S')
    );
}

function HeaderTextColorIcon({ className, extend }: { className: string; extend?: { colorChannel1?: string } }) {
    const color = extend?.colorChannel1 ?? 'currentColor';

    return createElement(
        'svg',
        {
            className,
            viewBox: '0 0 24 24',
            width: '1em',
            height: '1em',
            fill: 'none',
            'aria-hidden': true,
        },
        createElement('rect', {
            x: 3,
            y: 3,
            width: 18,
            height: 18,
            rx: 4,
            fill: 'none',
            stroke: 'currentColor',
            strokeOpacity: 0.16,
        }),
        createElement('text', {
            x: 7.5,
            y: 16.5,
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            fill: color,
        }, 'A')
    );
}

function DefaultTextColorIcon({ className }: { className: string }) {
    return TextColorSwatchIcon({ className, color: '#000000' });
}

export const HEADING_ICON_MAP: Record<NamedStyleType, { key: string; component: ComponentType<{ className: string }> }> = {
    [NamedStyleType.HEADING_1]: { key: 'H1Icon', component: H1Icon },
    [NamedStyleType.HEADING_2]: { key: 'H2Icon', component: H2Icon },
    [NamedStyleType.HEADING_3]: { key: 'H3Icon', component: H3Icon },
    [NamedStyleType.HEADING_4]: { key: 'H4Icon', component: H4Icon },
    [NamedStyleType.HEADING_5]: { key: 'H5Icon', component: H5Icon },
    [NamedStyleType.NORMAL_TEXT]: { key: 'TextTypeIcon', component: TextTypeIcon },
    [NamedStyleType.TITLE]: { key: 'TitleTypeIcon', component: TitleTypeIcon },
    [NamedStyleType.SUBTITLE]: { key: 'SubtitleTypeIcon', component: SubtitleTypeIcon },
    [NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED]: { key: 'TextTypeIcon', component: TextTypeIcon },
};

const createHeadingSelectorMenuItemFactory = (headingType: NamedStyleType) => (accessor: IAccessor): IMenuItem => {
    const commandService = accessor.get(ICommandService);
    const componentManager = accessor.get(ComponentManager);
    const icon = HEADING_ICON_MAP[headingType];
    if (!componentManager.get(icon.key)) {
        componentManager.register(icon.key, icon.component);
    }

    return {
        id: HEADING_MAP[headingType]!.id,
        type: MenuItemType.BUTTON,
        icon: icon.key,
        title: HEADING_TITLE_MAP[headingType],
        tooltip: HEADING_TITLE_MAP[headingType],
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: new Observable((subscriber) => {
            const DEFAULT_TYPE = NamedStyleType.NORMAL_TEXT;
            const calc = () => {
                const paragraph = getParagraphStyleAtCursor(accessor);
                if (paragraph == null) {
                    subscriber.next(DEFAULT_TYPE === headingType);
                    return;
                }

                const namedStyleType = paragraph.paragraphStyle?.namedStyleType ?? DEFAULT_TYPE;
                subscriber.next(namedStyleType === headingType);
            };

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatFontSizeCommand.id) {
                    calc();
                }
            });

            calc();
            return disposable.dispose;
        }),
    };
};

export const H1HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_1);
export const H2HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_2);
export const H3HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_3);
export const H4HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_4);
export const H5HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_5);
export const NormalTextHeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.NORMAL_TEXT);
export const TitleHeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.TITLE);
export const SubtitleHeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.SUBTITLE);

const createEmptyParagraphButtonFactory = (
    command: ICommand,
    icon: string,
    title: string
) => (accessor: IAccessor): IMenuButtonItem => {
    const componentManager = accessor.get(ComponentManager);
    const headingIcon = Object.values(HEADING_ICON_MAP).find((item) => item.key === icon);
    if (headingIcon && !componentManager.get(headingIcon.key)) {
        componentManager.register(headingIcon.key, headingIcon.component);
    } else {
        ensureParagraphMenuIcon(componentManager, icon);
    }

    return {
        id: command.id,
        type: MenuItemType.BUTTON,
        icon,
        title,
        tooltip: title,
    };
};

export const EMPTY_PARAGRAPH_MENU_ID = 'doc.menu.empty-paragraph';
export const EmptyParagraphH1MenuItemFactory = createEmptyParagraphButtonFactory(H1HeadingCommand, 'H1Icon', 'ui.toolbar.heading.1');
export const EmptyParagraphH2MenuItemFactory = createEmptyParagraphButtonFactory(H2HeadingCommand, 'H2Icon', 'ui.toolbar.heading.2');
export const EmptyParagraphH3MenuItemFactory = createEmptyParagraphButtonFactory(H3HeadingCommand, 'H3Icon', 'ui.toolbar.heading.3');
export const EmptyParagraphH4MenuItemFactory = createEmptyParagraphButtonFactory(H4HeadingCommand, 'H4Icon', 'ui.toolbar.heading.4');
export const EmptyParagraphH5MenuItemFactory = createEmptyParagraphButtonFactory(H5HeadingCommand, 'H5Icon', 'ui.toolbar.heading.5');
export const EmptyParagraphNormalTextMenuItemFactory = createEmptyParagraphButtonFactory(NormalTextHeadingCommand, 'TextTypeIcon', 'ui.toolbar.heading.normal');
export const EmptyParagraphOrderListMenuItemFactory = createEmptyParagraphButtonFactory(OrderListCommand, 'OrderIcon', 'docs-ui.rightClick.orderList');
export const EmptyParagraphBulletListMenuItemFactory = createEmptyParagraphButtonFactory(BulletListCommand, 'UnorderIcon', 'docs-ui.rightClick.bulletList');
export const EmptyParagraphCheckListMenuItemFactory = createEmptyParagraphButtonFactory(CheckListCommand, 'TodoListDoubleIcon', 'docs-ui.rightClick.checkList');
export const EmptyParagraphHorizontalLineMenuItemFactory = createEmptyParagraphButtonFactory(HorizontalLineCommand, 'ReduceIcon', 'docs-ui.toolbar.horizontalLine');

export const CopyCurrentParagraphMenuItemFactory = (_accessor: IAccessor): IMenuItem => {
    return {
        id: DocCopyCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CopyDoubleIcon',
        title: 'docs-ui.rightClick.copy',
    };
};

export const CutCurrentParagraphMenuItemFactory = (_accessor: IAccessor): IMenuItem => {
    return {
        id: DocCutCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CutIcon',
        title: 'docs-ui.rightClick.cut',
    };
};

export const DeleteCurrentParagraphMenuItemFactory = (_accessor: IAccessor): IMenuItem => {
    return {
        id: DeleteCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteIcon',
        title: 'docs-ui.rightClick.delete',
    };
};

export const InsertBulletListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    ensureParagraphMenuIcon(accessor.get(ComponentManager), 'UnorderIcon');

    return {
        id: InsertBulletListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnorderIcon',
        title: 'docs-ui.rightClick.bulletList',
        tooltip: 'docs-ui.rightClick.bulletList',
    };
};

export const InsertOrderListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    ensureParagraphMenuIcon(accessor.get(ComponentManager), 'OrderIcon');

    return {
        id: InsertOrderListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'OrderIcon',
        title: 'docs-ui.rightClick.orderList',
        tooltip: 'docs-ui.rightClick.orderList',
    };
};

export const InsertCheckListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    ensureParagraphMenuIcon(accessor.get(ComponentManager), 'TodoListDoubleIcon');

    return {
        id: InsertCheckListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TodoListDoubleIcon',
        title: 'docs-ui.rightClick.checkList',
        tooltip: 'docs-ui.rightClick.checkList',
    };
};

export const InsertHorizontalLineBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    ensureParagraphMenuIcon(accessor.get(ComponentManager), 'ReduceIcon');

    return {
        id: InsertHorizontalLineBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ReduceIcon',
        title: 'docs-ui.toolbar.horizontalLine',
        tooltip: 'docs-ui.toolbar.horizontalLine',
    };
};

export const INSERT_BELLOW_MENU_ID = 'doc.menu.insert-bellow';
export const DOC_CONTENT_INSERT_MENU_ID = 'doc.menu.content-insert';
export const DOC_TABLE_BLOCK_MENU_ID = 'doc.menu.table-block';
export const DOC_PARAGRAPH_T_INSERT_MENU_ID = 'doc.menu.paragraph-t.insert';
export const DOC_PARAGRAPH_T_EDIT_MENU_ID = 'doc.menu.paragraph-t.edit';
export const DOC_PARAGRAPH_T_DIVIDER_MENU_ID = 'doc.menu.paragraph-t.divider';
export const DOC_PARAGRAPH_T_ALIGN_MENU_ID = 'doc.menu.paragraph-t.align';
export const DOC_PARAGRAPH_T_COLORS_MENU_ID = 'doc.menu.paragraph-t.colors';
export const DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID = 'doc.menu.paragraph-t.insert-below';
export const DOC_PARAGRAPH_T_RESET_COLORS_ID = 'doc.menu.paragraph-t.reset-colors';
export const DOC_PARAGRAPH_T_INDENT_INCREASE_ID = 'doc.menu.paragraph-t.indent.increase';
export const DOC_PARAGRAPH_T_INDENT_DECREASE_ID = 'doc.menu.paragraph-t.indent.decrease';
export const DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID = 'doc.menu.paragraph-t.insert-below.command';

const TEXT_COLORS = ['#FE4B4B', '#FF8C51', '#A4DC16', '#2DAEFF', '#3A60F7', '#9E6DE3', '#F248A6'];
const BACKGROUND_COLORS = [
    'rgba(158, 109, 227, 0.3)',
    'rgba(254, 75, 75, 0.3)',
    'rgba(255, 140, 81, 0.3)',
    'rgba(164, 220, 22, 0.3)',
    'rgba(45, 174, 255, 0.3)',
    'rgba(58, 96, 247, 0.3)',
    'rgba(242, 72, 166, 0.3)',
    'rgba(153, 153, 153, 0.3)',
    'rgba(158, 109, 227, 0.15)',
    'rgba(254, 75, 75, 0.15)',
    'rgba(255, 140, 81, 0.15)',
    'rgba(164, 220, 22, 0.15)',
    'rgba(45, 174, 255, 0.15)',
    'rgba(58, 96, 247, 0.15)',
    'rgba(242, 72, 166, 0.15)',
];

export function getDocBlockRangeMenuId(blockType: string): string {
    return `doc.block-range.${blockType}.menu`;
}

function ensureParagraphMenuIcon(componentManager: ComponentManager, icon: string) {
    if (componentManager.get(icon)) {
        return;
    }

    const headingIcon = Object.values(HEADING_ICON_MAP).find((item) => item.key === icon);
    if (headingIcon) {
        componentManager.register(headingIcon.key, headingIcon.component);
        return;
    }

    const mapping: Partial<Record<string, ComponentType<{ className: string }>>> = {
        TitleTypeIcon,
        SubtitleTypeIcon,
        DefaultTextColorIcon,
        HeaderTextColorIcon,
        MoreRightIcon,
        MoreLeftIcon,
        OrderIcon,
        UnorderIcon,
        TodoListDoubleIcon,
        ReduceIcon,
        GridIcon,
    };

    const component = mapping[icon];
    if (component) {
        componentManager.register(icon, component);
    }
}

function TextColorSwatchIcon(props: { className?: string; color: string }) {
    const { className, color } = props;
    return createElement(
        'svg',
        {
            className,
            viewBox: '0 0 24 24',
            width: '1em',
            height: '1em',
            fill: 'none',
            'aria-hidden': true,
        },
        createElement('rect', {
            x: 3,
            y: 3,
            width: 18,
            height: 18,
            rx: 4,
            fill: 'none',
            stroke: 'currentColor',
            strokeOpacity: 0.16,
        }),
        createElement('text', {
            x: 7.5,
            y: 16.5,
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            fill: color,
        }, 'A')
    );
}

function BackgroundColorSwatchIcon(props: { className?: string; color: string }) {
    const { className, color } = props;
    return createElement(
        'svg',
        {
            className,
            viewBox: '0 0 24 24',
            width: '1em',
            height: '1em',
            fill: 'none',
            'aria-hidden': true,
        },
        createElement('rect', {
            x: 3,
            y: 3,
            width: 18,
            height: 18,
            rx: 5,
            fill: color,
            stroke: 'currentColor',
            strokeOpacity: 0.12,
        })
    );
}

function ensureColorSwatchIcon(componentManager: ComponentManager, icon: string, color: string, variant: 'text' | 'background') {
    if (componentManager.get(icon)) {
        return;
    }

    componentManager.register(
        icon,
        ({ className }: { className?: string }) => (variant === 'text'
            ? TextColorSwatchIcon({ className, color })
            : BackgroundColorSwatchIcon({ className, color }))
    );
}

function createStaticButtonMenuItemFactory(config: {
    id: string;
    commandId?: string;
    icon?: string;
    title?: string;
    tooltip?: string;
    params?: Record<string, unknown>;
    disabled$?: ReturnType<typeof disableMenuWhenNoDocRange>;
}) {
    return (accessor: IAccessor): IMenuButtonItem => {
        const componentManager = accessor.get(ComponentManager);
        if (config.icon) {
            ensureParagraphMenuIcon(componentManager, config.icon);
        }

        return {
            id: config.id,
            commandId: config.commandId,
            type: MenuItemType.BUTTON,
            icon: config.icon,
            title: config.title,
            tooltip: config.tooltip,
            params: config.params,
            disabled$: config.disabled$,
            hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        };
    };
}

function createStaticSubmenuMenuItemFactory(config: {
    id: string;
    icon?: string;
    title?: string;
    tooltip?: string;
}) {
    return (accessor: IAccessor): IMenuSelectorItem<string> => {
        const componentManager = accessor.get(ComponentManager);
        if (config.icon) {
            ensureParagraphMenuIcon(componentManager, config.icon);
        }

        return {
            id: config.id,
            type: MenuItemType.SUBITEMS,
            icon: config.icon,
            title: config.title,
            tooltip: config.tooltip,
            hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        };
    };
}

function createColorSwatchMenuItemFactory(config: {
    id: string;
    commandId: string;
    icon: string;
    color: string;
    variant: 'text' | 'background';
}) {
    return (accessor: IAccessor): IMenuButtonItem => {
        const componentManager = accessor.get(ComponentManager);
        ensureColorSwatchIcon(componentManager, config.icon, config.color, config.variant);

        return {
            id: config.id,
            commandId: config.commandId,
            type: MenuItemType.BUTTON,
            icon: config.icon,
            params: {
                value: config.color,
            },
            hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        };
    };
}

function createHeaderActionMenuItemFactory(
    baseFactory: (accessor: IAccessor) => IMenuItem,
    config?: {
        icon?: string;
    }
) {
    return (accessor: IAccessor): IMenuItem => {
        const componentManager = accessor.get(ComponentManager);

        if (config?.icon) {
            ensureParagraphMenuIcon(componentManager, config.icon);
        }

        const baseItem = baseFactory(accessor) as IMenuSelectorItem<string, string | undefined>;

        return {
            ...baseItem,
            icon: config?.icon ?? baseItem.icon,
            tooltip: undefined,
            title: undefined,
        };
    };
}

export const TableBlockCopyMenuItemFactory = (_accessor: IAccessor): IMenuItem => {
    return {
        id: DocCopyCommand.name,
        commandId: DocCopyCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CopyDoubleIcon',
        title: 'docs-ui.rightClick.copy',
    };
};

export const TableBlockPasteMenuItemFactory = (_accessor: IAccessor): IMenuItem => {
    return {
        id: DocPasteCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecialDoubleIcon',
        title: 'docs-ui.rightClick.paste',
    };
};

export const TableBlockDeleteMenuItemFactory = (_accessor: IAccessor): IMenuItem => {
    return {
        id: DocTableDeleteTableCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteIcon',
        title: 'docs-ui.rightClick.delete',
    };
};

export function DocInsertBellowMenuItemFactory(_accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: INSERT_BELLOW_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'docs-ui.rightClick.insertBellow',
    };
}

export const ParagraphMenuAlignSubmenuItemFactory = createStaticSubmenuMenuItemFactory({
    id: DOC_PARAGRAPH_T_ALIGN_MENU_ID,
    icon: 'LeftJustifyingIcon',
    title: 'docs-ui.paragraphMenu.alignAndIndent',
    tooltip: 'docs-ui.paragraphMenu.alignAndIndent',
});

export const ParagraphMenuColorsSubmenuItemFactory = createStaticSubmenuMenuItemFactory({
    id: DOC_PARAGRAPH_T_COLORS_MENU_ID,
    icon: 'PaintBucketDoubleIcon',
    title: 'docs-ui.paragraphMenu.color',
    tooltip: 'docs-ui.paragraphMenu.color',
});

export const ParagraphMenuTextColorHeaderActionMenuItemFactory = createHeaderActionMenuItemFactory(
    TextColorSelectorMenuItemFactory,
    { icon: 'HeaderTextColorIcon' }
);

export const ParagraphMenuBackgroundColorHeaderActionMenuItemFactory = createHeaderActionMenuItemFactory(
    BackgroundColorSelectorMenuItemFactory,
    { icon: 'PaintBucketDoubleIcon' }
);

export const ParagraphMenuInsertBelowSubmenuItemFactory = createStaticSubmenuMenuItemFactory({
    id: DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID,
    icon: 'TextTypeIcon',
    title: 'docs-ui.rightClick.insertBellow',
    tooltip: 'docs-ui.rightClick.insertBellow',
});

export const ParagraphMenuInsertBelowHeadingH1MenuItemFactory = createStaticButtonMenuItemFactory({
    id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h1`,
    commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
    icon: 'H1Icon',
    title: 'ui.toolbar.heading.1',
    tooltip: 'ui.toolbar.heading.1',
    params: { commandId: H1HeadingCommand.id, paragraphMenuPlacement: 'below', paragraphMenuInsertMode: 'breakline' },
});

export const ParagraphMenuInsertBelowHeadingH2MenuItemFactory = createStaticButtonMenuItemFactory({
    id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h2`,
    commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
    icon: 'H2Icon',
    title: 'ui.toolbar.heading.2',
    tooltip: 'ui.toolbar.heading.2',
    params: { commandId: H2HeadingCommand.id, paragraphMenuPlacement: 'below', paragraphMenuInsertMode: 'breakline' },
});

export const ParagraphMenuInsertBelowHeadingH3MenuItemFactory = createStaticButtonMenuItemFactory({
    id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h3`,
    commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
    icon: 'H3Icon',
    title: 'ui.toolbar.heading.3',
    tooltip: 'ui.toolbar.heading.3',
    params: { commandId: H3HeadingCommand.id, paragraphMenuPlacement: 'below', paragraphMenuInsertMode: 'breakline' },
});

export const ParagraphMenuInsertBelowHeadingH4MenuItemFactory = createStaticButtonMenuItemFactory({
    id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h4`,
    commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
    icon: 'H4Icon',
    title: 'ui.toolbar.heading.4',
    tooltip: 'ui.toolbar.heading.4',
    params: { commandId: H4HeadingCommand.id, paragraphMenuPlacement: 'below', paragraphMenuInsertMode: 'breakline' },
});

export const ParagraphMenuInsertBelowHeadingH5MenuItemFactory = createStaticButtonMenuItemFactory({
    id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h5`,
    commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
    icon: 'H5Icon',
    title: 'ui.toolbar.heading.5',
    tooltip: 'ui.toolbar.heading.5',
    params: { commandId: H5HeadingCommand.id, paragraphMenuPlacement: 'below', paragraphMenuInsertMode: 'breakline' },
});

export const ParagraphMenuInsertBelowTableMenuItemFactory = createStaticButtonMenuItemFactory({
    id: `${DocCreateTableOperation.id}.below`,
    commandId: DocCreateTableOperation.id,
    icon: 'GridIcon',
    title: 'docs-ui.toolbar.table.insert',
    tooltip: 'docs-ui.toolbar.table.insert',
    params: { rowCount: 3, colCount: 5, paragraphMenuPlacement: 'below' },
});

export const ParagraphMenuIndentIncreaseMenuItemFactory = createStaticButtonMenuItemFactory({
    id: DOC_PARAGRAPH_T_INDENT_INCREASE_ID,
    icon: 'MoreRightIcon',
    title: 'docs-ui.paragraphMenu.increase',
    tooltip: 'docs-ui.paragraphMenu.increaseIndent',
});

export const ParagraphMenuIndentDecreaseMenuItemFactory = createStaticButtonMenuItemFactory({
    id: DOC_PARAGRAPH_T_INDENT_DECREASE_ID,
    icon: 'MoreLeftIcon',
    title: 'docs-ui.paragraphMenu.decrease',
    tooltip: 'docs-ui.paragraphMenu.decreaseIndent',
});

export const ParagraphMenuDefaultTextColorMenuItemFactory = createStaticButtonMenuItemFactory({
    id: `${SetInlineFormatTextColorCommand.id}.default`,
    commandId: SetInlineFormatTextColorCommand.id,
    icon: 'DefaultTextColorIcon',
    title: 'docs-ui.paragraphMenu.defaultTextColor',
    params: { value: '#000000' },
});

export const ParagraphMenuNoBackgroundMenuItemFactory = createStaticButtonMenuItemFactory({
    id: ResetInlineFormatTextBackgroundColorCommand.id,
    icon: 'NoColorDoubleIcon',
    title: 'docs-ui.paragraphMenu.noBackground',
});

export const ParagraphMenuResetTextColorMenuItemFactory = createStaticButtonMenuItemFactory({
    id: ResetInlineFormatTextColorCommand.id,
    icon: 'NoColorDoubleIcon',
    title: 'docs-ui.toolbar.resetColor',
    tooltip: 'docs-ui.toolbar.resetColor',
});

export const ParagraphMenuResetColorsMenuItemFactory = createStaticButtonMenuItemFactory({
    id: DOC_PARAGRAPH_T_RESET_COLORS_ID,
    icon: 'PaintBucketDoubleIcon',
    title: 'docs-ui.toolbar.resetColor',
    tooltip: 'docs-ui.toolbar.resetColor',
});

export const ParagraphMenuTextColorSwatchMenuItemFactories = TEXT_COLORS.reduce<Record<string, { order: number; menuItemFactory: ReturnType<typeof createColorSwatchMenuItemFactory> }>>((items, color, index) => {
    const id = `doc.menu.paragraph-t.text-color.${index}`;
    items[id] = {
        order: index,
        menuItemFactory: createColorSwatchMenuItemFactory({
            id,
            commandId: SetInlineFormatTextColorCommand.id,
            icon: `DocParagraphTextColorSwatchIcon.${index}`,
            color,
            variant: 'text',
        }),
    };
    return items;
}, {});

export const ParagraphMenuBackgroundColorSwatchMenuItemFactories = BACKGROUND_COLORS.reduce<Record<string, { order: number; menuItemFactory: ReturnType<typeof createColorSwatchMenuItemFactory> }>>((items, color, index) => {
    const id = `doc.menu.paragraph-t.background-color.${index}`;
    items[id] = {
        order: index,
        menuItemFactory: createColorSwatchMenuItemFactory({
            id,
            commandId: SetInlineFormatTextBackgroundColorCommand.id,
            icon: `DocParagraphBackgroundColorSwatchIcon.${index}`,
            color,
            variant: 'background',
        }),
    };
    return items;
}, {});
