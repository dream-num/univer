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

import React, { useContext } from 'react';
import { RangePicker } from 'rc-picker';
import generateConfig from 'rc-picker/lib/generate/dayjs';
import { CalendarSingle, GuideSingle } from '@univerjs/icons';
import type { Dayjs } from 'dayjs';
import type { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

export interface IDateRangePickerProps {
    /**
     * The value of the date picker.
     */
    value: NoUndefinedRangeValueType<Dayjs>;

    /**
     * Callback when the value of the date picker changes.
     */
    onChange: (date: NoUndefinedRangeValueType<Dayjs>, dateString: [string, string]) => void;
}

export function DateRangePicker(props: IDateRangePickerProps) {
    const { value, onChange } = props;

    const { locale } = useContext(ConfigContext);

    function handleChange(date: NoUndefinedRangeValueType<Dayjs> | null, dateString: [string, string]) {
        if (Array.isArray(date) && Array.isArray(dateString)) {
            onChange(date, dateString);
        }
    }

    return (
        <RangePicker<Dayjs>
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
