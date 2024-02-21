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

import { LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { DataValidationPanelName } from '@univerjs/data-validation';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import { DataValidationPanel } from '../views/components';
import { DataValidationMenu } from './dv.menu';

@OnLifecycle(LifecycleStages.Rendered, DataValidationRenderController)
export class DataValidationRenderController extends RxDisposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @IMenuService private _menuService: IMenuService
    ) {
        super();
        this._init();
    }

    private _init() {
        this.disposeWithMe(
            this._componentManager.register(
                DataValidationPanelName,
                DataValidationPanel
            )
        );
        this.disposeWithMe(
            this._menuService.addMenuItem(
                DataValidationMenu
            )
        );
    }
}
