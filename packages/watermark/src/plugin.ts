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
import type { IWatermarkConfigWithType } from '@univerjs/engine-render';
import type { IUniverWatermarkConfig } from './controllers/config.schema';
import { IConfigService, ILocalStorageService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, IWatermarkTypeEnum, UNIVER_WATERMARK_STORAGE_KEY } from '@univerjs/engine-render';
import { WatermarkImageBaseConfig, WatermarkTextBaseConfig, WatermarkUserInfoBaseConfig } from './common/const';
import { defaultPluginConfig, WATERMARK_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { WatermarkRenderController } from './controllers/watermark.render.controller';
import { WatermarkService } from './services/watermark.service';

const PLUGIN_NAME = 'UNIVER_WATERMARK_PLUGIN';

export class UniverWatermarkPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverWatermarkConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @IRenderManagerService private readonly _renderManagerSrv: IRenderManagerService,
        @Inject(ILocalStorageService) private readonly _localStorageService: ILocalStorageService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(WATERMARK_PLUGIN_CONFIG_KEY, rest);

        this._initWatermarkStorage();
        this._initDependencies();
    }

    private async _initWatermarkStorage() {
        const config = this._configService.getConfig<IUniverWatermarkConfig>(WATERMARK_PLUGIN_CONFIG_KEY);
        if (!config) {
            return;
        }
        const { userWatermarkSettings, textWatermarkSettings, imageWatermarkSettings } = config;
        if (userWatermarkSettings) {
            this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, {
                type: IWatermarkTypeEnum.UserInfo,
                config: {
                    userInfo: merge({}, WatermarkUserInfoBaseConfig, userWatermarkSettings),
                },
            });
        } else if (textWatermarkSettings) {
            this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, {
                type: IWatermarkTypeEnum.Text,
                config: {
                    text: merge({}, WatermarkTextBaseConfig, textWatermarkSettings),
                },
            });
        } else if (imageWatermarkSettings) {
            this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, {
                type: IWatermarkTypeEnum.Image,
                config: {
                    image: merge({}, WatermarkImageBaseConfig, imageWatermarkSettings),
                },
            });
        } else {
            const config = await this._localStorageService.getItem<IWatermarkConfigWithType>(UNIVER_WATERMARK_STORAGE_KEY);
            if (config?.type === IWatermarkTypeEnum.UserInfo) {
                this._localStorageService.removeItem(UNIVER_WATERMARK_STORAGE_KEY);
            }
        }
    }

    private _initDependencies(): void {
        ([[WatermarkService]] as Dependency[]).forEach((d) => {
            this._injector.add(d);
        });
    }

    override onRendered(): void {
        const injector = this._injector;
        injector.get(WatermarkService);
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
