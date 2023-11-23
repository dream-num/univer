import type { Meta } from '@storybook/react';
import React from 'react';

import { InputNumber } from './InputNumber';

const meta: Meta<typeof InputNumber> = {
    title: 'Components / InputNumber',
    component: InputNumber,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const InputNumberBasic = {
    render() {
        return (
            <>
                <InputNumber />
                <InputNumber precision={0} />
            </>
        );
    },
};

export const InputNumberDisabled = {
    render() {
        return <InputNumber disabled />;
    },
};

export const InputNumberHideControls = {
    render() {
        return <InputNumber controls={false} />;
    },
};
