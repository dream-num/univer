import type { Meta } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
    title: 'Components / Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        type: 'default',
        size: 'middle',
        danger: false,
        disabled: false,
        block: false,
        loading: false,
    },
};

export default meta;

export const Playground = {
    args: {
        children: 'Button',
    },
};
