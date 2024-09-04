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
import { ComponentManager, IMenu2Service } from '@univerjs/ui';

import { MORE_NUMFMT_TYPE_KEY, MoreNumfmtType, Options, OPTIONS_KEY } from '../components/more-numfmt-type/MoreNumfmtType';
import { menuSchema } from './menu.schema';

@OnLifecycle(LifecycleStages.Rendered, NumfmtMenuController)
export class NumfmtMenuController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @IMenu2Service private readonly _menu2Service: IMenu2Service
    ) {
        super();
        this._initMenu();
    }

    private _initMenu() {
        this._menu2Service.mergeMenu(menuSchema);

        this.disposeWithMe((this._componentManager.register(MORE_NUMFMT_TYPE_KEY, MoreNumfmtType)));
        this.disposeWithMe((this._componentManager.register(OPTIONS_KEY, Options)));
    }
}
