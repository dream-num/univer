import type { Meta } from '@storybook/react';

import { InputNumber } from './InputNumber';

const meta: Meta<typeof InputNumber> = {
    title: 'Components / InputNumber',
    component: InputNumber,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        bordered: true,
    },
};

export default meta;

export const Playground = {
    args: {},
};
