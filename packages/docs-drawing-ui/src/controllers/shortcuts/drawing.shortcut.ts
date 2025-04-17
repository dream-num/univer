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

import type { IContextService } from '@univerjs/core';
import type { IShortcutItem } from '@univerjs/ui';
import type { IMoveDrawingsCommandParams } from '../../commands/commands/move-drawings.command';
import { Direction, FOCUSING_COMMON_DRAWINGS, FOCUSING_UNIVER_EDITOR } from '@univerjs/core';
import { KeyCode } from '@univerjs/ui';
import { DeleteDocDrawingsCommand } from '../../commands/commands/delete-doc-drawing.command';
import { MoveDocDrawingsCommand } from '../../commands/commands/move-drawings.command';

export function whenDocDrawingFocused(contextService: IContextService): boolean {
    return (
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        contextService.getContextValue(FOCUSING_COMMON_DRAWINGS)
    );
}

export const MoveDrawingDownShortcutItem: IShortcutItem<IMoveDrawingsCommandParams> = {
    id: MoveDocDrawingsCommand.id,
    description: 'shortcut.drawing-move-down',
    group: '4_drawing-view',
    binding: KeyCode.ARROW_DOWN,
    priority: 100,
    preconditions: whenDocDrawingFocused,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveDrawingUpShortcutItem: IShortcutItem<IMoveDrawingsCommandParams> = {
    id: MoveDocDrawingsCommand.id,
    description: 'shortcut.drawing-move-up',
    group: '4_drawing-view',
    binding: KeyCode.ARROW_UP,
    priority: 100,
    preconditions: whenDocDrawingFocused,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveDrawingLeftShortcutItem: IShortcutItem<IMoveDrawingsCommandParams> = {
    id: MoveDocDrawingsCommand.id,
    description: 'shortcut.drawing-move-left',
    group: '4_drawing-view',
    binding: KeyCode.ARROW_LEFT,
    priority: 100,
    preconditions: whenDocDrawingFocused,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveDrawingRightShortcutItem: IShortcutItem<IMoveDrawingsCommandParams> = {
    id: MoveDocDrawingsCommand.id,
    description: 'shortcut.drawing-move-right',
    group: '4_drawing-view',
    binding: KeyCode.ARROW_RIGHT,
    priority: 100,
    preconditions: whenDocDrawingFocused,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};
export const DeleteDrawingsShortcutItem: IShortcutItem = {
    id: DeleteDocDrawingsCommand.id,
    description: 'shortcut.drawing-delete',
    group: '4_drawing-view',
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: whenDocDrawingFocused,
    binding: KeyCode.DELETE,
    mac: KeyCode.BACKSPACE,
};
