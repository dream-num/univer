import type { Meta } from '@storybook/react';

import { Separator } from './Separator';

const meta: Meta<typeof Separator> = {
    title: 'Components / Separator',
    component: Separator,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        mode: false,
    },
};

export default meta;

export const Playground = {
    args: {},
};
