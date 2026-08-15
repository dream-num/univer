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

import { Disposable, DrawingTypeEnum, ICommandService, Inject } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IMenuManagerService, IShortcutService, ISidebarService } from '@univerjs/ui';
import { DeleteDrawingsCommand } from '../commands/commands/delete-drawings.command';
import { FlipSheetDrawingCommand } from '../commands/commands/flip-drawings.command';
import { GroupSheetDrawingCommand } from '../commands/commands/group-sheet-drawing.command';
import { InsertCellImageCommand, InsertFloatImageCommand } from '../commands/commands/insert-image.command';
import { MoveDrawingsCommand } from '../commands/commands/move-drawings.command';
import { SaveCellImagesCommand } from '../commands/commands/save-cell-images.command';
import { UngroupSheetDrawingCommand } from '../commands/commands/ungroup-sheet-drawing.command';
import { EditSheetDrawingOperation } from '../commands/operations/edit-sheet-drawing.operation';
import { SidebarSheetDrawingOperation } from '../commands/operations/open-drawing-panel.operation';
import { menuSchema } from '../menu/schema';
import { COMPONENT_SHEET_DRAWING_PANEL } from '../views/sheet-image-panel/component-name';
import {
    DeleteDrawingsShortcutItem,
    MoveDrawingDownShortcutItem,
    MoveDrawingLeftShortcutItem,
    MoveDrawingRightShortcutItem,
    MoveDrawingUpShortcutItem,
} from './shortcuts/drawing.shortcut';

export class SheetDrawingUIController extends Disposable {
    constructor(
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(ISidebarService) private readonly _sidebarService: ISidebarService
    ) {
        super();

        this._init();
    }

    private _initCustomComponents(): void {
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initCommands() {
        [
            InsertFloatImageCommand,
            InsertCellImageCommand,
            SidebarSheetDrawingOperation,
            EditSheetDrawingOperation,
            GroupSheetDrawingCommand,
            UngroupSheetDrawingCommand,
            MoveDrawingsCommand,
            DeleteDrawingsCommand,
            SaveCellImagesCommand,
            FlipSheetDrawingCommand,
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

    private _initImagePanel(): void {
        this.disposeWithMe(this._drawingManagerService.focus$.subscribe((drawings) => {
            if (!this._sidebarService.visible || this._sidebarService.options.id !== COMPONENT_SHEET_DRAWING_PANEL) {
                return;
            }

            if (drawings.length === 1 && drawings[0].drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
                return;
            }

            this._sidebarService.close(COMPONENT_SHEET_DRAWING_PANEL);
        }));
    }

    private _init(): void {
        this._initCommands();
        this._initCustomComponents();
        this._initMenus();
        this._initShortcuts();
        this._initImagePanel();
    }
}
