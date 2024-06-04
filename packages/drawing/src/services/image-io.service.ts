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

import type { Nullable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';

export enum ImageSourceType {
    URL = 'URL',
    UUID = 'UUID',
    BASE64 = 'BASE64',
}

export enum ImageUploadStatusType {
    SUCCUSS = '0',
    ERROR_EXCEED_SIZE = '1',
    ERROR_IMAGE_TYPE = '2',
    ERROR_UPLOAD_COUNT_LIMIT = '3',
    ERROR_IMAGE = '4',
}

export interface IImageIoServiceParam {
    imageId: string;
    imageSourceType: ImageSourceType;
    source: string;
    base64Cache: string;
    status: ImageUploadStatusType;
}

export interface IImageIoService {
    change$: Observable<number>;
    setWaitCount(count: number): void;

    getImage(imageId: string): Promise<string>;

    saveImage(imageFile: File): Promise<Nullable<IImageIoServiceParam>>;

    getImageSourceCache(source: string, imageSourceType: ImageSourceType): Nullable<HTMLImageElement>;
    addImageSourceCache(source: string, imageSourceType: ImageSourceType, imageSource: Nullable<HTMLImageElement>): void;
}

export const IImageIoService = createIdentifier<IImageIoService>('core.image-io.service');
