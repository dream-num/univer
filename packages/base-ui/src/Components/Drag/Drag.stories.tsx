import type { Meta } from '@storybook/react';

import { Drag } from './Drag';

const meta: Meta<typeof Drag> = {
    title: 'Components / Drag',
    component: Drag,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        isDrag: true,
        children: <div>test drag</div>,
    },
};

export default meta;

export const Playground = {
    args: {},
};
