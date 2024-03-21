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
import type { IDesktopUIController } from '@univerjs/ui';
import { ComponentManager, DesktopUIPart, IMenuService, IShortcutService, IUIController } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';

import { SheetOnlyPasteFormulaCommand } from '../commands/commands/formula-clipboard.command';
import { InsertFunctionCommand } from '../commands/commands/insert-function.command';
import { SelectEditorFormulaOperation } from '../commands/operations/editor-formula.operation';
import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';
import { ReferenceAbsoluteOperation } from '../commands/operations/reference-absolute.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { RenderFormulaPromptContent } from '../views/FormulaPromptContainer';
import { MORE_FUNCTIONS_COMPONENT } from '../views/more-functions/interface';
import { MoreFunctions } from '../views/more-functions/MoreFunctions';
import { InsertFunctionMenuItemFactory, MoreFunctionsMenuItemFactory, PasteFormulaMenuItemFactory } from './menu';
import {
    ChangeRefToAbsoluteShortcut,
    promptSelectionShortcutItem,
    promptSelectionShortcutItemCtrl,
    promptSelectionShortcutItemCtrlAndShift,
    promptSelectionShortcutItemShift,
    singleEditorPromptSelectionShortcutItem,
} from './shortcuts/prompt.shortcut';

@OnLifecycle(LifecycleStages.Ready, FormulaUIController)
export class FormulaUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IUIController private readonly _uiController: IDesktopUIController,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._registerCommands();
        this._registerMenus();
        this._registerShortcuts();
        this._registerComponents();
    }

    private _registerMenus(): void {
        [InsertFunctionMenuItemFactory, MoreFunctionsMenuItemFactory, PasteFormulaMenuItemFactory].forEach(
            (factory) => {
                this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
            }
        );
    }

    private _registerCommands(): void {
        [
            InsertFunctionCommand,
            SheetOnlyPasteFormulaCommand,
            InsertFunctionOperation,
            MoreFunctionsOperation,
            SearchFunctionOperation,
            HelpFunctionOperation,
            SelectEditorFormulaOperation,
            ReferenceAbsoluteOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _registerShortcuts(): void {
        [
            ...promptSelectionShortcutItem(),
            ...promptSelectionShortcutItemShift(),
            ...promptSelectionShortcutItemCtrl(),
            ...promptSelectionShortcutItemCtrlAndShift(),
            ...singleEditorPromptSelectionShortcutItem(),
            ChangeRefToAbsoluteShortcut,
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }

    private _registerComponents(): void {
        this.disposeWithMe(
            this.disposeWithMe(this._uiController.registerComponent(DesktopUIPart.CONTENT, () => connectInjector(RenderFormulaPromptContent, this._injector)))
        );

        this._componentManager.register(MORE_FUNCTIONS_COMPONENT, MoreFunctions);
    }
}
