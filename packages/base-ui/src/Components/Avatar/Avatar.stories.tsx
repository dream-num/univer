import type { Meta } from '@storybook/react';

import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
    title: 'Components / Avatar',
    component: Avatar,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        shape: 'circle',
        size: 'default',
        fit: 'fill',
    },
};

export default meta;

export const Playground = {
    args: {},
};
export const ImgAvatar = {
    args: {
        src: 'https://avatars.githubusercontent.com/u/20630676?s=60&v=4',
    },
};
