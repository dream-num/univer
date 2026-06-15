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
import { SearchIcon } from '@univerjs/icons';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { FindReplaceDialog } from '../views/dialog/FindReplaceDialog';

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
            SearchIcon,
        }));
    }

    private _registerComponents(): void {
        ([
            ['FindReplaceDialog', FindReplaceDialog],
        ] as const).forEach(([key, comp]) => {
            this.disposeWithMe(
                this._componentManager.register(key, comp)
            );
        });
    }
}
