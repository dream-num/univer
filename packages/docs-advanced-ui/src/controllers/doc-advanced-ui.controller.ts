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
import { IMenuService } from '@univerjs/ui';
import { CopyMenuFactory, CutMenuFactory, DeleteMenuFactory, PasteMenuFactory } from './menu';

export interface IDocAdvancedUIConfig {
    menu?: MenuConfig;
}

@OnLifecycle(LifecycleStages.Rendered, DocAdvancedUIController)
export class DocAdvancedUIController extends Disposable {
    constructor(
        private _config: IDocAdvancedUIConfig = {},
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initMenus();
    }

    private _initMenus() {
        const { menu = {} } = this._config;
        [
            CopyMenuFactory,
            CutMenuFactory,
            PasteMenuFactory,
            DeleteMenuFactory,
        ].forEach((menuItem) => {
            this.disposeWithMe(this._menuService.addMenuItem(menuItem(this._injector), menu));
        });
    }
}
