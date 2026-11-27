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
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
    title: 'Components / Radio',
    component: Radio,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const RadioBasic = {
    render() {
        const [selected, setSelected] = useState('portrait');

        return (
            <div className="univer-flex univer-flex-col univer-gap-2.5">
                <Radio name="orientation" value="portrait" checked={selected === 'portrait'} onChange={(v) => setSelected(String(v))}>
                    Portrait
                </Radio>
                <Radio name="orientation" value="landscape" checked={selected === 'landscape'} onChange={(v) => setSelected(String(v))}>
                    Landscape
                </Radio>
                <Radio
                    name="orientation"
                    value="auto"
                    checked={selected === 'auto'}
                    onChange={(v) => setSelected(String(v))}
                    className="univer-max-w-56"
                >
                    Match page orientation automatically when printing multi-page sheets
                </Radio>
            </div>
        );
    },
};

export const RadioDisabled = {
    render() {
        return (
            <div className="univer-flex univer-flex-col univer-gap-2.5">
                <Radio disabled>Disabled unselected</Radio>
                <Radio disabled checked>Disabled selected</Radio>
            </div>
        );
    },
};
