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

import { Disposable, Inject, Injector, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';

import { BehaviorSubject } from 'rxjs';
import { AddDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem, PercentMenuItem, SubtractDecimalMenuItem } from '../menu/menu';
import { MORE_NUMFMT_TYPE_KEY, MoreNumfmtType, Options, OPTIONS_KEY } from '../components/more-numfmt-type/MoreNumfmtType';
import type { countryCurrencyMap } from '../base/const/CURRENCY-SYMBOLS';

export interface IUniverSheetsNumfmtConfig {
    menu: MenuConfig;
}

export const DefaultSheetNumfmtConfig = {};

@OnLifecycle(LifecycleStages.Rendered, NumfmtMenuController)
export class NumfmtMenuController extends Disposable {
    private _currencySymbol$ = new BehaviorSubject<keyof typeof countryCurrencyMap>('US');
    public readonly currencySymbol$ = this._currencySymbol$.asObservable();

    constructor(
        private readonly _config: Partial<IUniverSheetsNumfmtConfig>,
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IMenuService) private _menuService: IMenuService
    ) {
        super();
        this._initMenu();
    }

    private _initMenu() {
        const { menu = {} } = this._config;

        [PercentMenuItem, AddDecimalMenuItem, SubtractDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem]
            .forEach((factory) => {
                this.disposeWithMe(this._menuService.addMenuItem(factory(this._injector), menu));
            });

        this.disposeWithMe((this._componentManager.register(MORE_NUMFMT_TYPE_KEY, MoreNumfmtType)));
        this.disposeWithMe((this._componentManager.register(OPTIONS_KEY, Options)));
    }

    /**
     * Set the currency symbol by setting the country code.
     */
    public setCurrencySymbolByCountryCode(symbol: keyof typeof countryCurrencyMap) {
        this._currencySymbol$.next(symbol);
    }

    public getCurrencySymbol() {
        return this._currencySymbol$.getValue();
    }
}
