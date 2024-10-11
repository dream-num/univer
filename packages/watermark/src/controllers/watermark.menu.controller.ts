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

import { Disposable, Inject } from '@univerjs/core';
import { CrownSingle } from '@univerjs/icons';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { UNIVER_WATERMARK_MENU, WATERMARK_PANEL } from '../common/const';
import { WatermarkPanel } from '../views/WatermarkPanel';
import { menuSchema } from './menu.schema';

export class UniverWatermarkMenuController extends Disposable {
    constructor(
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();
        this._initMenu();
        this._initComponents();
    }

    private _initComponents() {
        ([
            [UNIVER_WATERMARK_MENU, CrownSingle],
            [WATERMARK_PANEL, WatermarkPanel],
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(key, component));
        });
    }

    private _initMenu() {
        this._menuManagerService.mergeMenu(menuSchema);
    }
}
