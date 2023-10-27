import type { Meta } from '@storybook/react';

import { Container } from './Container';

const meta: Meta<typeof Container> = {
    title: 'Components / Container',
    component: Container,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        return <Container>main container</Container>;
    },
};
