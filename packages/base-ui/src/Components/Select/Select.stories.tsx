import type { Meta } from '@storybook/react';

import { Select } from './Select';

const meta: Meta<typeof Select> = {
    title: 'Components / Select',
    component: Select,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        label: 'test select',
    },
};

export default meta;

export const Playground = {
    args: {},
};
