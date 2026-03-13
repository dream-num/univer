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
import { AlignType, SetDrawingAlignOperation } from '../commands/operations/drawing-align.operation';

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

export const DRAWING_ALIGN_LEFT_CONTEXT_MENU_ID = 'contextMenu.drawing-align-left';
export function SetDrawingAlignLeftMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ALIGN_LEFT_CONTEXT_MENU_ID,
        commandId: SetDrawingAlignOperation.id,
        params: {
            alignType: AlignType.left,
        },
        type: MenuItemType.BUTTON,
        icon: 'LeftJustifyingIcon',
        title: 'image-panel.align.left',
    };
}

export const DRAWING_ALIGN_CENTER_CONTEXT_MENU_ID = 'contextMenu.drawing-align-center';
export function SetDrawingAlignCenterMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ALIGN_CENTER_CONTEXT_MENU_ID,
        commandId: SetDrawingAlignOperation.id,
        params: {
            alignType: AlignType.center,
        },
        type: MenuItemType.BUTTON,
        icon: 'HorizontallyIcon',
        title: 'image-panel.align.center',
    };
}

export const DRAWING_ALIGN_RIGHT_CONTEXT_MENU_ID = 'contextMenu.drawing-align-right';
export function SetDrawingAlignRightMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ALIGN_RIGHT_CONTEXT_MENU_ID,
        commandId: SetDrawingAlignOperation.id,
        params: {
            alignType: AlignType.right,
        },
        type: MenuItemType.BUTTON,
        icon: 'RightJustifyingIcon',
        title: 'image-panel.align.right',
    };
}

export const DRAWING_ALIGN_TOP_CONTEXT_MENU_ID = 'contextMenu.drawing-align-top';
export function SetDrawingAlignTopMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ALIGN_TOP_CONTEXT_MENU_ID,
        commandId: SetDrawingAlignOperation.id,
        params: {
            alignType: AlignType.top,
        },
        type: MenuItemType.BUTTON,
        icon: 'AlignTopIcon',
        title: 'image-panel.align.top',
    };
}

export const DRAWING_ALIGN_MIDDLE_CONTEXT_MENU_ID = 'contextMenu.drawing-align-middle';
export function SetDrawingAlignMiddleMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ALIGN_MIDDLE_CONTEXT_MENU_ID,
        commandId: SetDrawingAlignOperation.id,
        params: {
            alignType: AlignType.middle,
        },
        type: MenuItemType.BUTTON,
        icon: 'VerticalCenterIcon',
        title: 'image-panel.align.middle',
    };
}

export const DRAWING_ALIGN_BOTTOM_CONTEXT_MENU_ID = 'contextMenu.drawing-align-bottom';
export function SetDrawingAlignBottomMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ALIGN_BOTTOM_CONTEXT_MENU_ID,
        commandId: SetDrawingAlignOperation.id,
        params: {
            alignType: AlignType.bottom,
        },
        type: MenuItemType.BUTTON,
        icon: 'AlignBottomIcon',
        title: 'image-panel.align.bottom',
    };
}

export const DRAWING_ALIGN_HORIZON_CONTEXT_MENU_ID = 'contextMenu.drawing-align-horizon';
export function SetDrawingAlignHorizonMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ALIGN_HORIZON_CONTEXT_MENU_ID,
        commandId: SetDrawingAlignOperation.id,
        params: {
            alignType: AlignType.horizon,
        },
        type: MenuItemType.BUTTON,
        title: 'image-panel.align.horizon',
    };
}

export const DRAWING_ALIGN_VERTICAL_CONTEXT_MENU_ID = 'contextMenu.drawing-align-vertical';
export function SetDrawingAlignVerticalMenuItemFactory(): IMenuButtonItem {
    return {
        id: DRAWING_ALIGN_VERTICAL_CONTEXT_MENU_ID,
        commandId: SetDrawingAlignOperation.id,
        params: {
            alignType: AlignType.vertical,
        },
        type: MenuItemType.BUTTON,
        title: 'image-panel.align.vertical',
    };
}
