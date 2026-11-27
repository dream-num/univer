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
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import type { IFormulaSeparators } from './formula-separators';
import type { IRegionalNumberFormat } from './number-format';
import { Inject } from '../../common/di';
import { Disposable, toDisposable } from '../../shared/lifecycle';
import { LocaleService } from '../locale/locale.service';
import { getFormulaSeparators } from './formula-separators';
import { getRegionalNumberFormat } from './number-format';

export class RegionService extends Disposable {
    private readonly _currentRegion$: BehaviorSubject<string>;
    readonly currentRegion$: Observable<string>;
    readonly explicitRegion$: Observable<string | undefined>;

    private _hasExplicitRegion = false;

    constructor(@Inject(LocaleService) private readonly _localeService: LocaleService) {
        super();

        this._currentRegion$ = new BehaviorSubject<string>(this._localeService.getCurrentLocale());
        this.currentRegion$ = this._currentRegion$.asObservable();
        this.explicitRegion$ = this.currentRegion$.pipe(map(() => this.getExplicitRegion()), distinctUntilChanged());

        this.disposeWithMe(this._localeService.currentLocale$.subscribe((locale) => this.setDefaultRegion(locale)));
        this.disposeWithMe(toDisposable(() => this._currentRegion$.complete()));
    }

    /** Provide a locale-derived default until the caller explicitly selects a region. */
    setDefaultRegion(region: string): void {
        if (!this._hasExplicitRegion && region !== this._currentRegion$.value) this._currentRegion$.next(region);
    }

    setRegion(region: string): void {
        this._hasExplicitRegion = true;
        this._currentRegion$.next(region);
    }

    /** Excel formula punctuation for the current region, independent of the interface language packs. */
    getFormulaSeparators(): IFormulaSeparators {
        return getFormulaSeparators(this.getCurrentRegion());
    }

    getNumberFormat(): IRegionalNumberFormat {
        return getRegionalNumberFormat(this.getCurrentRegion());
    }

    getExplicitRegion(): string | undefined {
        return this._hasExplicitRegion ? this.getCurrentRegion() : undefined;
    }

    getCurrentRegion(): string {
        return this._currentRegion$.value;
    }
}
