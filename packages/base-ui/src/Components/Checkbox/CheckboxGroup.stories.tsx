import type { Meta } from '@storybook/react';

import { CheckboxGroup } from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
    title: 'Components / CheckboxGroup',
    component: CheckboxGroup,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        options: [
            {
                checked: true,
                name: 'checked',
                label: 'checked',
                value: 'checked',
            },
            {
                name: 'test',
                label: 'test',
                value: 'test',
            },
        ],
    },
};

export default meta;

export const Playground = {
    args: {},
};
