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

import type { IFontSizeProps } from './interface';
import { InputNumber } from '@univerjs/design';
import React, { useMemo, useState } from 'react';
import { useObservable } from '../../utils/di';

export const FontSize = (props: IFontSizeProps) => {
    const { value, min, max, onChange, disabled$ } = props;
    const disabled = useObservable(disabled$);
    const [realValue, setRealValue] = useState<number>(Number(value ?? 0));

    const _value = useMemo(() => Number(value ?? realValue), [value]);

    function handleChange(value: number | null) {
        if (value === null) return;

        setRealValue(value);
    }

    function handleStopPropagation(e: React.KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (e.code === 'Enter') {
            onChange(realValue.toString());
        }
    }

    return (
        <div className="univer-h-6 univer-w-7 univer-text-sm">
            <InputNumber
                className={`
                  univer-block univer-h-6 univer-border-none univer-bg-transparent univer-leading-6
                  [&_input:focus]:!univer-ring-0
                  [&_input]:univer-h-6 [&_input]:univer-w-7 [&_input]:univer-border-none [&_input]:univer-bg-transparent
                  [&_input]:univer-p-0 [&_input]:univer-text-sm
                `}
                value={_value}
                controls={false}
                min={min}
                max={max}
                onKeyDown={handleStopPropagation}
                onChange={handleChange}
                disabled={disabled}
            />
        </div>
    );
};
