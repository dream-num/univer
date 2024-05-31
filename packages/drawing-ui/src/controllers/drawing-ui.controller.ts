/**
 * Copyright 2023-present DreamNum Inc.
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

import { Disposable, ICommandService, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { COMPONENT_IMAGE_POPUP_MENU } from '../views/image-popup-menu/component-name';
import { ImagePopupMenu } from '../views/image-popup-menu/ImagePopupMenu';
import { AutoImageCropOperation, CloseImageCropOperation, OpenImageCropOperation } from '../commands/operations/image-crop.operation';
import { ImageViewer } from '../views/image-viewer/ImageViewer';
import { COMPONENT_IMAGE_VIEWER } from '../views/image-viewer/component-name';
import { ImageResetSizeOperation } from '../commands/operations/image-reset-size.operation';
import { SetDrawingAlignOperation } from '../commands/operations/drawing-align.operation';

@OnLifecycle(LifecycleStages.Rendered, DrawingUIController)
export class DrawingUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._init();
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(COMPONENT_IMAGE_POPUP_MENU, ImagePopupMenu));
        this.disposeWithMe(componentManager.register(COMPONENT_IMAGE_VIEWER, ImageViewer));
    }

    private _initMenus(): void {
        // init menus
        // (
        //     [

        //     ] as IMenuItemFactory[]
        // ).forEach((factory) => {
        //     this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        // });
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
        this._initMenus();
    }
}
