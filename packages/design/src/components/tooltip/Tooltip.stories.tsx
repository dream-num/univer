/**
 * Copyright 2023-present DreamNum Inc.
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
import React from 'react';

import { Button } from '../button/Button';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
    title: 'Components / Tooltip',
    component: Tooltip,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        return (
            <>
                <div>
                    <Tooltip title="hello world" placement="top">
                        <Button>top</Button>
                    </Tooltip>
                </div>
                <div>
                    <Tooltip title="hello world" placement="bottom">
                        <Button>bottom</Button>
                    </Tooltip>
                </div>
                <div>
                    <Tooltip showIfEllipsis title="hello world" placement="bottom">
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            showIfEllipsis: 奇奇怪怪乖乖跟琪琪去上课就开始丹江口市的是卡拉斯科独立思考独立思考
                        </span>
                    </Tooltip>
                </div>
            </>
        );
    },
};
