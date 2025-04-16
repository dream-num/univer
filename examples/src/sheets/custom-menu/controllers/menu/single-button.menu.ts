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

import type { IMenuButtonItem } from '@univerjs/ui';
import { MenuItemType } from '@univerjs/ui';
import { SingleButtonOperation } from '../../commands/operations/single-button.operation';

export function CustomMenuItemSingleButtonFactory(): IMenuButtonItem<string> {
    return {
        // Bind the command id, clicking the button will trigger this command
        id: SingleButtonOperation.id,
        // The type of the menu item, in this case, it is a button
        type: MenuItemType.BUTTON,
        // The icon of the button, which needs to be registered in ComponentManager
        icon: 'ButtonIcon',
        // The tooltip of the button. Prioritize matching internationalization. If no match is found, the original string will be displayed
        tooltip: 'customMenu.singleButton',
        // The title of the button. Prioritize matching internationalization. If no match is found, the original string will be displayed
        title: 'customMenu.button',
    };
}
