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

import type { IUser, Nullable } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import type { ILayerRenderOptions } from '../../../layer';
import type { IWatermarkConfigWithType } from './type';
import { Layer } from '../../../layer';
import { IWatermarkTypeEnum } from './type';
import { renderWatermark } from './util';

export class WatermarkLayer extends Layer {
    private _config: Nullable<IWatermarkConfigWithType & { user?: IUser }>;
    private _image: Nullable<HTMLImageElement>;
    private _user: Nullable<IUser>;

    override render(ctx?: UniverRenderingContext, isMaxLayer = false, options: ILayerRenderOptions = {}) {
        super.render(ctx, isMaxLayer, options);
        const mainCtx = ctx || this.scene.getEngine()?.getCanvas().getContext();
        if (mainCtx && mainCtx.getId()) {
            mainCtx.save();
            if (options.dirtyBounds) {
                mainCtx.beginPath();
                for (const bound of options.dirtyBounds) {
                    mainCtx.rect(bound.left, bound.top, bound.right - bound.left, bound.bottom - bound.top);
                }
                mainCtx.clip();
            }
            this._renderWatermark(mainCtx);
            mainCtx.restore();
        }
        return this;
    }

    public updateConfig(config?: IWatermarkConfigWithType, user?: IUser) {
        this._config = config;
        if (this._config?.type === IWatermarkTypeEnum.Image && this._config.config.image) {
            this._image = new Image();
            this._image.src = this._config.config.image.url;
        }
        if (user) {
            this._user = user;
        }
    }

    private _renderWatermark(ctx: UniverRenderingContext) {
        if (this._config) {
            renderWatermark(ctx, this._config, this._image, this._user);
        }
    }
}
