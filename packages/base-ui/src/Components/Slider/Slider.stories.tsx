import type { Meta } from '@storybook/react';
import { useState } from 'react';

import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
    title: 'Components / Slider',
    component: Slider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;

export const Playground = {
    render() {
        const [value, setValue] = useState(0);

        function handleChange(changedValue: number) {
            setValue(changedValue);
        }

        return <Slider value={value} shortcuts={[50, 75, 100, 125, 150, 175, 200, 400]} onChange={handleChange} />;
    },
};
