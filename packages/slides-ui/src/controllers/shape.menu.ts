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
import type { IMenuButtonItem, IMenuItem } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { InsertSlideShapeEllipseCommand, InsertSlideShapeRectangleCommand } from '../commands/operations/insert-shape.operation';

export const SHAPE_MENU_ID = 'slide.menu.shape';

export function SlideShapeMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SHAPE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'GraphIcon',
        tooltip: 'slide.shape.insert.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SLIDE),
        // disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function UploadSlideFloatRectangleShapeMenuFactory(_accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertSlideShapeRectangleCommand.id,
        title: 'slide.shape.insert.rectangle',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_SLIDE),
    };
}

export function UploadSlideFloatEllipseShapeMenuFactory(_accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertSlideShapeEllipseCommand.id,
        title: 'slide.shape.insert.ellipse',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_SLIDE),
    };
}
