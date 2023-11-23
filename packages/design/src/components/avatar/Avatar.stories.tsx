import type { Meta } from '@storybook/react';
import React from 'react';

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
