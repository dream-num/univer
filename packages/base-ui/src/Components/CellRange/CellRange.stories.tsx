import type { Meta } from '@storybook/react';

import { CellRange } from './CellRange';

const meta: Meta<typeof CellRange> = {
    title: 'Components / CellRange',
    component: CellRange,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {},
};

export default meta;

export const Playground = {
    args: {},
};
