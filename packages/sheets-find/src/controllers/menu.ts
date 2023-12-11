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

import type { IMenuButtonItem } from '@univerjs/ui';
import { MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { ShowModalOperation } from '../commands/operations/show-modal.operation';

export function FindMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ShowModalOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'SearchIcon',
        title: 'find.findLabel',
        tooltip: 'find.findLabel',
        positions: [MenuPosition.TOOLBAR_START],
        // TODO@Dushusir disabled$ status
    };
}
