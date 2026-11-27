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
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
    title: 'Components / Switch',
    component: Switch,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const SwitchBasic = {
    render() {
        const [checked, setChecked] = useState(true);

        return (
            <div className="univer-flex univer-flex-col univer-gap-3">
                <Switch checked={checked} onChange={setChecked}>Show gridlines</Switch>
                <Switch defaultChecked={false}>Uncontrolled switch</Switch>
                <Switch disabled defaultChecked={false}>Disabled off</Switch>
                <Switch disabled defaultChecked>Disabled on</Switch>
            </div>
        );
    },
};
