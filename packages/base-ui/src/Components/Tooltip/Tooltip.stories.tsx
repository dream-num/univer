import type { Meta } from '@storybook/react';

import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
    title: 'Components / Tooltip',
    component: Tooltip,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: <div>test</div>,
        title: 'test tooltip',
    },
};

export default meta;

export const Playground = {
    args: {},
};
