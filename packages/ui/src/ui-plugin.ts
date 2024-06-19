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

import { DependentOn, IContextService, ILocalStorageService, mergeOverrideWithDependencies, Plugin, Tools } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';

import { CanvasPopupService, ICanvasPopupService } from './services/popup/canvas-popup.service';
import { DesktopGlobalZoneService } from './services/global-zone/desktop-global-zone.service';
import { IGlobalZoneService } from './services/global-zone/global-zone.service';
import { ComponentManager } from './common/component-manager';
import { ZIndexManager } from './common/z-index-manager';
import { ErrorController } from './controllers/error/error.controller';
import { SharedController } from './controllers/shared-shortcut.controller';
import { ShortcutPanelController } from './controllers/shortcut-display/shortcut-panel.controller';
import type { IUniverUIConfig } from './controllers/ui/ui.controller';
import { IUIController } from './controllers/ui/ui.controller';
import { DesktopUIController } from './controllers/ui/ui-desktop.controller';
import { DesktopBeforeCloseService, IBeforeCloseService } from './services/before-close/before-close.service';
import { BrowserClipboardService, IClipboardInterfaceService } from './services/clipboard/clipboard-interface.service';
import { IConfirmService } from './services/confirm/confirm.service';
import { DesktopConfirmService } from './services/confirm/desktop-confirm.service';
import { DesktopContextMenuService, IContextMenuService } from './services/contextmenu/contextmenu.service';
import { DesktopDialogService } from './services/dialog/desktop-dialog.service';
import { IDialogService } from './services/dialog/dialog.service';
import { DesktopLayoutService, ILayoutService } from './services/layout/layout.service';
import { DesktopLocalStorageService } from './services/local-storage/local-storage.service';
import { DesktopMenuService, IMenuService } from './services/menu/menu.service';
import { DesktopMessageService } from './services/message/desktop-message.service';
import { IMessageService } from './services/message/message.service';
import { DesktopNotificationService } from './services/notification/desktop-notification.service';
import { INotificationService } from './services/notification/notification.service';
import { DesktopPlatformService, IPlatformService } from './services/platform/platform.service';
import { DesktopShortcutService, IShortcutService } from './services/shortcut/shortcut.service';
import { ShortcutPanelService } from './services/shortcut/shortcut-panel.service';
import { DesktopSidebarService } from './services/sidebar/desktop-sidebar.service';
import { ISidebarService } from './services/sidebar/sidebar.service';
import { DesktopZenZoneService } from './services/zen-zone/desktop-zen-zone.service';
import { IZenZoneService } from './services/zen-zone/zen-zone.service';
import { EditorService, IEditorService } from './services/editor/editor.service';
import { IRangeSelectorService, RangeSelectorService } from './services/range-selector/range-selector.service';
import { IProgressService, ProgressService } from './services/progress/progress.service';
import { IUIPartsService, UIPartsService } from './services/parts/parts.service';
import { CanvasFloatDomService } from './services/dom/canvas-dom-layer.service';

export const UNIVER_UI_PLUGIN_NAME = 'UNIVER_UI_PLUGIN';
export const DISABLE_AUTO_FOCUS_KEY = 'DISABLE_AUTO_FOCUS';

const UI_BOOTSTRAP_DELAY = 16;

/**
 * UI plugin provides basic interaction with users. Including workbench (menus, UI parts, notifications etc.), copy paste, shortcut.
 */
@DependentOn(UniverRenderEnginePlugin)
export class UniverUIPlugin extends Plugin {
    static override pluginName = UNIVER_UI_PLUGIN_NAME;

    constructor(
        private _config: Partial<IUniverUIConfig> = {},
        @IContextService private readonly _contextService: IContextService,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();

        this._config = Tools.deepMerge({}, this._config);
        if (this._config.disableAutoFocus) {
            this._contextService.setContextValue(DISABLE_AUTO_FOCUS_KEY, true);
        }
    }

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = mergeOverrideWithDependencies([
            [ComponentManager],
            [ZIndexManager],

            [ShortcutPanelService],
            [IUIPartsService, { useClass: UIPartsService }],
            [ILayoutService, { useClass: DesktopLayoutService }],
            [IShortcutService, { useClass: DesktopShortcutService }],
            [IPlatformService, { useClass: DesktopPlatformService }],
            [IMenuService, { useClass: DesktopMenuService }],
            [IContextMenuService, { useClass: DesktopContextMenuService }],
            [IClipboardInterfaceService, { useClass: BrowserClipboardService, lazy: true }],
            [INotificationService, { useClass: DesktopNotificationService, lazy: true }],
            [IDialogService, { useClass: DesktopDialogService, lazy: true }],
            [IConfirmService, { useClass: DesktopConfirmService, lazy: true }],
            [ISidebarService, { useClass: DesktopSidebarService, lazy: true }],
            [IZenZoneService, { useClass: DesktopZenZoneService, lazy: true }],
            [IGlobalZoneService, { useClass: DesktopGlobalZoneService, lazy: true }],
            [IMessageService, { useClass: DesktopMessageService, lazy: true }],
            [ILocalStorageService, { useClass: DesktopLocalStorageService, lazy: true }],
            [IBeforeCloseService, { useClass: DesktopBeforeCloseService }],
            [IEditorService, { useClass: EditorService }],
            [IRangeSelectorService, { useClass: RangeSelectorService }],
            [ICanvasPopupService, { useClass: CanvasPopupService }],
            [IProgressService, { useClass: ProgressService }],
            [CanvasFloatDomService],

            [IUIController, { useClass: DesktopUIController }],
            [SharedController, { useFactory: () => this._injector.createInstance(SharedController, this._config) }],
            [ErrorController],
            [ShortcutPanelController, { useFactory: () => this._injector.createInstance(ShortcutPanelController, this._config) }],
        ], this._config.override);
        dependencies.forEach((dependency) => injector.add(dependency));
    }

    override onReady(): void {
        // We need to run this async to let other modules do their `onReady` jobs first.
        setTimeout(() => this._injector.get(IUIController).bootstrapWorkbench(this._config), UI_BOOTSTRAP_DELAY);
    }
}
