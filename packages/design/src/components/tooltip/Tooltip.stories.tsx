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
                    className={`
                      univer-relative univer-box-border univer-flex univer-h-48 univer-w-96 univer-items-center
                      univer-justify-center univer-bg-gray-50 univer-p-4
                    `}
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
                    <Tooltip title="Just a tooltip">
                        <a className="univer-rounded univer-bg-primary-500 univer-px-4 univer-py-2 univer-text-white">
                            Hover me
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
                        title="Full text"
                        showIfEllipsis
                        placement="bottom"
                        asChild={false}
                    >
                        <span>not ellipsis</span>
                    </Tooltip>
                </div>
            </>
        );
    },
};
