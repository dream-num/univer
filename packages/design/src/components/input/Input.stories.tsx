import type { Meta } from '@storybook/react';
import React from 'react';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
    title: 'Components / Input',
    component: Input,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const InputBasic = {
    render() {
        return (
            <>
                <Input />
                <Input allowClear />
            </>
        );
    },
};

export const InputSize = {
    render() {
        return (
            <>
                <Input size="mini" />
                <Input size="small" />
                <Input />
                <Input size="large" />
            </>
        );
    },
};

export const InputDisabled = {
    render() {
        return <Input disabled />;
    },
};
