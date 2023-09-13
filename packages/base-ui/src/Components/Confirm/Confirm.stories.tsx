import type { Meta } from '@storybook/react';

import { Confirm } from './Confirm';

const meta: Meta<typeof Confirm> = {
    title: 'Components / Confirm',
    component: Confirm,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        color: '#abcdef',
    },
};

export default meta;

export const Playground = {
    args: {},
};
