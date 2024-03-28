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

import { InputNumber } from '@univerjs/design';
import React, { useMemo, useState } from 'react';

import { useObservable } from '../hooks/observable';
import styles from './index.module.less';
import type { IFontSizeProps } from './interface';

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
        <div className={styles.uiPluginSheetsFontSize}>
            <InputNumber
                className={styles.uiPluginSheetsFontSizeInput}
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
