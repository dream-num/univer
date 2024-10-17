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

import type { Dependency } from '@univerjs/core';
import type { IWatermarkConfigWithType } from './common/type';
import type { IUniverWatermarkConfig } from './controllers/config.schema';
import { ICommandService, IConfigService, ILocalStorageService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { OpenWatermarkPanelOperation } from './commands/operations/OpenWatermarkPanelOperation';
import { UNIVER_WATERMARK_STORAGE_KEY, WatermarkImageBaseConfig, WatermarkTextBaseConfig, WatermarkUserInfoBaseConfig } from './common/const';
import { IWatermarkTypeEnum } from './common/type';
import { UniverWatermarkMenuController } from './controllers/watermark.menu.controller';
import { WatermarkRenderController } from './controllers/watermark.render.controller';
import { UniverWatermarkService } from './services/watermarkService';

const PLUGIN_NAME = 'UNIVER_WATERMARK_PLUGIN';

export class UniverWatermarkPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverWatermarkConfig> = {},
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
        @Inject(ILocalStorageService) private readonly _localStorageService: ILocalStorageService
    ) {
        super();

        const { menu } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }

        this._initWatermarkStorage();
        this._initDependencies();
        this._initRegisterCommand();
    }

    private async _initWatermarkStorage() {
        const { menu, ...rest } = this._config;
        if (rest.userWatermarkSettings) {
            this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, { type: IWatermarkTypeEnum.UserInfo, config: { userInfo: { ...WatermarkUserInfoBaseConfig, ...rest.userWatermarkSettings } } });
        } else if (rest.textWatermarkSettings) {
            this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, { type: IWatermarkTypeEnum.Text, config: { text: { ...WatermarkTextBaseConfig, ...rest.textWatermarkSettings } } });
        } else if (rest.imageWatermarkSettings) {
            this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, { type: IWatermarkTypeEnum.Image, config: { image: { ...WatermarkImageBaseConfig, ...rest.imageWatermarkSettings } } });
        } else {
            const config = await this._localStorageService.getItem<IWatermarkConfigWithType>(UNIVER_WATERMARK_STORAGE_KEY);
            if (config?.type === IWatermarkTypeEnum.UserInfo) {
                this._localStorageService.removeItem(UNIVER_WATERMARK_STORAGE_KEY);
            }
        }
    }

    private _initDependencies(): void {
        ([[UniverWatermarkService], [UniverWatermarkMenuController]] as Dependency[]).forEach((d) => {
            this._injector.add(d);
        });
    }

    private _initRegisterCommand(): void {
        [
            OpenWatermarkPanelOperation,
        ].forEach((m) => this._commandService.registerCommand(m));
    }

    override onRendered(): void {
        const injector = this._injector;
        injector.get(UniverWatermarkService);

        const { userWatermarkSettings, textWatermarkSettings, imageWatermarkSettings, showMenu = true } = this._config;
        const shouldDisplayUI = !(userWatermarkSettings || textWatermarkSettings || imageWatermarkSettings) && showMenu;
        if (shouldDisplayUI) {
            injector.get(UniverWatermarkMenuController);
        }

        this._initRenderDependencies();
    }

    private _initRenderDependencies(): void {
        ([
            [WatermarkRenderController],
        ] as Dependency[]).forEach((d) => {
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_SHEET, d);
            this._renderManagerSrv.registerRenderModule(UniverInstanceType.UNIVER_DOC, d);
        });
    }
}
