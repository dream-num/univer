import type { Meta } from '@storybook/react';

import { Layout } from './Layout';

const meta: Meta<typeof Layout> = {
    title: 'Components / Layout',
    component: Layout,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: <div>test layout</div>,
    },
};

export default meta;

export const Playground = {
    args: {},
};
