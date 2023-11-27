import { ComponentManager, IMenuService } from '@univerjs/base-ui';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { ScriptPanelComponentName, ToggleScriptPanelOperation } from '../commands/operations/panel.operation';
import { ScriptEditorPanel } from '../views/components/ScriptEditorPanel';
import { UniscriptMenuItemFactory } from './menu';

@OnLifecycle(LifecycleStages.Steady, UniscriptController)
export class UniscriptController extends Disposable {
    constructor(
        @IMenuService menuService: IMenuService,
        @ICommandService commandService: ICommandService,
        @Inject(ComponentManager) componentManager: ComponentManager
    ) {
        super();

        this.disposeWithMe(menuService.addMenuItem(UniscriptMenuItemFactory()));
        this.disposeWithMe(componentManager.register(ScriptPanelComponentName, ScriptEditorPanel));
        this.disposeWithMe(commandService.registerCommand(ToggleScriptPanelOperation));
    }
}
