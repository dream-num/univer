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

import { Input } from '../input/Input';
import { Select } from '../select/Select';
import { FormLayout } from './FormLayout';

const meta: Meta = {
    title: 'Components / FormLayout',
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

function PagerDemo() {
    return (
        <>
            <FormLayout label="行标题与列标题" desc="转到“查看”>“冻结”可选择要在所有页面重复的行/列">
                <Input placeholder="请输入" />
            </FormLayout>
            <FormLayout label="行标题与列标题" desc="转到“查看”>“冻结”可选择要在所有页面重复的行/列" error="123">
                <Select value="" onChange={() => { /* empty */ }} />
            </FormLayout>
        </>
    );
}

export const Playground = {
    render: () => {
        return (
            <>
                <PagerDemo />
            </>
        );
    },
};
