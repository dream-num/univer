import type { Meta } from '@storybook/react';

import { Menu2 } from './Menu2';

const meta: Meta<typeof Menu2> = {
    title: 'Components / Menu',
    component: Menu2,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        return <Menu2 />;
    },
};
