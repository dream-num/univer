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

import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { ComponentManager } from '@univerjs/ui';
import { SetDrawingAlignOperation } from '../commands/operations/drawing-align.operation';
import { AutoImageCropOperation, CloseImageCropOperation, OpenImageCropOperation } from '../commands/operations/image-crop.operation';
import { ImageResetSizeOperation } from '../commands/operations/image-reset-size.operation';
import { COMPONENT_IMAGE_POPUP_MENU } from '../views/image-popup-menu/component-name';
import { ImagePopupMenu } from '../views/image-popup-menu/ImagePopupMenu';

export class DrawingUIController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(COMPONENT_IMAGE_POPUP_MENU, ImagePopupMenu));
    }

    private _initCommands() {
        [
            OpenImageCropOperation,
            CloseImageCropOperation,
            ImageResetSizeOperation,
            SetDrawingAlignOperation,
            AutoImageCropOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _init(): void {
        this._initCommands();
        this._initCustomComponents();
    }
}
