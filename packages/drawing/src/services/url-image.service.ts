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

import type { IDisposable, IURLImageService } from '@univerjs/core';
import { Disposable, toDisposable } from '@univerjs/core';

export class URLImageService extends Disposable implements IURLImageService {
    private _urlImageDownloader: ((url: string) => Promise<string>) | null = null;

    registerURLImageDownloader(downloader: (url: string) => Promise<string>): IDisposable {
        this._urlImageDownloader = downloader;
        return toDisposable(() => {
            this._urlImageDownloader = null;
        });
    }

    async getImage(url: string): Promise<string> {
        if (this._urlImageDownloader) {
            try {
                return await this._urlImageDownloader(url);
            } catch (error) {
                console.error(`Custom downloader failed for ${url}, falling back to default behavior:`, error);
            }
        }

        return url;
    }

    async downloadImage(url: string): Promise<Blob> {
        if (this._urlImageDownloader) {
            try {
                const base64 = await this._urlImageDownloader(url);
                const response = await fetch(base64);
                return await response.blob();
            } catch (error) {
                console.error(`Custom downloader failed for ${url}, falling back to default fetch:`, error);
            }
        }

        const response = await fetch(url);
        return await response.blob();
    }
}
