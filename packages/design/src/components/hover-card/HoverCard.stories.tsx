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

import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { HoverCard } from './HoverCard';

const meta: Meta<typeof HoverCard> = {
    title: 'Components / HoverCard',
    component: HoverCard,
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
                <HoverCard
                    overlay={(
                        <div className="univer-text-primary-500">
                            Hello Univer
                            <HoverCard
                                openDelay={0}
                                overlay={(
                                    <div className="univer-text-cyan-700">
                                        <div>Nested Content</div>
                                        <div>Nested Content</div>
                                        <div>Nested Content</div>
                                        <div>Nested Content</div>
                                    </div>
                                )}
                            >
                                <a>Nested Hover Card</a>
                            </HoverCard>
                        </div>
                    )}
                >
                    <a
                        className={clsx(`
                          univer-cursor-pointer univer-rounded-lg univer-px-4 univer-py-2 univer-transition-all
                          hover:univer-bg-gray-100
                          dark:hover:!univer-bg-gray-700
                        `, borderClassName)}
                    >
                        Click me
                    </a>
                </HoverCard>
            </div>
        );
    },
};
