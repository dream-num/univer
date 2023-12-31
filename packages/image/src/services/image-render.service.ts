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
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';

export interface IImageRenderParam {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
    imageId: string;
}

export interface IImageRenderService {
    dispose(): void;

    add(key: string, param: IImageRenderParam): void;

    remove(key: string): void;

    get(key: string): Nullable<IImageRenderParam>;
}

/**
 *
 */
export class ImageRenderService implements IDisposable, IImageRenderService {
    private _imageRenderInfo: Map<string, IImageRenderParam> = new Map();

    dispose(): void {
        this._imageRenderInfo.clear();
    }

    add(key: string, param: IImageRenderParam) {
        this._imageRenderInfo.set(key, param);
    }

    remove(key: string) {
        this._imageRenderInfo.delete(key);
    }

    get(key: string): Nullable<IImageRenderParam> {
        return this._imageRenderInfo.get(key);
    }
}

export const IImageRenderService = createIdentifier<IImageRenderService>('univer.plugin.image-render.service');
