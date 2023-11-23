import type { Meta } from '@storybook/react';
import React from 'react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
    title: 'Components / Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const ButtonType = {
    render() {
        return (
            <>
                <Button>default button</Button>
                <Button type="primary">primary button</Button>
                <Button type="text">text button</Button>
                <Button type="link">link button</Button>
            </>
        );
    },
};

export const ButtonSize = {
    render() {
        return (
            <>
                <Button size="small">small button</Button>
                <Button>medium button</Button>
                <Button type="primary" size="large">
                    large button
                </Button>
            </>
        );
    },
};

export const ButtonBlock = {
    render() {
        return (
            <>
                <Button size="small" block>
                    small button
                </Button>
                <Button type="primary" block>
                    primary button
                </Button>
            </>
        );
    },
};

export const ButtonDisabled = {
    render() {
        return (
            <>
                <Button disabled>default button</Button>
                <Button type="text" disabled>
                    text button
                </Button>
                <Button type="primary" disabled>
                    primary button
                </Button>
            </>
        );
    },
};
