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

import type { UnitModel } from '@univerjs/core';
import type { IRenderContext, IRenderModule, IWatermarkConfigWithType } from '@univerjs/engine-render';
import { ILocalStorageService, Inject, RxDisposable, UserManagerService } from '@univerjs/core';
import { IWatermarkTypeEnum, UNIVER_WATERMARK_LAYER_INDEX, UNIVER_WATERMARK_STORAGE_KEY, WatermarkLayer } from '@univerjs/engine-render';
import { WatermarkService } from '../services/watermark.service';

export class WatermarkRenderController extends RxDisposable implements IRenderModule {
    private readonly _watermarkLayer: WatermarkLayer;

    constructor(
        private readonly _context: IRenderContext<UnitModel>,
        @Inject(WatermarkService) private _watermarkService: WatermarkService,
        @Inject(ILocalStorageService) private _localStorageService: ILocalStorageService,
        @Inject(UserManagerService) private _userManagerService: UserManagerService
    ) {
        super();
        this._watermarkLayer = new WatermarkLayer(_context.scene, [], UNIVER_WATERMARK_LAYER_INDEX);
        this._initAddRender();
        this._initWatermarkUpdate();
        this._initWatermarkConfig();
    }

    private _initAddRender() {
        const { scene } = this._context;
        scene.addLayer(this._watermarkLayer);
    }

    private async _initWatermarkConfig() {
        const config = await this._localStorageService.getItem<IWatermarkConfigWithType>(UNIVER_WATERMARK_STORAGE_KEY);
        if (config) {
            this._watermarkService.updateWatermarkConfig(config);
            this._context.mainComponent?.makeDirty();
        }
    }

    private _initWatermarkUpdate() {
        this.disposeWithMe(
            this._watermarkService.updateConfig$.subscribe((_config) => {
                if (!_config) {
                    this._watermarkLayer.updateConfig();
                    this._context.mainComponent?.makeDirty();
                    return;
                }
                if (_config.type === IWatermarkTypeEnum.UserInfo) {
                    this._watermarkLayer.updateConfig(_config, this._userManagerService.getCurrentUser());
                } else {
                    this._watermarkLayer.updateConfig(_config);
                }
                this._context.mainComponent?.makeDirty();
            })
        );
    }
}
