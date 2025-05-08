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
import type { IUniverUIConfig } from './controllers/config.schema';
import { DependentOn, generateRandomId, IConfigService, IContextService, ILocalStorageService, Inject, Injector, merge, mergeOverrideWithDependencies, Plugin } from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { ComponentManager } from './common/component-manager';
import { ZIndexManager } from './common/z-index-manager';
import { defaultPluginConfig, UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { ErrorController } from './controllers/error/error.controller';
import { SharedController } from './controllers/shared-shortcut.controller';
import { ShortcutPanelController } from './controllers/shortcut-display/shortcut-panel.controller';
import { DesktopUIController } from './controllers/ui/ui-desktop.controller';
import { IUIController } from './controllers/ui/ui.controller';
import { DesktopBeforeCloseService, IBeforeCloseService } from './services/before-close/before-close.service';
import { BrowserClipboardService, IClipboardInterfaceService } from './services/clipboard/clipboard-interface.service';
import { IConfirmService } from './services/confirm/confirm.service';
import { DesktopConfirmService } from './services/confirm/desktop-confirm.service';
import { ContextMenuService, IContextMenuService } from './services/contextmenu/contextmenu.service';
import { DesktopDialogService } from './services/dialog/desktop-dialog.service';
import { IDialogService } from './services/dialog/dialog.service';
import { CanvasFloatDomService } from './services/dom/canvas-dom-layer.service';
import { DesktopGalleryService } from './services/gallery/desktop-gallery.service';
import { IGalleryService } from './services/gallery/gallery.service';
import { DesktopGlobalZoneService } from './services/global-zone/desktop-global-zone.service';
import { IGlobalZoneService } from './services/global-zone/global-zone.service';
import { DesktopLayoutService, ILayoutService } from './services/layout/layout.service';
import { DesktopLocalFileService } from './services/local-file/desktop-local-file.service';
import { ILocalFileService } from './services/local-file/local-file.service';
import { DesktopLocalStorageService } from './services/local-storage/local-storage.service';
import { IMenuManagerService, MenuManagerService } from './services/menu/menu-manager.service';
import { DesktopMessageService } from './services/message/desktop-message.service';
import { IMessageService } from './services/message/message.service';
import { DesktopNotificationService } from './services/notification/desktop-notification.service';
import { INotificationService } from './services/notification/notification.service';
import { IUIPartsService, UIPartsService } from './services/parts/parts.service';
import { IPlatformService, PlatformService } from './services/platform/platform.service';
import { CanvasPopupService, ICanvasPopupService } from './services/popup/canvas-popup.service';
import { ShortcutPanelService } from './services/shortcut/shortcut-panel.service';
import { IShortcutService, ShortcutService } from './services/shortcut/shortcut.service';
import { DesktopSidebarService } from './services/sidebar/desktop-sidebar.service';
import { ISidebarService } from './services/sidebar/sidebar.service';
import { ThemeSwitcherService } from './services/theme-switcher/theme-switcher.service';
import { DesktopZenZoneService } from './services/zen-zone/desktop-zen-zone.service';
import { IZenZoneService } from './services/zen-zone/zen-zone.service';

export const UNIVER_UI_PLUGIN_NAME = 'UNIVER_UI_PLUGIN';

export const DISABLE_AUTO_FOCUS_KEY = 'DISABLE_AUTO_FOCUS';

/**
 * UI plugin provides basic interaction with users. Including workbench (menus, UI parts, notifications etc.), copy paste, shortcut.
 */
@DependentOn(UniverRenderEnginePlugin)
export class UniverUIPlugin extends Plugin {
    static override pluginName = UNIVER_UI_PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverUIConfig> = defaultPluginConfig,
        @IContextService private readonly _contextService: IContextService,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {
                popupRootId: `univer-popup-portal-${generateRandomId(6)}`,
            },
            defaultPluginConfig,
            this._config
        );

        if (rest.disableAutoFocus) {
            this._contextService.setContextValue(DISABLE_AUTO_FOCUS_KEY, true);
        }
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const dependencies: Dependency[] = mergeOverrideWithDependencies([
            [ComponentManager],
            [ThemeSwitcherService],
            [ZIndexManager],
            [ShortcutPanelService],
            [IUIPartsService, { useClass: UIPartsService }],
            [ILayoutService, { useClass: DesktopLayoutService }],
            [IShortcutService, { useClass: ShortcutService }],
            [IPlatformService, { useClass: PlatformService }],
            [IMenuManagerService, { useClass: MenuManagerService }],
            [IContextMenuService, { useClass: ContextMenuService }],
            [IClipboardInterfaceService, { useClass: BrowserClipboardService, lazy: true }],
            [INotificationService, { useClass: DesktopNotificationService, lazy: true }],
            [IGalleryService, { useClass: DesktopGalleryService, lazy: true }],
            [IDialogService, { useClass: DesktopDialogService, lazy: true }],
            [IConfirmService, { useClass: DesktopConfirmService, lazy: true }],
            [ISidebarService, { useClass: DesktopSidebarService, lazy: true }],
            [IZenZoneService, { useClass: DesktopZenZoneService, lazy: true }],
            [IGlobalZoneService, { useClass: DesktopGlobalZoneService, lazy: true }],
            [IMessageService, { useClass: DesktopMessageService, lazy: true }],
            [ILocalStorageService, { useClass: DesktopLocalStorageService, lazy: true }],
            [IBeforeCloseService, { useClass: DesktopBeforeCloseService }],
            [ILocalFileService, { useClass: DesktopLocalFileService }],
            [ICanvasPopupService, { useClass: CanvasPopupService }],
            [CanvasFloatDomService],
            [IUIController, {
                useFactory: (injector: Injector) => injector.createInstance(DesktopUIController, this._config),
                deps: [Injector],
            }],
            [SharedController],
            [ErrorController],
            [ShortcutPanelController],
        ], this._config.override);
        dependencies.forEach((dependency) => this._injector.add(dependency));

        this._injector.get(IUIController);
        this._injector.get(ErrorController);
    }

    override onReady(): void {
        this._injector.get(SharedController);
    }

    override onSteady(): void {
        this._injector.get(ShortcutPanelController);
    }
}
