import type { Meta } from '@storybook/react';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
    title: 'Components / Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        placeholder: 'Your Content',
        bordered: true,
    },
};

export default meta;

export const Playground = {
    args: {},
};
