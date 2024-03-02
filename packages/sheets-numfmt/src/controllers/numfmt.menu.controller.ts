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

import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';

import { AddDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem, PercentMenuItem, SubtractDecimalMenuItem } from '../menu/menu';

@OnLifecycle(LifecycleStages.Rendered, NumfmtMenuController)
export class NumfmtMenuController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IMenuService) private _menuService: IMenuService
    ) {
        super();
        this._initMenu();
    }

    private _initMenu() {
        [PercentMenuItem, AddDecimalMenuItem, SubtractDecimalMenuItem, CurrencyMenuItem, FactoryOtherMenuItem]
            .map((factory) => factory(this._componentManager))
            .forEach((configFactory) => {
                this.disposeWithMe(this._menuService.addMenuItem(configFactory(this._injector)));
            });
    }
}
