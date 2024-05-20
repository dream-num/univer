/**
 * Copyright 2023-present DreamNum Inc.
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

import {
    BaselineOffset,
    BooleanNumber,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AlignCenterCommand,
    AlignJustifyCommand,
    AlignLeftCommand,
    AlignOperationCommand,
    AlignRightCommand,
    BulletListCommand,
    OrderListCommand,
    ResetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
    SetTextSelectionsOperation,
    TextSelectionManagerService,
} from '@univerjs/docs';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import {
    FONT_FAMILY_LIST,
    FONT_SIZE_LIST,
    getMenuHiddenObservable,
    IMenuService,
    MenuGroup,
    MenuItemType,
    MenuPosition,
    mergeMenuConfigs,
} from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../../components/font-family';
import { FONT_SIZE_COMPONENT } from '../../components/font-size';

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatBoldCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatBoldCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const bl = textRun.ts?.bl;

                    subscriber.next(bl === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatItalicCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatItalicCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const it = textRun.ts?.it;

                    subscriber.next(it === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatUnderlineCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatUnderlineCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const ul = textRun.ts?.ul;

                    subscriber.next(ul?.s === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatStrikethroughCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatStrikethroughCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const st = textRun.ts?.st;

                    subscriber.next(st?.s === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function SubscriptMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatSubscriptCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatSubscriptCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'SubscriptSingle',
        tooltip: 'toolbar.subscript',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const va = textRun.ts?.va;

                    subscriber.next(va === BaselineOffset.SUBSCRIPT);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function SuperscriptMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatSuperscriptCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatSuperscriptCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'SuperscriptSingle',
        tooltip: 'toolbar.superscript',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const va = textRun.ts?.va;

                    subscriber.next(va === BaselineOffset.SUPERSCRIPT);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatFontFamilyCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatFontFamilyCommand.id,
        tooltip: 'toolbar.font',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        label: FONT_FAMILY_COMPONENT,
        positions: [MenuPosition.TOOLBAR_START],
        selections: FONT_FAMILY_LIST.map((item) => ({
            label: {
                name: FONT_FAMILY_ITEM_COMPONENT,
                hoverable: true,
            },
            value: item.value,
        })),
        // disabled$: getCurrentSheetDisabled$(accessor),
        value$: new Observable((subscriber) => {
            const defaultValue = FONT_FAMILY_LIST[0].value;

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatFontFamilyCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const ff = textRun.ts?.ff;

                    subscriber.next(ff ?? defaultValue);
                }
            });

            subscriber.next(defaultValue);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatFontSizeCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatFontSizeCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.fontSize',
        label: {
            name: FONT_SIZE_COMPONENT,
            props: {
                min: 1,
                max: 400,
                // disabled$,
            },
        },
        positions: [MenuPosition.TOOLBAR_START],
        selections: FONT_SIZE_LIST,
        // disabled$,
        value$: new Observable((subscriber) => {
            const DEFAULT_SIZE = 14;
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatFontSizeCommand.id) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const fs = textRun.ts?.fs;

                    subscriber.next(fs ?? DEFAULT_SIZE);
                }
            });

            subscriber.next(DEFAULT_SIZE);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatTextColorCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatTextColorCommand.id,
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',

        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = themeService.getCurrentTheme().textColor;
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetInlineFormatTextColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultColor);
                }
            });

            subscriber.next(defaultColor);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        // disabled$: getCurrentSheetDisabled$(accessor),
    }, menuItemConfig);
}

export function AlignLeftMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(AlignLeftCommand.id);

    return mergeMenuConfigs({
        id: AlignLeftCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'LeftJustifyingSingle',
        tooltip: 'toolbar.alignLeft',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === AlignOperationCommand.id) {
                    const paragraph = getParagraphStyleAtCursor(accessor);

                    if (paragraph == null) {
                        return;
                    }

                    const alignType = paragraph.paragraphStyle?.horizontalAlign;

                    subscriber.next(alignType === HorizontalAlign.LEFT);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function AlignCenterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(AlignCenterCommand.id);

    return mergeMenuConfigs({
        id: AlignCenterCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'HorizontallySingle',
        tooltip: 'toolbar.alignCenter',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === AlignOperationCommand.id) {
                    const paragraph = getParagraphStyleAtCursor(accessor);

                    if (paragraph == null) {
                        return;
                    }

                    const alignType = paragraph.paragraphStyle?.horizontalAlign;

                    subscriber.next(alignType === HorizontalAlign.CENTER);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function AlignRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(AlignRightCommand.id);

    return mergeMenuConfigs({
        id: AlignRightCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'RightJustifyingSingle',
        tooltip: 'toolbar.alignRight',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === AlignOperationCommand.id) {
                    const paragraph = getParagraphStyleAtCursor(accessor);

                    if (paragraph == null) {
                        return;
                    }

                    const alignType = paragraph.paragraphStyle?.horizontalAlign;

                    subscriber.next(alignType === HorizontalAlign.RIGHT);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function AlignJustifyMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(AlignJustifyCommand.id);

    return mergeMenuConfigs({
        id: AlignJustifyCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'AlignTextBothSingle',
        tooltip: 'toolbar.alignJustify',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === AlignOperationCommand.id) {
                    const paragraph = getParagraphStyleAtCursor(accessor);

                    if (paragraph == null) {
                        return;
                    }

                    const alignType = paragraph.paragraphStyle?.horizontalAlign;

                    subscriber.next(alignType === HorizontalAlign.JUSTIFIED);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function OrderListMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(OrderListCommand.id);

    return mergeMenuConfigs({
        id: OrderListCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'OrderSingle',
        tooltip: 'toolbar.order',
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function BulletListMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(BulletListCommand.id);

    return mergeMenuConfigs({
        id: BulletListCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'UnorderSingle',
        tooltip: 'toolbar.unorder',
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ResetInlineFormatTextBackgroundColorCommand.id);

    return mergeMenuConfigs({
        id: ResetInlineFormatTextBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
        positions: SetInlineFormatTextBackgroundColorCommand.id,
    }, menuItemConfig);
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetInlineFormatTextBackgroundColorCommand.id);

    return mergeMenuConfigs({
        id: SetInlineFormatTextBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        icon: 'PaintBucket',
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = themeService.getCurrentTheme().primaryColor;
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetInlineFormatTextBackgroundColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultColor);
                }
            });

            subscriber.next(defaultColor);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    }, menuItemConfig);
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);
    const editorDataModel = univerInstanceService.getCurrentUniverDocInstance();
    const activeTextRange = textSelectionService.getActiveRange();

    if (editorDataModel == null || activeTextRange == null) {
        return;
    }

    const textRuns = editorDataModel.getBody()?.textRuns;

    if (textRuns == null) {
        return;
    }

    const { startOffset } = activeTextRange;

    const textRun = textRuns.find(({ st, ed }) => startOffset >= st && startOffset < ed);

    return textRun;
}

function getParagraphStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);
    const editorDataModel = univerInstanceService.getCurrentUniverDocInstance();
    const activeTextRange = textSelectionService.getActiveRange();

    if (editorDataModel == null || activeTextRange == null) {
        return;
    }

    const paragraphs = editorDataModel.getBody()?.paragraphs;

    if (paragraphs == null) {
        return;
    }

    const { startOffset } = activeTextRange;

    let prevIndex = -1;

    for (const paragraph of paragraphs) {
        const { startIndex } = paragraph;
        if (startOffset > prevIndex && startOffset <= startIndex) {
            return paragraph;
        }

        prevIndex = startIndex;
    }

    return null;
}
