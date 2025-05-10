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

import type { DocumentDataModel, IAccessor, PresetListType } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IMenuButtonItem, IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import type { Subscription } from 'rxjs';
import {
    BaselineOffset,
    BooleanNumber,
    BuildTextUtils,
    DEFAULT_STYLES,
    DOCS_ZEN_EDITOR_UNIT_ID_KEY,
    DocumentFlavor,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    NAMED_STYLE_MAP,
    NamedStyleType,
    ThemeService,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    DocSkeletonManagerService,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import {
    COMMON_LABEL_COMPONENT,
    FONT_FAMILY_LIST,
    FONT_SIZE_LIST,
    getMenuHiddenObservable,
    HEADING_ITEM_COMPONENT,
    HEADING_LIST,
    MenuItemType,
} from '@univerjs/ui';

import { combineLatest, map, Observable } from 'rxjs';
import { OpenHeaderFooterPanelCommand } from '../../commands/commands/doc-header-footer.command';
import { HorizontalLineCommand } from '../../commands/commands/doc-horizontal-line.command';
import { getStyleInTextRange, ResetInlineFormatTextBackgroundColorCommand, SetInlineFormatBoldCommand, SetInlineFormatCommand, SetInlineFormatFontFamilyCommand, SetInlineFormatFontSizeCommand, SetInlineFormatItalicCommand, SetInlineFormatStrikethroughCommand, SetInlineFormatSubscriptCommand, SetInlineFormatSuperscriptCommand, SetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand, SetInlineFormatUnderlineCommand } from '../../commands/commands/inline-format.command';
import { BulletListCommand, CheckListCommand, OrderListCommand } from '../../commands/commands/list.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignOperationCommand, AlignRightCommand } from '../../commands/commands/paragraph-align.command';
import { SetParagraphNamedStyleCommand } from '../../commands/commands/set-heading.command';
import { SwitchDocModeCommand } from '../../commands/commands/switch-doc-mode.command';
import { DocCreateTableOperation } from '../../commands/operations/doc-create-table.operation';
import { DocOpenPageSettingCommand } from '../../commands/operations/open-page-setting.operation';
import { getCommandSkeleton } from '../../commands/util';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../../components/font-family';
import { FONT_SIZE_COMPONENT } from '../../components/font-size';
import { BULLET_LIST_TYPE_COMPONENT, ORDER_LIST_TYPE_COMPONENT } from '../../components/list-type-picker';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';

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

        return () => subscription.unsubscribe();
    });
}

function getHeaderFooterMenuHiddenObservable(
    accessor: IAccessor
): Observable<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);

    return new Observable((subscriber) => {
        const subscription0 = commandService.onCommandExecuted((command) => {
            if (command.id === RichTextEditingMutation.id) {
                const { unitId } = command.params as IRichTextEditingMutationParams;
                const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId);
                if (docDataModel == null) {
                    subscriber.next(true);
                    return;
                }
                const { documentStyle } = docDataModel.getSnapshot();

                subscriber.next(documentStyle?.documentFlavor !== DocumentFlavor.TRADITIONAL);
            }
        });

        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            if (unitId == null) {
                return subscriber.next(true);
            }
            const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
            const documentFlavor = docDataModel?.getSnapshot().documentStyle.documentFlavor;

            subscriber.next(documentFlavor !== DocumentFlavor.TRADITIONAL);
        });

        const docDataModel = univerInstanceService.getCurrentUniverDocInstance();

        if (docDataModel == null) {
            return subscriber.next(true);
        }

        const documentFlavor = docDataModel?.getSnapshot().documentStyle.documentFlavor;
        subscriber.next(documentFlavor !== DocumentFlavor.TRADITIONAL);

        return () => {
            subscription0.dispose();
            subscription.unsubscribe();
        };
    });
}

