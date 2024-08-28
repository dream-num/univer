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
    CheckListCommand,
    DocSkeletonManagerService,
    getCommandSkeleton,
    getParagraphsInRange,
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
    TextSelectionManagerService } from '@univerjs/docs';
import type { IMenuButtonItem, IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import {
    FONT_FAMILY_LIST,
    FONT_SIZE_LIST,
    getHeaderFooterMenuHiddenObservable,
    getMenuHiddenObservable,
    MenuGroup,
    MenuItemType,
    MenuPosition,
} from '@univerjs/ui';
import type { IAccessor, PresetListType } from '@univerjs/core';
import type { Subscription } from 'rxjs';
import { combineLatest, map, Observable } from 'rxjs';

import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../../components/font-family';
import { FONT_SIZE_COMPONENT } from '../../components/font-size';
import { OpenHeaderFooterPanelCommand } from '../../commands/commands/doc-header-footer.command';
import { BULLET_LIST_TYPE_COMPONENT, ORDER_LIST_TYPE_COMPONENT } from '../../components/list-type-picker';
import { DocCreateTableOperation } from '../../commands/operations/doc-create-table.operation';

function getInsertTableHiddenObservable(
    accessor: IAccessor
): Observable<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);

    return new Observable((subscriber) => {
        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            if (unitId == null) {
                return subscriber.next(true);
            }
            const univerType = univerInstanceService.getUnitType(unitId);

            if (univerType !== UniverInstanceType.UNIVER_DOC) {
                return subscriber.next(true);
            }

            const currentRender = renderManagerService.getRenderById(unitId);
            if (currentRender == null) {
                return subscriber.next(true);
            }

            const viewModel = currentRender.with(DocSkeletonManagerService).getViewModel();

            viewModel.editAreaChange$.subscribe((editArea) => {
                subscriber.next(editArea === DocumentEditArea.HEADER || editArea === DocumentEditArea.FOOTER);
            });
        });

        const currentRender = renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_DOC);
        if (currentRender == null) {
            return subscriber.next(true);
        }

        const viewModel = currentRender.with(DocSkeletonManagerService).getViewModel();

        subscriber.next(viewModel.getEditArea() !== DocumentEditArea.BODY);

        return () => subscription.unsubscribe();
    });
}

function getTableDisabledObservable(accessor: IAccessor): Observable<boolean> {
    const textSelectionManagerService = accessor.get(TextSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable((subscriber) => {
        const subscription = textSelectionManagerService.textSelection$.subscribe((selection) => {
            if (selection == null) {
                subscriber.next(true);
                return;
            }

            const { textRanges } = selection;

            if (textRanges.length !== 1) {
                subscriber.next(true);
                return;
            }

            const textRange = textRanges[0];
            const { collapsed, anchorNodePosition, startOffset } = textRange;

            if (!collapsed || startOffset == null) {
                subscriber.next(true);
                return;
            }

            const docDataModel = univerInstanceService.getCurrentUniverDocInstance();

            if (docDataModel == null) {
                subscriber.next(true);
                return;
            }

            const docSkeletonManagerService = getCommandSkeleton(accessor, docDataModel.getUnitId());

            if (docSkeletonManagerService == null) {
                subscriber.next(true);
                return;
            }

            const viewModel = docSkeletonManagerService.getViewModel();

            const customRange = viewModel.getCustomRangeRaw(startOffset);

            // Can not insert table in custom range.
            if (customRange) {
                subscriber.next(true);
                return;
            }

            if (anchorNodePosition != null) {
                const { path } = anchorNodePosition;

                // TODO: Not support insert table in table cell now.
                if (path.indexOf('cells') !== -1) {
                    subscriber.next(true);
                    return;
                }
            }

            subscriber.next(false);
        });

        return () => subscription.unsubscribe();
    });
}

function disableMenuWhenNoDocRange(accessor: IAccessor): Observable<boolean> {
    const textSelectionManagerService = accessor.get(TextSelectionManagerService);

    return new Observable((subscriber) => {
        const subscription = textSelectionManagerService.textSelection$.subscribe((selection) => {
            if (selection == null) {
                subscriber.next(true);
                return;
            }

            const { textRanges, rectRanges } = selection;

            if (textRanges.length === 0 && rectRanges.length === 0) {
                subscriber.next(true);
                return;
            }

            subscriber.next(false);
        });

        return () => subscription.unsubscribe();
    });
}

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function SubscriptMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function SuperscriptMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        // disabled$: getCurrentSheetDisabled$(accessor),
    };
}

export function HeaderFooterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: OpenHeaderFooterPanelCommand.id,
        group: MenuGroup.TOOLBAR_OTHERS,
        type: MenuItemType.BUTTON,
        icon: 'FreezeRowSingle',
        tooltip: 'toolbar.headerFooter',
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getHeaderFooterMenuHiddenObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

