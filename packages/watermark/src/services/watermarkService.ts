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
import type { IWatermarkConfigWithType } from '../common/type';
import { Disposable, ILocalStorageService, Inject } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { UNIVER_WATERMARK_STORAGE_KEY } from '../common/const';
import { IWatermarkTypeEnum } from '../common/type';

export class UniverWatermarkService extends Disposable {
    private _updateConfig$ = new Subject<Nullable<IWatermarkConfigWithType>>();
    public updateConfig$ = this._updateConfig$.asObservable();
    private _menuHidden$ = new BehaviorSubject<boolean>(false);
    public menuHidden$ = this._menuHidden$.asObservable();
    private _refresh$ = new Subject<number>();
    public refresh$ = this._refresh$.asObservable();

    constructor(
        @Inject(ILocalStorageService) private _localStorageService: ILocalStorageService
    ) {
        super();
        this._initMenuHiddenState();
    }

    private async _initMenuHiddenState() {
        const config = await this._localStorageService.getItem<IWatermarkConfigWithType>(UNIVER_WATERMARK_STORAGE_KEY);
        if (config?.type === IWatermarkTypeEnum.UserInfo) {
            this._menuHidden$.next(true);
        } else {
            this._menuHidden$.next(false);
        }
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
}
