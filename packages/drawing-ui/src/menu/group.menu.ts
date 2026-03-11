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

import type { IAccessor, IDrawingParam } from '@univerjs/core';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { DrawingTypeEnum, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map, Observable } from 'rxjs';
import { CancelDrawingGroupOperation, SetDrawingGroupOperation } from '../commands/operations/drawing-group.operation';

const getMenuStateByDrawingFocusChangedObservable$ = (accessor: IAccessor, type?: 'group' | 'unGroup'): Observable<boolean> => {
    const drawingManagerService = accessor.get(IDrawingManagerService);

    return new Observable((subscriber) => {
        const update = (drawings: IDrawingParam[]) => {
            if (!drawings || drawings.length === 0) {
                return subscriber.next(true);
            }

            if (type === 'group') {
                const shapes = drawings.filter((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_SHAPE || drawing.drawingType === DrawingTypeEnum.DRAWING_GROUP);

                // If there are less than 2 shapes or groups, disable the group button
                if (shapes.length < 2) {
                    return subscriber.next(true);
                }
            } else if (type === 'unGroup') {
                const groups = drawings.filter((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_GROUP);

                // If there are no groups, disable the unGroup button
                if (groups.length === 0) {
                    return subscriber.next(true);
                }
            } else {
                const shapes = drawings.filter((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_SHAPE || drawing.drawingType === DrawingTypeEnum.DRAWING_GROUP);

                // If there are no shapes or groups, hide the context menu
                if (shapes.length === 0) {
                    return subscriber.next(true);
                }
            }

            subscriber.next(false);
        };

        const subscription = drawingManagerService.focus$.subscribe((drawings) => {
            if (!drawings || drawings.length === 0) {
                return subscriber.next(true);
            }

            update(drawings);
        });

        update(drawingManagerService.getFocusDrawings());

        return () => subscription.unsubscribe();
    });
};

export const DRAWING_GROUP_CONTEXT_MENU_ID = 'contextMenu.drawing-group';
export function DrawingGroupContextMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: DRAWING_GROUP_CONTEXT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'image-panel.group.title',
        icon: 'PipingIcon',
        hidden$: combineLatest([getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET), getMenuStateByDrawingFocusChangedObservable$(accessor)]).pipe(
            map(([menuHidden, selectionHidden]) => menuHidden || selectionHidden)
        ),
    };
}

export function SetDrawingGroupMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetDrawingGroupOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'ClearFormatDoubleIcon',
        title: 'image-panel.group.group',
        disabled$: getMenuStateByDrawingFocusChangedObservable$(accessor, 'group'),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CancelDrawingGroupMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CancelDrawingGroupOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'ClearFormatDoubleIcon',
        title: 'image-panel.group.unGroup',
        disabled$: getMenuStateByDrawingFocusChangedObservable$(accessor, 'unGroup'),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
