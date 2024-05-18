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
import { ImageSourceType, Tools } from '@univerjs/core';

export const ALLOW_IMAGE_LIST = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];

const ALLOW_IMAGE_SIZE = 5 * 1024 * 1024;


export class ImageRemoteService implements IImageRemoteService {
    async getImage(imageId: string): Promise<string> {
        return Promise.resolve(imageId);
    }

    async saveImage(imageFile: File): Promise<Nullable<IImageRemoteServiceParam>> {
        return new Promise((resolve, reject) => {
            if (!ALLOW_IMAGE_LIST.includes(imageFile.type)) {
                reject(new Error('Not support image type'));
            }
            if (imageFile.size > ALLOW_IMAGE_SIZE) {
                reject(new Error('Image size is too large'));
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
                });
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

