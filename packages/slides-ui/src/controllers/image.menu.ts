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

import type { IMenuItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';
import { COMPONENT_UPLOAD_FILE_MENU, UploadFileType } from '../components/upload-component/component-name';
import { InsertSlideFloatImageOperation } from '../commands/operations/insert-image.operation';

export const IMAGE_UPLOAD_ICON = 'addition-and-subtraction-single';
const IMAGE_MENU_ID = 'slide.menu.image';

export function SlideImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        icon: IMAGE_UPLOAD_ICON,
        tooltip: 'sheetImage.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SLIDE),
        // disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function UploadSlideFloatImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: InsertSlideFloatImageOperation.id,
        title: 'sheetImage.upload.float',
        type: MenuItemType.SELECTOR,
        label: {
            name: COMPONENT_UPLOAD_FILE_MENU,
            props: {
                type: UploadFileType.floatImage,
            },
        },
        positions: [IMAGE_MENU_ID],
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_SLIDE),
    };
}
