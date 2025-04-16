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

import type { Injector } from '@wendellhu/redi';
import { IImageIoService, ImageSourceType } from '../../services/image-io/image-io.service';
import { LRUMap } from '../lru/lru-map';

export class ImageCacheMap {
    private _imageCacheMap: LRUMap<string, HTMLImageElement>;

    constructor(
        private _injector: Injector,
        maxSize = 100
    ) {
        this._imageCacheMap = new LRUMap(maxSize);
    }

    private _getImageCacheKey(imageSourceType: ImageSourceType, source: string) {
        return `${imageSourceType}-${source}`;
    }

    getImage(imageSourceType: ImageSourceType, source: string, onLoad?: () => void, onError?: () => void) {
        const imageCacheKey = this._getImageCacheKey(imageSourceType, source);
        let imageElement = this._imageCacheMap.get(imageCacheKey);
        if (imageElement) {
            return imageElement;
        } else {
            (async () => {
                imageElement = new Image();
                const imageIoService = this._injector.has(IImageIoService) ? this._injector.get(IImageIoService) : null;

                if (imageSourceType === ImageSourceType.UUID) {
                    try {
                        imageElement.src = await imageIoService?.getImage(source) || '';
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    imageElement.src = source;
                }

                imageElement.onload = () => {
                    onLoad?.();
                };
                imageElement.onerror = () => {
                    onError?.();
                };

                this._imageCacheMap.set(imageCacheKey, imageElement);
            })();

            return null;
        }
    }
}
