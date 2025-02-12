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

import { Radio } from '../radio/Radio';
import { RadioGroup } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
    title: 'Components / RadioGroup',
    component: RadioGroup,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState('');

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return (
            <RadioGroup value={value} onChange={handleChange}>
                <Radio value="test">test</Radio>
                <Radio value="test1">test1</Radio>
            </RadioGroup>
        );
    },
};

export const RadioGroupVertical = {
    render() {
        const [value, setValue] = useState('');

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return (
            <RadioGroup value={value} onChange={handleChange} direction="vertical">
                <Radio value="test">test</Radio>
                <Radio value="test1">test1</Radio>
            </RadioGroup>
        );
    },
};
