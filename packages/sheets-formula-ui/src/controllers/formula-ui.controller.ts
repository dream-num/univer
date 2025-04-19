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

import type { Dependency } from '@univerjs/core';
import { Disposable, ICommandService, Inject, Injector, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';

import { SheetsUIPart } from '@univerjs/sheets-ui';
import { ComponentManager, connectInjector, IMenuManagerService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { SheetOnlyPasteFormulaCommand } from '../commands/commands/formula-clipboard.command';
import { SelectEditorFormulaOperation } from '../commands/operations/editor-formula.operation';
import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';
import { ReferenceAbsoluteOperation } from '../commands/operations/reference-absolute.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { FormulaProgressBar } from '../views/formula-progress/FormulaProgress';
import { MORE_FUNCTIONS_COMPONENT } from '../views/more-functions/interface';
import { MoreFunctions } from '../views/more-functions/MoreFunctions';
import { FormulaEditorShowController } from './formula-editor-show.controller';
import { menuSchema } from './menu.schema';
import {
    ChangeRefToAbsoluteShortcut,
    promptSelectionShortcutItem,
    promptSelectionShortcutItemCtrl,
    promptSelectionShortcutItemCtrlAndShift,
    promptSelectionShortcutItemShift,
    singleEditorPromptSelectionShortcutItem,
} from './shortcuts/prompt.shortcut';

export class FormulaUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
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
        this._registerRenderModules();
    }

    private _registerMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _registerCommands(): void {
        [
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
        this.disposeWithMe(this._uiPartsService.registerComponent(SheetsUIPart.FORMULA_AUX, () => connectInjector(FormulaProgressBar, this._injector)));

        this._componentManager.register(MORE_FUNCTIONS_COMPONENT, MoreFunctions);
    }

    private _registerRenderModules(): void {
        this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [FormulaEditorShowController] as Dependency));
    }
}
