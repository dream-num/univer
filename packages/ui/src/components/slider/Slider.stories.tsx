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

import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
    title: 'Components / Slider',
    component: Slider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState(100);

        function handleChange(changedValue: number) {
            setValue(changedValue);
        }

        return (
            <>
                <Slider
                    min={0}
                    value={value}
                    shortcuts={[50, 75, 100, 125, 150, 175, 200, 400]}
                    onChange={handleChange}
                />
                <Slider
                    min={20}
                    value={value}
                    shortcuts={[50, 75, 100, 125, 150, 175, 200, 400]}
                    onChange={handleChange}
                />
            </>
        );
    },
};
