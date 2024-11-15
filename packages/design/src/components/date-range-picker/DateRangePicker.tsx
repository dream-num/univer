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

import type { dayjs } from '@univerjs/core';
import type { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import { CalendarSingle, GuideSingle } from '@univerjs/icons';
import { RangePicker } from 'rc-picker';
import generateConfig from 'rc-picker/lib/generate/dayjs';
import React, { useContext } from 'react';
import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

export interface IDateRangePickerProps {
    /**
     * The value of the date picker.
     */
    value: NoUndefinedRangeValueType<dayjs.Dayjs>;

    /**
     * Callback when the value of the date picker changes.
     */
    onChange: (date: NoUndefinedRangeValueType<dayjs.Dayjs>, dateString: [string, string]) => void;
}

export function DateRangePicker(props: IDateRangePickerProps) {
    const { value, onChange } = props;

    const { locale } = useContext(ConfigContext);

    function handleChange(date: NoUndefinedRangeValueType<dayjs.Dayjs> | null, dateString: [string, string]) {
        if (Array.isArray(date) && Array.isArray(dateString)) {
            onChange(date, dateString);
        }
    }

    return (
        <RangePicker<dayjs.Dayjs>
            value={value}
            prefixCls={styles.dateRangePicker}
            generateConfig={generateConfig}
            locale={locale?.Picker!}
            separator={<GuideSingle />}
            suffixIcon={<CalendarSingle className={styles.dateRangePickerSuffixIcon} />}
            onChange={handleChange}
        />
    );
}
