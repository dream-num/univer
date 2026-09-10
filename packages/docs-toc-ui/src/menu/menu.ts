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
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DeleteTableOfContentsCommand, findTableOfContentsAtOffset } from '@univerjs/docs-toc';
import { disableMenuWithoutDocumentUnitPermission } from '@univerjs/docs-ui';
import { UnitAction } from '@univerjs/protocol';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map, Observable } from 'rxjs';
import {
    InsertTableOfContentsOperation,
    OpenTableOfContentsDialogOperation,
} from '../commands/table-of-contents-dialog.operation';

export const INSERT_TABLE_OF_CONTENTS_MENU_ID = 'doc.menu.insert-table-of-contents';

function getTableOfContentsHiddenObservable(accessor: IAccessor): Observable<boolean> {
    const selectionManager = accessor.get(DocSelectionManagerService);
    const instanceService = accessor.get(IUniverInstanceService);
    return new Observable((subscriber) => {
        const emit = () => {
            const doc = instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
            const selection = selectionManager.getActiveTextRange();
            subscriber.next(!findTableOfContentsAtOffset(doc?.getBody(), selection?.startOffset));
        };
        emit();
        const selectionSubscription = selectionManager.textSelection$.subscribe(emit);
        const unitSubscription = instanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC).subscribe(emit);
        return () => {
            selectionSubscription.unsubscribe();
            unitSubscription.unsubscribe();
        };
    });
}

function getInsertTableOfContentsDisabledObservable(accessor: IAccessor): Observable<boolean> {
    const selectionManager = accessor.get(DocSelectionManagerService);
    const instanceService = accessor.get(IUniverInstanceService);
    return new Observable((subscriber) => {
        const emit = () => {
            const doc = instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
            const selection = selectionManager.getActiveTextRange();
            subscriber.next(!selection || selection.startOffset !== selection.endOffset || Boolean(selection.segmentId) ||
                Boolean(findTableOfContentsAtOffset(doc?.getBody(), selection.startOffset)));
        };
        emit();
        const selectionSubscription = selectionManager.textSelection$.subscribe(emit);
        const unitSubscription = instanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC).subscribe(emit);
        return () => {
            selectionSubscription.unsubscribe();
            unitSubscription.unsubscribe();
        };
    });
}

export function InsertTableOfContentsMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    const permissionDisabled$ = disableMenuWithoutDocumentUnitPermission(accessor, UnitAction.Edit);
    return {
        id: INSERT_TABLE_OF_CONTENTS_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'UnorderIcon',
        title: 'docs-toc-ui.tableOfContents.insertTitle',
        selectionsCommandId: InsertTableOfContentsOperation.id,
        selections: [{
            value: 'automatic',
            label: 'docs-toc-ui.tableOfContents.automaticTitle',
            icon: 'UnorderIcon',
            params: { mode: 'automatic' },
        }, {
            value: 'custom',
            label: 'docs-toc-ui.tableOfContents.customTitle',
            icon: 'DocSettingIcon',
            params: { mode: 'custom' },
        }],
        disabled$: combineLatest([
            permissionDisabled$,
            getInsertTableOfContentsDisabledObservable(accessor),
        ]).pipe(map(([permissionDisabled, unavailable]) => permissionDisabled || unavailable)),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function UpdateTableOfContentsMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: OpenTableOfContentsDialogOperation.id,
        commandId: OpenTableOfContentsDialogOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'UnorderIcon',
        title: 'docs-toc-ui.tableOfContents.updateTitle',
        disabled$: disableMenuWithoutDocumentUnitPermission(accessor, UnitAction.Edit),
        hidden$: combineLatest([
            getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
            getTableOfContentsHiddenObservable(accessor),
        ]).pipe(map(([hidden, unavailable]) => hidden || unavailable)),
    };
}

export function DeleteTableOfContentsMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DeleteTableOfContentsCommand.id,
        commandId: DeleteTableOfContentsCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteIcon',
        title: 'docs-toc-ui.tableOfContents.removeTitle',
        disabled$: disableMenuWithoutDocumentUnitPermission(accessor, UnitAction.Edit),
        hidden$: combineLatest([
            getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
            getTableOfContentsHiddenObservable(accessor),
        ]).pipe(map(([hidden, unavailable]) => hidden || unavailable)),
    };
}
