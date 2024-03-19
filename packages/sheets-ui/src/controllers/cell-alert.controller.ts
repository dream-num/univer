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
import { ComponentManager } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import { CellAlert } from '../views/cell-alert/CellAlertPopup';
import { CellDropdown, DROP_DOWN_KEY } from '../views/drop-down';
import { CELL_ALERT_KEY } from '../views/cell-alert';

@OnLifecycle(LifecycleStages.Starting, CellAlertController)
export class CellAlertController extends Disposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager
    ) {
        super();
        this._initComponent();
    }

    private _initComponent() {
        this._componentManager.register(CELL_ALERT_KEY, CellAlert);
        this._componentManager.register(DROP_DOWN_KEY, CellDropdown);
    }
}
