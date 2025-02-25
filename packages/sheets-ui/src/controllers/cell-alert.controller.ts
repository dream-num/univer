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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject } from '@univerjs/core';
import { ComponentManager } from '@univerjs/ui';
import { CELL_ALERT_KEY } from '../views/cell-alert';
import { CellAlert } from '../views/cell-alert/CellAlertPopup';

// FIXME@weird94: this should not be render module

export class CellAlertRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(ComponentManager) private _componentManager: ComponentManager
    ) {
        super();
        this._initComponent();
    }

    private _initComponent() {
        this._componentManager.register(CELL_ALERT_KEY, CellAlert);
    }
}
