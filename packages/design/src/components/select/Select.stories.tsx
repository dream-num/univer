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

export const SelectBasic = {
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

export const SelectGroup = {
    render() {
        const [value, setValue] = useState('');

        const options = [
            { label: 'Option 1', value: 'option1' },
            {
                options: [
                    {
                        label: 'Option 2-2',
                        value: 'option22',
                    },
                    {
                        label: 'Option 2-3',
                        value: 'option23',
                    },
                ],
            },
            {
                options: [
                    {
                        label: (
                            <span>
                                Option 3-2 <strong>xxx</strong>
                            </span>
                        ),
                        value: 'option32',
                    },
                    {
                        label: 'Option 3-3',
                        value: 'option33',
                    },
                ],
            },
        ];

        function handleChange(value: string | number | boolean) {
            setValue(value as string);
        }

        return <Select value={value} options={options} onChange={handleChange} />;
    },
};
