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
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ColorPicker } from './ColorPicker';
import { ColorPickerPanel } from './ColorPickerPanel';
import { ColorSelect } from './ColorSelect';

const meta: Meta<typeof ColorPicker> = {
    title: 'Components / ColorPicker',
    component: ColorPicker,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState('#3F83F8');

        return (
            <div className="univer-flex univer-flex-col univer-gap-3">
                <div className="univer-text-xs univer-font-medium univer-text-gray-500">
                    HEX:
                    {' '}
                    {value}
                </div>
                <div
                    className={clsx(`
                      univer-rounded-lg univer-bg-gray-0 univer-p-3 univer-shadow-md
                      dark:!univer-bg-gray-700
                    `, borderClassName)}
                >
                    <ColorPicker format="hex" value={value} onChange={setValue} />
                </div>
            </div>
        );
    },
};

export const RgbaFormat = {
    render() {
        const [value, setValue] = useState('rgba(44, 83, 241, 0.5)');

        return (
            <div className="univer-flex univer-flex-col univer-gap-3">
                <div className="univer-text-xs univer-font-medium univer-text-gray-500">
                    RGBA:
                    {' '}
                    {value}
                </div>
                <div
                    className={clsx(`
                      univer-rounded-lg univer-bg-gray-0 univer-p-3 univer-shadow-md
                      dark:!univer-bg-gray-700
                    `, borderClassName)}
                >
                    <ColorPicker format="rgba" value={value} onChange={setValue} />
                </div>
            </div>
        );
    },
};

export const CustomPanel = {
    render() {
        const [value, setValue] = useState('#2C53F1');

        return (
            <div
                className={clsx(`
                  univer-w-72 univer-rounded-lg univer-bg-gray-0 univer-p-3 univer-shadow-md
                  dark:!univer-bg-gray-700
                `, borderClassName)}
            >
                <ColorPickerPanel value={value} onConfirm={setValue} />
            </div>
        );
    },
};

export const SelectTrigger = {
    render() {
        const [value, setValue] = useState<string | null>('#3F83F8');

        return (
            <div className="univer-w-44">
                <ColorSelect
                    aria-label="Fill color"
                    placeholder="Default"
                    resetLabel="Reset"
                    transparentLabel="Transparent"
                    value={value}
                    onChange={setValue}
                    onReset={() => setValue(null)}
                />
            </div>
        );
    },
};
