import type { Meta } from '@storybook/react';

import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
    title: 'Components / Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        checked: false,
        disabled: false,
    },
};

export default meta;

export const Playground = {
    args: {},
};

export const UsingSlot = {
    title: 'Using Slot',
    args: {
        children: <strong>Apple</strong>,
    },
};