export const TableIcon = 'GridSingle';
export const TABLE_MENU_ID = 'doc.menu.table';

export function TableMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: TABLE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_LAYOUT,
        icon: TableIcon,
        tooltip: 'toolbar.table.main',
        disabled$: getTableDisabledObservable(accessor),
        // Do not show header footer menu and insert table at zen mode.
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getInsertTableHiddenObservable(accessor), getHeaderFooterMenuHiddenObservable(accessor), (one, two, three) => {
            return one || two || three;
        }),
    };
}

export function InsertTableMenuFactory(_accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocCreateTableOperation.id,
        title: 'toolbar.table.insert',
        type: MenuItemType.BUTTON,
        positions: [TABLE_MENU_ID],
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function AlignLeftMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignLeftCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'LeftJustifyingSingle',
        tooltip: 'toolbar.alignLeft',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: disableMenuWhenNoDocRange(accessor),
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
    };
}

export function AlignCenterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function AlignRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function AlignJustifyMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

const listValueFactory$ = (accessor: IAccessor) => {
    return new Observable<PresetListType>((subscriber) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const textSelectionManagerService = accessor.get(TextSelectionManagerService);
        let textSubscription: Subscription | undefined;
        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            textSubscription?.unsubscribe();
            if (unitId == null) {
                return;
            }

            const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
            if (docDataModel == null) {
                return;
            }

            textSubscription = textSelectionManagerService.textSelection$.subscribe(() => {
                const range = textSelectionManagerService.getActiveTextRangeWithStyle();
                if (range) {
                    const doc = docDataModel.getSelfOrHeaderFooterModel(range?.segmentId);
                    const paragraphs = getParagraphsInRange(range, doc.getBody()?.paragraphs ?? []);
                    let listType: string | undefined;
                    if (paragraphs.every((p) => {
                        if (!listType) {
                            listType = p.bullet?.listType;
                        }
                        return p.bullet && p.bullet.listType === listType;
                    })) {
                        subscriber.next(listType as PresetListType);
                        return;
                    }
                }

                subscriber.next(undefined);
            });
        });

        return () => {
            subscription.unsubscribe();
            textSubscription?.unsubscribe();
        };
    });
};

export function OrderListMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<PresetListType, PresetListType> {
    return {
        id: OrderListCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON_SELECTOR,
        selections: [
            {
                label: {
                    name: ORDER_LIST_TYPE_COMPONENT,
                    hoverable: false,
                },
                value$: listValueFactory$(accessor),
            },
        ],
        icon: 'OrderSingle',
        tooltip: 'toolbar.order',
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        disabled$: disableMenuWhenNoDocRange(accessor),
        activated$: listValueFactory$(accessor).pipe(map((v) => v && v.indexOf('ORDER_LIST') === 0)),
    };
}

export function BulletListMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<PresetListType, PresetListType> {
    return {
        id: BulletListCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON_SELECTOR,
        selections: [
            {
                label: {
                    name: BULLET_LIST_TYPE_COMPONENT,
                    hoverable: false,
                },
                value$: listValueFactory$(accessor),
            },
        ],
        icon: 'UnorderSingle',
        tooltip: 'toolbar.unorder',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: listValueFactory$(accessor).pipe(map((v) => v && v.indexOf('BULLET_LIST') === 0)),
    };
}

export function CheckListMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CheckListCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'TodoList',
        tooltip: 'toolbar.checklist',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: listValueFactory$(accessor).pipe(map((v) => v && v.indexOf('CHECK_LIST') === 0)),
    };
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetInlineFormatTextBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
        positions: SetInlineFormatTextBackgroundColorCommand.id,
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);
    const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
    const activeTextRange = textSelectionService.getActiveTextRangeWithStyle();

    if (docDataModel == null || activeTextRange == null) {
        return;
    }

    const { startOffset, segmentId } = activeTextRange;

    const textRuns = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.textRuns;

    if (textRuns == null) {
        return;
    }

    let textRun;

    for (let i = textRuns.length - 1; i >= 0; i--) {
        const curTextRun = textRuns[i];

        if (curTextRun.st <= startOffset && startOffset <= curTextRun.ed) {
            textRun = curTextRun;
            break;
        }
    }

    return textRun;
}

function getParagraphStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);
    const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
    const activeTextRange = textSelectionService.getActiveTextRangeWithStyle();

    if (docDataModel == null || activeTextRange == null) {
        return;
    }

    const { startOffset, segmentId } = activeTextRange;

    const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody()?.paragraphs;

    if (paragraphs == null) {
        return;
    }

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
