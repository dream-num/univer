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

import type { DocumentDataModel, IAccessor, ITextRangeParam, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IMenuButtonItem, IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import {
    BaselineOffset,
    BooleanNumber,
    BuildTextUtils,
    DEFAULT_STYLES,
    DocumentBlockRangeType,
    DocumentFlavor,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    NAMED_STYLE_MAP,
    NamedStyleType,
    PresetListType,
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
    COLOR_PICKER_COMPONENT,
    COMMON_LABEL_COMPONENT,
    FONT_FAMILY_COMPONENT,
    FONT_FAMILY_ITEM_COMPONENT,
    FONT_SIZE_COMPONENT,
    FONT_SIZE_LIST,
    getMenuHiddenObservable,
    HEADING_ITEM_COMPONENT,
    HEADING_LIST,
    MenuItemType,
} from '@univerjs/ui';
import { combineLatest, map, Observable } from 'rxjs';
import { OpenHeaderFooterPanelCommand } from '../commands/commands/doc-header-footer.command';
import { HorizontalLineCommand } from '../commands/commands/doc-horizontal-line.command';
import {
    getStyleInTextRange,
    ResetInlineFormatTextBackgroundColorCommand,
    ResetInlineFormatTextColorCommand,
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
} from '../commands/commands/inline-format.command';
import { BulletListCommand, CheckListCommand, OrderListCommand } from '../commands/commands/list.command';
import {
    AlignCenterCommand,
    AlignJustifyCommand,
    AlignLeftCommand,
    AlignOperationCommand,
    AlignRightCommand,
} from '../commands/commands/paragraph-align.command';
import { SetParagraphNamedStyleCommand } from '../commands/commands/set-heading.command';
// import { SwitchDocModeCommand } from '../commands/commands/switch-doc-mode.command';
import { CreateDocTableCommand } from '../commands/commands/table/doc-table-create.command';
import { DocCreateTableOperation } from '../commands/operations/doc-create-table.operation';
import { DocOpenPageSettingCommand } from '../commands/operations/open-page-setting.operation';
import { getCommandSkeleton } from '../commands/util';
import { DocMenuStyleService } from '../services/doc-menu-style.service';
import { IDocEmbedRuntimeFocusCoordinator } from '../services/doc-embed-integration.service';
import { BULLET_LIST_TYPE_COMPONENT, ORDER_LIST_TYPE_COMPONENT } from '../views/list-type-picker/index';

export function shouldSuppressDocMenuStateRefresh(accessor: IAccessor): boolean {
    let univerInstanceService: IUniverInstanceService;
    let focusCoordinator: IDocEmbedRuntimeFocusCoordinator;

    try {
        univerInstanceService = accessor.get(IUniverInstanceService);
    } catch (error) {
        if (isInjectorDisposedError(error)) {
            return true;
        }

        throw error;
    }

    try {
        focusCoordinator = accessor.get(IDocEmbedRuntimeFocusCoordinator);
    } catch {
        return false;
    }

    const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    const unitId = docDataModel?.getUnitId();
    return focusCoordinator.shouldSuppressHostInteraction(unitId);
}

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

export function disableMenuWhenHeaderFooterEditing(accessor: IAccessor): Observable<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);

    return new Observable((subscriber) => {
        let editAreaSubscription: { unsubscribe: () => void } | null = null;
        let lastDisabled: boolean | undefined;

        const emit = (disabled: boolean) => {
            if (disabled !== lastDisabled) {
                lastDisabled = disabled;
                subscriber.next(disabled);
            }
        };

        const emitByUnit = (unitId?: string | null | void) => {
            editAreaSubscription?.unsubscribe();
            editAreaSubscription = null;

            if (!unitId || univerInstanceService.getUnitType(unitId) !== UniverInstanceType.UNIVER_DOC) {
                emit(true);
                return;
            }

            const currentRender = renderManagerService.getRenderById(unitId);
            const skeletonManager = currentRender?.with(DocSkeletonManagerService);
            const viewModel = skeletonManager?.getViewModel();
            if (!viewModel) {
                emit(true);
                return;
            }

            const emitDisabled = (editArea?: Nullable<DocumentEditArea>) => {
                const currentEditArea = editArea ?? viewModel.getEditArea();
                emit(currentEditArea === DocumentEditArea.HEADER || currentEditArea === DocumentEditArea.FOOTER);
            };

            emitDisabled();
            editAreaSubscription = viewModel.editAreaChange$.subscribe(emitDisabled);
        };

        const focusedSubscription = univerInstanceService.focused$.subscribe(emitByUnit);

        return () => {
            editAreaSubscription?.unsubscribe();
            focusedSubscription.unsubscribe();
        };
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
            const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
            const documentFlavor = docDataModel?.getSnapshot().documentStyle.documentFlavor;

            subscriber.next(documentFlavor !== DocumentFlavor.TRADITIONAL);
        });

        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

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

            const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

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
    const univerInstanceService = accessor.get(IUniverInstanceService);

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

            const document = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
            const codeBlockRanges = document?.getBody()?.blockRanges?.filter((range) => range.blockType === DocumentBlockRangeType.CODE) ?? [];
            if (codeBlockRanges.some((blockRange) => textRanges.some((range) => (
                Math.max(range.startOffset, blockRange.startIndex) <= Math.min(range.endOffset, blockRange.endIndex)
            )))) {
                subscriber.next(true);
                return;
            }

            subscriber.next(false);
        });

        return () => subscription.unsubscribe();
    });
}

