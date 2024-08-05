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
import { connectInjector, Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { AddImageSingle, GraphSingle, TextSingle } from '@univerjs/icons';
import type { MenuConfig } from '@univerjs/ui';
import { BuiltInUIPart, ComponentManager, IMenuService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { ActivateSlidePageOperation } from '../commands/operations/activate.operation';
import { DeleteSlideElementOperation } from '../commands/operations/delete-element.operation';
import { InsertSlideFloatImageOperation } from '../commands/operations/insert-image.operation';
import { InsertSlideShapeRectangleOperation, ToggleSlideEditSidebarOperation } from '../commands/operations/insert-shape.operation';
import { SlideAddTextOperation } from '../commands/operations/insert-text.operation';
import { SetSlidePageThumbOperation } from '../commands/operations/set-thumb.operation';
import { SetTextEditArrowOperation } from '../commands/operations/text-edit.operation';
import { SlideImagePopupMenu } from '../components/image-popup-menu/ImagePopupMenu';
import { COMPONENT_SLIDE_IMAGE_POPUP_MENU } from '../components/image-popup-menu/component-name';
import { UploadFileMenu } from '../components/upload-component/UploadFile';
import { COMPONENT_UPLOAD_FILE_MENU } from '../components/upload-component/component-name';
import { EditorContainer } from '../views/editor-container';
import { SlideSideBar } from '../components/slide-bar/SlideBar';
import Sidebar, { COMPONENT_SLIDE_SIDEBAR } from '../components/sidebar/Sidebar';
import { AppendSlideOperation } from '../commands/operations/append-slide.operation';
import { IMAGE_UPLOAD_ICON, SlideImageMenuFactory, UploadSlideFloatImageMenuFactory } from './image.menu';
import { GRAPH_SINGLE_ICON, SlideShapeMenuFactory, UploadSlideFloatShapeMenuFactory } from './shape.menu';
import { EditorDeleteLeftShortcut, generateArrowSelectionShortCutItem } from './shortcuts/editor.shortcuts';
import { SlideAddTextMenuItemFactory, TEXT_ICON_ID } from './text.menu';

export interface IUniverSlidesDrawingConfig {
    menu?: MenuConfig;
    override?: DependencyOverride;
}

export const DefaultSlidesDrawingConfig: IUniverSlidesDrawingConfig = {
};

/**
 * This controller registers UI parts of slide workbench to the base-ui workbench.
 */
// @OnLifecycle(LifecycleStages.Ready, SlideUIController)
export class SlideUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverSlidesDrawingConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService

    ) {
        super();

        this._initCommands();
        this._initCustomComponents();
        this._initUIComponents();
        this._initMenus();
        this._initShortcuts();
    }

    private _initMenus(): void {
        const { menu = {} } = this._config || {};

        [
            SlideAddTextMenuItemFactory,
            SlideImageMenuFactory,
            UploadSlideFloatImageMenuFactory,
            SlideShapeMenuFactory,
            UploadSlideFloatShapeMenuFactory,
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
        this.disposeWithMe(componentManager.register(COMPONENT_SLIDE_IMAGE_POPUP_MENU, SlideImagePopupMenu));
        this.disposeWithMe(componentManager.register(COMPONENT_SLIDE_SIDEBAR, Sidebar));
    }

    private _initCommands(): void {
        [
            AppendSlideOperation,
            ActivateSlidePageOperation,
            SetSlidePageThumbOperation,
            InsertSlideFloatImageOperation,
            SlideAddTextOperation,
            InsertSlideShapeRectangleOperation,
            ToggleSlideEditSidebarOperation,
            DeleteSlideElementOperation,

            //cmds for editor
            SetTextEditArrowOperation,

        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    protected _initUIComponents(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.LEFT_SIDEBAR, () => connectInjector(SlideSideBar, this._injector))
        );

        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(EditorContainer, this._injector))
        );
    }

    private _initShortcuts(): void {
        [
            EditorDeleteLeftShortcut,
            ...generateArrowSelectionShortCutItem(),
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }
}
