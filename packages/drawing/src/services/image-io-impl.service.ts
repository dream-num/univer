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

import type { Nullable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { IImageIoService, IImageIoServiceParam } from './image-io.service';
import { Tools } from '@univerjs/core';
import { Subject } from 'rxjs';
import { DRAWING_IMAGE_ALLOW_IMAGE_LIST, DRAWING_IMAGE_ALLOW_SIZE } from '../basics/config';
import { ImageSourceType, ImageUploadStatusType } from './image-io.service';

export class ImageIoService implements IImageIoService {
    private _waitCount = 0;

    private _change$ = new Subject<number>();
    change$ = this._change$ as Observable<number>;

    setWaitCount(count: number) {
        this._waitCount = count;
        this._change$.next(count);
    }

    private _imageSourceCache: Map<string, HTMLImageElement> = new Map();
    getImageSourceCache(source: string, imageSourceType: ImageSourceType) {
        if (imageSourceType === ImageSourceType.BASE64) {
            const image = new Image();
            image.src = source;
            return image;
        }
        return this._imageSourceCache.get(source);
    }

    addImageSourceCache(source: string, imageSourceType: ImageSourceType, imageSource: Nullable<HTMLImageElement>) {
        if (imageSourceType === ImageSourceType.BASE64 || imageSource == null) {
            return;
        }
        this._imageSourceCache.set(source, imageSource);
    }

    async getImage(imageId: string): Promise<string> {
        return Promise.resolve(imageId);
    }

    async saveImage(imageFile: File): Promise<Nullable<IImageIoServiceParam>> {
        return new Promise((resolve, reject) => {
            if (!DRAWING_IMAGE_ALLOW_IMAGE_LIST.includes(imageFile.type)) {
                reject(new Error(ImageUploadStatusType.ERROR_IMAGE_TYPE));
                this._decreaseWaiting();
                return;
            }
            if (imageFile.size > DRAWING_IMAGE_ALLOW_SIZE) {
                reject(new Error(ImageUploadStatusType.ERROR_EXCEED_SIZE));
                this._decreaseWaiting();
                return;
            }
            // 获取上传的图片的宽高
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = (evt) => {
                const replaceSrc = evt.target?.result as string;
                if (replaceSrc == null) {
                    reject(new Error(ImageUploadStatusType.ERROR_IMAGE));
                    this._decreaseWaiting();
                    return;
                }

                const imageId = Tools.generateRandomId(6);
                resolve({
                    imageId,
                    imageSourceType: ImageSourceType.BASE64,
                    source: replaceSrc,
                    base64Cache: replaceSrc,
                    status: ImageUploadStatusType.SUCCUSS,
                });

                this._decreaseWaiting();
            };
        });
    }

    private _decreaseWaiting() {
        this._waitCount -= 1;
        this._change$.next(this._waitCount);
    }
}
