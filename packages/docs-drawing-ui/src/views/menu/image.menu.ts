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
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

import { combineLatest, Observable } from 'rxjs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { InsertDocImageOperation } from '../../commands/operations/insert-image.operation';
import { COMPONENT_DOC_UPLOAD_FILE_MENU } from '../upload-component/component-name';

export const ImageUploadIcon = 'addition-and-subtraction-single';
const IMAGE_MENU_ID = 'doc.menu.image';

// TODO: @Jocs hide image menu in header and footer active.
function getHeaderFooterImageMenuHiddenObservable(
    accessor: IAccessor
): Observable<boolean> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const renderManagerService = accessor.get(IRenderManagerService);

    return new Observable((subscriber) => {
        const subscription = univerInstanceService.focused$.subscribe((unitId) => {
            if (unitId == null) {
                return subscriber.next(true);
            }
            const currentRender = renderManagerService.getRenderById(unitId);
            if (currentRender == null) {
                return subscriber.next(true);
            }

            const viewModel = currentRender.with(DocSkeletonManagerService).getViewModel();

            viewModel.editAreaChange$.subscribe((editArea) => {
                subscriber.next(editArea === DocumentEditArea.HEADER || editArea === DocumentEditArea.FOOTER);
            });
        });

        const currentRender = renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_DOC);
        if (currentRender == null) {
            return subscriber.next(true);
        }

        const viewModel = currentRender.with(DocSkeletonManagerService).getViewModel();

        subscriber.next(viewModel.getEditArea() !== DocumentEditArea.BODY);

        return () => subscription.unsubscribe();
    });
}

export function ImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_LAYOUT,
        icon: ImageUploadIcon,
        tooltip: 'docImage.title',
        hidden$: combineLatest(getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC), getHeaderFooterImageMenuHiddenObservable(accessor), (one, two) => {
            return one || two;
        }),
    };
}

export function UploadFloatImageMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: InsertDocImageOperation.id,
        title: 'docImage.upload.float',
        type: MenuItemType.SELECTOR,
        label: {
            name: COMPONENT_DOC_UPLOAD_FILE_MENU,
        },
        positions: [IMAGE_MENU_ID],
        hidden$: getMenuHiddenObservable(_accessor, UniverInstanceType.UNIVER_DOC),
    };
}
