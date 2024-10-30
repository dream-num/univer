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

import type { FC } from 'react';
import type { IBusinessComponentProps } from '../interface';
import { LocaleService, numfmt, useDependency } from '@univerjs/core';
import { SelectList } from '@univerjs/design';
import { getDateFormatOptions } from '@univerjs/sheets-numfmt';
import React, { useMemo, useState } from 'react';

export const isDatePanel = (pattern: string) => {
    const info = numfmt.getInfo(pattern);
    return (
        getDateFormatOptions()
            .map((item) => item.value)
            .includes(pattern) || ['date', 'datetime', 'time'].includes(info.type)
    );
};

export const DatePanel: FC<IBusinessComponentProps> = (props) => {
    const options = useMemo(getDateFormatOptions, []);
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const [suffix, suffixSet] = useState(() => {
        if (props.defaultPattern) {
            const item = options.find((item) => item.value === props.defaultPattern);
            if (item) {
                return item.value;
            }
        }
        return options[0].value;
    });

    props.action.current = () => suffix;

    const onChange = (v: any) => {
        if (v === undefined) {
            return;
        }
        suffixSet(v);
        props.onChange(v);
    };

    return (
        <div>
            <div className="m-t-16 label">{t('sheet.numfmt.dateType')}</div>
            <div className="m-t-8">
                <SelectList value={suffix} options={options} onChange={onChange} />
            </div>
            <div className="describe m-t-14">{t('sheet.numfmt.dateDes')}</div>
        </div>
    );
};
