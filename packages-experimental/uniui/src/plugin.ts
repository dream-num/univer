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
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import type { IUniverUIConfig } from '@univerjs/ui';
import {
    BrowserClipboardService,
    CanvasFloatDomService,
    CanvasPopupService,
    ComponentManager,
    DesktopBeforeCloseService,
    DesktopConfirmService,
    DesktopContextMenuService,
    DesktopDialogService,
    DesktopGlobalZoneService,
    DesktopLayoutService,
    DesktopLocalStorageService,
    DesktopMenuService,
    DesktopMessageService,
    DesktopNotificationService,
    DesktopPlatformService,
    DesktopShortcutService,
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
    ProgressService,
    RangeSelectorService,
    SharedController,
    ShortcutPanelController,
    ShortcutPanelService,
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

    override onStarting(injector: Injector): void {
        const dependencies: Dependency[] = mergeOverrideWithDependencies([
            [ComponentManager],
            [ZIndexManager],

            [ShortcutPanelService],
            [UnitGridService],
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

            // This line is different from the original UI plugin.
            [IUIController, { useClass: UniverUniUIController }],

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
