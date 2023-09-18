import type { Meta } from '@storybook/react';

import { CustomLabel } from './CustomLabel';

const meta: Meta<typeof CustomLabel> = {
    title: 'Components / CustomLabel',
    component: CustomLabel,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        label: 'test customLabel',
    },
};

export default meta;

export const Playground = {
    args: {},
};
