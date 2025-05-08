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
import type { IUniverUIConfig } from '@univerjs/ui';
import { DependentOn, ICommandService, IContextService, ILocalStorageService, Inject, Injector, merge, mergeOverrideWithDependencies, Plugin } from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import {
    BrowserClipboardService,
    CanvasFloatDomService,
    CanvasPopupService,
    ComponentManager,
    ContextMenuService,
    DesktopBeforeCloseService,
    DesktopConfirmService,
    DesktopDialogService,
    DesktopGalleryService,
    DesktopGlobalZoneService,
    DesktopLayoutService,
    DesktopLocalFileService,
    DesktopLocalStorageService,
    DesktopMessageService,
    DesktopNotificationService,
    DesktopSidebarService,
    DesktopZenZoneService,
    DISABLE_AUTO_FOCUS_KEY,
    ErrorController,
    IBeforeCloseService,
    ICanvasPopupService,
    IClipboardInterfaceService,
    IConfirmService,
    IContextMenuService,
    IDialogService,
    IGalleryService,
    IGlobalZoneService,
    ILayoutService,
    ILeftSidebarService,
    ILocalFileService,
    IMenuManagerService,
    IMessageService,
    INotificationService,
    IPlatformService,
    IShortcutService,
    ISidebarService,
    IUIController,
    IUIPartsService,
    IZenZoneService,
    MenuManagerService,
    PlatformService,
    SharedController,
    ShortcutPanelController,
    ShortcutPanelService,
    ShortcutService,
    UIPartsService,
    UNIVER_UI_PLUGIN_NAME,
    ZIndexManager,
} from '@univerjs/ui';
import { UniverUniUIController } from './controllers/uniui-desktop.controller';
import { UniuiFlowController } from './controllers/uniui-flow.controller';
import { UniuiLeftSidebarController } from './controllers/uniui-leftsidebar.controller';
import { UniuiToolbarController } from './controllers/uniui-toolbar.controller';
import { FlowManagerService } from './services/flow/flow-manager.service';
import { UniToolbarService } from './services/toolbar/uni-toolbar-service';
import { IUnitGridService, UnitGridService } from './services/unit-grid/unit-grid.service';

/**
 * This plugin enables the Uni Mode of Univer. It should replace
 * `UniverUIPlugin` when registered.
 */
@DependentOn(UniverRenderEnginePlugin)
export class UniverUniUIPlugin extends Plugin {
    static override pluginName: string = UNIVER_UI_PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverUIConfig> = {},
        @Inject(Injector) protected readonly _injector: Injector,
        @IContextService private readonly _contextService: IContextService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._config = merge({}, this._config);
        if (this._config.disableAutoFocus) {
            this._contextService.setContextValue(DISABLE_AUTO_FOCUS_KEY, true);
        }
    }

    override onStarting(): void {
        const dependencies: Dependency[] = mergeOverrideWithDependencies([
            [ComponentManager],
            [ZIndexManager],
            [ShortcutPanelService],
            [FlowManagerService],
            [UniToolbarService],
            [IUnitGridService, { useClass: UnitGridService }],
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
            [ILeftSidebarService, { useClass: DesktopSidebarService, lazy: true }],
            [IZenZoneService, { useClass: DesktopZenZoneService, lazy: true }],
            [IGlobalZoneService, { useClass: DesktopGlobalZoneService, lazy: true }],
            [IMessageService, { useClass: DesktopMessageService, lazy: true }],
            [ILocalStorageService, { useClass: DesktopLocalStorageService, lazy: true }],
            [IBeforeCloseService, { useClass: DesktopBeforeCloseService }],
            [ILocalFileService, { useClass: DesktopLocalFileService }],
            [ICanvasPopupService, { useClass: CanvasPopupService }],
            [CanvasFloatDomService],
            [IUIController, {
                useFactory: () => this._injector.createInstance(UniverUniUIController, this._config),
            }],
            [SharedController],
            [ErrorController],
            [ShortcutPanelController],
            [UniuiLeftSidebarController],
            [UniuiToolbarController],
            [UniuiFlowController],
        ], this._config.override);
        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onReady(): void {
        this._injector.get(IUIController); // Do not move it to onStarting, otherwise the univer instance may not be mounted.
        this._injector.get(UniuiFlowController);
        this._injector.get(UniuiLeftSidebarController);
        this._injector.get(UniuiToolbarController);
    }
}
