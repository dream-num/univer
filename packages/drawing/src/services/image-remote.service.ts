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

import type { IImageRemoteService, IImageRemoteServiceParam, Nullable } from '@univerjs/core';
import { ImageSourceType, ImageUploadStatusType, Tools } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export const ALLOW_IMAGE_LIST = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];

const ALLOW_IMAGE_SIZE = 5 * 1024 * 1024;

export class ImageRemoteService implements IImageRemoteService {
    private _waitCount = 0;

    private _change$ = new Subject<number>();
    change$ = this._change$ as Observable<number>;

    setWaitCount(count: number) {
        this._waitCount = count;
        this._change$.next(count);
    }

    getWaitCount() {
        return this._waitCount;
    }

    decreaseWaiting() {
        this._waitCount -= 1;
        this._change$.next(this._waitCount);
    }

    imageSourceCache: Map<string, HTMLImageElement> = new Map();
    getImageSourceCache(source: string, imageSourceType: ImageSourceType) {
        if (imageSourceType === ImageSourceType.BASE64) {
            const image = new Image();
            image.src = source;
            return image;
        }
        return this.imageSourceCache.get(source);
    }

    addImageSourceCache(source: string, imageSourceType: ImageSourceType, imageSource: Nullable<HTMLImageElement>) {
        if (imageSourceType === ImageSourceType.BASE64 || imageSource == null) {
            return;
        }
        this.imageSourceCache.set(source, imageSource);
    }

    async getImage(imageId: string): Promise<string> {
        return Promise.resolve(imageId);
    }

    async saveImage(imageFile: File): Promise<Nullable<IImageRemoteServiceParam>> {
        return new Promise((resolve, reject) => {
            if (!ALLOW_IMAGE_LIST.includes(imageFile.type)) {
                resolve({
                    imageId: '',
                    imageSourceType: ImageSourceType.BASE64,
                    source: '',
                    base64Cache: '',
                    status: ImageUploadStatusType.ERROR_IMAGE_TYPE,
                });
            }
            if (imageFile.size > ALLOW_IMAGE_SIZE) {
                resolve({
                    imageId: '',
                    imageSourceType: ImageSourceType.BASE64,
                    source: '',
                    base64Cache: '',
                    status: ImageUploadStatusType.ERROR_EXCEED_SIZE,
                });
            }
            // 获取上传的图片的宽高
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = (evt) => {
                const replaceSrc = evt.target?.result as string;
                if (replaceSrc == null) {
                    reject(new Error('Image is null'));
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

                this.decreaseWaiting();
            };
        });
    }

    async applyFilter(imageId: string): Promise<string> {
        return Promise.resolve(imageId);
    }

    async applyAI(imageId: string, operatorType: string): Promise<string> {
        return Promise.resolve(imageId);
    }
}

