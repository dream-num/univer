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
import React, { useState } from 'react';

import { CascaderList } from './CascaderList';

const meta: Meta<typeof CascaderList> = {
    title: 'Components / CascaderList',
    component: CascaderList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState<string[]>([]);

        const options = [
            {
                value: '常规',
                label: '常规',
                children: [
                    {
                        value: 'hangzhou',
                        label: 'Hangzhou',
                    },
                ],
            },
            {
                value: '货币',
                label: '货币',
                children: [
                    {
                        value: 'nanjing',
                        label: 'Nanjing',
                    },
                ],
            },
            {
                value: '自定义',
                label: '自定义',
                children: [
                    {
                        value: 'beijing',
                        label: 'beijing',
                        children: [
                            {
                                value: '-1,234.00',
                                label: '-1,234.00',
                            },
                            {
                                value: '(1,234.00)',
                                label: '(1,234.00)',
                            },
                        ],
                    },
                ],
            },
            {
                value: '日期',
                label: '日期',
                children: [],
            },
            {
                value: '会计专用',
                label: '会计专用',
            },
            {
                value: '百分比',
                label: '百分比',
                children: [
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                    {
                        value: '1.23%',
                        label: '1.23%',
                    },
                    {
                        value: '123.00%',
                        label: '123.00%',
                    },
                ],
            },
        ];

        function handleChange(value: string[]) {
            setValue(value);
        }

        return <CascaderList wrapperClassName="univer-h-[150px]" value={value} options={options} onChange={handleChange} />;
    },
};
