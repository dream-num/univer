import { ILocalStorageService, LocaleService, Plugin, PLUGIN_NAMES, PluginType } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';

import { ComponentManager } from './Common/ComponentManager';
import { ZIndexManager } from './Common/ZIndexManager';
import { ErrorController } from './controllers/error/error.controller';
import { SharedController } from './controllers/shared-shortcut.controller';
import { IUIController, IWorkbenchOptions } from './controllers/ui/ui.controller';
import { DesktopUIController } from './controllers/ui/ui-desktop.controller';
import { enUS } from './locale';
import { DesktopBeforeCloseService, IBeforeCloseService } from './services/before-close/before-close.service';
import { BrowserClipboardService, IClipboardInterfaceService } from './services/clipboard/clipboard-interface.service';
import { IConfirmService } from './services/confirm/confirm.service';
import { DesktopConfirmService } from './services/confirm/desktop-confirm.service';
import { DesktopContextMenuService, IContextMenuService } from './services/contextmenu/contextmenu.service';
import { DesktopDialogService } from './services/dialog/desktop-dialog.service';
import { IDialogService } from './services/dialog/dialog.service';
import { DesktopFocusService, IFocusService } from './services/focus/focus.service';
import { DesktopLocalStorageService } from './services/local-storage/local-storage.service';
import { DesktopMenuService, IMenuService } from './services/menu/menu.service';
import { DesktopMessageService } from './services/message/desktop-message.service';
import { IMessageService } from './services/message/message.service';
import { DesktopNotificationService } from './services/notification/desktop-notification.service';
import { INotificationService } from './services/notification/notification.service';
import { DesktopPlatformService, IPlatformService } from './services/platform/platform.service';
import { DesktopShortcutService, IShortcutService } from './services/shortcut/shortcut.service';
import { ShortcutExperienceService } from './services/shortcut/shortcut-experience.service';
import { DesktopSidebarService } from './services/sidebar/desktop-sidebar.service';
import { ISidebarService } from './services/sidebar/sidebar.service';

export interface IUIPluginConfig extends IWorkbenchOptions {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

/**
 * UI plugin provides basic interaction with users. Including workbench (menus, UI parts, notifications etc.), copy paste, shortcut.
 */
export class UIPlugin extends Plugin {
    static override type = PluginType.Univer;

    private _config: IUIPluginConfig;

    constructor(
        config: Partial<IUIPluginConfig> = {},
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(PLUGIN_NAMES.BASE_UI);

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);

        this._localeService.load({
            enUS,
        });
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
    }

    override onReady(): void {
        this._initUI();
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [
            // legacy managers - deprecated
            [ComponentManager],
            [ZIndexManager],
            // services
            [ShortcutExperienceService],
            [IShortcutService, { useClass: DesktopShortcutService }],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [IMenuService, { useClass: DesktopMenuService }],
            [IContextMenuService, { useClass: DesktopContextMenuService }],
            [IClipboardInterfaceService, { useClass: BrowserClipboardService, lazy: true }],
            [INotificationService, { useClass: DesktopNotificationService, lazy: true }],
            [IDialogService, { useClass: DesktopDialogService, lazy: true }],
            [IConfirmService, { useClass: DesktopConfirmService, lazy: true }],
            [ISidebarService, { useClass: DesktopSidebarService, lazy: true }],
            [IMessageService, { useClass: DesktopMessageService, lazy: true }],
            [ILocalStorageService, { useClass: DesktopLocalStorageService, lazy: true }],
            [IBeforeCloseService, { useClass: DesktopBeforeCloseService }],
            // controllers
            [IFocusService, { useClass: DesktopFocusService }],
            [IUIController, { useClass: DesktopUIController }],
            [SharedController],
            [ErrorController],
        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }

    private _initUI(): void {
        Promise.resolve().then(() => this._injector.get(IUIController).bootstrapWorkbench(this._config));
    }
}
