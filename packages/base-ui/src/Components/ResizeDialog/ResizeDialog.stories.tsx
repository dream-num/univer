import type { Meta } from '@storybook/react';

import { ResizeDialog } from './ResizeDialog';

const meta: Meta<typeof ResizeDialog> = {
    title: 'Components / ResizeDialog',
    component: ResizeDialog,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        left: 20,
        top: 20,
        width: 20,
        height: 20,
        children: <div>test ResizeDialog</div>,
        ratio: 1,
    },
};

export default meta;

export const Playground = {
    args: {},
};
