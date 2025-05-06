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

import type { Meta } from '@storybook/react';

import type { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import { dayjs } from '@univerjs/core';
import { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';

const meta: Meta<typeof DateRangePicker> = {
    title: 'Components / DateRangePicker',
    component: DateRangePicker,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const DateRangePickerBasic = {
    render() {
        const [value, setValue] = useState<NoUndefinedRangeValueType<dayjs.Dayjs>>([dayjs(), dayjs().add(7, 'day')]);

        return (
            <DateRangePicker value={value} onChange={setValue} />
        );
    },
};
