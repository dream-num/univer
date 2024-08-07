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
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IAccessor } from '@univerjs/core';

import { TextSelectionManagerService } from '@univerjs/docs';
import { Observable } from 'rxjs';
import { COMPONENT_DOC_UPLOAD_FILE_MENU } from '../upload-component/component-name';

export const ImageUploadIcon = 'addition-and-subtraction-single';
export const IMAGE_MENU_ID = 'doc.menu.image';
const IMAGE_MENU_UPLOAD_FLOAT_ID = 'doc.menu.image.upload.float';

// TODO: @Jocs, remove this when cell support drawing.
const getDisableWhenSelectionInTableObservable = (accessor: IAccessor) => {
    const textSelectionManagerService = accessor.get(TextSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable<boolean>((subscriber) => {
        const observable = textSelectionManagerService.textSelection$.subscribe(() => {
            const activeRange = textSelectionManagerService.getActiveTextRangeWithStyle();

            if (activeRange) {
                const { segmentId, startOffset, endOffset } = activeRange;
                const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
                const tables = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody()?.tables;

                if (tables && tables.length) {
                    if (tables.some((table) => {
                        const { startIndex, endIndex } = table;
                        return (startOffset >= startIndex && startOffset <= endIndex) || (endOffset >= startIndex && endOffset <= endIndex);
                    })) {
                        subscriber.next(true);
                        return;
                    }
                }
            } else {
                subscriber.next(true);
                return;
            }

            subscriber.next(false);
        });

        return () => observable.unsubscribe();
    });
};

export function ImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_LAYOUT,
        icon: ImageUploadIcon,
        tooltip: 'docImage.title',
        disabled$: getDisableWhenSelectionInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function UploadFloatImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: IMAGE_MENU_UPLOAD_FLOAT_ID,
        title: 'docImage.upload.float',
        type: MenuItemType.SELECTOR,
        label: {
            name: COMPONENT_DOC_UPLOAD_FILE_MENU,
        },
        positions: [IMAGE_MENU_ID],
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_DOC),
    };
}
