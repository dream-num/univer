/**
 * Copyright 2023 DreamNum Inc.
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

import {
    SetInlineFormatBoldCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatUnderlineCommand,
} from '@univerjs/docs';
import type { IMenuButtonItem } from '@univerjs/ui';
import { MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

// TODO @Dushusir: use for test, change id later
export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetInlineFormatBoldCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [MenuPosition.TOOLBAR_START],
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetInlineFormatItalicCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [MenuPosition.TOOLBAR_START],
    };
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetInlineFormatUnderlineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        positions: [MenuPosition.TOOLBAR_START],
    };
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetInlineFormatStrikethroughCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        positions: [MenuPosition.TOOLBAR_START],
    };
}
