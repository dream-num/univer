import type { Meta } from '@storybook/react';
import React, { useState } from 'react';

import { Select } from './Select';

const meta: Meta<typeof Select> = {
    title: 'Components / Select',
    component: Select,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState('');

        const options = [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' },
        ];

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return <Select value={value} options={options} onChange={handleChange} />;
    },
};
