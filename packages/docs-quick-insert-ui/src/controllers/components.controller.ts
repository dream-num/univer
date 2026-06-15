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
import { DividerIcon, TextIcon } from '@univerjs/icons';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { KeywordInputPlaceholder } from '../views/KeywordInputPlaceholder';
import { QuickInsertButton } from '../views/QuickInsertButton';
import { QuickInsertPlaceholder } from '../views/QuickInsertPlaceholder';
import { QuickInsertPopup } from '../views/QuickInsertPopup';

export class ComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IconManager) private readonly _iconManager: IconManager
    ) {
        super();

        this._registerIcons();
        this._registerComponents();
    }

    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register({
            DividerIcon,
            TextIcon,
        }));
    }

    private _registerComponents(): void {
        ([
            [QuickInsertPopup.componentKey, QuickInsertPopup],
            [KeywordInputPlaceholder.componentKey, KeywordInputPlaceholder],
            [QuickInsertPlaceholder.componentKey, QuickInsertPlaceholder],
            [QuickInsertButton.componentKey, QuickInsertButton],
        ] as const).forEach(([key, comp]) => {
            if (key) {
                this.disposeWithMe(this._componentManager.register(key, comp));
            }
        });
    }
}
