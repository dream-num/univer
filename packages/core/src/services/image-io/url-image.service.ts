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

import type { IDisposable } from '../../common/di';
import { createIdentifier } from '../../common/di';

export interface IURLImageService {
    /**
     * Get image url or base64.
     * if there is a custom downloader, return the result of the downloader (usually base64).
     * if there is no custom downloader, return the original url.
     * @param url image url
     */
    getImage(url: string): Promise<string>;

    /**
     * Download image to blob
     * @param url image url
     */
    downloadImage(url: string): Promise<Blob>;

    /**
     * Register a custom image downloader for URL images
     * @param downloader The downloader function that takes a URL and returns a base64 string
     * @returns A disposable object to unregister the downloader
     */
    registerURLImageDownloader(downloader: (url: string) => Promise<string>): IDisposable;
}

export const IURLImageService = createIdentifier<IURLImageService>('core.url-image.service');
