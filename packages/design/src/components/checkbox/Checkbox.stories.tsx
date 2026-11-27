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
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
    title: 'Components / Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const CheckboxBasic = {
    render() {
        const [checked, setChecked] = useState(false);
        function handleChange(value: string | number | boolean) {
            setChecked(value as boolean);
        }

        return (
            <div className="univer-flex univer-flex-col univer-gap-2.5">
                <Checkbox checked={checked} onChange={handleChange}>Show gridlines</Checkbox>
                <Checkbox checked onChange={handleChange}>Freeze header row</Checkbox>
                <Checkbox checked={checked} onChange={handleChange} className="univer-max-w-56">
                    Automatically wrap long labels so the indicator stays aligned with the first line
                </Checkbox>
            </div>
        );
    },
};

export const CheckboxDisabled = {
    render() {
        return (
            <div className="univer-flex univer-flex-col univer-gap-2.5">
                <Checkbox disabled>Disabled unchecked</Checkbox>
                <Checkbox disabled checked>Disabled checked</Checkbox>
                <Checkbox disabled indeterminate>Disabled indeterminate</Checkbox>
            </div>
        );
    },
};

export const CheckboxIndeterminate = {
    render() {
        const [checked, setChecked] = useState(false);
        function handleChange(value: string | number | boolean) {
            setChecked(value as boolean);
        }

        return (
            <div className="univer-flex univer-flex-col univer-gap-2.5">
                <Checkbox checked={checked} onChange={handleChange} indeterminate>Select all columns</Checkbox>
                <Checkbox disabled indeterminate>Partially selected (disabled)</Checkbox>
            </div>
        );
    },
};
