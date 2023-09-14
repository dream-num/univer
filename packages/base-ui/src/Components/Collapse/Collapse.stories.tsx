import type { Meta } from '@storybook/react';

import { Collapse } from './Collapse';

const meta: Meta<typeof Collapse> = {
    title: 'Components / Collapse',
    component: Collapse,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: 'Collapse Content',
        header: 'Collapse Header',
    },
};

export default meta;

export const Playground = {
    args: {},
};
