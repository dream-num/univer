import type { Meta } from '@storybook/react';
import React, { useState } from 'react';

import { Checkbox } from '../checkbox/Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
    title: 'Components / CheckboxGroup',
    component: CheckboxGroup,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState<string[]>([]);

        function handleChange(value: Array<string | number | boolean>) {
            setValue(value as string[]);
        }

        return (
            <CheckboxGroup value={value} onChange={handleChange}>
                <Checkbox value="test">test</Checkbox>
                <Checkbox value="test1">test1</Checkbox>
            </CheckboxGroup>
        );
    },
};
