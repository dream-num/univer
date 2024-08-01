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

import { DependentOn, IContextService, ILocalStorageService, Inject, Injector, mergeOverrideWithDependencies, Plugin, Tools } from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import type { Dependency } from '@univerjs/core';
import type { IUniverUIConfig } from '@univerjs/ui';
import {
    BrowserClipboardService,
    CanvasFloatDomService,
    CanvasPopupService,
    ComponentManager,
    ContextMenuService,
    DesktopBeforeCloseService,
    DesktopConfirmService,
    DesktopDialogService,
    DesktopGlobalZoneService,
    DesktopLayoutService,
    DesktopLocalStorageService,
    DesktopMessageService,
    DesktopNotificationService,
    DesktopSidebarService,
    DesktopZenZoneService,
    DISABLE_AUTO_FOCUS_KEY,
    EditorService,
    ErrorController,
    IBeforeCloseService,
    ICanvasPopupService,
    IClipboardInterfaceService,
    IConfirmService,
    IContextMenuService,
    IDialogService,
    IEditorService,
    IGlobalZoneService,
    ILayoutService,
    IMenuService,
    IMessageService,
    INotificationService,
    IPlatformService,
    IProgressService,
    IRangeSelectorService,
    IShortcutService,
    ISidebarService,
    IUIController,
    IUIPartsService,
    IZenZoneService,
    MenuService,
    PlatformService,
    ProgressService,
    RangeSelectorService,
    SharedController,
    ShortcutPanelController,
    ShortcutPanelService,
    ShortcutService,
    UIPartsService,
    UNIVER_UI_PLUGIN_NAME,
    ZIndexManager,
} from '@univerjs/ui';
import { UniverUniUIController } from './controllers/uniui-desktop.controller';
import { UnitGridService } from './services/unit-grid/unit-grid.service';

const UI_BOOTSTRAP_DELAY = 16;

/**
 * This plugin enables the Uni Mode of Univer. It should replace
 * `UniverUIPlugin` when registered.
 */
@DependentOn(UniverRenderEnginePlugin)
export class UniverUniUIPlugin extends Plugin {
    static override pluginName: string = UNIVER_UI_PLUGIN_NAME;

    constructor(
        private _config: Partial<IUniverUIConfig> = {},
        @Inject(Injector) protected readonly _injector: Injector,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();

        this._config = Tools.deepMerge({}, this._config);
        if (this._config.disableAutoFocus) {
            this._contextService.setContextValue(DISABLE_AUTO_FOCUS_KEY, true);
        }
    }

    override onStarting(): void {
        const dependencies: Dependency[] = mergeOverrideWithDependencies([
            [ComponentManager],
            [ZIndexManager],
            [ShortcutPanelService],
            [UnitGridService],
            [IUIPartsService, { useClass: UIPartsService }],
            [ILayoutService, { useClass: DesktopLayoutService }],
            [IShortcutService, { useClass: ShortcutService }],
            [IPlatformService, { useClass: PlatformService }],
            [IMenuService, { useClass: MenuService }],
            [IContextMenuService, { useClass: ContextMenuService }],
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
            [IUIController, {
                useFactory: () => this._injector.createInstance(UniverUniUIController, this._config),
            }],
            [SharedController, {
                useFactory: () => this._injector.createInstance(SharedController, this._config),
            }],
            [ErrorController],
            [ShortcutPanelController, {
                useFactory: () => this._injector.createInstance(ShortcutPanelController, this._config),
            }],
        ], this._config.override);
        dependencies.forEach((dependency) => this._injector.add(dependency));
    }
}
