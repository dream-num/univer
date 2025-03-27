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
import type { IWatermarkConfigWithType } from '@univerjs/engine-render';
import { Disposable, ILocalStorageService, Inject } from '@univerjs/core';
import { UNIVER_WATERMARK_STORAGE_KEY } from '@univerjs/engine-render';
import { Subject } from 'rxjs';

export class WatermarkService extends Disposable {
    private readonly _updateConfig$ = new Subject<Nullable<IWatermarkConfigWithType>>();
    public readonly updateConfig$ = this._updateConfig$.asObservable();
    private readonly _refresh$ = new Subject<number>();
    public readonly refresh$ = this._refresh$.asObservable();

    constructor(
        @Inject(ILocalStorageService) private _localStorageService: ILocalStorageService
    ) {
        super();
    }

    public async getWatermarkConfig() {
        const res = await this._localStorageService.getItem<IWatermarkConfigWithType>(UNIVER_WATERMARK_STORAGE_KEY);
        return res;
    }

    public updateWatermarkConfig(config: IWatermarkConfigWithType) {
        this._localStorageService.setItem(UNIVER_WATERMARK_STORAGE_KEY, config);
        this._updateConfig$.next(config);
    }

    public deleteWatermarkConfig() {
        this._localStorageService.removeItem(UNIVER_WATERMARK_STORAGE_KEY);
        this._updateConfig$.next(null);
    }

    public refresh() {
        this._refresh$.next(Math.random());
    }

    override dispose(): void {
        this._refresh$.complete();
        this._updateConfig$.complete();
    }
}
