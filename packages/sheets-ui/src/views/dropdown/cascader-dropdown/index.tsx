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

import type { ICascaderOption } from '@univerjs/design';
import type { IPopup } from '@univerjs/ui';
import type { IBaseDropdownProps } from '../type';
import { CascaderList } from '@univerjs/design';
import { useState } from 'react';

export interface ICascaderDropdownProps {
    options: ICascaderOption[];
    defaultValue?: string[];
    onChange: (value: string[]) => void;
}

export function CascaderDropdown(props: { popup: IPopup<ICascaderDropdownProps & IBaseDropdownProps> }) {
    const { popup } = props;
    const { extraProps } = popup;
    const { options, defaultValue, onChange } = extraProps!;
    const [localValue, setLocalValue] = useState(defaultValue ?? []);

    return (
        <CascaderList
            options={options}
            value={localValue}
            onChange={onChange}
        />
    );
}

CascaderDropdown.componentKey = 'sheets.dropdown.cascader';
