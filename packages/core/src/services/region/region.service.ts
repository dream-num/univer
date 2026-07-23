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

import type { Observable } from 'rxjs';
import type { LocaleType } from '../../types/enum/locale-type';
import { BehaviorSubject } from 'rxjs';
import { Inject } from '../../common/di';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import { LocaleService } from '../locale/locale.service';

export class RegionService extends Disposable {
    private readonly _currentRegion$: BehaviorSubject<LocaleType>;
    readonly currentRegion$: Observable<LocaleType>;

    private _hasExplicitRegion = false;

    constructor(@Inject(LocaleService) private readonly _localeService: LocaleService) {
        super();

        this._currentRegion$ = new BehaviorSubject<LocaleType>(this._localeService.getCurrentLocale());
        this.currentRegion$ = this._currentRegion$.asObservable();

        this.disposeWithMe(this._localeService.currentLocale$.subscribe((locale) => {
            if (!this._hasExplicitRegion && locale !== this._currentRegion$.value) {
                this._currentRegion$.next(locale);
            }
        }));
        this.disposeWithMe(toDisposable(() => this._currentRegion$.complete()));
    }

    setRegion(region: LocaleType): void {
        this._hasExplicitRegion = true;
        this._currentRegion$.next(region);
    }

    getCurrentRegion(): LocaleType {
        return this._currentRegion$.value;
    }
}
