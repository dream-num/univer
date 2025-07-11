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

import { ICommandService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { IShortcutService } from '@univerjs/ui';
import { CustomClearSelectionContentCommand } from './commands/commands/custom.command';
import { CustomClearSelectionValueShortcutItem } from './controllers/shortcuts/custom.shortcut';

const SHEET_CUSTOM_SHORTCUT_PLUGIN = 'SHEET_CUSTOM_SHORTCUT_PLUGIN';

export class UniverSheetsCustomShortcutPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = SHEET_CUSTOM_SHORTCUT_PLUGIN;

    constructor(
        _config = undefined,
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        this._initCommands();
        this._initShortcuts();
    }

    private _initCommands() {
        [
            CustomClearSelectionContentCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initShortcuts() {
        [
            CustomClearSelectionValueShortcutItem,
        ].forEach((item) => this.disposeWithMe(this._shortcutService.registerShortcut(item)));
    }
}
