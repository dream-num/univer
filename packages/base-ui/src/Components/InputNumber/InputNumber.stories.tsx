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
        value: 1,
        min: 0,
        max: 10,
    },
};

export default meta;

export const Playground = {
    args: {},
};
