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

import type { IAccessor } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { combineLatest, Observable } from 'rxjs';
import { DeleteLeftCommand, DocTableDeleteColumnsCommand, DocTableDeleteRowsCommand, DocTableDeleteTableCommand, DocTableInsertColumnLeftCommand, DocTableInsertColumnRightCommand, DocTableInsertRowAboveCommand, DocTableInsertRowBellowCommand, TextSelectionManagerService } from '@univerjs/docs';
import type { RectRange } from '@univerjs/engine-render';
import { DocCopyCommand, DocCutCommand, DocPasteCommand } from '../../commands/commands/clipboard.command';
import { DocParagraphSettingPanelOperation } from '../../commands/operations/doc-paragraph-setting-panel.operation';

const getDisableOnCollapsedObservable = (accessor: IAccessor) => {
    const textSelectionManagerService = accessor.get(TextSelectionManagerService);
    return new Observable<boolean>((subscriber) => {
        const observable = textSelectionManagerService.textSelection$.subscribe(() => {
            const range = textSelectionManagerService.getActiveTextRangeWithStyle();
            if (range && !range.collapsed) {
                subscriber.next(false);
            } else {
                subscriber.next(true);
            }
        });

        return () => observable.unsubscribe();
    });
};

function inSameTable(rectRanges: Readonly<RectRange[]>) {
    if (rectRanges.length < 2) {
        return true;
    }

    const tableIds = rectRanges.map((rectRange) => rectRange.tableId);
    return tableIds.every((tableId) => tableId === tableIds[0]);
}

const getDisableWhenSelectionNotInTableObservable = (accessor: IAccessor) => {
    const textSelectionManagerService = accessor.get(TextSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable<boolean>((subscriber) => {
        const observable = textSelectionManagerService.textSelection$.subscribe(() => {
            const rectRanges = textSelectionManagerService.getCurrentRectRanges();
            const activeRange = textSelectionManagerService.getActiveTextRangeWithStyle();
            if (rectRanges && rectRanges.length && inSameTable(rectRanges)) {
                subscriber.next(false);
                return;
            }

            if (activeRange && (rectRanges == null || rectRanges.length === 0)) {
                const { segmentId, startOffset, endOffset } = activeRange;
                const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
                const tables = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody()?.tables;

                if (tables && tables.length) {
                    if (tables.some((table) => {
                        const { startIndex, endIndex } = table;
                        return (startOffset >= startIndex && startOffset <= endIndex) || (endOffset >= startIndex && endOffset <= endIndex);
                    })) {
                        subscriber.next(false);
                        return;
                    }
                }
            }

            subscriber.next(true);
        });

        return () => observable.unsubscribe();
    });
};

export const CopyMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocCopyCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'Copy',
        title: 'rightClick.copy',
        positions: [MenuPosition.CONTEXT_MENU],
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const ParagraphSettingMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocParagraphSettingPanelOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'MenuSingle24',
        title: 'doc.menu.paragraphSetting',
        positions: [MenuPosition.CONTEXT_MENU],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const CutMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocCutCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'Copy',
        title: 'rightClick.cut',
        positions: [MenuPosition.CONTEXT_MENU],
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const PasteMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocPasteCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecial',
        title: 'rightClick.paste',
        positions: [MenuPosition.CONTEXT_MENU],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const DeleteMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DeleteLeftCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecial',
        title: 'rightClick.delete',
        positions: [MenuPosition.CONTEXT_MENU],
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

const TABLE_INSERT_MENU_ID = 'doc.menu.table-insert';
export function TableInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: TABLE_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'table.insert',
        icon: 'Insert',
        positions: [MenuPosition.CONTEXT_MENU],
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getDisableWhenSelectionNotInTableObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

export function InsertRowBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableInsertRowAboveCommand.id,
        type: MenuItemType.BUTTON,
        title: 'table.insertRowAbove',
        icon: 'InsertRowAbove',
        positions: [TABLE_INSERT_MENU_ID],
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableInsertRowBellowCommand.id,
        type: MenuItemType.BUTTON,
        positions: [TABLE_INSERT_MENU_ID],
        title: 'table.insertRowBelow',
        icon: 'InsertRowBelow',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertColumnLeftMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableInsertColumnLeftCommand.id,
        type: MenuItemType.BUTTON,
        title: 'table.insertColumnLeft',
        icon: 'LeftInsertColumn',
        positions: [TABLE_INSERT_MENU_ID],
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertColumnRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableInsertColumnRightCommand.id,
        type: MenuItemType.BUTTON,
        positions: [TABLE_INSERT_MENU_ID],
        title: 'table.insertColumnRight',
        icon: 'RightInsertColumn',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

const TABLE_DELETE_MENU_ID = 'doc.menu.table-delete';
export function TableDeleteMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: TABLE_DELETE_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'table.delete',
        icon: 'Reduce',
        positions: [MenuPosition.CONTEXT_MENU],
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getDisableWhenSelectionNotInTableObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

export function DeleteRowsMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableDeleteRowsCommand.id,
        type: MenuItemType.BUTTON,
        title: 'table.deleteRows',
        icon: 'DeleteRow',
        positions: [TABLE_DELETE_MENU_ID],
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DeleteColumnsMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableDeleteColumnsCommand.id,
        type: MenuItemType.BUTTON,
        positions: [TABLE_DELETE_MENU_ID],
        title: 'table.deleteColumns',
        icon: 'DeleteColumn',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DeleteTableMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableDeleteTableCommand.id,
        type: MenuItemType.BUTTON,
        positions: [TABLE_DELETE_MENU_ID],
        title: 'table.deleteTable',
        icon: 'GridSingle',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
