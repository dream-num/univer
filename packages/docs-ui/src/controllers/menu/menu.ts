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
    ICommandService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    BulletListCommand,
    OrderListCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatUnderlineCommand,
    SetTextSelectionsOperation,
    TextSelectionManagerService,
} from '@univerjs/docs';
import type { IMenuButtonItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

// TODO @Dushusir: use for test, change id later
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.DOC),
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.DOC),
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.DOC),
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.DOC),
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.DOC),
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.DOC),
    };
}

export function OrderListMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: OrderListCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'OrderSingle',
        tooltip: 'toolbar.order',
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.DOC),
    };
}

export function BulletListMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: BulletListCommand.id,
        group: MenuGroup.TOOLBAR_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'UnorderSingle',
        tooltip: 'toolbar.unorder',
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.DOC),
    };
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const currentUniverService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);
    const editorDataModel = currentUniverService.getCurrentUniverDocInstance();
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
