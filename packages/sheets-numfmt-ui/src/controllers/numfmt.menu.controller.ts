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

import { Disposable, Inject } from '@univerjs/core';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';

import { MORE_NUMFMT_TYPE_KEY, MoreNumfmtType, Options, OPTIONS_KEY } from '../views/components/MoreNumfmtType';
import { menuSchema } from './menu.schema';

export class NumfmtMenuController extends Disposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService
    ) {
        super();

        this._initMenu();
    }

    private _initMenu() {
        this._menuManagerService.mergeMenu(menuSchema);

        this.disposeWithMe((this._componentManager.register(MORE_NUMFMT_TYPE_KEY, MoreNumfmtType)));
        this.disposeWithMe((this._componentManager.register(OPTIONS_KEY, Options)));
    }
}
