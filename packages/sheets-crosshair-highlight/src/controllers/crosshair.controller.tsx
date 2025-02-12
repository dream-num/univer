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
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { CrossHighlightingSingle } from '@univerjs/icons';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SetCrosshairHighlightColorOperation,
    ToggleCrosshairHighlightOperation,
} from '../commands/operations/operation';
import { CrosshairOverlay } from '../views/components/CrosshairHighlight';
import { CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT } from './crosshair.menu';
import { menuSchema } from './menu.schema';

export class SheetsCrosshairHighlightController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentMgr: ComponentManager,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @ICommandService private readonly _cmdSrv: ICommandService
    ) {
        super();

        this._initCommands();
        this._initMenus();
        this._initComponents();
    }

    private _initCommands(): void {
        ([
            ToggleCrosshairHighlightOperation,
            SetCrosshairHighlightColorOperation,
            EnableCrosshairHighlightOperation,
            DisableCrosshairHighlightOperation,
        ]).forEach((c) => this._cmdSrv.registerCommand(c));
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initComponents(): void {
        this._componentMgr.register(CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT, CrosshairOverlay);
        this._componentMgr.register('CrossHighlightingSingle', CrossHighlightingSingle);
    }
}