function getTableDisabledObservable(accessor: IAccessor): Observable<boolean> {
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable((subscriber) => {
        const subscription = docSelectionManagerService.textSelection$.subscribe((selection) => {
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
            const { collapsed, startNodePosition, startOffset } = textRange;

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

            if (startNodePosition != null) {
                const { path } = startNodePosition;

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

export function disableMenuWhenNoDocRange(accessor: IAccessor): Observable<boolean> {
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);

    return new Observable((subscriber) => {
        const subscription = docSelectionManagerService.textSelection$.subscribe((selection) => {
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
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                const textRun = getFontStyleAtCursor(accessor);

                if (textRun == null) {
                    subscriber.next(false);
                    return;
                }

                const bl = textRun.ts?.bl;

                subscriber.next(bl === BooleanNumber.TRUE);
            };
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    calc();
                }
            });

            calc();

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
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                const textRun = getFontStyleAtCursor(accessor);

                if (textRun == null) {
                    subscriber.next(false);
                    return;
                }

                const it = textRun.ts?.it;

                subscriber.next(it === BooleanNumber.TRUE);
            };
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    calc();
                }
            });

            calc();

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
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                const textRun = getFontStyleAtCursor(accessor);

                if (textRun == null) {
                    subscriber.next(false);
                    return;
                }

                const ul = textRun.ts?.ul;

                subscriber.next(ul?.s === BooleanNumber.TRUE);
            };
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    calc();
                }
            });

            calc();

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
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                const textRun = getFontStyleAtCursor(accessor);

                if (textRun == null) {
                    subscriber.next(false);
                    return;
                }

                const st = textRun.ts?.st;

                subscriber.next(st?.s === BooleanNumber.TRUE);
            };
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    calc();
                }
            });

            calc();

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
        type: MenuItemType.BUTTON,
        icon: 'SubscriptSingle',
        tooltip: 'toolbar.subscript',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                const textRun = getFontStyleAtCursor(accessor);

                if (textRun == null) {
                    subscriber.next(false);
                    return;
                }

                const va = textRun.ts?.va;

                subscriber.next(va === BaselineOffset.SUBSCRIPT);
            };
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    calc();
                }
            });

            calc();

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
        type: MenuItemType.BUTTON,
        icon: 'SuperscriptSingle',
        tooltip: 'toolbar.superscript',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                const textRun = getFontStyleAtCursor(accessor);

                if (textRun == null) {
                    subscriber.next(false);
                    return;
                }

                const va = textRun.ts?.va;

                subscriber.next(va === BaselineOffset.SUPERSCRIPT);
            };
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
                    calc();
                }
            });

            calc();

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
        type: MenuItemType.SELECTOR,
        label: FONT_FAMILY_COMPONENT,
        selections: FONT_FAMILY_LIST.map((item) => ({
            label: {
                name: FONT_FAMILY_ITEM_COMPONENT,
            },
            value: item.value,
        })),
        // disabled$: getCurrentSheetDisabled$(accessor),
        value$: new Observable((subscriber) => {
            const defaultValue = DEFAULT_STYLES.ff;

            const calc = () => {
                const textRun = getFontStyleAtCursor(accessor);

                if (textRun == null) {
                    subscriber.next(defaultValue);
                    return;
                }

                const ff = textRun.ts?.ff;

                subscriber.next(ff ?? defaultValue);
            };
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatFontFamilyCommand.id) {
                    calc();
                }
            });

            calc();
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
        selections: FONT_SIZE_LIST,
        // disabled$,
        value$: new Observable((subscriber) => {
            const DEFAULT_SIZE = DEFAULT_STYLES.fs;
            const calc = () => {
                const textRun = getFontStyleAtCursor(accessor);
                if (textRun == null) {
                    subscriber.next(DEFAULT_SIZE);
                    return;
                }

                const fs = textRun.ts?.fs;
                subscriber.next(fs ?? DEFAULT_SIZE);
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
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function HeadingSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetParagraphNamedStyleCommand.id,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.heading.tooltip',
        label: {
            name: COMMON_LABEL_COMPONENT,
            props: {
                selections: HEADING_LIST,
            },
        },
        selections: HEADING_LIST.map((item) => ({
            label: {
                name: HEADING_ITEM_COMPONENT,
                props: {
                    value: item.value,
                    text: item.label,
                },
            },
            value: item.value,
        })),
        value$: new Observable((subscriber) => {
            const DEFAULT_TYPE = NamedStyleType.NORMAL_TEXT;
            const calc = () => {
                const paragraph = getParagraphStyleAtCursor(accessor);
                if (paragraph == null) {
                    subscriber.next(DEFAULT_TYPE);
                    return;
                }

                const namedStyleType = paragraph.paragraphStyle?.namedStyleType ?? DEFAULT_TYPE;
                subscriber.next(namedStyleType);
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

        type: MenuItemType.BUTTON_SELECTOR,
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = themeService.getColorFromTheme('gray.900');

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
        type: MenuItemType.BUTTON,
        icon: 'HeaderFooterSingle',
        tooltip: 'toolbar.headerFooter',
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY), getHeaderFooterMenuHiddenObservable(accessor), (one, two) => {
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
        icon: TableIcon,
        tooltip: 'toolbar.table.main',
        disabled$: getTableDisabledObservable(accessor),
        // Do not show header footer menu and insert table at zen mode.
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY), getInsertTableHiddenObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

export function InsertTableMenuFactory(_accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocCreateTableOperation.id,
        title: 'toolbar.table.insert',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function AlignLeftMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignLeftCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'LeftJustifyingSingle',
        tooltip: 'toolbar.alignLeft',
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    };
}

export function AlignCenterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignCenterCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'HorizontallySingle',
        tooltip: 'toolbar.alignCenter',
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    };
}

export function AlignRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignRightCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'RightJustifyingSingle',
        tooltip: 'toolbar.alignRight',
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    };
}

export function AlignJustifyMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignJustifyCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'AlignTextBothSingle',
        tooltip: 'toolbar.alignJustify',
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    };
}

