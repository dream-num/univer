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
import { FunctionIcon } from '@univerjs/icons';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, RANGE_SELECTOR_COMPONENT_KEY } from '@univerjs/sheets-ui';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { FormulaEditor } from '../views/formula-editor/index';
import { MORE_FUNCTIONS_COMPONENT } from '../views/more-functions/interface';
import { MoreFunctions } from '../views/more-functions/MoreFunctions';
import { RangeSelector } from '../views/range-selector';

export class ComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IconManager) private readonly _iconManager: IconManager
    ) {
        super();

        this._registerComponents2();
        this._registerIcons();
        this._registerComponents();
    }

    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register({
            FunctionIcon,
        }));
    }

    private _registerComponents(): void {
        this._componentManager.register(MORE_FUNCTIONS_COMPONENT, MoreFunctions);
    }

    private _registerComponents2(): void {
        this.disposeWithMe(this._componentManager.register(RANGE_SELECTOR_COMPONENT_KEY, RangeSelector));

        this.disposeWithMe(this._componentManager.register(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, FormulaEditor));
    }
}
