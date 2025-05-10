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

import type { dayjs } from '@univerjs/core';
import type { BasePickerPanelProps } from 'rc-picker';
import { PickerPanel } from 'rc-picker';
import generateConfig from 'rc-picker/lib/generate/dayjs';
import { useContext } from 'react';
import { ConfigContext } from '../config-provider/ConfigProvider';
import './index.css';

export type IDatePanelProps = Omit<BasePickerPanelProps<dayjs.Dayjs>, 'prefixCls' | 'locale' | 'generateConfig'> & {
    multiple?: boolean;
    defaultValue?: dayjs.Dayjs | dayjs.Dayjs[];
    value?: dayjs.Dayjs | dayjs.Dayjs[];
    onChange?: (date: dayjs.Dayjs | dayjs.Dayjs[]) => void;
};

export const DatePanel = (props: IDatePanelProps) => {
    const { locale } = useContext(ConfigContext);

    return (
        <PickerPanel
            {...props}
            prefixCls="univer-date-picker"
            generateConfig={generateConfig}
            locale={locale?.Picker!}
        />
    );
};
