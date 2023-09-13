import type { Meta } from '@storybook/react';

import { Radio, RadioGroup } from './Radio';

const meta: Meta<typeof RadioGroup> = {
    title: 'Components / RadioGroup',
    component: RadioGroup,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: [<Radio value="test" label="test"></Radio>, <Radio value="test1" label="test1"></Radio>],
    },
};

export default meta;

export const Playground = {
    args: {},
};
