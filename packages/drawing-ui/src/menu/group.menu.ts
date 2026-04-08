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
import { DrawingTypeEnum } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import { CancelDrawingGroupOperation, DRAWING_GROUP_TYPES, SetDrawingGroupOperation } from '../commands/operations/drawing-group.operation';

const getMenuStateByDrawingFocusChangedObservable$ = (accessor: IAccessor, type?: 'group' | 'unGroup'): Observable<boolean> => {
    const drawingManagerService = accessor.get(IDrawingManagerService);

    return new Observable((subscriber) => {
        const update = (drawings: IDrawingParam[]) => {
            if (!drawings || drawings.length === 0) {
                return subscriber.next(true);
            }

            if (type === 'group') {
                // If there are less than 2 drawings that can be grouped, disable the group button
                if (drawings.length < 2) {
                    return subscriber.next(true);
                }

                if (!drawings.every((drawing) => DRAWING_GROUP_TYPES.includes(drawing.drawingType))) {
                    return subscriber.next(true);
                }
            } else if (type === 'unGroup') {
                // If there are no groups, disable the unGroup button
                const groups = drawings.filter((drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_GROUP);

                if (groups.length === 0) {
                    return subscriber.next(true);
                }
            } else {
                // If there are drawings that cannot be grouped or ungrouped, hide the context menu
                if (!drawings.every((drawing) => DRAWING_GROUP_TYPES.includes(drawing.drawingType))) {
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
        icon: 'GroupIcon',
        title: 'image-panel.group.title',
        hidden$: getMenuStateByDrawingFocusChangedObservable$(accessor),
    };
}

export function SetDrawingGroupMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetDrawingGroupOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'GroupIcon',
        title: 'image-panel.group.group',
        disabled$: getMenuStateByDrawingFocusChangedObservable$(accessor, 'group'),
    };
}

export function CancelDrawingGroupMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CancelDrawingGroupOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'UngroupIcon',
        title: 'image-panel.group.unGroup',
        disabled$: getMenuStateByDrawingFocusChangedObservable$(accessor, 'unGroup'),
    };
}
