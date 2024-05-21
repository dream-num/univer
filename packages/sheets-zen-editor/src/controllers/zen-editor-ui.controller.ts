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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { IMenuItemFactory, MenuConfig } from '@univerjs/ui';
import { IMenuService, IShortcutService, IZenZoneService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { CancelZenEditCommand, ConfirmZenEditCommand } from '../commands/commands/zen-editor.command';
import { OpenZenEditorOperation } from '../commands/operations/zen-editor.operation';
import { ZenEditorMenuItemFactory } from '../views/menu';
import { ZEN_EDITOR_COMPONENT, ZenEditor } from '../views/zen-editor';
import { ZenEditorCancelShortcut, ZenEditorConfirmShortcut } from './shortcuts/zen-editor.shortcut';

export interface IUniverSheetsZenEditorUIConfig {
    menu: MenuConfig;
}

export const DefaultSheetZenEditorUiConfig = {};

@OnLifecycle(LifecycleStages.Rendered, ZenEditorUIController)
export class ZenEditorUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverSheetsZenEditorUIConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @IZenZoneService private readonly _zenZoneService: IZenZoneService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initCustomComponents();
        this._initCommands();
        this._initMenus();
        this._initShortcuts();
    }

    private _initCustomComponents(): void {
        this.disposeWithMe(this._zenZoneService.set(ZEN_EDITOR_COMPONENT, ZenEditor));
    }

    private _initCommands(): void {
        [OpenZenEditorOperation, CancelZenEditCommand, ConfirmZenEditCommand].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initMenus(): void {
        const { menu = {} } = this._config;

        (
            [
                // context menu
                ZenEditorMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), menu));
        });
    }

    private _initShortcuts(): void {
        [ZenEditorConfirmShortcut, ZenEditorCancelShortcut].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }
}
