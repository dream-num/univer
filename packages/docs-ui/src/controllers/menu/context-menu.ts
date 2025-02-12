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

import type { IAccessor } from '@univerjs/core';
import type { IRectRangeWithStyle } from '@univerjs/engine-render';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import type { Subscriber } from 'rxjs';
import { DOC_RANGE_TYPE, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, Observable } from 'rxjs';
import { DocCopyCommand, DocCutCommand, DocPasteCommand } from '../../commands/commands/clipboard.command';
import { DeleteLeftCommand } from '../../commands/commands/doc-delete.command';
import { DocTableDeleteColumnsCommand, DocTableDeleteRowsCommand, DocTableDeleteTableCommand } from '../../commands/commands/table/doc-table-delete.command';
import { DocTableInsertColumnLeftCommand, DocTableInsertColumnRightCommand, DocTableInsertRowAboveCommand, DocTableInsertRowBellowCommand } from '../../commands/commands/table/doc-table-insert.command';
import { DocParagraphSettingPanelOperation } from '../../commands/operations/doc-paragraph-setting-panel.operation';

const getDisableOnCollapsedObservable = (accessor: IAccessor) => {
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    return new Observable<boolean>((subscriber) => {
        const observable = docSelectionManagerService.textSelection$.subscribe(() => {
            const ranges = docSelectionManagerService.getDocRanges();
            const legal = ranges.some((range) => range.collapsed === false || range.rangeType === DOC_RANGE_TYPE.RECT);
            if (legal) {
                subscriber.next(false);
            } else {
                subscriber.next(true);
            }
        });

        return () => observable.unsubscribe();
    });
};

function inSameTable(rectRanges: Readonly<IRectRangeWithStyle[]>) {
    if (rectRanges.length < 2) {
        return true;
    }

    const tableIds = rectRanges.map((rectRange) => rectRange.tableId);
    return tableIds.every((tableId) => tableId === tableIds[0]);
}

function notInTableSubscriber(subscriber: Subscriber<boolean>, docSelectionManagerService: DocSelectionManagerService, univerInstanceService: IUniverInstanceService) {
    const rectRanges = docSelectionManagerService.getRectRanges();
    const activeRange = docSelectionManagerService.getActiveTextRange();

    if (rectRanges && rectRanges.length && inSameTable(rectRanges) && activeRange == null) {
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
                return (startOffset > startIndex && startOffset < endIndex) || (endOffset > startIndex && endOffset < endIndex);
            })) {
                subscriber.next(false);
                return;
            }
        }
    }
    subscriber.next(true);
}

const getDisableWhenSelectionNotInTableObservable = (accessor: IAccessor) => {
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable<boolean>((subscriber) => {
        const observable = docSelectionManagerService.textSelection$.subscribe(() => {
            notInTableSubscriber(subscriber, docSelectionManagerService, univerInstanceService);
        });

        notInTableSubscriber(subscriber, docSelectionManagerService, univerInstanceService);

        return () => observable.unsubscribe();
    });
};

export const CopyMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocCopyCommand.name,
        commandId: DocCopyCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'Copy',
        title: 'rightClick.copy',
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const CutMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocCutCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'Copy',
        title: 'rightClick.cut',
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const PasteMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DocPasteCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecial',
        title: 'rightClick.paste',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const DeleteMenuFactory = (accessor: IAccessor): IMenuButtonItem => {
    return {
        id: DeleteLeftCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecial',
        title: 'rightClick.delete',
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const TABLE_INSERT_MENU_ID = 'doc.menu.table-insert';
export function TableInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: TABLE_INSERT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'table.insert',
        icon: 'Insert',
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
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableInsertRowBellowCommand.id,
        type: MenuItemType.BUTTON,
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
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertColumnRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableInsertColumnRightCommand.id,
        type: MenuItemType.BUTTON,
        title: 'table.insertColumnRight',
        icon: 'RightInsertColumn',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export const TABLE_DELETE_MENU_ID = 'doc.menu.table-delete';
export function TableDeleteMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: TABLE_DELETE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'table.delete',
        icon: 'Reduce',
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
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DeleteColumnsMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DocTableDeleteColumnsCommand.id,
        type: MenuItemType.BUTTON,
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
        title: 'table.deleteTable',
        icon: 'GridSingle',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
