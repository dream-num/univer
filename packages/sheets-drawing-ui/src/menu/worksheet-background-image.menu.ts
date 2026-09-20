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

import type { IAccessor, Workbook } from '@univerjs/core';
import type { IMenuItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import {
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    SetWorksheetActiveOperation,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { SetWorksheetBackgroundImageMutation } from '@univerjs/sheets-drawing';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map, Observable } from 'rxjs';
import {
    AddWorksheetBackgroundImageCommand,
    DeleteWorksheetBackgroundImageCommand,
} from '../commands/commands/worksheet-background-image.command';

export const WORKSHEET_BACKGROUND_IMAGE_MENU_ID = 'sheet.menu.worksheet-background-image';

function worksheetBackgroundImagePresent$(accessor: IAccessor): Observable<boolean> {
    const commandService = accessor.get(ICommandService);
    const instanceService = accessor.get(IUniverInstanceService);

    return new Observable<boolean>((observer) => {
        const getValue = () => {
            const workbook = instanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            return !!workbook?.getActiveSheet().getConfig().backgroundImage;
        };
        const disposables = new DisposableCollection();
        disposables.add(commandService.onCommandExecuted((command) => {
            if (
                command.id === SetWorksheetBackgroundImageMutation.id ||
                command.id === SetWorksheetActiveOperation.id
            ) {
                observer.next(getValue());
            }
        }));
        disposables.add(instanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe(() => {
            observer.next(getValue());
        }));
        observer.next(getValue());
        return () => disposables.dispose();
    });
}

function worksheetBackgroundImagePermissionDisabled$(accessor: IAccessor) {
    return getCurrentRangeDisable$(accessor, {
        workbookTypes: [WorkbookEditablePermission],
        worksheetTypes: [WorksheetEditPermission],
    });
}

export function WorksheetBackgroundImageMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: WORKSHEET_BACKGROUND_IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'AddImageIcon',
        tooltip: 'sheets-drawing-ui.backgroundImage.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: worksheetBackgroundImagePermissionDisabled$(accessor),
    };
}

export function AddWorksheetBackgroundImageMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: AddWorksheetBackgroundImageCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-drawing-ui.backgroundImage.add',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: worksheetBackgroundImagePermissionDisabled$(accessor),
    };
}

export function DeleteWorksheetBackgroundImageMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    const permissionDisabled$ = worksheetBackgroundImagePermissionDisabled$(accessor);
    return {
        id: DeleteWorksheetBackgroundImageCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-drawing-ui.backgroundImage.delete',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: combineLatest([permissionDisabled$, worksheetBackgroundImagePresent$(accessor)]).pipe(
            map(([permissionDisabled, present]) => permissionDisabled || !present)
        ),
    };
}
