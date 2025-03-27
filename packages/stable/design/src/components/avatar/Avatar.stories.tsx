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

import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
    title: 'Components / Avatar',
    component: Avatar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const AvatarShape = {
    render() {
        return (
            <>
                <Avatar>xxx</Avatar>
                <Avatar shape="square" />
            </>
        );
    },
};

export const AvatarSize = {
    render() {
        return (
            <>
                <div>
                    <Avatar size="small" />
                    <Avatar />
                </div>
                <div>
                    <Avatar shape="square" size="small" />
                    <Avatar shape="square" />
                </div>
            </>
        );
    },
};

export const AvatarSrc = {
    render() {
        return <Avatar src="https://avatars.githubusercontent.com/u/20630676?s=60&v=4" />;
    },
};
