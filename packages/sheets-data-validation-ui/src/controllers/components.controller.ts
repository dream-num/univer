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
import { CheckboxIcon, DataValidationIcon, DatePickerIcon, DropdownListIcon } from '@univerjs/icons';
import { ComponentManager, IconManager } from '@univerjs/ui';
import { DATA_VALIDATION_PANEL } from '../commands/operations/data-validation.operation';
import { DataValidationPanel } from '../views/components';
import { DateShowTimeOption } from '../views/components/DateShowTimeOption';
import { DROPDOWN_PRESETS_COMPONENT, DropdownPresets } from '../views/components/DropdownPresets';
import { FORMULA_INPUTS } from '../views/components/formula-input';
import { ListRenderModeInput } from '../views/components/ListRenderModeInput';

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
            CheckboxIcon,
            DataValidationIcon,
            DatePickerIcon,
            DropdownListIcon,
        }));
    }

    private _registerComponents(): void {
        ([
            [DATA_VALIDATION_PANEL, DataValidationPanel],
            [ListRenderModeInput.componentKey, ListRenderModeInput],
            [DateShowTimeOption.componentKey, DateShowTimeOption],
            [DROPDOWN_PRESETS_COMPONENT, DropdownPresets],
            ...FORMULA_INPUTS,
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(key, component));
        });
    }
}
