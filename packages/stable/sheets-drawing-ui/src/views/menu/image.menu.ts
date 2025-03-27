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
import { UniverInstanceType } from '@univerjs/core';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { InsertCellImageCommand, InsertFloatImageCommand } from '../../commands/commands/insert-image.command';

export const IMAGE_UPLOAD_ICON = 'addition-and-subtraction-single';
export const SHEETS_IMAGE_MENU_ID = 'sheet.menu.image';

export function ImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SHEETS_IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: IMAGE_UPLOAD_ICON,
        tooltip: 'sheetImage.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function UploadFloatImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: InsertFloatImageCommand.id,
        title: 'sheetImage.upload.float',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function UploadCellImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: InsertCellImageCommand.id,
        title: 'sheetImage.upload.cell',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