export function HorizontalLineFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: HorizontalLineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ReduceSingle',
        tooltip: 'toolbar.horizontalLine',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    };
}

const listValueFactory$ = (accessor: IAccessor) => {
    return new Observable<PresetListType | undefined>((subscriber) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
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

            textSubscription = docSelectionManagerService.textSelection$.subscribe(() => {
                const docRanges = docSelectionManagerService.getDocRanges();
                const range = docRanges.find((r) => r.isActive) ?? docRanges[0];

                if (range) {
                    const doc = docDataModel.getSelfOrHeaderFooterModel(range?.segmentId);

                    const paragraphs = BuildTextUtils.range.getParagraphsInRange(range, doc.getBody()?.paragraphs ?? [], doc.getBody()?.dataStream ?? '');
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

export function OrderListMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<PresetListType, PresetListType | undefined> {
    return {
        id: OrderListCommand.id,
        type: MenuItemType.BUTTON_SELECTOR,
        slot: true,
        selections: [
            {
                label: {
                    name: ORDER_LIST_TYPE_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
                value$: listValueFactory$(accessor),
            },
        ],
        icon: 'OrderSingle',
        tooltip: 'toolbar.order',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        disabled$: disableMenuWhenNoDocRange(accessor),
        activated$: listValueFactory$(accessor).pipe(map((v) => Boolean(v && v.indexOf('ORDER_LIST') === 0))),
    };
}

export function BulletListMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<PresetListType, PresetListType | undefined> {
    return {
        id: BulletListCommand.id,
        type: MenuItemType.BUTTON_SELECTOR,
        slot: true,
        selections: [
            {
                label: {
                    name: BULLET_LIST_TYPE_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
                value$: listValueFactory$(accessor),
            },
        ],
        icon: 'UnorderSingle',
        tooltip: 'toolbar.unorder',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: listValueFactory$(accessor).pipe(map((v) => Boolean(v && v.indexOf('BULLET_LIST') === 0))),
    };
}

export function CheckListMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CheckListCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TodoList',
        tooltip: 'toolbar.checklist',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: listValueFactory$(accessor).pipe(map((v) => Boolean(v && v.indexOf('CHECK_LIST') === 0))),
    };
}

export function DocSwitchModeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return {
        id: SwitchDocModeCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'KeyboardSingle',
        tooltip: 'toolbar.documentFlavor',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
        activated$: new Observable<boolean>((subscriber) => {
            const subscription = commandService.onCommandExecuted((c) => {
                if (c.id === RichTextEditingMutation.id) {
                    const instance = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

                    subscriber.next(instance?.getSnapshot()?.documentStyle.documentFlavor === DocumentFlavor.MODERN);
                }
            });

            const instance = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

            subscriber.next(instance?.getSnapshot()?.documentStyle.documentFlavor === DocumentFlavor.MODERN);

            return () => subscription.dispose();
        }),
    };
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetInlineFormatTextBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
        id: SetInlineFormatTextBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'PaintBucket',
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = themeService.getColorFromTheme('primary.600');

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
    const textSelectionService = accessor.get(DocSelectionManagerService);
    const docMenuStyleService = accessor.get(DocMenuStyleService);

    const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    const docRanges = textSelectionService.getDocRanges();
    const activeRange = docRanges.find((r) => r.isActive) ?? docRanges[0];

    const defaultTextStyle = docMenuStyleService.getDefaultStyle();
    const cacheStyle = docMenuStyleService.getStyleCache() ?? {};
    const paragraph = getParagraphStyleAtCursor(accessor);
    const namedStyle = paragraph?.paragraphStyle?.namedStyleType ? NAMED_STYLE_MAP[paragraph?.paragraphStyle?.namedStyleType] : null;
    if (docDataModel == null || activeRange == null) {
        return {
            ts: {
                ...defaultTextStyle,
                ...namedStyle,
                ...cacheStyle,
            },
        };
    }

    const { segmentId } = activeRange;
    const body = docDataModel.getSelfOrHeaderFooterModel(segmentId).getBody();

    if (body == null) {
        return {
            ts: {
                ...defaultTextStyle,
                ...namedStyle,
                ...cacheStyle,
            },
        };
    }

    const curTextStyle = getStyleInTextRange(body, activeRange, {});
    Tools.deleteNull(curTextStyle);
    return {
        ts: {
            ...defaultTextStyle,
            ...namedStyle,
            ...curTextStyle,
            ...cacheStyle,
        },
    };
}

export function getParagraphStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(DocSelectionManagerService);

    const docDataModel = univerInstanceService.getCurrentUniverDocInstance();

    const docRanges = textSelectionService.getDocRanges();
    const activeRange = docRanges.find((r) => r.isActive) ?? docRanges[0];

    if (docDataModel == null || activeRange == null) {
        return;
    }

    const { startOffset, segmentId } = activeRange;

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

export function PageSettingMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocOpenPageSettingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DocumentSettingSingle',
        tooltip: 'toolbar.pageSetup',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
