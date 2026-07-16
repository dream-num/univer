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

import { Disposable, ICommandService } from '@univerjs/core';
import { IMenuManagerService, IShortcutService } from '@univerjs/ui';
import { DeleteDocDrawingsCommand } from '../commands/commands/delete-doc-drawing.command';
import { GroupDocDrawingCommand } from '../commands/commands/group-doc-drawing.command';
import { InsertDocImageCommand } from '../commands/commands/insert-image.command';
import { InsertDocEllipseShapeCommand, InsertDocRectangleShapeCommand } from '../commands/commands/insert-shape.command';
import { MoveDocDrawingsCommand } from '../commands/commands/move-drawings.command';
import { UngroupDocDrawingCommand } from '../commands/commands/ungroup-doc-drawing.command';
import {
    IMoveInlineDrawingCommand,
    ITransformNonInlineDrawingCommand,
    UpdateDocDrawingDistanceCommand,
    UpdateDocDrawingWrapTextCommand,
} from '../commands/commands/update-doc-drawing.command';
import { ClearDocDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';
import { EditDocDrawingOperation } from '../commands/operations/edit-doc-drawing.operation';
import { SidebarDocDrawingOperation } from '../commands/operations/open-drawing-panel.operation';
import { menuSchema } from '../menu/schema';
import {
    DeleteDrawingsShortcutItem,
    MoveDrawingDownShortcutItem,
    MoveDrawingLeftShortcutItem,
    MoveDrawingRightShortcutItem,
    MoveDrawingUpShortcutItem,
} from './shortcuts/drawing.shortcut';

export class DocDrawingUIController extends Disposable {
    constructor(
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService
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
            InsertDocImageCommand,
            InsertDocRectangleShapeCommand,
            InsertDocEllipseShapeCommand,
            UpdateDocDrawingDistanceCommand,
            UpdateDocDrawingWrapTextCommand,
            IMoveInlineDrawingCommand,
            ITransformNonInlineDrawingCommand,
            SidebarDocDrawingOperation,
            ClearDocDrawingTransformerOperation,
            EditDocDrawingOperation,
            GroupDocDrawingCommand,
            UngroupDocDrawingCommand,
            MoveDocDrawingsCommand,
            DeleteDocDrawingsCommand,
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
