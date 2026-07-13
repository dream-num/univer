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

import type { DocumentDataModel, IAccessor } from '@univerjs/core';
import type { IRectRangeWithStyle } from '@univerjs/engine-render';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import type { Subscriber } from 'rxjs';
import type { LocaleKey } from '../locale/types';
import { DOC_RANGE_TYPE, DocumentFlavor, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, Observable } from 'rxjs';
import { DocCopyCommand, DocCutCommand, DocPasteCommand } from '../commands/commands/clipboard.command';
import { DeleteLeftCommand } from '../commands/commands/doc-delete.command';
import {
    DocTableDeleteColumnsCommand,
    DocTableDeleteRowsCommand,
    DocTableDeleteTableCommand,
} from '../commands/commands/table/doc-table-delete.command';
import {
    DocTableInsertColumnLeftCommand,
    DocTableInsertColumnRightCommand,
    DocTableInsertRowAboveCommand,
    DocTableInsertRowBellowCommand,
} from '../commands/commands/table/doc-table-insert.command';
import { DocParagraphSettingPanelOperation } from '../commands/operations/doc-paragraph-setting-panel.operation';
import { DocSectionSettingPanelOperation } from '../commands/operations/doc-section-setting-panel.operation';

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
        const isCollapsed = activeRange.collapsed === true || startOffset === endOffset;
        if (!isCollapsed) {
            subscriber.next(true);
            return;
        }

        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const tables = docDataModel?.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.tables;

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

export function CopyMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocCopyCommand.name,
        commandId: DocCopyCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CopyDoubleIcon',
        title: 'docs-ui.rightClick.copy',
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export function ParagraphSettingMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocParagraphSettingPanelOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'MenuIcon',
        title: 'docs-ui.doc.menu.paragraphSetting',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export function CutMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocCutCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CopyDoubleIcon',
        title: 'docs-ui.rightClick.cut',
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export function PasteMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocPasteCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecialDoubleIcon',
        title: 'docs-ui.rightClick.paste',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export function DeleteMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DeleteLeftCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecialDoubleIcon',
        title: 'docs-ui.rightClick.delete',
        disabled$: getDisableOnCollapsedObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
};

export const TABLE_INSERT_MENU_ID = 'doc.menu.table-insert';
export function TableInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: TABLE_INSERT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'docs-ui.table.insert',
        icon: 'InsertDoubleIcon',
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getDisableWhenSelectionNotInTableObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

function getSectionSettingUnavailableObservable(accessor: IAccessor): Observable<boolean> {
    const selectionManager = accessor.get(DocSelectionManagerService);
    const instanceService = accessor.get(IUniverInstanceService);

    return new Observable((subscriber) => {
        const emit = () => {
            const documentDataModel = instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
            const activeRange = selectionManager.getActiveTextRange();
            const body = documentDataModel?.getBody();
            const unavailable = !documentDataModel ||
                documentDataModel.getDocumentStyle().documentFlavor !== DocumentFlavor.TRADITIONAL ||
                !activeRange ||
                Boolean(activeRange.segmentId) ||
                Boolean(body?.tables?.some((table) => activeRange.startOffset > table.startIndex && activeRange.startOffset < table.endIndex));
            subscriber.next(unavailable);
        };

        emit();
        const subscription = selectionManager.textSelection$.subscribe(emit);
        return () => subscription.unsubscribe();
    });
}

export function SectionSettingMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocSectionSettingPanelOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'MenuIcon',
        title: 'docs-ui.doc.menu.sectionSetting',
        hidden$: combineLatest(
            getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
            getSectionSettingUnavailableObservable(accessor),
            (hidden, unavailable) => hidden || unavailable
        ),
    };
}

export function InsertRowBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocTableInsertRowAboveCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.table.insertRowAbove',
        icon: 'InsertRowAboveDoubleIcon',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocTableInsertRowBellowCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.table.insertRowBelow',
        icon: 'InsertRowBelowDoubleIcon',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertColumnLeftMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocTableInsertColumnLeftCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.table.insertColumnLeft',
        icon: 'LeftInsertColumnDoubleIcon',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function InsertColumnRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocTableInsertColumnRightCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.table.insertColumnRight',
        icon: 'RightInsertColumnDoubleIcon',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export const TABLE_DELETE_MENU_ID = 'doc.menu.table-delete';
export function TableDeleteMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: TABLE_DELETE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'docs-ui.table.delete',
        icon: 'ReduceDoubleIcon',
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getDisableWhenSelectionNotInTableObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

export function DeleteRowsMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocTableDeleteRowsCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.table.deleteRows',
        icon: 'DeleteRowDoubleIcon',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DeleteColumnsMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocTableDeleteColumnsCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.table.deleteColumns',
        icon: 'DeleteColumnDoubleIcon',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function DeleteTableMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DocTableDeleteTableCommand.id,
        type: MenuItemType.BUTTON,
        title: 'docs-ui.table.deleteTable',
        icon: 'GridIcon',
        disabled$: getDisableWhenSelectionNotInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}
