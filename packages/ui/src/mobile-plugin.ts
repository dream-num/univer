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
import { DependentOn, ILocalStorageService, Inject, Injector, mergeOverrideWithDependencies, Plugin } from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { ComponentManager } from './common/component-manager';
import { ZIndexManager } from './common/z-index-manager';
import { ErrorController } from './controllers/error/error.controller';
import { SharedController } from './controllers/shared-shortcut.controller';
import { MobileUIController } from './controllers/ui/ui-mobile.controller';
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
import { DesktopZenZoneService } from './services/zen-zone/desktop-zen-zone.service';
import { IZenZoneService } from './services/zen-zone/zen-zone.service';

export const UNIVER_MOBILE_UI_PLUGIN_NAME = 'UNIVER_MOBILE_UI_PLUGIN';

/**
 * @ignore
 */
@DependentOn(UniverRenderEnginePlugin)
export class UniverMobileUIPlugin extends Plugin {
    static override pluginName = UNIVER_MOBILE_UI_PLUGIN_NAME;

    constructor(
        private readonly _config: IUniverUIConfig,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(): void {
        const dependencies: Dependency[] = mergeOverrideWithDependencies([
            [ComponentManager],
            [ZIndexManager],

            // services
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
            [ICanvasPopupService, { useClass: CanvasPopupService }],
            [CanvasFloatDomService],

            // controllers
            [
                IUIController,
                {
                    useFactory: (injector: Injector) => injector.createInstance(MobileUIController, this._config),
                    deps: [Injector],
                },
            ],
            [SharedController],
            [ErrorController],
        ], this._config.override);

        dependencies.forEach((dependency) => this._injector.add(dependency));

        this._injector.get(IUIController);
        this._injector.get(ErrorController);
    }
}
