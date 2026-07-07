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

import { Disposable, Inject } from '@univerjs/core';
import { ColorPicker } from '@univerjs/design';
import { IncreaseIcon, MoreDownIcon, RedoIcon, ReduceIcon, ShortcutIcon, UndoIcon } from '@univerjs/icons';
import { ShortcutPanelComponentName } from '../commands/operations/toggle-shortcut-panel.operation';
import { ComponentManager, IconManager } from '../common';
import { COLOR_PICKER_COMPONENT } from '../views/color-picker/interface';
import { COMMON_LABEL_COMPONENT, CommonLabel } from '../views/CommonLabel';
import { ShortcutPanel } from '../views/components/shortcut-panel/ShortcutPanel';
import { EMOJI_PICKER_COMPONENT, EmojiPicker } from '../views/emoji-picker/index';
import {
    FONT_FAMILY_COMPONENT,
    FONT_FAMILY_ITEM_COMPONENT,
    FontFamily,
    FontFamilyItem,
} from '../views/font-family/index';
import { FontSize } from '../views/font-size/FontSize';
import { FONT_SIZE_COMPONENT } from '../views/font-size/interface';
import { HEADING_ITEM_COMPONENT, HeadingItem } from '../views/index';

export class ComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IconManager) private readonly _iconManager: IconManager
    ) {
        super();

        this._registerIcons();
        this._registerComponents();
    }

    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register({
            IncreaseIcon,
            MoreDownIcon,
            RedoIcon,
            ReduceIcon,
            ShortcutIcon,
            UndoIcon,
        }));
    }

    private _registerComponents(): void {
        ([
            [COMMON_LABEL_COMPONENT, CommonLabel],
            [HEADING_ITEM_COMPONENT, HeadingItem],
            [FONT_FAMILY_COMPONENT, FontFamily],
            [FONT_FAMILY_ITEM_COMPONENT, FontFamilyItem],
            [FONT_SIZE_COMPONENT, FontSize],
            [COLOR_PICKER_COMPONENT, ColorPicker],
            [EMOJI_PICKER_COMPONENT, EmojiPicker],
        ] as const).forEach(([key, comp]) => {
            this.disposeWithMe(
                this._componentManager.register(key, comp)
            );
        });

        // register the panel
        this.disposeWithMe(this._componentManager.register(ShortcutPanelComponentName, ShortcutPanel));
    }
}
