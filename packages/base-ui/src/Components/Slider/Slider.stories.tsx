import type { Meta } from '@storybook/react';

import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
    title: 'Components / Slider',
    component: Slider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        min: 0,
        max: 100,
        step: 1,
        range: false,
    },
};

export default meta;

export const Playground = {
    args: {},
};
