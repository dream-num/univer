import type { Meta } from '@storybook/react';

import { ColorPickerCircleButton } from './ColorPickerCircleButton';

const meta: Meta<typeof ColorPickerCircleButton> = {
    title: 'Components / ColorPickerCircleButton',
    component: ColorPickerCircleButton,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        color: '#abcdef',
    },
};

export default meta;

export const Playground = {
    args: {},
};
