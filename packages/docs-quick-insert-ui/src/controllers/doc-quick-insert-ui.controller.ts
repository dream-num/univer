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

import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocPopup } from '../services/doc-quick-insert-popup.service';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { DividerSingle, TextSingle } from '@univerjs/icons';
import { ComponentManager } from '@univerjs/ui';
import { of } from 'rxjs';
import { DeleteSearchKeyCommand } from '../commands/commands/doc-quick-insert.command';
import { CloseQuickInsertPopupOperation, ShowQuickInsertPopupOperation } from '../commands/operations/quick-insert-popup.operation';
import { DocQuickInsertPopupService } from '../services/doc-quick-insert-popup.service';
import { KeywordInputPlaceholder } from '../views/KeywordInputPlaceholder';
import { QuickInsertButton } from '../views/menu';
import { QuickInsertPlaceholder } from '../views/QuickInsertPlaceholder';
import { QuickInsertPopup } from '../views/QuickInsertPopup';
import { builtInMenus } from './built-in-menus';

export class DocQuickInsertUIController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocQuickInsertPopupService) private readonly _docQuickInsertPopupService: DocQuickInsertPopupService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initCommands();
        this._initComponents();
        this._initMenus();
    }

    private _initCommands() {
        [
            DeleteSearchKeyCommand,
            ShowQuickInsertPopupOperation,
            CloseQuickInsertPopupOperation,
        ].forEach((operation) => {
            this.disposeWithMe(this._commandService.registerCommand(operation));
        });
    }

    private _initComponents() {
        ([
            [QuickInsertPopup.componentKey, QuickInsertPopup],
            [KeywordInputPlaceholder.componentKey, KeywordInputPlaceholder],
            [QuickInsertPlaceholder.componentKey, QuickInsertPlaceholder],
            [DividerSingle.displayName, DividerSingle],
            [TextSingle.displayName, TextSingle],
            [QuickInsertButton.componentKey, QuickInsertButton],
        ] as const).forEach(([name, component]) => {
            if (name) {
                this.disposeWithMe(this._componentManager.register(name, component));
            }
        });

        const popups: IDocPopup[] = [
            {
                keyword: '/',
                menus$: of(builtInMenus),
                // only show when the cursor is at the beginning of a line
                preconditions: (params) => (params.range as ITextRangeWithStyle).startNodePosition?.glyph === 0,
            },
        ];

        popups.forEach((popup) => {
            this.disposeWithMe(this._docQuickInsertPopupService.registerPopup(popup));
        });
    }

    private _initMenus() {

    }
}
