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
import type { IGradientValue } from './GradientColorPicker';
import { useState } from 'react';
import { GradientColorPicker } from './GradientColorPicker';

const meta: Meta<typeof GradientColorPicker> = {
    title: 'Components / GradientColorPicker',
    component: GradientColorPicker,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState<IGradientValue>({
            type: 'linear',
            stops: [
                { color: '#409eff', offset: 0 },
                { color: '#67c23a', offset: 100 },
            ],
            angle: 90,
        });

        return (
            <div className="univer-flex univer-flex-col univer-gap-4">
                <div className="univer-font-mono univer-text-sm">
                    {JSON.stringify(value, null, 2)}
                </div>
                <GradientColorPicker className="univer-w-80" value={value} onChange={setValue} />
            </div>
        );
    },
};
