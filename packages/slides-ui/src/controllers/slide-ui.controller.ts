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

import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { AddImageSingle, GraphSingle, TextSingle } from '@univerjs/icons';
import { BuiltInUIPart, ComponentManager, connectInjector, IMenuManagerService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { ActivateSlidePageOperation } from '../commands/operations/activate.operation';
import { AppendSlideOperation } from '../commands/operations/append-slide.operation';
import { DeleteSlideElementOperation } from '../commands/operations/delete-element.operation';
import { InsertSlideFloatImageCommand } from '../commands/operations/insert-image.operation';
import { InsertSlideShapeRectangleCommand, InsertSlideShapeRectangleOperation, ToggleSlideEditSidebarOperation } from '../commands/operations/insert-shape.operation';
import { SlideAddTextCommand, SlideAddTextOperation } from '../commands/operations/insert-text.operation';
import { SetSlidePageThumbOperation } from '../commands/operations/set-thumb.operation';
import { SetTextEditArrowOperation } from '../commands/operations/text-edit.operation';
import { UpdateSlideElementOperation } from '../commands/operations/update-element.operation';
import { COMPONENT_SLIDE_IMAGE_POPUP_MENU } from '../components/image-popup-menu/component-name';
import { SlideImagePopupMenu } from '../components/image-popup-menu/ImagePopupMenu';
import Sidebar, { COMPONENT_SLIDE_SIDEBAR } from '../components/sidebar/Sidebar';
import { SlideSideBar } from '../components/slide-bar/SlideBar';
import { SlideEditorContainer } from '../views/editor-container';
import { IMAGE_UPLOAD_ICON } from './image.menu';
import { menuSchema } from './menu.schema';
import { GRAPH_SINGLE_ICON } from './shape.menu';
import { EditorDeleteLeftShortcut, generateArrowSelectionShortCutItem } from './shortcuts/editor.shortcuts';
import { TEXT_ICON_ID } from './text.menu';

/**
 * This controller registers UI parts of slide workbench to the base-ui workbench.
 */
export class SlidesUIController extends Disposable {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @ICommandService protected readonly _commandService: ICommandService,
        @IShortcutService protected readonly _shortcutService: IShortcutService
    ) {
        super();

        this._initCommands();
        this._initCustomComponents();
        this._initUIComponents();
        this._initMenus();
        this._initShortcuts();
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(IMAGE_UPLOAD_ICON, AddImageSingle));
        this.disposeWithMe(componentManager.register(TEXT_ICON_ID, TextSingle));
        this.disposeWithMe(componentManager.register(GRAPH_SINGLE_ICON, GraphSingle));
        this.disposeWithMe(componentManager.register(COMPONENT_SLIDE_IMAGE_POPUP_MENU, SlideImagePopupMenu));
        this.disposeWithMe(componentManager.register(COMPONENT_SLIDE_SIDEBAR, Sidebar));
    }

    private _initCommands(): void {
        [
            AppendSlideOperation,
            ActivateSlidePageOperation,
            SetSlidePageThumbOperation,
            InsertSlideFloatImageCommand,
            SlideAddTextOperation,
            SlideAddTextCommand,
            InsertSlideShapeRectangleOperation,
            InsertSlideShapeRectangleCommand,
            ToggleSlideEditSidebarOperation,
            DeleteSlideElementOperation,
            UpdateSlideElementOperation,

            // commands for editor
            SetTextEditArrowOperation,

        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    protected _initUIComponents(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.LEFT_SIDEBAR, () => connectInjector(SlideSideBar, this._injector))
        );

        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(SlideEditorContainer, this._injector))
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
