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

import { Disposable, ICommandService, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IMenuItemFactory } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { AdditionAndSubtractionSingle, Insert } from '@univerjs/icons';
import { UploadFileMenu } from '../views/upload-component/UploadFile';
import { COMPONENT_UPLOAD_FILE_MENU } from '../views/upload-component/component-name';
import { ImageMenuFactory, ImageUploadIcon, UploadCellImageMenuFactory, UploadFloatImageMenuFactory } from '../views/menu/image.menu';
import { InsertCellImageOperation, InsertFloatImageOperation } from '../commands/operations/insert-image.operation';
import { InsertSheetImageCommand } from '../commands/commands/insert-sheet-image.command';
import { RemoveSheetImageCommand } from '../commands/commands/remove-sheet-image.command';
import { SetSheetImageCommand } from '../commands/commands/set-sheet-image.command';
import { COMPONENT_SHEET_IMAGE_PANEL } from '../views/sheet-image-panel/component-name';
import { SheetImagePanel } from '../views/sheet-image-panel/SheetImagePanel';
import { SidebarSheetImageOperation } from '../commands/operations/open-image-panel.operation';
import { ClearSheetDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';

@OnLifecycle(LifecycleStages.Rendered, SheetImageUIController)
export class SheetImageUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(ImageUploadIcon, AdditionAndSubtractionSingle));
        this.disposeWithMe(componentManager.register(COMPONENT_UPLOAD_FILE_MENU, UploadFileMenu));
        this.disposeWithMe(componentManager.register(COMPONENT_SHEET_IMAGE_PANEL, SheetImagePanel));
    }

    private _initMenus(): void {
        // init menus
        (
            [
                ImageMenuFactory,
                UploadFloatImageMenuFactory,
                UploadCellImageMenuFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _initCommands() {
        [
            InsertFloatImageOperation,
            InsertCellImageOperation,
            InsertSheetImageCommand,
            RemoveSheetImageCommand,
            SetSheetImageCommand,
            SidebarSheetImageOperation,
            ClearSheetDrawingTransformerOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _init(): void {
        this._initCommands();
        this._initCustomComponents();
        this._initMenus();
    }
}
