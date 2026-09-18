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
import { IShortcutService } from '@univerjs/ui';
import {
    CloseHyperLinkPopupOperation,
    InsertHyperLinkOperation,
    InsertHyperLinkToolbarOperation,
    OpenHyperLinkEditPanelOperation,
} from '../commands/operations/popup.operations';
import { InsertLinkShortcut } from '../menu/menu';

export class SheetsHyperLinkUIController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(IShortcutService) private readonly _shortcutService: IShortcutService
    ) {
        super();
        this._initCommands();
        this._initShortCut();
    }

    private _initCommands() {
        [
            OpenHyperLinkEditPanelOperation,
            CloseHyperLinkPopupOperation,
            InsertHyperLinkOperation,
            InsertHyperLinkToolbarOperation,
        ].forEach((command) => {
            this.disposeWithMe(this._commandService.registerCommand(command));
        });
    }

    private _initShortCut() {
        this.disposeWithMe(this._shortcutService.registerShortcut(InsertLinkShortcut));
    }
}
