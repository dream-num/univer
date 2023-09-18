import type { Meta } from '@storybook/react';

import { Menu } from './Menu';

const meta: Meta<typeof Menu> = {
    title: 'Components / Menu',
    component: Menu,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        menu: [
            {
                label: 'test',
                value: 'test',
                show: true,
            },
            {
                label: 'test1',
                value: 'test1',
                show: true,
            },
        ],
    },
};

export default meta;

export const Playground = {
    args: {},
};
