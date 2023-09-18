import type { Meta } from '@storybook/react';

import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
    title: 'Components / Radio',
    component: Radio,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        value: 'value',
    },
};

export default meta;

export const Playground = {
    args: {},
};
