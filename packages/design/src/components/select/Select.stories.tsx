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
import type { Meta } from '@storybook/react';

import { Select } from './Select';
import type { ISelectProps } from './Select';

const meta: Meta<typeof Select> = {
    title: 'Components / Select',
    component: Select,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const SelectBasic = {
    render() {
        const [value, setValue] = useState('');

        const options = [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3 Option 3 Option 3 Option 3 Option 3 Option 3', value: 'option3' },
        ];

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return <Select value={value} options={options} onChange={handleChange} />;
    },
};

export const SelectEmpty = {
    render() {
        const [value, setValue] = useState('');

        const options: ISelectProps['options'] = [];

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return <Select value={value} options={options} onChange={handleChange} />;
    },
};

export const SelectBorderless = {
    render() {
        const [value, setValue] = useState('');

        const options = [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3 Option 3 Option 3 Option 3 Option 3 Option 3', value: 'option3' },
        ];

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return <Select value={value} options={options} onChange={handleChange} borderless />;
    },
};

export const SelectGroup = {
    render() {
        const [value, setValue] = useState('');

        const options = [
            { label: 'Option 1', value: 'option1' },
            {
                options: [
                    {
                        label: 'Option 2-2',
                        value: 'option22',
                    },
                    {
                        label: 'Option 2-3',
                        value: 'option23',
                    },
                ],
            },
            {
                options: [
                    {
                        label: (
                            <span>
                                Option 3-2
                                <strong>xxx</strong>
                            </span>
                        ),
                        value: 'option32',
                    },
                    {
                        label: 'Option 3-3',
                        value: 'option33',
                    },
                ],
            },
        ];

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return <Select value={value} options={options} onChange={handleChange} />;
    },
};
