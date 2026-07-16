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
import {
    BottomIcon,
    CropIcon,
    DeleteIcon,
    DocSettingIcon,
    GroupIcon,
    MoveDownIcon,
    MoveUpIcon,
    TopmostIcon,
    UngroupIcon,
} from '@univerjs/icons';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { COMPONENT_IMAGE_POPUP_MENU } from '../views/image-popup-menu/component-name';
import { ImagePopupMenu } from '../views/image-popup-menu/ImagePopupMenu';

export class ComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IconManager) private readonly _iconManager: IconManager
    ) {
        super();

        this._registerComponents();
        this._registerIcons();
    }

    private _registerComponents(): void {
        ([
            [COMPONENT_IMAGE_POPUP_MENU, ImagePopupMenu],
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(key, component));
        });
    }

    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register({
            BottomIcon,
            DrawingCropIcon: CropIcon,
            DrawingDeleteIcon: DeleteIcon,
            DrawingEditIcon: DocSettingIcon,
            GroupIcon,
            MoveDownIcon,
            MoveUpIcon,
            TopmostIcon,
            UngroupIcon,
        }));
    }
}
