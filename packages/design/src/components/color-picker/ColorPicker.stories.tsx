import type { Meta } from '@storybook/react';
import React from 'react';

import { ColorPicker } from './ColorPicker';

const meta: Meta<typeof ColorPicker> = {
    title: 'Components / ColorPicker',
    component: ColorPicker,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground = {
    render() {
        return <ColorPicker />;
    },
};
