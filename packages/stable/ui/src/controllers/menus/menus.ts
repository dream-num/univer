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
import type { IMenuButtonItem } from '../../services/menu/menu';
import { EDITOR_ACTIVATED, FOCUSING_FX_BAR_EDITOR, IContextService, IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';

import { combineLatest, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenuItemType } from '../../services/menu/menu';

const undoRedoDisableFactory$ = (accessor: IAccessor, isUndo: boolean) => {
    const undoRedoService = accessor.get(IUndoRedoService);
    const contextService = accessor.get(IContextService);

    return combineLatest([
        undoRedoService.undoRedoStatus$.pipe(map((v) => isUndo ? v.undos <= 0 : v.redos <= 0)),
        merge([of({}), contextService.contextChanged$]),
    ]).pipe(map(([undoDisable]) => {
        return undoDisable || contextService.getContextValue(EDITOR_ACTIVATED) || contextService.getContextValue(FOCUSING_FX_BAR_EDITOR);
    }));
};

export function UndoMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UndoCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UndoSingle',
        title: 'Undo',
        tooltip: 'toolbar.undo',
        disabled$: undoRedoDisableFactory$(accessor, true),
    };
}

export function RedoMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: RedoCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'RedoSingle',
        title: 'Redo',
        tooltip: 'toolbar.redo',
        disabled$: undoRedoDisableFactory$(accessor, false),
    };
}
