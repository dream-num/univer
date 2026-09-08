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

import type { IRuleEditProps } from '../panel/RuleEdit';
import { MobileDropdown, MobileSelect } from '@univerjs/design';
import { MobileRangeSelector } from '@univerjs/sheets-formula-ui';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '@univerjs/sheets-ui';
import { ComponentManager, useDependency } from '@univerjs/ui';
import { RuleEdit } from '../panel/RuleEdit';
import { MobileConditionalColorPicker } from './MobileColorPicker';

export function MobileRuleEdit(props: IRuleEditProps) {
    const componentManager = useDependency(ComponentManager);
    const FormulaEditorComponent = componentManager.get(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY);

    return (
        <RuleEdit
            {...props}
            SelectComponent={MobileSelect}
            DropdownComponent={MobileDropdown}
            ColorPickerComponent={MobileConditionalColorPicker}
            RangeSelectorComponent={MobileRangeSelector}
            FormulaEditorComponent={FormulaEditorComponent}
        />
    );
}
