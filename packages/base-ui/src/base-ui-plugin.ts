import { Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { ComponentManager } from './Common/ComponentManager';
import { ZIndexManager } from './Common/ZIndexManager';
import { SharedController } from './controllers/shared-shortcut.controller';
import { IUIController, IWorkbenchOptions } from './controllers/ui/ui.controller';
import { DesktopUIController } from './controllers/ui/ui-desktop.controller';
import { DesktopClipboardService, IClipboardService } from './services/clipboard/clipboard.service';
import { BrowserClipboardService, IClipboardInterfaceService } from './services/clipboard/clipboard-interface.service';
import { ContextService, IContextService } from './services/context/context.service';
import { DesktopContextMenuService, IContextMenuService } from './services/contextmenu/contextmenu.service';
import { DesktopMenuService, IMenuService } from './services/menu/menu.service';
import { DesktopPlatformService, IPlatformService } from './services/platform/platform.service';
import { DesktopShortcutService, IShortcutService } from './services/shortcut/shortcut.service';

export interface IUIPluginConfig extends IWorkbenchOptions {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

/**
 * UI plugin provides basic interaction with users. Including workbench (menus, UI parts, notifications etc.), copy paste, shortcut.
 */
export class UIPlugin extends Plugin {
    static override type = PluginType.Univer;

    private _config: IUIPluginConfig;

    constructor(config: Partial<IUIPluginConfig> = {}, @Inject(Injector) injector: Injector) {
        super(PLUGIN_NAMES.BASE_UI);

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);
        this._injector = injector;
    }

    override onMounted(): void {
        this._initDependencies();
        this._initModules();
        this._initUI();
    }

    private _initDependencies(): void {
        const dependencies: Dependency[] = [
            // legacy managers - deprecated
            [ComponentManager],
            [ZIndexManager],

            // services
            [IShortcutService, { useClass: DesktopShortcutService }],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [IMenuService, { useClass: DesktopMenuService }],
            [IContextService, { useClass: ContextService }],
            [IContextMenuService, { useClass: DesktopContextMenuService }],
            [IClipboardInterfaceService, { useClass: BrowserClipboardService }],
            [IClipboardService, { useClass: DesktopClipboardService }],

            // controllers
            [SharedController],
            [IUIController, { useClass: DesktopUIController }],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    private _initModules(): void {
        this._injector.get(SharedController).initialize();
    }

    private _initUI(): void {
        this._injector.get(IUIController).bootstrapWorkbench(this._config);
    }
}
