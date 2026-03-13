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
import { IDrawingManagerService } from '@univerjs/drawing';
import { MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import {
    SetDrawingAlignBottomOperation,
    SetDrawingAlignCenterOperation,
    SetDrawingAlignHorizonOperation,
    SetDrawingAlignLeftOperation,
    SetDrawingAlignMiddleOperation,
    SetDrawingAlignRightOperation,
    SetDrawingAlignTopOperation,
    SetDrawingAlignVerticalOperation,
} from '../commands/operations/drawing-align.operation';

const getMenuStateByDrawingFocusChangedObservable$ = (accessor: IAccessor): Observable<boolean> => {
    const drawingManagerService = accessor.get(IDrawingManagerService);

    return new Observable((subscriber) => {
        const update = (drawings: IDrawingParam[]) => {
            if (!drawings || drawings.length === 0) {
                return subscriber.next(true);
            }

            if (drawings.length < 2) {
                return subscriber.next(true);
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

export const DRAWING_ALIGN_CONTEXT_MENU_ID = 'contextMenu.drawing-align';
export function DrawingAlignContextMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: DRAWING_ALIGN_CONTEXT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'HorizontallyIcon',
        title: 'image-panel.align.title',
        hidden$: getMenuStateByDrawingFocusChangedObservable$(accessor),
    };
}

export function SetDrawingAlignLeftMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetDrawingAlignLeftOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'LeftJustifyingIcon',
        title: 'image-panel.align.left',
    };
}

export function SetDrawingAlignCenterMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetDrawingAlignCenterOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'HorizontallyIcon',
        title: 'image-panel.align.center',
    };
}

export function SetDrawingAlignRightMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetDrawingAlignRightOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'RightJustifyingIcon',
        title: 'image-panel.align.right',
    };
}

export function SetDrawingAlignTopMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetDrawingAlignTopOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'AlignTopIcon',
        title: 'image-panel.align.top',
    };
}

export function SetDrawingAlignMiddleMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetDrawingAlignMiddleOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'VerticalCenterIcon',
        title: 'image-panel.align.middle',
    };
}

export function SetDrawingAlignBottomMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetDrawingAlignBottomOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'AlignBottomIcon',
        title: 'image-panel.align.bottom',
    };
}

export function SetDrawingAlignHorizonMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetDrawingAlignHorizonOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'HorizontallyIcon',
        title: 'image-panel.align.horizon',
    };
}

export function SetDrawingAlignVerticalMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetDrawingAlignVerticalOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'VerticalCenterIcon',
        title: 'image-panel.align.vertical',
    };
}
