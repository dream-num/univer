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

import { Checkbox } from '../checkbox/Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
    title: 'Components / CheckboxGroup',
    component: CheckboxGroup,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState<string[]>([]);

        function handleChange(value: Array<string | number | boolean>) {
            setValue(value as string[]);
        }

        return (
            <CheckboxGroup value={value} onChange={handleChange}>
                <Checkbox value="test">test</Checkbox>
                <Checkbox value="test1">test1</Checkbox>
            </CheckboxGroup>
        );
    },
};

export const CheckboxGroupVertical = {
    render() {
        const [value, setValue] = useState<string[]>([]);

        function handleChange(value: Array<string | number | boolean>) {
            setValue(value as string[]);
        }

        return (
            <CheckboxGroup value={value} onChange={handleChange} direction="vertical">
                <Checkbox value="test">test</Checkbox>
                <Checkbox value="test1">test1</Checkbox>
            </CheckboxGroup>
        );
    },
};
