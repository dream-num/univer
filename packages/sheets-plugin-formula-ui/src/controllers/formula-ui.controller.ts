import {
    ComponentManager,
    IDesktopUIController,
    IMenuService,
    IShortcutService,
    IUIController,
} from '@univerjs/base-ui';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';

import { SelectEditorFormulaOperation } from '../commands/operations/editor-formula.operation';
import { HelpFunctionOperation } from '../commands/operations/help-function.operation';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';
import { SearchFunctionOperation } from '../commands/operations/search-function.operation';
import { RenderFormulaPromptContent } from '../views/FormulaPromptContainer';
import { MORE_FUNCTIONS_COMPONENT } from '../views/more-functions/interface';
import { MoreFunctions } from '../views/more-functions/MoreFunctions';
import { InsertFunctionMenuItemFactory, MoreFunctionsMenuItemFactory } from './menu';
import {
    promptSelectionShortcutItem,
    promptSelectionShortcutItemCtrl,
    promptSelectionShortcutItemCtrlAndShift,
    promptSelectionShortcutItemShift,
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
        [InsertFunctionMenuItemFactory, MoreFunctionsMenuItemFactory].forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });
    }

    private _registerCommands(): void {
        [
            InsertFunctionOperation,
            MoreFunctionsOperation,
            SearchFunctionOperation,
            HelpFunctionOperation,
            SelectEditorFormulaOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _registerShortcuts(): void {
        [
            ...promptSelectionShortcutItem(),
            ...promptSelectionShortcutItemShift(),
            ...promptSelectionShortcutItemCtrl(),
            ...promptSelectionShortcutItemCtrlAndShift(),
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }

    private _registerComponents(): void {
        this.disposeWithMe(
            this._uiController.registerContentComponent(() =>
                connectInjector(RenderFormulaPromptContent, this._injector)
            )
        );

        this._componentManager.register(MORE_FUNCTIONS_COMPONENT, MoreFunctions);
    }
}
