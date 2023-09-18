import type { Meta } from '@storybook/react';

import { Item } from './Item';

const meta: Meta<typeof Item> = {
    title: 'Components / Item',
    component: Item,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        selected: true,
        border: true,
    },
};

export default meta;

export const Playground = {
    args: {},
};
