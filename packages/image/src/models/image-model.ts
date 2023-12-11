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

export interface IImageData {
    imageId: string;
    contentUrl: string;
}

export class ImageModel {
    private _imageShapeKey: Nullable<string>;

    constructor(private _imageData: IImageData) {}

    getImageData() {
        return this._imageData;
    }

    getUrl() {
        return this._imageData.contentUrl;
    }

    getId() {
        return this._imageData.imageId;
    }

    setKey(key: string) {
        this._imageShapeKey = key;
    }

    getKey() {
        return this._imageShapeKey;
    }

    hasRender() {
        return this._imageShapeKey != null;
    }
}
