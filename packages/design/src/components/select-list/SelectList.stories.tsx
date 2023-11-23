import type { Meta } from '@storybook/react';
import React, { useState } from 'react';

import { SelectList } from './SelectList';

const meta: Meta<typeof SelectList> = {
    title: 'Components / SelectList',
    component: SelectList,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState('option4');

        const options = [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' },
            { label: 'Option 4', value: 'option4' },
            { label: 'Option 5', value: 'option5' },
            { label: 'Option 6', value: 'option6' },
            { label: 'Option 7', value: 'option7' },
            { label: 'Option 8', value: 'option8' },
            { label: 'Option 9', value: 'option9' },
            { label: 'Option 10', value: 'option10' },
            { label: 'Option 11', value: 'option11' },
        ];

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return <SelectList value={value} options={options} onChange={handleChange} />;
    },
};
