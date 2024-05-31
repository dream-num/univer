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
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService, IShortcutService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { AddImageSingle } from '@univerjs/icons';
import { UploadFileMenu } from '../views/upload-component/UploadFile';
import { COMPONENT_UPLOAD_FILE_MENU } from '../views/upload-component/component-name';
import { IMAGE_UPLOAD_ICON, ImageMenuFactory, UploadFloatImageMenuFactory } from '../views/menu/image.menu';
import { InsertCellImageOperation, InsertFloatImageOperation } from '../commands/operations/insert-image.operation';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';
import { RemoveSheetDrawingCommand } from '../commands/commands/remove-sheet-drawing.command';
import { SetSheetDrawingCommand } from '../commands/commands/set-sheet-drawing.command';
import { COMPONENT_SHEET_DRAWING_PANEL } from '../views/sheet-image-panel/component-name';
import { SheetDrawingPanel } from '../views/sheet-image-panel/SheetDrawingPanel';

import { ClearSheetDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';
import { EditSheetDrawingOperation } from '../commands/operations/edit-sheet-drawing.operation';
import { GroupSheetDrawingCommand } from '../commands/commands/group-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../commands/commands/ungroup-sheet-drawing.command';
import { SidebarSheetDrawingOperation } from '../commands/operations/open-drawing-panel.operation';
import { MoveDrawingsCommand } from '../commands/commands/move-drawings.command';
import { DeleteDrawingsCommand } from '../commands/commands/delete-drawings.command';
import { SetDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { DeleteDrawingsShortcutItem, MoveDrawingDownShortcutItem, MoveDrawingLeftShortcutItem, MoveDrawingRightShortcutItem, MoveDrawingUpShortcutItem } from './shortcuts/drawing.shortcut';

export interface IUniverSheetsDrawingConfig {
    menu?: MenuConfig;
    overrides?: DependencyOverride;
}

export const DefaultSheetsDrawingConfig: IUniverSheetsDrawingConfig = {

};

@OnLifecycle(LifecycleStages.Rendered, SheetDrawingUIController)
export class SheetDrawingUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverSheetsDrawingConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        this._init();
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(IMAGE_UPLOAD_ICON, AddImageSingle));
        this.disposeWithMe(componentManager.register(COMPONENT_UPLOAD_FILE_MENU, UploadFileMenu));
        this.disposeWithMe(componentManager.register(COMPONENT_SHEET_DRAWING_PANEL, SheetDrawingPanel));
    }

    private _initMenus(): void {
        const { menu = {} } = this._config;
        // init menus
        [
            ImageMenuFactory,
            UploadFloatImageMenuFactory,
            // UploadCellImageMenuFactory,
        ].forEach((menuFactory) => {
            this._menuService.addMenuItem(menuFactory(this._injector), menu);
        });
    }

    private _initCommands() {
        [
            InsertFloatImageOperation,
            InsertCellImageOperation,
            InsertSheetDrawingCommand,
            RemoveSheetDrawingCommand,
            SetSheetDrawingCommand,
            SidebarSheetDrawingOperation,
            ClearSheetDrawingTransformerOperation,
            EditSheetDrawingOperation,
            GroupSheetDrawingCommand,
            UngroupSheetDrawingCommand,
            MoveDrawingsCommand,
            DeleteDrawingsCommand,
            SetDrawingArrangeCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initShortcuts(): void {
        [
            // sheet drawing shortcuts
            MoveDrawingDownShortcutItem,
            MoveDrawingUpShortcutItem,
            MoveDrawingLeftShortcutItem,
            MoveDrawingRightShortcutItem,
            DeleteDrawingsShortcutItem,
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }

    private _init(): void {
        this._initCommands();
        this._initCustomComponents();
        this._initMenus();
        this._initShortcuts();
    }
}
