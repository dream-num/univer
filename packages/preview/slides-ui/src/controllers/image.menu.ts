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
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { InsertSlideFloatImageCommand } from '../commands/operations/insert-image.operation';

export const IMAGE_UPLOAD_ICON = 'addition-and-subtraction-single';
export const SLIDES_IMAGE_MENU_ID = 'slide.menu.image';

export function SlideImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SLIDES_IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: IMAGE_UPLOAD_ICON,
        tooltip: 'slide.image.insert.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SLIDE),
    };
}

export function UploadSlideFloatImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: InsertSlideFloatImageCommand.id,
        title: 'slide.image.insert.float',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_SLIDE),
    };
}
