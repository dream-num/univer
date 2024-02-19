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

import React, { useState } from 'react';

import { Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { LocaleService } from '@univerjs/core';
import type { IExampleItem } from '../../services/script-editor.service';
import styles from './index.module.less';

export interface IScriptExampleProps {
    onChange: (value: string) => void;
    options: IExampleItem[];
}

export function ScriptExample(props: IScriptExampleProps) {
    const { onChange, options } = props;

    const allTypeValue = options[0].label;
    const [typeSelected, setTypeSelected] = useState(allTypeValue);

    const localeService = useDependency(LocaleService);

    const example = localeService.t('script-panel.example');

    function handleSelectChange(value: string) {
        setTypeSelected(value);
        onChange(value);
    }

    return (
        <div className={styles.scriptExample}>
            <span className={styles.scriptExampleLabel}>{example}</span>
            <span className={styles.scriptExampleSelect}>
                <Select value={typeSelected} options={options} onChange={handleSelectChange} />
            </span>
        </div>
    );
}
