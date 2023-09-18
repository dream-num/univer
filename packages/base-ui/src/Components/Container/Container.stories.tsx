import type { Meta } from '@storybook/react';

import { Container } from './Container';

const meta: Meta<typeof Container> = {
    title: 'Components / Container',
    component: Container,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    args: {
        children: 'main container',
    },
};

export default meta;

export const Playground = {
    args: {},
};
