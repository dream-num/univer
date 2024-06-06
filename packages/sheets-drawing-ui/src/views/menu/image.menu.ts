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

import { getMenuHiddenObservable, type IMenuItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { UniverInstanceType } from '@univerjs/core';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { COMPONENT_UPLOAD_FILE_MENU, UploadFileType } from '../upload-component/component-name';
import { InsertCellImageOperation, InsertFloatImageOperation } from '../../commands/operations/insert-image.operation';

export const IMAGE_UPLOAD_ICON = 'addition-and-subtraction-single';
const IMAGE_MENU_ID = 'sheet.menu.image';

export function ImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        icon: IMAGE_UPLOAD_ICON,
        tooltip: 'sheetImage.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function UploadFloatImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: InsertFloatImageOperation.id,
        title: 'sheetImage.upload.float',
        type: MenuItemType.SELECTOR,
        label: {
            name: COMPONENT_UPLOAD_FILE_MENU,
            props: {
                type: UploadFileType.floatImage,
            },
        },
        positions: [IMAGE_MENU_ID],
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function UploadCellImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: InsertCellImageOperation.id,
        title: 'sheetImage.upload.cell',
        type: MenuItemType.SELECTOR,
        label: {
            name: COMPONENT_UPLOAD_FILE_MENU,
            props: {
                type: UploadFileType.cellImage,
            },
        },
        positions: [IMAGE_MENU_ID],
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
