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

import { IUniverInstanceService, LocaleService, Plugin, PluginType, Tools } from '@univerjs/core';
import { ComponentManager } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import type { IUniverSlidesUIConfig } from './basics';
import { DefaultSlideUIConfig } from './basics';
import { SLIDE_UI_PLUGIN_NAME } from './basics/const/plugin-name';
import type { IToolbarItemProps } from './controllers';
import { AppUIController } from './controllers/app-ui-controller';
import { SlideUIController } from './controllers/slide-ui.controller';
import { zhCN } from './locale';

export class UniverSlidesUIPlugin extends Plugin {
    static override type = PluginType.Slide;

    private _appUIController?: AppUIController;

    private _config: IUniverSlidesUIConfig;

    constructor(
        config: Partial<IUniverSlidesUIConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super(SLIDE_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultSlideUIConfig, config);

        this._initializeDependencies();
    }

    getConfig() {
        return this._config;
    }

    override onStarting(): void {
        this._localeService.load({
            zhCN,
        });
    }

    override onReady(): void {
        this._markSlideAsFocused();
    }

    getAppUIController() {
        return this._appUIController;
    }

    addToolButton(config: IToolbarItemProps) {
        this._appUIController!.getSlideContainerController().getToolbarController().addToolbarConfig(config);
    }

    deleteToolButton(name: string) {
        this._appUIController!.getSlideContainerController().getToolbarController().deleteToolbarConfig(name);
    }

    private _initializeDependencies(): void {
        this._injector.add([SlideUIController]);

        this._appUIController = this._injector.createInstance(AppUIController, this._config);
    }

    private _markSlideAsFocused() {
        const currentService = this._currentUniverService;
        const c = currentService.getCurrentUniverSlideInstance();
        currentService.focusUniverInstance(c.getUnitId());
    }
}
