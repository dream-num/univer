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
import { UniverInstanceType } from '@univerjs/core';
import { ToggleShortcutPanelOperation } from '../../commands/operations/toggle-shortcut-panel.operation';
import { getMenuHiddenObservable } from '../../common/menu-hidden-observable';
import { MenuItemType } from '../../services/menu/menu';

export function ShortcutPanelMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ToggleShortcutPanelOperation.id,
        title: 'toggle-shortcut-panel',
        tooltip: 'toggle-shortcut-panel',
        icon: 'KeyboardSingle',
        type: MenuItemType.BUTTON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        // disabled$: getCurrentSheetDisabled$(accessor),
    };
}
