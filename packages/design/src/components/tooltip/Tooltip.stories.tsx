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
                <div
                    className="univer-box-border univer-relative univer-w-96 univer-p-4 univer-bg-gray-50 univer-h-48 univer-flex univer-justify-center univer-items-center"
                >

                    <div className="univer-absolute univer-top-0">
                        <Tooltip title="hello world" placement="top">
                            <Button>top</Button>
                        </Tooltip>
                    </div>
                    <div className="univer-absolute univer-right-0">
                        <Tooltip title="hello world" placement="right">
                            <Button>right</Button>
                        </Tooltip>
                    </div>
                    <div className="univer-absolute univer-bottom-0">
                        <Tooltip title="hello world" placement="bottom">
                            <Button>bottom</Button>
                        </Tooltip>
                    </div>
                    <div className="univer-absolute univer-left-0">
                        <Tooltip title="hello world" placement="left">
                            <Button>left</Button>
                        </Tooltip>
                    </div>
                </div>

                <div>
                    <Tooltip title="这是一个提示">
                        <a className="px-4 py-2 bg-blue-500 text-white rounded">
                            悬浮显示提示
                        </a>
                    </Tooltip>
                </div>

                <div>

                    <Tooltip
                        title="https://docs.google.com/spreadsheets/d/1nt6WeRPP7E8LSUdJQZBetYJandjhNa4G6i-plp__hRA/edit?gid=0#gid=0"
                        showIfEllipsis
                        placement="bottom"
                    >
                        <div className="univer-w-72 univer-truncate">
                            https://docs.google.com/spreadsheets/d/1nt6WeRPP7E8LSUdJQZBetYJandjhNa4G6i-plp__hRA/edit?gid=0#gid=0
                        </div>
                    </Tooltip>
                </div>

                <div>
                    <Tooltip
                        title="完整的文本内容"
                        showIfEllipsis
                        placement="bottom"
                    >
                        <div className="univer-w-32 univer-truncate">
                            这是一段很长的文本内容，超出部分会被截断
                        </div>
                    </Tooltip>
                </div>

                <div className="univer-relative">

                    <Tooltip
                        title="asChild"
                        placement="bottom"
                        asChild
                    >
                        <div className="univer-h-8 univer-w-8 univer-bg-blue-400 univer-absolute univer-right-0">
                        </div>
                    </Tooltip>
                </div>
            </>
        );
    },
};
