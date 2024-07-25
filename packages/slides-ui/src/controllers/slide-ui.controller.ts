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

import type { DependencyOverride } from '@univerjs/core';
import { connectInjector, Disposable, ICommandService, Inject, Injector, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { AddImageSingle, GraphSingle, TextSingle } from '@univerjs/icons';
import type { MenuConfig } from '@univerjs/ui';
import { BuiltInUIPart, ComponentManager, IMenuService, IUIPartsService } from '@univerjs/ui';
import { ActivateSlidePageOperation } from '../commands/operations/activate.operation';
import { InsertSlideFloatImageOperation } from '../commands/operations/insert-image.operation';
import { InsertSlideShapeRectangleOperation } from '../commands/operations/insert-shape.operation';
import { SlideAddTextOperation } from '../commands/operations/insert-text.operation';
import { SetSlidePageThumbOperation } from '../commands/operations/set-thumb.operation';
import { UploadFileMenu } from '../components/upload-component/UploadFile';
import { COMPONENT_UPLOAD_FILE_MENU } from '../components/upload-component/component-name';
import { SlideSideBar } from '../views/slide-bar/SlideBar';
import { IMAGE_UPLOAD_ICON, SlideImageMenuFactory, UploadSlideFloatImageMenuFactory } from './image.menu';
import { GRAPH_SINGLE_ICON, SlideShapeMenuFactory, UploadSlideFloatShapeMenuFactory } from './shape.menu';
import { AddTextMenuItemFactory, TEXT_ICON_ID } from './text.menu';

export interface IUniverSlidesDrawingConfig {
    menu?: MenuConfig;
    overrides?: DependencyOverride;
}

export const DefaultSlidesDrawingConfig: IUniverSlidesDrawingConfig = {
};

/**
 * This controller registers UI parts of slide workbench to the base-ui workbench.
 */
@OnLifecycle(LifecycleStages.Ready, SlideUIController)
export class SlideUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverSlidesDrawingConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initCommands();
        this._initCustomComponents();
        this._initUIComponents();
        this._initMenus();
    }

    private _initMenus(): void {
        const { menu = {} } = this._config;

        [
            SlideImageMenuFactory,
            UploadSlideFloatImageMenuFactory,
            SlideShapeMenuFactory,
            UploadSlideFloatShapeMenuFactory,
            AddTextMenuItemFactory,
        ].forEach((menuFactory) => {
            this._menuService.addMenuItem(menuFactory(this._injector), menu);
        });
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(IMAGE_UPLOAD_ICON, AddImageSingle));
        this.disposeWithMe(componentManager.register(TEXT_ICON_ID, TextSingle));
        this.disposeWithMe(componentManager.register(GRAPH_SINGLE_ICON, GraphSingle));
        this.disposeWithMe(componentManager.register(COMPONENT_UPLOAD_FILE_MENU, UploadFileMenu));
        // this.disposeWithMe(componentManager.register(COMPONENT_SHEET_DRAWING_PANEL, SheetDrawingPanel));
    }

    private _initCommands(): void {
        [
            ActivateSlidePageOperation,
            SetSlidePageThumbOperation,
            InsertSlideFloatImageOperation,
            SlideAddTextOperation,
            InsertSlideShapeRectangleOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initUIComponents(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.LEFT_SIDEBAR, () => connectInjector(SlideSideBar, this._injector))
        );
    }
}
