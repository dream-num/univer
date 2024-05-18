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

import type { DependencyOverride } from '@univerjs/core';
import { IContextService, ILocalStorageService, LocaleService, mergeOverrideWithDependencies, Plugin } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { CanvasPopupService, ICanvasPopupService } from './services/popup/canvas-popup.service';
import { DesktopGlobalZoneService } from './services/global-zone/desktop-global-zone.service';
import { IGlobalZoneService } from './services/global-zone/global-zone.service';
import { ComponentManager } from './common/component-manager';
import { ZIndexManager } from './common/z-index-manager';
import { ErrorController } from './controllers/error/error.controller';
import { SharedController } from './controllers/shared-shortcut.controller';
import { ShortcutPanelController } from './controllers/shortcut-display/shortcut-panel.controller';
import type { IWorkbenchOptions } from './controllers/ui/ui.controller';
import { IUIController } from './controllers/ui/ui.controller';
import { DesktopUIController } from './controllers/ui/ui-desktop.controller';
import { zhCN } from './locale';
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
import { DesktopUIPartsService, IUIPartsService } from './services/parts/parts.service';

const PLUGIN_NAME = 'ui';

export interface IUniverUIConfig extends IWorkbenchOptions {
    /** Disable auto focus when Univer bootstraps. */
    disableAutoFocus?: true;

    override?: DependencyOverride;
}

export const DISABLE_AUTO_FOCUS_KEY = 'DISABLE_AUTO_FOCUS';

/**
 * UI plugin provides basic interaction with users. Including workbench (menus, UI parts, notifications etc.), copy paste, shortcut.
 */
export class UniverUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private _config: Partial<IUniverUIConfig> = {},
        @IContextService private readonly _contextService: IContextService,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._localeService.load({ zhCN });

        if (this._config.disableAutoFocus) {
            this._contextService.setContextValue(DISABLE_AUTO_FOCUS_KEY, true);
        }
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);

        this._initUI();
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = mergeOverrideWithDependencies([
            [ComponentManager],
            [ZIndexManager],

            // services
            [ShortcutPanelService],
            [IUIPartsService, { useClass: DesktopUIPartsService }],
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

            // controllers
            [IUIController, { useClass: DesktopUIController }],
            [SharedController],
            [ErrorController],
            [ShortcutPanelController],
        ], this._config.override);

        dependencies.forEach((dependency) => injector.add(dependency));
    }

    private _initUI(): void {
        Promise.resolve().then(() => this._injector.get(IUIController).bootstrapWorkbench(this._config));
    }
}
