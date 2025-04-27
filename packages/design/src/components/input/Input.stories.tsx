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

import { Pager } from '../pager/Pager';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
    title: 'Components / Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const InputBasic = {
    render() {
        return (
            <>
                <Input />
                <Input allowClear />
            </>
        );
    },
};

export const InputSize = {
    render() {
        return (
            <>
                <Input size="small" />
                <Input />
                <Input size="large" />
            </>
        );
    },
};

export const InputDisabled = {
    render() {
        return (
            <>
                <Input disabled />
                <Input value="disabled content" disabled />
            </>
        );
    },
};

export const Clear = {
    render() {
        return (
            <>
                <Input allowClear />
                <Input value="content" allowClear />
            </>
        );
    },
};

export const ClearWithPage = {
    render() {
        return (
            <>
                <Input value="with some very long content to push content offset" allowClear slot={<Pager value={1} total={10} />} />
            </>
        );
    },
};
