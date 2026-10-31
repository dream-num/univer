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
import type { IMenuItem } from '@univerjs/ui';
import { IPermissionService, IUniverInstanceService, SheetTypes, UniverInstanceType } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { distinctUntilChanged, map, of, startWith } from 'rxjs';
import type { LocaleKey } from '../locale/types';
import { InsertCellImageCommand, InsertFloatImageCommand } from '../commands/commands/insert-image.command';

export const SHEETS_IMAGE_MENU_ID = 'sheet.menu.image';

/** Chart Sheets have no cells; other sheet types retain the existing range-menu permission rules. */
function getImageMenuDisabled$(accessor: IAccessor, floating: boolean) {
    return deriveStateFromActiveSheet$(accessor.get(IUniverInstanceService), true, ({ workbook, worksheet }) => {
        if (worksheet.getConfig().type === SheetTypes.CHART) {
            if (!floating) {
                return of(true);
            }
            const permissions = accessor.get(IPermissionService);
            const ids = [
                new WorkbookEditablePermission(workbook.getUnitId()).id,
                new WorksheetEditPermission(workbook.getUnitId(), worksheet.getSheetId()).id,
            ];
            return permissions.permissionPointUpdate$.pipe(
                startWith(null),
                map(() => ids.some((id) => permissions.getPermissionPoint(id)?.value !== true)),
                distinctUntilChanged()
            );
        }
        return getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        });
    });
}

export function ImageMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SHEETS_IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'AddImageIcon',
        tooltip: 'sheets-drawing-ui.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getImageMenuDisabled$(accessor, true),
    };
}

export function UploadFloatImageMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: InsertFloatImageCommand.id,
        title: 'sheets-drawing-ui.upload.float',
        disabled$: getImageMenuDisabled$(accessor, true),
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function UploadCellImageMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: InsertCellImageCommand.id,
        title: 'sheets-drawing-ui.upload.cell',
        disabled$: getImageMenuDisabled$(accessor, false),
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
