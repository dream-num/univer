import type { Meta } from '@storybook/react';
import { useState } from 'react';

import { Radio } from '../radio/Radio';
import { RadioGroup } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
    title: 'Components / RadioGroup',
    component: RadioGroup,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState('');

        function handleChange(value: string) {
            setValue(value);
        }

        return (
            <RadioGroup value={value} onChange={handleChange}>
                <Radio value="test">test</Radio>
                <Radio value="test1">test1</Radio>
            </RadioGroup>
        );
    },
};