export function isTextRangeInAnyBlockRange(document: Nullable<DocumentDataModel>, range: ITextRangeParam): boolean {
    const blockRanges = document?.getBody()?.blockRanges ?? [];
    const startOffset = range.startOffset;
    const endOffset = range.collapsed ? range.startOffset : range.endOffset - 1;

    return blockRanges.some((blockRange) => (
        Math.max(startOffset, blockRange.startIndex) <= Math.min(endOffset, blockRange.endIndex)
    ));
}

export function hideMenuWhenSelectionInBlockRange(accessor: IAccessor): Observable<boolean> {
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable((subscriber) => {
        const calc = (selection?: { textRanges?: ITextRangeParam[]; unitId?: string }) => {
            const currentSelection = (docSelectionManagerService as { __getCurrentSelection?: () => { unitId?: string } | null }).__getCurrentSelection?.();
            const textRanges = selection?.textRanges ?? [...(docSelectionManagerService.getTextRanges() ?? [])];
            const unitId = selection?.unitId ?? currentSelection?.unitId;
            const document = unitId
                ? univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC)
                : univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
            subscriber.next(textRanges.some((range) => isTextRangeInAnyBlockRange(document, range)));
        };

        calc();
        const subscription = docSelectionManagerService.textSelection$.subscribe((selection) => calc(selection));

        return () => subscription.unsubscribe();
    });
}

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetInlineFormatBoldCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BoldIcon',
        title: 'docs-ui.toolbar.bold',
        tooltip: 'docs-ui.toolbar.bold',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetInlineFormatItalicCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ItalicIcon',
        title: 'docs-ui.toolbar.italic',
        tooltip: 'docs-ui.toolbar.italic',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetInlineFormatUnderlineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineIcon',
        title: 'docs-ui.toolbar.underline',
        tooltip: 'docs-ui.toolbar.underline',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetInlineFormatStrikethroughCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughIcon',
        title: 'docs-ui.toolbar.strikethrough',
        tooltip: 'docs-ui.toolbar.strikethrough',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export function SubscriptMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetInlineFormatSubscriptCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'SubscriptIcon',
        tooltip: 'docs-ui.toolbar.subscript',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export function SuperscriptMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetInlineFormatSuperscriptCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'SuperscriptIcon',
        tooltip: 'docs-ui.toolbar.superscript',
        activated$: new Observable<boolean>((subscriber) => {
            const calc = () => {
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, string, string> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetInlineFormatFontFamilyCommand.id,
        tooltip: 'docs-ui.toolbar.font',
        type: MenuItemType.SELECTOR,
        label: {
            name: FONT_FAMILY_COMPONENT,
            props: {
                id: SetInlineFormatFontFamilyCommand.id,
            },
        },
        selections: [{
            label: {
                name: FONT_FAMILY_ITEM_COMPONENT,
                hoverable: false,
                selectable: false,
                props: {
                    id: SetInlineFormatFontFamilyCommand.id,
                },
            },
        }],
        // disabled$: getCurrentSheetDisabled$(accessor),
        value$: new Observable((subscriber) => {
            const defaultValue = DEFAULT_STYLES.ff;

            const calc = () => {
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, number> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetInlineFormatFontSizeCommand.id,
        type: MenuItemType.SELECTOR,
        tooltip: 'docs-ui.toolbar.fontSize',
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
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export function HeadingSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, NamedStyleType> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetParagraphNamedStyleCommand.id,
        type: MenuItemType.SELECTOR,
        tooltip: 'docs-ui.toolbar.heading.tooltip',
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
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

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

export const FLOAT_TEXT_STYLE_MENU_ID = 'doc.menu.float-text-style';
export const FLOAT_TOOLBAR_MENU_POSITION = 'doc.menu.float-toolbar';

const FLOAT_TEXT_STYLE_OPTIONS = [
    {
        icon: 'TextTypeIcon',
        label: 'docs-ui.toolbar.heading.normal',
        value: NamedStyleType.NORMAL_TEXT,
    },
    {
        icon: 'H1Icon',
        label: 'docs-ui.toolbar.heading.leading1',
        value: NamedStyleType.HEADING_1,
    },
    {
        icon: 'H2Icon',
        label: 'docs-ui.toolbar.heading.leading2',
        value: NamedStyleType.HEADING_2,
    },
    {
        icon: 'H3Icon',
        label: 'docs-ui.toolbar.heading.leading3',
        value: NamedStyleType.HEADING_3,
    },
    {
        icon: 'H4Icon',
        label: 'docs-ui.toolbar.heading.leading4',
        value: NamedStyleType.HEADING_4,
    },
    {
        icon: 'H5Icon',
        label: 'docs-ui.toolbar.heading.leading5',
        value: NamedStyleType.HEADING_5,
    },
    {
        id: OrderListCommand.id,
        icon: 'OrderIcon',
        label: 'docs-ui.toolbar.order',
        value: PresetListType.ORDER_LIST,
    },
    {
        id: BulletListCommand.id,
        icon: 'UnorderIcon',
        label: 'docs-ui.toolbar.unorder',
        value: PresetListType.BULLET_LIST,
    },
    {
        id: CheckListCommand.id,
        icon: 'TodoListDoubleIcon',
        label: 'docs-ui.toolbar.checklist',
        value: PresetListType.CHECK_LIST,
    },
];

function normalizeFloatingTextStyleValue(paragraph: ReturnType<typeof getParagraphStyleAtCursor>): string | number {
    const listType = paragraph?.bullet?.listType;

    if (listType?.startsWith(PresetListType.ORDER_LIST)) {
        return PresetListType.ORDER_LIST;
    }

    if (listType?.startsWith(PresetListType.BULLET_LIST)) {
        return PresetListType.BULLET_LIST;
    }

    if (listType === PresetListType.CHECK_LIST || listType === PresetListType.CHECK_LIST_CHECKED) {
        return PresetListType.CHECK_LIST;
    }

    return paragraph?.paragraphStyle?.namedStyleType ?? NamedStyleType.NORMAL_TEXT;
}

export function FloatTextStyleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, string | number> {
    const commandService = accessor.get(ICommandService);

    return {
        id: FLOAT_TEXT_STYLE_MENU_ID,
        commandId: SetParagraphNamedStyleCommand.id,
        type: MenuItemType.SELECTOR,
        icon: 'TextTypeIcon',
        tooltip: 'docs-ui.toolbar.heading.tooltip',
        selections: FLOAT_TEXT_STYLE_OPTIONS,
        value$: new Observable((subscriber) => {
            const calc = () => {
                if (shouldSuppressDocMenuStateRefresh(accessor)) {
                    return;
                }

                subscriber.next(normalizeFloatingTextStyleValue(getParagraphStyleAtCursor(accessor)));
            };

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (
                    id === SetTextSelectionsOperation.id ||
                    id === SetParagraphNamedStyleCommand.id ||
                    id === OrderListCommand.id ||
                    id === BulletListCommand.id ||
                    id === CheckListCommand.id
                ) {
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

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, string, string | undefined> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
        id: SetInlineFormatTextColorCommand.id,
        icon: 'FontColorDoubleIcon',
        tooltip: 'docs-ui.toolbar.textColor.main',

        type: MenuItemType.BUTTON_SELECTOR,
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
                value$: new Observable<string>((subscriber) => {
                    const defaultValue = DEFAULT_STYLES.cl.rgb;
                    const calc = () => {
                        if (shouldSuppressDocMenuStateRefresh(accessor)) {
                            return;
                        }

                        const textRun = getFontStyleAtCursor(accessor);

                        if (!textRun) {
                            subscriber.next(defaultValue);
                            return;
                        }

                        const color = textRun.ts?.cl?.rgb;
                        subscriber.next(color ?? defaultValue);
                    };

                    const disposable = commandService.onCommandExecuted((c) => {
                        if (c.id === SetInlineFormatTextColorCommand.id) {
                            calc();
                        }
                    });

                    calc();
                    return disposable.dispose;
                }),
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = themeService.getColorFromTheme('gray.900');

            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetInlineFormatTextColorCommand.id) {
                    if (shouldSuppressDocMenuStateRefresh(accessor)) {
                        return;
                    }

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

export function HeaderFooterMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: OpenHeaderFooterPanelCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'HeaderFooterIcon',
        tooltip: 'docs-ui.toolbar.headerFooter',
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getHeaderFooterMenuHiddenObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

export const TableIcon = 'GridIcon';
export const TABLE_MENU_ID = 'doc.menu.table';

export function TableMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: TABLE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: TableIcon,
        tooltip: 'docs-ui.toolbar.table.main',
        disabled$: getTableDisabledObservable(accessor),
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getInsertTableHiddenObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

export function InsertTableMenuFactory(_accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocCreateTableOperation.id,
        title: 'docs-ui.toolbar.table.insert',
        type: MenuItemType.BUTTON,
        icon: TableIcon,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertDefaultTableMenuFactory(_accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocCreateTableOperation.id,
        commandId: CreateDocTableCommand.id,
        params: {
            rowCount: 3,
            colCount: 5,
        },
        title: 'docs-ui.toolbar.table.insert',
        type: MenuItemType.BUTTON,
        icon: TableIcon,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function AlignLeftMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignLeftCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'LeftJustifyingIcon',
        tooltip: 'docs-ui.toolbar.alignLeft',
        disabled$: disableMenuWhenNoDocRange(accessor),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === AlignOperationCommand.id) {
                    if (shouldSuppressDocMenuStateRefresh(accessor)) {
                        return;
                    }

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

export function AlignCenterMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignCenterCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'HorizontallyIcon',
        tooltip: 'docs-ui.toolbar.alignCenter',
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === AlignOperationCommand.id) {
                    if (shouldSuppressDocMenuStateRefresh(accessor)) {
                        return;
                    }

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

export function AlignRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignRightCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'RightJustifyingIcon',
        tooltip: 'docs-ui.toolbar.alignRight',
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === AlignOperationCommand.id) {
                    if (shouldSuppressDocMenuStateRefresh(accessor)) {
                        return;
                    }

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

export function AlignJustifyMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);

    return {
        id: AlignJustifyCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'AlignTextBothIcon',
        tooltip: 'docs-ui.toolbar.alignJustify',
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === AlignOperationCommand.id) {
                    if (shouldSuppressDocMenuStateRefresh(accessor)) {
                        return;
                    }

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

const HORIZONTAL_ALIGN_OPTIONS = [
    {
        id: AlignLeftCommand.id,
        value: HorizontalAlign.LEFT,
        label: 'docs-ui.toolbar.alignLeft',
        icon: 'LeftJustifyingIcon',
    },
    {
        id: AlignCenterCommand.id,
        value: HorizontalAlign.CENTER,
        label: 'docs-ui.toolbar.alignCenter',
        icon: 'HorizontallyIcon',
    },
    {
        id: AlignRightCommand.id,
        value: HorizontalAlign.RIGHT,
        label: 'docs-ui.toolbar.alignRight',
        icon: 'RightJustifyingIcon',
    },
    {
        id: AlignJustifyCommand.id,
        value: HorizontalAlign.JUSTIFIED,
        label: 'docs-ui.toolbar.alignJustify',
        icon: 'AlignTextBothIcon',
    },
];

export function AlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, HorizontalAlign, HorizontalAlign> {
    const commandService = accessor.get(ICommandService);

    const value$ = new Observable<HorizontalAlign>((subscriber) => {
        const calc = () => {
            if (shouldSuppressDocMenuStateRefresh(accessor)) {
                subscriber.next(HorizontalAlign.LEFT);
                return;
            }

            const paragraph = getParagraphStyleAtCursor(accessor);

            subscriber.next(paragraph?.paragraphStyle?.horizontalAlign ?? HorizontalAlign.LEFT);
        };
        const disposable = commandService.onCommandExecuted((c) => {
            if (c.id === SetTextSelectionsOperation.id || c.id === AlignOperationCommand.id) {
                calc();
            }
        });

        calc();
        return disposable.dispose;
    });

    return {
        id: AlignOperationCommand.id,
        type: MenuItemType.SELECTOR,
        icon: value$.pipe(map((alignType) => HORIZONTAL_ALIGN_OPTIONS.find((option) => option.value === alignType)?.icon ?? 'LeftJustifyingIcon')),
        tooltip: 'docs-ui.toolbar.alignLeft',
        selections: HORIZONTAL_ALIGN_OPTIONS,
        value$,
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function HorizontalLineFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: HorizontalLineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ReduceIcon',
        tooltip: 'docs-ui.toolbar.horizontalLine',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

const listValueFactory$ = (accessor: IAccessor) => {
    return new Observable<PresetListType | undefined>((subscriber) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            if (shouldSuppressDocMenuStateRefresh(accessor)) {
                return;
            }

            if (unitId == null) {
                return;
            }

            const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
            if (docDataModel == null) {
                return;
            }

            const docRanges = docSelectionManagerService.getDocRanges();
            const range = docRanges.find((r) => r.isActive) ?? docRanges[0];

            if (range) {
                const doc = docDataModel.getSelfOrHeaderFooterModel(range?.segmentId);

                const paragraphs = BuildTextUtils.range.getParagraphsInRange(range, doc?.getBody()?.paragraphs ?? [], doc?.getBody()?.dataStream ?? '');
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

        return () => {
            subscription.unsubscribe();
        };
    });
};

export function OrderListMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, PresetListType | undefined, PresetListType | undefined> {
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
        icon: 'OrderIcon',
        tooltip: 'docs-ui.toolbar.order',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        disabled$: disableMenuWhenNoDocRange(accessor),
        activated$: listValueFactory$(accessor).pipe(map((v) => Boolean(v && v.indexOf('ORDER_LIST') === 0))),
    };
}

export function BulletListMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, PresetListType | undefined, PresetListType | undefined> {
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
        icon: 'UnorderIcon',
        tooltip: 'docs-ui.toolbar.unorder',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: listValueFactory$(accessor).pipe(map((v) => Boolean(v && v.indexOf('BULLET_LIST') === 0))),
    };
}

export function CheckListMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: CheckListCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TodoListDoubleIcon',
        tooltip: 'docs-ui.toolbar.checklist',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: listValueFactory$(accessor).pipe(map((v) => Boolean(v && v.indexOf('CHECK_LIST') === 0))),
    };
}

// export function DocSwitchModeMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
//     const commandService = accessor.get(ICommandService);
//     const univerInstanceService = accessor.get(IUniverInstanceService);

//     return {
//         id: SwitchDocModeCommand.id,
//         type: MenuItemType.BUTTON,
//         icon: 'KeyboardIcon',
//         tooltip: 'docs-ui.toolbar.documentFlavor',
//         hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
//         activated$: new Observable<boolean>((subscriber) => {
//             const subscription = commandService.onCommandExecuted((c) => {
//                 if (c.id === RichTextEditingMutation.id) {
//                     const instance = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

//                     subscriber.next(instance?.getSnapshot()?.documentStyle.documentFlavor === DocumentFlavor.MODERN);
//                 }
//             });

//             const instance = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

//             subscriber.next(instance?.getSnapshot()?.documentStyle.documentFlavor === DocumentFlavor.MODERN);

//             return () => subscription.dispose();
//         }),
//     };
// }

export function ResetTextColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: ResetInlineFormatTextColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.toolbar.resetColor',
        icon: 'NoColorDoubleIcon',
    };
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: ResetInlineFormatTextBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.toolbar.resetColor',
        icon: 'NoColorDoubleIcon',
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey, string, string | undefined> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
        id: SetInlineFormatTextBackgroundColorCommand.id,
        tooltip: 'docs-ui.toolbar.fillColor.main',
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'PaintBucketDoubleIcon',
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
                value$: new Observable<string>((subscriber) => {
                    const defaultValue = themeService.getColorFromTheme('primary.600');
                    const calc = () => {
                        if (shouldSuppressDocMenuStateRefresh(accessor)) {
                            return;
                        }

                        const textRun = getFontStyleAtCursor(accessor);

                        if (!textRun) {
                            subscriber.next(defaultValue);
                            return;
                        }

                        const color = textRun.ts?.bg?.rgb;

                        subscriber.next(color ?? defaultValue);
                    };

                    const disposable = commandService.onCommandExecuted((c) => {
                        if (c.id === SetInlineFormatTextBackgroundColorCommand.id) {
                            calc();
                        }
                    });

                    calc();
                    return disposable.dispose;
                }),
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = themeService.getColorFromTheme('primary.600');

            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetInlineFormatTextBackgroundColorCommand.id) {
                    if (shouldSuppressDocMenuStateRefresh(accessor)) {
                        return;
                    }

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
    if (shouldSuppressDocMenuStateRefresh(accessor)) {
        return;
    }

    let univerInstanceService: IUniverInstanceService;
    let textSelectionService: DocSelectionManagerService;
    let docMenuStyleService: DocMenuStyleService;
    try {
        univerInstanceService = accessor.get(IUniverInstanceService);
        textSelectionService = accessor.get(DocSelectionManagerService);
        docMenuStyleService = accessor.get(DocMenuStyleService);
    } catch (error) {
        if (isInjectorDisposedError(error)) {
            return;
        }

        throw error;
    }

    const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
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
    const body = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();

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
    if (shouldSuppressDocMenuStateRefresh(accessor)) {
        return;
    }

    let univerInstanceService: IUniverInstanceService;
    let textSelectionService: DocSelectionManagerService;
    try {
        univerInstanceService = accessor.get(IUniverInstanceService);
        textSelectionService = accessor.get(DocSelectionManagerService);
    } catch (error) {
        if (isInjectorDisposedError(error)) {
            return;
        }

        throw error;
    }

    const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

    const docRanges = textSelectionService.getDocRanges();
    const activeRange = docRanges.find((r) => r.isActive) ?? docRanges[0];

    if (docDataModel == null || activeRange == null) {
        return;
    }

    const { startOffset, segmentId } = activeRange;

    const paragraphs = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.paragraphs;

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

function isInjectorDisposedError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }

    return error.name === 'InjectorAlreadyDisposedError' ||
        error.message.includes('Injector cannot be accessed after it was disposed');
}

export function PageSettingMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocOpenPageSettingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DocSettingIcon',
        tooltip: 'docs-ui.toolbar.pageSetup',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
