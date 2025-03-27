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
import { DOCS_ZEN_EDITOR_UNIT_ID_KEY, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

import { DocSelectionManagerService } from '@univerjs/docs';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import { InsertDocImageCommand } from '../../commands/commands/insert-image.command';

export const ImageUploadIcon = 'addition-and-subtraction-single';
export const DOCS_IMAGE_MENU_ID = 'doc.menu.image';
export const IMAGE_MENU_UPLOAD_FLOAT_ID = InsertDocImageCommand.id;

// TODO: @Jocs, remove this when cell support drawing.
const getDisableWhenSelectionInTableObservable = (accessor: IAccessor) => {
    const docSelectionManagerService = accessor.get(DocSelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return new Observable<boolean>((subscriber) => {
        const observable = docSelectionManagerService.textSelection$.subscribe(() => {
            const activeRange = docSelectionManagerService.getActiveTextRange();

            if (activeRange) {
                const { segmentId, startOffset, endOffset } = activeRange;
                const docDataModel = univerInstanceService.getCurrentUniverDocInstance();
                const tables = docDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody()?.tables;

                if (tables && tables.length) {
                    if (tables.some((table) => {
                        const { startIndex, endIndex } = table;
                        return (startOffset >= startIndex && startOffset < endIndex) || (endOffset >= startIndex && endOffset < endIndex);
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
        id: DOCS_IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: ImageUploadIcon,
        tooltip: 'docImage.title',
        disabled$: getDisableWhenSelectionInTableObservable(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    };
}

export function UploadFloatImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: IMAGE_MENU_UPLOAD_FLOAT_ID,
        title: 'docImage.upload.float',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_DOC, undefined, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
    };
}
