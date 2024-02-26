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

import {
    ICommandService,
    IContextService,
    LifecycleStages,
    LocaleService,
    OnLifecycle,
    RxDisposable,
} from '@univerjs/core';
import { SearchSingle16 } from '@univerjs/icons';
import { ComponentManager, IDialogService, ILayoutService, IMenuService, IShortcutService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { takeUntil } from 'rxjs';

import {
    CloseFindReplaceDialogOperation,
    GoToNextMatchOperation,
    GoToPreviousMatchOperation,
    OpenFindDialogOperation,
    OpenReplaceDialogOperation,
    ToggleReplaceDialogOperation,
} from '../commands/operations/find-replace.operation';
import { FIND_REPLACE_ACTIVATED } from '../services/context-keys';
import { IFindReplaceService } from '../services/find-replace.service';
import { FindReplaceDialog } from '../views/dialog/Dialog';
import { FindReplaceMenuItemFactory } from './find-replace.menu';
import {
    CloseFRDialogShortcutItem,
    GoToNextFindMatchShortcutItem,
    GoToPreviousFindMatchShortcutItem,
    OpenFindDialogShortcutItem,
    OpenReplaceDialogShortcutItem,
} from './find-replace.shortcut';

const FIND_REPLACE_DIALOG_ID = 'DESKTOP_FIND_REPLACE_DIALOG';

@OnLifecycle(LifecycleStages.Rendered, FindReplaceController)
export class FindReplaceController extends RxDisposable {
    constructor(
        @IMenuService private readonly _menuService: IMenuService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService,
        @IFindReplaceService private readonly _findReplaceService: IFindReplaceService,
        @IDialogService private readonly _dialogService: IDialogService,
        @IContextService private readonly _contextService: IContextService,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initOperations();
        this._initUI();
        this._initShortcuts();
    }

    private _initOperations(): void {
        [
            CloseFindReplaceDialogOperation,
            OpenFindDialogOperation,
            OpenReplaceDialogOperation,
            ToggleReplaceDialogOperation,
            GoToNextMatchOperation,
            GoToPreviousMatchOperation,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initUI(): void {
        [FindReplaceMenuItemFactory].forEach((f) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(f)));
        });

        this.disposeWithMe(this._componentManager.register('FindReplaceDialog', FindReplaceDialog));
        this.disposeWithMe(this._componentManager.register('SearchIcon', SearchSingle16));

        // this controller is also responsible for toggling the FindReplaceDialog
        this._findReplaceService.stateUpdates$.pipe(takeUntil(this.dispose$)).subscribe((newState) => {
            if (newState.revealed === true) {
                this._openPanel();
            } else if (newState.revealed === false) {
                this._closePanel();
            }
        });
    }

    private _initShortcuts(): void {
        [
            OpenReplaceDialogShortcutItem,
            OpenFindDialogShortcutItem,
            CloseFRDialogShortcutItem,
            GoToPreviousFindMatchShortcutItem,
            GoToNextFindMatchShortcutItem,
        ].forEach((s) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(s));
        });
    }

    private _openPanel(): void {
        this._dialogService.open({
            id: FIND_REPLACE_DIALOG_ID,
            draggable: true,
            width: 350,
            title: { title: this._localeService.t('univer.find-replace.dialog.title') },
            children: { label: 'FindReplaceDialog' },
            onClose: () => this._closePanel(),
        });

        this._contextService.setContextValue(FIND_REPLACE_ACTIVATED, true);
    }

    private _closePanel(): void {
        this._dialogService.close(FIND_REPLACE_DIALOG_ID);
        this._contextService.setContextValue(FIND_REPLACE_ACTIVATED, false);
        this._layoutService.focus();
        this._findReplaceService.end();
    }
}
