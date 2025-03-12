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

import type { IDrawingParam, ISrcRect, Nullable, PresetGeometryType, Serializable } from '@univerjs/core';
import type { ImageSourceType } from '../services/image-io.service';

export interface IImageData extends IDrawingParam {
    imageSourceType: ImageSourceType;
    source: string;
    /**
     * 20.1.8.55 srcRect (Source Rectangle)
     */
    srcRect?: Nullable<ISrcRect>;
    /**
     * 20.1.9.18 prstGeom (Preset geometry)
     */
    prstGeom?: Nullable<PresetGeometryType>;
}

export interface IDocFloatDomDataBase {
    componentKey: string;
    data?: Serializable;
    allowTransform?: boolean;
}

export interface IDocFloatDomData extends IDrawingParam, IDocFloatDomDataBase {

}
