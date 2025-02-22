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

import { Dropdown } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
    title: 'Components / Dropdown',
    component: Dropdown,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        return (
            <div className="univer-relative">
                <Dropdown
                    overlay={(
                        <div className="univer-text-blue-500">
                            Hello Univer
                            <Dropdown
                                overlay={(
                                    <div className="univer-text-cyan-700">
                                        <div>Nested Content</div>
                                        <div>Nested Content</div>
                                        <div>Nested Content</div>
                                        <div>Nested Content</div>
                                    </div>
                                )}
                            >
                                <a>Nested Popover</a>
                            </Dropdown>
                        </div>
                    )}
                >
                    <a className="univer-cursor-pointer univer-border univer-rounded-lg univer-border-gray-200 univer-px-4 univer-py-2 univer-border-solid hover:univer-bg-gray-100 univer-transition-all">
                        Click me
                    </a>
                </Dropdown>
            </div>
        );
    },
};
